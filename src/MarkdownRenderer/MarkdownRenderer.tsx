import { ConfigProvider } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useStyle as useContentStyle } from '../MarkdownEditor/editor/style';
import type { MarkdownEditorPlugin } from '../MarkdownEditor/plugin';
import type { MarkdownEditorProps } from '../MarkdownEditor/types';
import { useStyle as useEditorStyle } from '../MarkdownEditor/style';
import { CharacterQueue } from './CharacterQueue';
import { AgenticUiTaskBlockRenderer } from './renderers/AgenticUiTaskBlockRenderer';
import { AgenticUiToolUseBarBlockRenderer } from './renderers/AgenticUiToolUseBarBlockRenderer';
import { AgenticUiFileMapBlockRenderer } from './renderers/AgenticUiFileMapBlockRenderer';
import { ChartBlockRenderer } from './renderers/ChartRenderer';
import { CodeBlockRenderer } from './renderers/CodeRenderer';
import { MermaidBlockRenderer } from './renderers/MermaidRenderer';
import { SchemaBlockRenderer } from './renderers/SchemaRenderer';
import { useRendererVarStyle } from './style';
import type {
  FileMapConfig,
  MarkdownRendererProps,
  MarkdownRendererRef,
  RendererBlockProps,
} from './types';
import { extractFootnoteDefinitionsFromMarkdown } from './extractFootnoteDefinitions';
import { useMarkdownToReact } from './useMarkdownToReact';
import { useStreaming } from './useStreaming';

const SCHEMA_LANGUAGES = new Set([
  'schema',
  'apaasify',
  'apassify',
  'agentar-card',
]);

/**
 * 从插件列表中收集 rendererComponents
 */
const collectRendererComponents = (
  plugins?: MarkdownEditorPlugin[],
): Record<string, React.ComponentType<RendererBlockProps>> => {
  const components: Record<
    string,
    React.ComponentType<RendererBlockProps>
  > = {};
  if (!plugins) return components;
  for (const plugin of plugins) {
    const renderer = (plugin as any).renderer;
    if (renderer?.rendererComponents) {
      Object.assign(components, renderer.rendererComponents);
    }
  }
  return components;
};

/**
 * 默认的代码块路由——根据语言分发到对应渲染器
 */
const DefaultCodeRouter: React.FC<
  RendererBlockProps & {
    pluginComponents: Record<string, React.ComponentType<RendererBlockProps>>;
    apaasifyRender?: (value: any) => React.ReactNode;
    fileMapConfig?: FileMapConfig;
    editorCodeProps?: MarkdownEditorProps['codeProps'];
  }
> = (props) => {
  const {
    language,
    pluginComponents,
    apaasifyRender,
    fileMapConfig,
    editorCodeProps,
    ...rest
  } = props;

  if (language === 'mermaid') {
    const MermaidComp = pluginComponents.mermaid || MermaidBlockRenderer;
    return <MermaidComp {...rest} language={language} />;
  }

  if (language === 'chart' || language === 'json-chart') {
    const ChartComp = pluginComponents.chart || ChartBlockRenderer;
    return <ChartComp {...rest} language={language} />;
  }

  if (language === 'agentic-ui-task') {
    const TaskComp =
      pluginComponents['agentic-ui-task'] || AgenticUiTaskBlockRenderer;
    return <TaskComp {...rest} language={language} />;
  }

  if (
    language === 'agentic-ui-toolusebar' ||
    language === 'agentic-ui-usertoolbar'
  ) {
    const ToolbarComp =
      pluginComponents['agentic-ui-toolusebar'] ||
      pluginComponents['agentic-ui-usertoolbar'] ||
      AgenticUiToolUseBarBlockRenderer;
    return <ToolbarComp {...rest} language={language} />;
  }

  if (language === 'agentic-ui-filemap') {
    const FileMapComp =
      pluginComponents['agentic-ui-filemap'] || AgenticUiFileMapBlockRenderer;
    return (
      <FileMapComp {...rest} language={language} fileMapConfig={fileMapConfig} />
    );
  }

  if (SCHEMA_LANGUAGES.has(language)) {
    const SchemaComp = pluginComponents.schema || SchemaBlockRenderer;
    return (
      <SchemaComp
        {...rest}
        language={language}
        apaasifyRender={apaasifyRender}
        editorCodeProps={editorCodeProps}
      />
    );
  }

  const CodeComp = pluginComponents.code || CodeBlockRenderer;
  return (
    <CodeComp {...rest} language={language} editorCodeProps={editorCodeProps} />
  );
};

/** 轻量流式 Markdown 渲染器——无 Slate 实例，Markdown → hast → React */
const InternalMarkdownRenderer = forwardRef<
  MarkdownRendererRef,
  MarkdownRendererProps
>((props, ref) => {
  const {
    content,
    streaming = false,
    isFinished,
    queueOptions,
    plugins,
    remarkPlugins,
    htmlConfig,
    className,
    style,
    prefixCls: customPrefixCls,
    linkConfig,
    streamingParagraphAnimation,
    apaasify,
    eleRender,
    fileMapConfig,
    fncProps,
    codeProps: editorCodeProps,
  } = props;

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  // 复用 MarkdownEditor 的 CSS 前缀和样式，保持渲染一致性
  const prefixCls = getPrefixCls('agentic-md-editor', customPrefixCls);
  const { wrapSSR, hashId } = useEditorStyle(prefixCls);
  // 注册 content 层的样式（段落间距、链接、blockquote 等）
  const contentCls = `${prefixCls}-content`;
  const { wrapSSR: wrapContentSSR } = useContentStyle(contentCls, {});
  // 注册间距 CSS 变量回退值（:where 低优先级，不覆盖宿主定义）
  const { wrapSSR: wrapVarSSR } = useRendererVarStyle(prefixCls);

  const containerRef = useRef<HTMLDivElement>(null);
  const [displayedContent, setDisplayedContent] = useState(content || '');
  const queueRef = useRef<CharacterQueue | null>(null);
  /** 与 CharacterQueue 构造参数同步，避免 queueOptions 变更后仍用旧队列行为 */
  const queueOptsSigRef = useRef('');

  useImperativeHandle(ref, () => ({
    nativeElement: containerRef.current,
    getDisplayedContent: () => displayedContent,
  }));

  // 收集插件的 rendererComponents
  const pluginComponents = useMemo(
    () => collectRendererComponents(plugins),
    [plugins],
  );

  // 字符队列：默认关闭逐字动画，避免 RAF 每帧全量重解析 Markdown 导致整页闪动。
  // 需要打字机效果时显式传入 queueOptions={{ animate: true, animateTailChars?: number }}。
  const resolvedQueueOptions = useMemo(
    () =>
      streaming
        ? { animate: false, animateTailChars: undefined, ...queueOptions }
        : queueOptions,
    [streaming, queueOptions],
  );

  useEffect(() => {
    if (!streaming) {
      setDisplayedContent(content || '');
      queueRef.current?.dispose();
      queueRef.current = null;
      queueOptsSigRef.current = '';
      return;
    }

    const sig = JSON.stringify(resolvedQueueOptions ?? {});
    if (!queueRef.current || sig !== queueOptsSigRef.current) {
      queueRef.current?.dispose();
      queueRef.current = new CharacterQueue(
        (displayed) => setDisplayedContent(displayed),
        resolvedQueueOptions,
      );
      queueOptsSigRef.current = sig;
    }
    queueRef.current.push(content || '');
  }, [content, streaming, resolvedQueueOptions]);

  // 流式完成时 flush 所有剩余内容
  useEffect(() => {
    if (isFinished && queueRef.current) {
      queueRef.current.complete();
    }
  }, [isFinished]);

  // 清理
  useEffect(() => {
    return () => {
      queueRef.current?.dispose();
      queueRef.current = null;
    };
  }, []);

  // 非流式内容变化时同步
  useEffect(() => {
    if (!streaming) {
      setDisplayedContent(content || '');
    }
  }, [content, streaming]);

  useEffect(() => {
    const notify = fncProps?.onFootnoteDefinitionChange;
    if (!notify) return;
    notify(extractFootnoteDefinitionsFromMarkdown(displayedContent || ''));
  }, [displayedContent, fncProps?.onFootnoteDefinitionChange]);

  // 构建组件映射
  // code 渲染器通过 pre override 在 useMarkdownToReact 中路由，
  // 不直接映射到 <code> 标签（否则会影响行内代码 `code`）
  const apaasifyRender = useMemo(() => {
    if (apaasify?.enable && apaasify.render) return apaasify.render;
    return undefined;
  }, [apaasify]);

  const components = useMemo(() => {
    const codeRouter = (blockProps: RendererBlockProps) => (
      <DefaultCodeRouter
        {...blockProps}
        pluginComponents={pluginComponents}
        apaasifyRender={apaasifyRender}
        fileMapConfig={fileMapConfig}
        editorCodeProps={editorCodeProps}
      />
    );
    codeRouter.displayName = 'CodeRouter';

    return {
      __codeBlock: codeRouter,
      ...pluginComponents,
    };
  }, [pluginComponents, apaasifyRender, fileMapConfig, editorCodeProps]);

  // 流式缓存：将不完整的 Markdown token 暂缓，避免 parser 错误解析
  const safeContent = useStreaming(displayedContent, streaming);

  const reactContent = useMarkdownToReact(safeContent, {
    remarkPlugins,
    htmlConfig,
    components,
    prefixCls,
    linkConfig,
    fncProps,
    streaming,
    streamingParagraphAnimation,
    contentRevisionSource: streaming ? displayedContent : undefined,
    eleRender,
  });

  return wrapVarSSR(
    wrapSSR(
      wrapContentSSR(
        <div
          ref={containerRef}
          className={clsx(
            prefixCls,
            `${prefixCls}-readonly`,
            hashId,
            className,
          )}
          style={style}
        >
          <div
            className={clsx(`${prefixCls}-container`, hashId)}
            style={{ display: 'block' }}
          >
            <div
              className={clsx(
                contentCls,
                `${contentCls}-markdown-readonly`,
                hashId,
              )}
              style={{ whiteSpace: 'normal', wordWrap: 'normal' }}
            >
              {reactContent}
            </div>
          </div>
        </div>,
      ),
    ),
  );
});

InternalMarkdownRenderer.displayName = 'MarkdownRenderer';

export default InternalMarkdownRenderer;

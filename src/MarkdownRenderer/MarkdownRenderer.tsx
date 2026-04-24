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
import { useStyle as useEditorStyle } from '../MarkdownEditor/style';
import { DefaultCodeRouter } from './DefaultCodeRouter';
import { CharacterQueue } from './CharacterQueue';
import { extractFootnoteDefinitionsFromMarkdown } from './extractFootnoteDefinitions';
import { useRendererVarStyle } from './style';
import type {
  MarkdownRendererProps,
  MarkdownRendererRef,
  RendererBlockProps,
} from './types';
import { useMarkdownToReact } from './useMarkdownToReact';
import { useStreaming } from './useStreaming';

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
      queueRef.current?.dispose();
      queueRef.current = null;
      queueOptsSigRef.current = '';
      setDisplayedContent(content || '');
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

    if (isFinished) {
      queueRef.current.complete();
    }
  }, [content, streaming, resolvedQueueOptions, isFinished]);

  // 清理
  useEffect(() => {
    return () => {
      queueRef.current?.dispose();
      queueRef.current = null;
    };
  }, []);

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
          data-testid="markdown-renderer"
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

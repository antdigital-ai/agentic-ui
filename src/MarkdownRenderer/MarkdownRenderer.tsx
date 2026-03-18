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
import type { MarkdownEditorPlugin } from '../MarkdownEditor/plugin';
import { useStyle as useEditorStyle } from '../MarkdownEditor/style';
import { CharacterQueue } from './CharacterQueue';
import { CodeBlockRenderer } from './renderers/CodeRenderer';
import { MermaidBlockRenderer } from './renderers/MermaidRenderer';
import { ChartBlockRenderer } from './renderers/ChartRenderer';
import type {
  MarkdownRendererProps,
  MarkdownRendererRef,
  RendererBlockProps,
} from './types';
import { useMarkdownToReact } from './useMarkdownToReact';

const SPECIAL_LANGUAGES = new Set(['mermaid', 'chart', 'json-chart']);

/**
 * 从插件列表中收集 rendererComponents
 */
const collectRendererComponents = (
  plugins?: MarkdownEditorPlugin[],
): Record<string, React.ComponentType<RendererBlockProps>> => {
  const components: Record<string, React.ComponentType<RendererBlockProps>> = {};
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
 * 默认的代码块路由——根据语言分发到 Mermaid / Chart / 普通代码渲染器
 */
const DefaultCodeRouter: React.FC<
  RendererBlockProps & { pluginComponents: Record<string, React.ComponentType<RendererBlockProps>> }
> = (props) => {
  const { language, pluginComponents, ...rest } = props;

  if (language === 'mermaid') {
    const MermaidComp = pluginComponents.mermaid || MermaidBlockRenderer;
    return <MermaidComp {...rest} language={language} />;
  }

  if (language === 'chart' || language === 'json-chart') {
    const ChartComp = pluginComponents.chart || ChartBlockRenderer;
    return <ChartComp {...rest} language={language} />;
  }

  const CodeComp = pluginComponents.code || CodeBlockRenderer;
  return <CodeComp {...rest} language={language} />;
};

/**
 * MarkdownRenderer —— 流式/只读场景下的轻量 Markdown 渲染器。
 *
 * 核心优势：
 * - 不创建 Slate 实例，无编辑态开销
 * - 字符队列驱动流式逐字输出动画
 * - Markdown → hast → React 元素树（hast-util-to-jsx-runtime）
 * - 特殊块（code / mermaid / chart / katex）通过组件映射拦截渲染
 */
const InternalMarkdownRenderer = forwardRef<MarkdownRendererRef, MarkdownRendererProps>(
  (props, ref) => {
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
    } = props;

    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    // 复用 MarkdownEditor 的 CSS 前缀和样式，保持渲染一致性
    const prefixCls = getPrefixCls('agentic-md-editor', customPrefixCls);
    const { wrapSSR, hashId } = useEditorStyle(prefixCls);

    const containerRef = useRef<HTMLDivElement>(null);
    const [displayedContent, setDisplayedContent] = useState(content || '');
    const queueRef = useRef<CharacterQueue | null>(null);

    useImperativeHandle(ref, () => ({
      nativeElement: containerRef.current,
      getDisplayedContent: () => displayedContent,
    }));

    // 收集插件的 rendererComponents
    const pluginComponents = useMemo(
      () => collectRendererComponents(plugins),
      [plugins],
    );

    // 字符队列管理
    useEffect(() => {
      if (!streaming) {
        // 非流式：直接展示全部内容
        setDisplayedContent(content || '');
        return;
      }

      if (!queueRef.current) {
        queueRef.current = new CharacterQueue(
          (displayed) => setDisplayedContent(displayed),
          queueOptions,
        );
      }

      queueRef.current.push(content || '');

      return undefined;
    }, [content, streaming, queueOptions]);

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

    // 构建组件映射
    // code 渲染器通过 pre override 在 useMarkdownToReact 中路由，
    // 不直接映射到 <code> 标签（否则会影响行内代码 `code`）
    const components = useMemo(() => {
      const codeRouter = (codeProps: RendererBlockProps) => (
        <DefaultCodeRouter {...codeProps} pluginComponents={pluginComponents} />
      );
      codeRouter.displayName = 'CodeRouter';

      return {
        // __codeBlock 是内部约定 key，在 useMarkdownToReact 的 pre override 中使用
        __codeBlock: codeRouter,
        ...pluginComponents,
      };
    }, [pluginComponents]);

    const reactContent = useMarkdownToReact(displayedContent, {
      remarkPlugins,
      htmlConfig,
      components,
    });

    return wrapSSR(
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
        <div className={clsx(`${prefixCls}-container`, hashId)}>
          {reactContent}
        </div>
      </div>,
    );
  },
);

InternalMarkdownRenderer.displayName = 'MarkdownRenderer';

export default InternalMarkdownRenderer;

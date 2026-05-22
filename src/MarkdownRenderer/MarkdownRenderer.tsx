import { ConfigProvider } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import type { MarkdownEditorPlugin } from '../MarkdownEditor/plugin';
import { useStyle as useEditorStyle } from '../MarkdownEditor/style';
import { DefaultCodeRouter } from './DefaultCodeRouter';
import { extractFootnoteDefinitionsFromMarkdown } from './extractFootnoteDefinitions';
import type {
  MarkdownRendererProps,
  MarkdownRendererRef,
  RendererBlockProps,
} from './types';
import { useContentThrottle } from './useContentThrottle';
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
    throttleOptions,
    plugins,
    remarkPlugins,
    htmlConfig,
    className,
    style,
    prefixCls: customPrefixCls,
    linkConfig,
    apaasify,
    eleRender,
    fileMapConfig,
    fncProps,
    codeProps: editorCodeProps,
  } = props;

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-md-editor', customPrefixCls);
  const { hashId } = useEditorStyle(prefixCls);
  const contentCls = `${prefixCls}-content`;

  const containerRef = useRef<HTMLDivElement>(null);
  const sourceText = content || '';

  const throttleEnabled = streaming && throttleOptions?.enabled !== false;

  const displayedText = useContentThrottle(
    sourceText,
    throttleEnabled,
    throttleOptions,
    isFinished,
  );

  useImperativeHandle(ref, () => ({
    nativeElement: containerRef.current,
    getDisplayedContent: () => displayedText,
  }));

  const pluginComponents = useMemo(
    () => collectRendererComponents(plugins),
    [plugins],
  );

  const lastFootnoteEmptyRef = useRef(false);
  useEffect(() => {
    const notify = fncProps?.onFootnoteDefinitionChange;
    if (!notify) return;
    if (
      !displayedText.includes('[^') ||
      !/^\[\^[^\]]+\]:/m.test(displayedText)
    ) {
      if (!lastFootnoteEmptyRef.current) {
        notify([]);
        lastFootnoteEmptyRef.current = true;
      }
      return;
    }
    lastFootnoteEmptyRef.current = false;
    notify(extractFootnoteDefinitionsFromMarkdown(displayedText));
  }, [displayedText, fncProps?.onFootnoteDefinitionChange]);

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

  const safeContent = useStreaming(displayedText, streaming);

  const reactContent = useMarkdownToReact(safeContent, {
    remarkPlugins,
    htmlConfig,
    components,
    prefixCls,
    linkConfig,
    fncProps,
    streaming,
    // 修订追踪用未限流的完整 source，保证缓存键随真实流入推进，而非随限流帧抖动。
    contentRevisionSource: streaming ? sourceText : undefined,
    eleRender,
  });

  return (
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
    </div>
  );
});

InternalMarkdownRenderer.displayName = 'MarkdownRenderer';

export default InternalMarkdownRenderer;

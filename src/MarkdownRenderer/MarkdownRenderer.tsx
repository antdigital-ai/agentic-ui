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
import { useFormulaConfig } from '../Config';
import { useStyle as useEditorStyle } from '../MarkdownEditor/style';
import {
  collectRendererComponents,
  collectRendererRehypePlugins,
  collectRendererRemarkPlugins,
} from './collectMarkdownRendererPlugin';
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
    formula: formulaProp,
  } = props;

  const formulaConfig = useFormulaConfig(formulaProp);

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

  const mergedRemarkPlugins = useMemo(() => {
    const fromPlugins = collectRendererRemarkPlugins(plugins);
    if (!remarkPlugins?.length) {
      return fromPlugins.length ? fromPlugins : undefined;
    }
    if (!fromPlugins.length) {
      return remarkPlugins;
    }
    return [...remarkPlugins, ...fromPlugins];
  }, [plugins, remarkPlugins]);

  const mergedRehypePlugins = useMemo(
    () => collectRendererRehypePlugins(plugins),
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

  // 逐词淡入是否生效：流式 + 未显式关闭。单一来源，同时驱动 token 拆分与容器类。
  const fadeActive = streaming && throttleOptions?.fade !== false;

  const reactContent = useMarkdownToReact(safeContent, {
    remarkPlugins: mergedRemarkPlugins,
    rehypePlugins: mergedRehypePlugins.length ? mergedRehypePlugins : undefined,
    htmlConfig,
    formula: formulaConfig,
    components,
    prefixCls,
    linkConfig,
    fncProps,
    streaming,
    fadeTokens: fadeActive,
    // 修订追踪用未限流的完整 source，保证缓存键随真实流入推进，而非随限流帧抖动。
    contentRevisionSource: streaming ? sourceText : undefined,
    eleRender,
  });

  return (
    <div
      ref={containerRef}
      className={clsx(prefixCls, `${prefixCls}-readonly`, hashId, className)}
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
            { [`${contentCls}-streaming`]: fadeActive },
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

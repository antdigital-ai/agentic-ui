import { ConfigProvider } from 'antd';
import clsx from 'clsx';
import React, {
  createContext,
  forwardRef,
  useContext,
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
import { MarkdownTable } from './renderers/MarkdownTable';
import type {
  MarkdownRendererProps,
  MarkdownRendererRef,
  RendererBlockProps,
} from './types';
import { useContentThrottle } from './useContentThrottle';
import {
  FootnoteDefinitionsContext,
  useFootnoteDefinitions,
} from './useFootnoteDefinitions';
import { useMarkdownToReact } from './useMarkdownToReact';
import { useStreaming } from './useStreaming';

interface CodeRuntime {
  pluginComponents: ReturnType<typeof collectRendererComponents>;
  apaasifyRender: React.ComponentProps<
    typeof DefaultCodeRouter
  >['apaasifyRender'];
  fileMapConfig: MarkdownRendererProps['fileMapConfig'];
  editorCodeProps: MarkdownRendererProps['codeProps'];
}

interface TableRuntime {
  tableConfig: MarkdownRendererProps['tableConfig'];
  prefixCls: string;
  eleRender: MarkdownRendererProps['eleRender'];
}

const CodeRuntimeContext = createContext<CodeRuntime | null>(null);
const TableRuntimeContext = createContext<TableRuntime | null>(null);

const CodeRouter = (props: RendererBlockProps) => {
  const runtime = useContext(CodeRuntimeContext);
  if (!runtime) return null;
  return (
    <DefaultCodeRouter
      {...props}
      pluginComponents={runtime.pluginComponents}
      apaasifyRender={runtime.apaasifyRender}
      fileMapConfig={runtime.fileMapConfig}
      editorCodeProps={runtime.editorCodeProps}
    />
  );
};

const TableRenderer = ({ node, ...props }: RendererBlockProps) => {
  const runtime = useContext(TableRuntimeContext);
  if (!runtime?.tableConfig) return null;
  const defaultDom = (
    <MarkdownTable
      {...props}
      prefixCls={runtime.prefixCls}
      config={runtime.tableConfig}
    />
  );
  const rendered = runtime.eleRender?.(
    { tagName: 'table', node, ...props },
    defaultDom,
  );
  return rendered !== undefined ? rendered : defaultDom;
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
    tableConfig,
    formula: formulaProp,
  } = props;

  const formulaConfig = useFormulaConfig(formulaProp);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-md-editor', customPrefixCls);
  const { hashId } = useEditorStyle(prefixCls);
  const contentCls = `${prefixCls}-content`;

  const containerRef = useRef<HTMLDivElement>(null);
  const sourceText = content || '';
  const activeStreaming = streaming && !isFinished;

  const throttleEnabled = activeStreaming && throttleOptions?.enabled !== false;

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

  const { definitionMap } = useFootnoteDefinitions(
    displayedText,
    fncProps?.onFootnoteDefinitionChange,
  );

  const apaasifyRender = useMemo(() => {
    if (apaasify?.enable && apaasify.render) return apaasify.render;
    return undefined;
  }, [apaasify]);

  const codeRuntime = useMemo(
    () => ({
      pluginComponents,
      apaasifyRender,
      fileMapConfig,
      editorCodeProps,
    }),
    [pluginComponents, apaasifyRender, fileMapConfig, editorCodeProps],
  );
  const tableRuntime = useMemo(
    () => ({
      tableConfig,
      prefixCls,
      eleRender,
    }),
    [tableConfig, prefixCls, eleRender],
  );
  const tablePreviewEnabled = !!tableConfig?.actions?.fullScreen;
  const components = useMemo(
    () => ({
      __codeBlock: CodeRouter,
      ...(tablePreviewEnabled ? { table: TableRenderer } : {}),
      ...pluginComponents,
    }),
    [pluginComponents, tablePreviewEnabled],
  );

  const safeContent = useStreaming(displayedText, activeStreaming);

  // 逐词淡入是否生效：流式 + 未显式关闭。单一来源，同时驱动 token 拆分与容器类。
  const fadeActive = activeStreaming && throttleOptions?.fade !== false;

  const reactContent = useMarkdownToReact(safeContent, {
    remarkPlugins: mergedRemarkPlugins,
    rehypePlugins: mergedRehypePlugins.length ? mergedRehypePlugins : undefined,
    htmlConfig,
    formula: formulaConfig,
    components,
    prefixCls,
    linkConfig,
    fncProps,
    streaming: activeStreaming,
    isFinished: streaming && isFinished,
    fadeTokens: fadeActive,
    // 仅随宿主 fade 配置变化（不随流式结束翻转），驱动 processor 重建重解析缓存块
    fadeTokensConfig: throttleOptions?.fade !== false,
    // 修订追踪用未限流的完整 source，保证缓存键随真实流入推进，而非随限流帧抖动。
    contentRevisionSource: activeStreaming ? sourceText : undefined,
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
          <FootnoteDefinitionsContext.Provider value={definitionMap}>
            <CodeRuntimeContext.Provider value={codeRuntime}>
              <TableRuntimeContext.Provider value={tableRuntime}>
                {reactContent}
              </TableRuntimeContext.Provider>
            </CodeRuntimeContext.Provider>
          </FootnoteDefinitionsContext.Provider>
        </div>
      </div>
    </div>
  );
});

InternalMarkdownRenderer.displayName = 'MarkdownRenderer';

export default InternalMarkdownRenderer;

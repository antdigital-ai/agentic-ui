import React, { lazy, Suspense, useMemo } from 'react';
import type { MarkdownEditorProps } from '../MarkdownEditor/types';
import { extractBlockTextContent } from './extractBlockTextContent';
import type { FileMapConfig, RendererBlockProps } from './types';

const LazyMermaidBlockRenderer = lazy(() =>
  import('./renderers/MermaidRenderer').then((m) => ({
    default: m.MermaidBlockRenderer,
  })),
);
const LazyChartBlockRenderer = lazy(() =>
  import('./renderers/ChartRenderer').then((m) => ({
    default: m.ChartBlockRenderer,
  })),
);
const LazyCodeBlockRenderer = lazy(() =>
  import('./renderers/CodeRenderer').then((m) => ({
    default: m.CodeBlockRenderer,
  })),
);
const LazySchemaBlockRenderer = lazy(() =>
  import('./renderers/SchemaRenderer').then((m) => ({
    default: m.SchemaBlockRenderer,
  })),
);
const LazyAgenticUiTaskBlockRenderer = lazy(() =>
  import('./renderers/AgenticUiTaskBlockRenderer').then((m) => ({
    default: m.AgenticUiTaskBlockRenderer,
  })),
);
const LazyAgenticUiToolUseBarBlockRenderer = lazy(() =>
  import('./renderers/AgenticUiToolUseBarBlockRenderer').then((m) => ({
    default: m.AgenticUiToolUseBarBlockRenderer,
  })),
);
const LazyAgenticUiFileMapBlockRenderer = lazy(() =>
  import('./renderers/AgenticUiFileMapBlockRenderer').then((m) => ({
    default: m.AgenticUiFileMapBlockRenderer,
  })),
);

const SCHEMA_LANGUAGES = new Set([
  'schema',
  'apaasify',
  'apassify',
  'agentar-card',
]);

const CodeBlockLazyFallback: React.FC<RendererBlockProps> = (props) => {
  const code = useMemo(
    () => extractBlockTextContent(props.children),
    [props.children],
  );
  return (
    <pre
      className="agentic-md-renderer-fallback"
      style={{
        margin: '0.5em 0',
        padding: '0.75em 1em',
        overflow: 'auto',
        fontSize: '0.875em',
        lineHeight: 1.5,
        background: 'var(--ant-color-fill-quaternary, #f5f5f5)',
        borderRadius: 6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      <code>{code}</code>
    </pre>
  );
};

export type DefaultCodeRouterProps = RendererBlockProps & {
  pluginComponents: Record<string, React.ComponentType<RendererBlockProps>>;
  apaasifyRender?: (value: any) => React.ReactNode;
  fileMapConfig?: FileMapConfig;
  editorCodeProps?: MarkdownEditorProps['codeProps'];
};

/**
 * 默认的代码块路由：内置渲染器使用 React.lazy 分包，插件提供的 renderer 仍同步加载。
 */
export const DefaultCodeRouter: React.FC<DefaultCodeRouterProps> = (props) => {
  const {
    language,
    pluginComponents,
    apaasifyRender,
    fileMapConfig,
    editorCodeProps,
    ...rest
  } = props;

  if (language === 'mermaid') {
    if (pluginComponents.mermaid) {
      const C = pluginComponents.mermaid;
      return <C {...rest} language={language} />;
    }
    return (
      <Suspense
        fallback={<CodeBlockLazyFallback {...rest} language={language} />}
      >
        <LazyMermaidBlockRenderer {...rest} language={language} />
      </Suspense>
    );
  }

  if (language === 'chart' || language === 'json-chart') {
    if (pluginComponents.chart) {
      const C = pluginComponents.chart;
      return <C {...rest} language={language} />;
    }
    return (
      <Suspense
        fallback={<CodeBlockLazyFallback {...rest} language={language} />}
      >
        <LazyChartBlockRenderer {...rest} language={language} />
      </Suspense>
    );
  }

  if (language === 'agentic-ui-task') {
    if (pluginComponents['agentic-ui-task']) {
      const C = pluginComponents['agentic-ui-task'];
      return <C {...rest} language={language} />;
    }
    return (
      <Suspense
        fallback={<CodeBlockLazyFallback {...rest} language={language} />}
      >
        <LazyAgenticUiTaskBlockRenderer {...rest} language={language} />
      </Suspense>
    );
  }

  if (
    language === 'agentic-ui-toolusebar' ||
    language === 'agentic-ui-usertoolbar'
  ) {
    if (
      pluginComponents['agentic-ui-toolusebar'] ||
      pluginComponents['agentic-ui-usertoolbar']
    ) {
      const C =
        pluginComponents['agentic-ui-toolusebar'] ||
        pluginComponents['agentic-ui-usertoolbar']!;
      return <C {...rest} language={language} />;
    }
    return (
      <Suspense
        fallback={<CodeBlockLazyFallback {...rest} language={language} />}
      >
        <LazyAgenticUiToolUseBarBlockRenderer {...rest} language={language} />
      </Suspense>
    );
  }

  if (language === 'agentic-ui-filemap') {
    if (pluginComponents['agentic-ui-filemap']) {
      const C = pluginComponents['agentic-ui-filemap'];
      return <C {...rest} language={language} fileMapConfig={fileMapConfig} />;
    }
    return (
      <Suspense
        fallback={<CodeBlockLazyFallback {...rest} language={language} />}
      >
        <LazyAgenticUiFileMapBlockRenderer
          {...rest}
          language={language}
          fileMapConfig={fileMapConfig}
        />
      </Suspense>
    );
  }

  if (language && SCHEMA_LANGUAGES.has(language)) {
    if (pluginComponents.schema) {
      const C = pluginComponents.schema;
      return (
        <C
          {...rest}
          language={language}
          apaasifyRender={apaasifyRender}
          editorCodeProps={editorCodeProps}
        />
      );
    }
    return (
      <Suspense
        fallback={<CodeBlockLazyFallback {...rest} language={language} />}
      >
        <LazySchemaBlockRenderer
          {...rest}
          language={language}
          apaasifyRender={apaasifyRender}
          editorCodeProps={editorCodeProps}
        />
      </Suspense>
    );
  }

  if (language && pluginComponents[language]) {
    const C = pluginComponents[language];
    return (
      <C {...rest} language={language} editorCodeProps={editorCodeProps} />
    );
  }

  if (pluginComponents.code) {
    const C = pluginComponents.code;
    return (
      <C {...rest} language={language} editorCodeProps={editorCodeProps} />
    );
  }
  return (
    <Suspense
      fallback={<CodeBlockLazyFallback {...rest} language={language} />}
    >
      <LazyCodeBlockRenderer
        {...rest}
        language={language}
        editorCodeProps={editorCodeProps}
      />
    </Suspense>
  );
};

export default DefaultCodeRouter;

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

/* -------------------------------------------------------------------------- */
/*  声明式路由表                                                               */
/* -------------------------------------------------------------------------- */

type LazyComponent = React.LazyExoticComponent<React.ComponentType<any>>;

interface RouteConfig {
  /** 匹配的 language 标识；aliases 中的语言也路由到同一组件 */
  language: string;
  /** 同路由的别名（如 'agentic-ui-usertoolbar' → 'agentic-ui-toolusebar'） */
  aliases?: string[];
  /** React.lazy 加载的组件 */
  component: LazyComponent;
  /** 需要从 pluginComponents 中查找的插件 key（默认等于 language） */
  pluginKey?: string;
  /** 额外透传给组件的 props 选择器 */
  extraProps?: (
    ctx: DefaultCodeRouterProps,
  ) => Record<string, any> | undefined;
}

const ROUTE_TABLE: RouteConfig[] = [
  {
    language: 'mermaid',
    component: LazyMermaidBlockRenderer,
  },
  {
    language: 'chart',
    aliases: ['json-chart'],
    component: LazyChartBlockRenderer,
  },
  {
    language: 'agentic-ui-task',
    component: LazyAgenticUiTaskBlockRenderer,
  },
  {
    language: 'agentic-ui-toolusebar',
    aliases: ['agentic-ui-usertoolbar'],
    component: LazyAgenticUiToolUseBarBlockRenderer,
  },
  {
    language: 'agentic-ui-filemap',
    component: LazyAgenticUiFileMapBlockRenderer,
    extraProps: (ctx) => ({ fileMapConfig: ctx.fileMapConfig }),
  },
];

/** 构建 language → RouteConfig 的查找表（含 aliases 展开） */
const ROUTE_MAP = new Map<string, RouteConfig>();
for (const route of ROUTE_TABLE) {
  ROUTE_MAP.set(route.language, route);
  if (route.aliases) {
    for (const alias of route.aliases) {
      ROUTE_MAP.set(alias, route);
    }
  }
}

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
    // 仅用于从 rest 里剥离；实际通过 route.extraProps(props) 传给 filemap 组件
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileMapConfig: _fileMapConfig,
    editorCodeProps,
    ...rest
  } = props;

  // 1. 声明式路由表匹配
  const route = language ? ROUTE_MAP.get(language) : undefined;
  if (route) {
    const pluginKey = route.pluginKey ?? route.language;
    // 别名也检查对应的 plugin key
    const C =
      pluginComponents[pluginKey] ??
      (route.aliases
        ? route.aliases
            .map((a) => pluginComponents[a])
            .find((c) => c !== undefined)
        : undefined);
    if (C) {
      return (
        <C
          {...rest}
          language={language}
          {...(route.extraProps?.(props) ?? {})}
        />
      );
    }
    return (
      <Suspense
        fallback={<CodeBlockLazyFallback {...rest} language={language} />}
      >
        <route.component
          {...rest}
          language={language}
          {...(route.extraProps?.(props) ?? {})}
        />
      </Suspense>
    );
  }

  // 2. schema 语言族（共享同一个 lazy 组件 + apaasifyRender/editorCodeProps）
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

  // 3. 通用插件路由：任何 pluginComponents[language] 都可渲染
  if (language && pluginComponents[language]) {
    const C = pluginComponents[language];
    return (
      <C {...rest} language={language} editorCodeProps={editorCodeProps} />
    );
  }

  // 4. 默认代码块渲染
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

import React, { useMemo } from 'react';
import type { MarkdownEditorProps } from '../../MarkdownEditor/types';
import { SchemaRenderer, type LowCodeSchema } from '../../Schema';
import { debugInfo } from '../../Utils/debugUtils';
import { extractBlockTextContent } from '../extractBlockTextContent';
import type { RendererBlockProps } from '../types';
import { parseSchemaJson } from './utils/parseJsonBody';

/**
 * Schema / Apaasify 渲染器
 * 对齐 MarkdownEditor 的 ReadonlySchema 组件。
 *
 * 处理以下代码块语言：
 * - ```schema     → SchemaRenderer
 * - ```apaasify   → SchemaRenderer / 自定义 render
 * - ```apassify   → 同 apaasify（兼容旧版）
 * - ```agentar-card → SchemaRenderer
 */
/**
 * schema / apaasify 解析后的 JSON 形态由用户决定，无法静态收敛。
 * 此处用 `Record<string, unknown>` 表示"任意键的对象"，比 any 更安全：
 * - 调用方读取 `initialValues` 等已知字段时仍需做存在性检查
 * - 下游 `SchemaRenderer` 接收 `LowCodeSchema` 类型，由其内部做更严格校验
 */
type SchemaValue = Record<string, unknown> | unknown[] | null;

/** 从 schemaValue 安全提取 `initialValues`（仅当为对象且字段存在时返回） */
const extractInitialValues = (value: SchemaValue): Record<string, unknown> => {
  if (
    value &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).initialValues === 'object' &&
    (value as Record<string, unknown>).initialValues !== null
  ) {
    return (value as Record<string, unknown>).initialValues as Record<
      string,
      unknown
    >;
  }
  return {};
};

export const SchemaBlockRenderer: React.FC<
  RendererBlockProps & {
    apaasifyRender?: (value: SchemaValue) => React.ReactNode;
    editorCodeProps?: MarkdownEditorProps['codeProps'];
  }
> = (props) => {
  const { children, language, apaasifyRender, editorCodeProps } = props;
  const code = extractBlockTextContent(children);

  const schemaValue = useMemo<SchemaValue>(
    () => parseSchemaJson(code) as SchemaValue,
    [code],
  );

  const applyCodeRender = (
    defaultDom: React.ReactNode,
    valueForElement: unknown,
  ): React.ReactNode => {
    const customRender = editorCodeProps?.render;
    if (!customRender) return defaultDom;
    // customRender 接收 Slate-like 结构。MarkdownRenderer 不依赖 Slate，构造一个
    // 形状兼容的对象即可；因 customRender 的 `props` 类型为 `CustomLeaf<...> & { children }`，
    // 与此处 `element` 字段类型并不严格匹配，故在调用边界保留一次必要的类型断言。
    const slateLike = {
      attributes: {},
      children: null,
      element: {
        type: language === 'agentar-card' ? 'card' : 'schema',
        value: valueForElement,
        language,
      },
    } as unknown as Parameters<typeof customRender>[0];
    try {
      const rendered = customRender(slateLike, defaultDom, editorCodeProps);
      if (rendered === undefined) return defaultDom;
      return rendered;
    } catch (error) {
      debugInfo('SchemaBlockRenderer - codeProps.render 异常，回退默认', {
        error: (error as Error)?.message || String(error),
      });
      return defaultDom;
    }
  };

  if (!schemaValue) {
    const fallbackDom = (
      <pre
        data-testid="schema-fallback"
        style={{
          background: 'rgb(242, 241, 241)',
          color: 'rgb(27, 27, 27)',
          padding: '1em',
          borderRadius: '0.5em',
          margin: '1em 0',
          fontSize: '0.8em',
          fontFamily: 'monospace',
          lineHeight: '1.5',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          wordWrap: 'break-word',
        }}
      >
        <code>{code}</code>
      </pre>
    );
    return applyCodeRender(fallbackDom, code);
  }

  if (apaasifyRender) {
    const rendered = apaasifyRender(schemaValue);
    if (rendered !== undefined) {
      const apaasifyDom = (
        <div
          data-testid="schema-container"
          contentEditable={false}
          style={{
            display: 'flex',
            flexDirection: 'column',
            userSelect: 'text',
            WebkitUserSelect: 'text',
          }}
        >
          {rendered}
          <div
            data-testid="schema-hidden-json"
            style={{
              height: 1,
              opacity: 0,
              userSelect: 'none',
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            {JSON.stringify(schemaValue, null, 2)}
          </div>
        </div>
      );
      return applyCodeRender(apaasifyDom, schemaValue);
    }
  }

  if (language === 'agentar-card') {
    const cardDom = (
      <div
        data-testid="agentar-card-container"
        style={{ padding: '0.5em' }}
        data-agentar-card="true"
      >
        <SchemaRenderer
          schema={schemaValue as LowCodeSchema}
          values={extractInitialValues(schemaValue) as Record<string, any>}
          useDefaultValues={false}
          debug={false}
          fallbackContent={null}
        />
      </div>
    );
    return applyCodeRender(cardDom, schemaValue);
  }

  const schemaDom = (
    <div data-testid="schema-renderer" style={{ padding: '0.5em' }}>
      <SchemaRenderer
        schema={schemaValue as LowCodeSchema}
        values={extractInitialValues(schemaValue) as Record<string, any>}
        useDefaultValues={false}
        debug={false}
        fallbackContent={null}
      />
    </div>
  );
  return applyCodeRender(schemaDom, schemaValue);
};

SchemaBlockRenderer.displayName = 'SchemaBlockRenderer';

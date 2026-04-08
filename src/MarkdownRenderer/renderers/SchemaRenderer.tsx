import React, { useMemo } from 'react';
import partialParse from '../../MarkdownEditor/editor/parser/json-parse';
import type { MarkdownEditorProps } from '../../MarkdownEditor/types';
import { SchemaRenderer } from '../../Schema';
import { debugInfo } from '../../Utils/debugUtils';
import type { RendererBlockProps } from '../types';

const extractTextContent = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractTextContent).join('');
  if (React.isValidElement(children) && children.props?.children) {
    return extractTextContent(children.props.children);
  }
  return '';
};

/**
 * 解析 schema/apaasify JSON 内容，与 Slate parseCode 的 processSchemaLanguage 对齐
 */
const parseSchemaValue = (code: string): any => {
  try {
    return JSON.parse(code);
  } catch {
    try {
      return partialParse(code || '[]');
    } catch {
      return null;
    }
  }
};

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
export const SchemaBlockRenderer: React.FC<
  RendererBlockProps & {
    apaasifyRender?: (value: any) => React.ReactNode;
    editorCodeProps?: MarkdownEditorProps['codeProps'];
  }
> = (props) => {
  const { children, language, apaasifyRender, editorCodeProps } = props;
  const code = extractTextContent(children);

  const schemaValue = useMemo(() => parseSchemaValue(code), [code]);

  const applyCodeRender = (
    defaultDom: React.ReactNode,
    valueForElement: any,
  ): React.ReactNode => {
    const customRender = editorCodeProps?.render;
    if (!customRender) return defaultDom;
    const slateLike = {
      attributes: {},
      children: null,
      element: {
        type: language === 'agentar-card' ? 'card' : 'schema',
        value: valueForElement,
        language,
      },
    } as any;
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
          schema={schemaValue}
          values={schemaValue?.initialValues || {}}
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
        schema={schemaValue}
        values={schemaValue?.initialValues || {}}
        useDefaultValues={false}
        debug={false}
        fallbackContent={null}
      />
    </div>
  );
  return applyCodeRender(schemaDom, schemaValue);
};

SchemaBlockRenderer.displayName = 'SchemaBlockRenderer';

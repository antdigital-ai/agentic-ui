import json5 from 'json5';
import React, { useMemo } from 'react';
import { SuggestionList } from '../../Components/SuggestionList';
import { normalizeUserToolbarPropsFromJson } from '../../MarkdownEditor/editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';
import partialParse from '../../MarkdownEditor/editor/parser/json-parse';
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

const parseJsonBody = (code: string): unknown => {
  try {
    return json5.parse(code || '{}');
  } catch {
    try {
      return partialParse(code || '{}');
    } catch {
      return null;
    }
  }
};

/**
 * ```agentic-ui-usertoolbar``` 代码块 → SuggestionList（用户侧快捷操作条）
 */
export const AgenticUiUserToolbarBlockRenderer: React.FC<RendererBlockProps> = (
  props,
) => {
  const code = useMemo(
    () => extractTextContent(props.children),
    [props.children],
  );
  const parsed = useMemo(() => parseJsonBody(code), [code]);
  const toolbarProps = useMemo(
    () => normalizeUserToolbarPropsFromJson(parsed),
    [parsed],
  );

  if (parsed === null) {
    return (
      <pre
        data-testid="agentic-ui-usertoolbar-fallback"
        style={{
          background: 'rgb(242, 241, 241)',
          padding: '1em',
          borderRadius: '0.5em',
          margin: '0.75em 0',
          fontSize: '0.8em',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      data-testid="agentic-ui-usertoolbar-block"
      style={{ margin: '0.75em 0' }}
    >
      <SuggestionList {...toolbarProps} />
    </div>
  );
};

AgenticUiUserToolbarBlockRenderer.displayName =
  'AgenticUiUserToolbarBlockRenderer';

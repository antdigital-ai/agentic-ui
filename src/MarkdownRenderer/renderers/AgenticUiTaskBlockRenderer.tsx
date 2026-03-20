import json5 from 'json5';
import React, { useMemo } from 'react';
import { normalizeTaskListPropsFromJson } from '../../MarkdownEditor/editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';
import partialParse from '../../MarkdownEditor/editor/parser/json-parse';
import { TaskList } from '../../TaskList';
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
 * ```agentic-ui-task``` 代码块 → TaskList（与 MarkdownEditor parseCode 对齐）
 */
export const AgenticUiTaskBlockRenderer: React.FC<RendererBlockProps> = (
  props,
) => {
  const code = useMemo(
    () => extractTextContent(props.children),
    [props.children],
  );
  const parsed = useMemo(() => parseJsonBody(code), [code]);
  const listProps = useMemo(
    () => normalizeTaskListPropsFromJson(parsed),
    [parsed],
  );

  if (parsed === null) {
    return (
      <pre
        data-testid="agentic-ui-task-fallback"
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
    <div data-testid="agentic-ui-task-block" style={{ margin: '0.75em 0' }}>
      <TaskList {...listProps} />
    </div>
  );
};

AgenticUiTaskBlockRenderer.displayName = 'AgenticUiTaskBlockRenderer';

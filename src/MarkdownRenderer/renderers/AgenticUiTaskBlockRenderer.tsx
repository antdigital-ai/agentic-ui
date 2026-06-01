import React, { useMemo } from 'react';
import { normalizeTaskListPropsFromJson } from '../../MarkdownEditor/editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';
import { TaskList } from '../../TaskList';
import { extractBlockTextContent } from '../extractBlockTextContent';
import type { RendererBlockProps } from '../types';
import { parseJsonBody } from './utils/parseJsonBody';
import { RendererJsonFallback } from './utils/RendererJsonFallback';

/**
 * ```agentic-ui-task``` 代码块 → TaskList（与 MarkdownEditor parseCode 对齐）
 */
export const AgenticUiTaskBlockRenderer: React.FC<RendererBlockProps> = (
  props,
) => {
  const code = useMemo(
    () => extractBlockTextContent(props.children),
    [props.children],
  );
  const parsed = useMemo(() => parseJsonBody(code), [code]);
  const listProps = useMemo(
    () => normalizeTaskListPropsFromJson(parsed),
    [parsed],
  );

  if (parsed === null) {
    return (
      <RendererJsonFallback testId="agentic-ui-task-fallback" code={code} />
    );
  }

  return (
    <div data-testid="agentic-ui-task-block" style={{ margin: '0.75em 0' }}>
      <TaskList {...listProps} />
    </div>
  );
};

AgenticUiTaskBlockRenderer.displayName = 'AgenticUiTaskBlockRenderer';

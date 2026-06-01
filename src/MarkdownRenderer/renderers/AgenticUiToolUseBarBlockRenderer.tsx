import React, { useMemo } from 'react';
import { normalizeToolUseBarPropsFromJson } from '../../MarkdownEditor/editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';
import { ToolUseBar } from '../../ToolUseBar';
import { extractBlockTextContent } from '../extractBlockTextContent';
import type { RendererBlockProps } from '../types';
import { parseJsonBody } from './utils/parseJsonBody';
import { RendererJsonFallback } from './utils/RendererJsonFallback';

/**
 * ```agentic-ui-toolusebar``` 代码块 → ToolUseBar
 */
export const AgenticUiToolUseBarBlockRenderer: React.FC<RendererBlockProps> = (
  props,
) => {
  const code = useMemo(
    () => extractBlockTextContent(props.children),
    [props.children],
  );
  const parsed = useMemo(() => parseJsonBody(code), [code]);
  const { tools, ...restBar } = useMemo(
    () => normalizeToolUseBarPropsFromJson(parsed),
    [parsed],
  );

  if (parsed === null) {
    return (
      <RendererJsonFallback
        testId="agentic-ui-toolusebar-fallback"
        code={code}
      />
    );
  }

  return (
    <div
      data-testid="agentic-ui-toolusebar-block"
      style={{ margin: '0.75em 0' }}
    >
      <ToolUseBar tools={tools} {...restBar} />
    </div>
  );
};

AgenticUiToolUseBarBlockRenderer.displayName =
  'AgenticUiToolUseBarBlockRenderer';

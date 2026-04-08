import React from 'react';
import { RenderElementProps } from 'slate-react';
import { ToolUseBar } from '../../../../ToolUseBar';
import { normalizeToolUseBarPropsFromJson } from './agenticUiEmbedUtils';

export const AgenticUiToolUseBarBlock: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const { tools, ...restBar } = normalizeToolUseBarPropsFromJson(
    (element as any).value,
  );

  return (
    <div
      {...attributes}
      contentEditable={false}
      data-testid="agentic-ui-toolusebar-block"
      style={{ margin: '0.75em 0' }}
    >
      <ToolUseBar tools={tools} {...restBar} />
      <span
        data-testid="agentic-ui-toolusebar-hidden-children"
        style={{ display: 'none' }}
      >
        {children}
      </span>
    </div>
  );
};

AgenticUiToolUseBarBlock.displayName = 'AgenticUiToolUseBarBlock';

export const ReadonlyAgenticUiToolUseBarBlock = React.memo(
  AgenticUiToolUseBarBlock,
);
ReadonlyAgenticUiToolUseBarBlock.displayName =
  'ReadonlyAgenticUiToolUseBarBlock';

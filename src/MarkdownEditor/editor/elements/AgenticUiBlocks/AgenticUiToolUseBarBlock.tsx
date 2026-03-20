import React from 'react';
import { RenderElementProps } from 'slate-react';
import { SuggestionList } from '../../../../Components/SuggestionList';
import { normalizeToolUseBarPropsFromJson } from './agenticUiEmbedUtils';

export const AgenticUiToolUseBarBlock: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const toolbarProps = normalizeToolUseBarPropsFromJson((element as any).value);

  return (
    <div
      {...attributes}
      contentEditable={false}
      data-testid="agentic-ui-toolusebar-block"
      style={{ margin: '0.75em 0' }}
    >
      <SuggestionList {...toolbarProps} />
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

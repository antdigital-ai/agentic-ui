import React from 'react';
import { RenderElementProps } from 'slate-react';
import { SuggestionList } from '../../../../Components/SuggestionList';
import { normalizeUserToolbarPropsFromJson } from './agenticUiEmbedUtils';

export const AgenticUiUserToolbarBlock: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const toolbarProps = normalizeUserToolbarPropsFromJson(
    (element as any).value,
  );

  return (
    <div
      {...attributes}
      contentEditable={false}
      data-testid="agentic-ui-usertoolbar-block"
      style={{ margin: '0.75em 0' }}
    >
      <SuggestionList {...toolbarProps} />
      <span
        data-testid="agentic-ui-usertoolbar-hidden-children"
        style={{ display: 'none' }}
      >
        {children}
      </span>
    </div>
  );
};

AgenticUiUserToolbarBlock.displayName = 'AgenticUiUserToolbarBlock';

export const ReadonlyAgenticUiUserToolbarBlock = React.memo(
  AgenticUiUserToolbarBlock,
);
ReadonlyAgenticUiUserToolbarBlock.displayName =
  'ReadonlyAgenticUiUserToolbarBlock';

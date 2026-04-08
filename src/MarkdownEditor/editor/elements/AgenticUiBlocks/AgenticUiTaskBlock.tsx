import React from 'react';
import { RenderElementProps } from 'slate-react';
import { TaskList } from '../../../../TaskList';
import { normalizeTaskListPropsFromJson } from './agenticUiEmbedUtils';

export const AgenticUiTaskBlock: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const listProps = normalizeTaskListPropsFromJson((element as any).value);

  return (
    <div
      {...attributes}
      contentEditable={false}
      data-testid="agentic-ui-task-block"
      style={{ margin: '0.75em 0' }}
    >
      <TaskList {...listProps} />
      <span
        data-testid="agentic-ui-task-hidden-children"
        style={{ display: 'none' }}
      >
        {children}
      </span>
    </div>
  );
};

AgenticUiTaskBlock.displayName = 'AgenticUiTaskBlock';

export const ReadonlyAgenticUiTaskBlock = React.memo(AgenticUiTaskBlock);
ReadonlyAgenticUiTaskBlock.displayName = 'ReadonlyAgenticUiTaskBlock';

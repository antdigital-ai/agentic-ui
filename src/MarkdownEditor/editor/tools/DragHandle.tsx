import { HolderOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { CSSProperties } from 'react';
import { useEditorStore } from '../store';

export const DragHandle = (props: { style?: CSSProperties }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { store, editorProps, readonly } = useEditorStore();
  if (!store) return null;

  if (readonly === true) return null;
  if (editorProps?.drag?.enable !== true) return null;
  return (
    <Tooltip title="拖拽移动">
      <span
        data-drag-handle
        data-testid="drag-handle"
        style={{ ...props.style }}
        contentEditable={false}
        ref={ref}
        onMouseDown={(e) => {
          let parent = ref.current!.parentElement!;
          if (parent.parentElement?.dataset.be === 'list-item') {
            if (
              !parent.previousSibling ||
              (parent.previousSibling as HTMLElement).hasAttribute(
                'data-check-item',
              )
            ) {
              parent = parent.parentElement;
            }
          }
          e.stopPropagation();
          parent.draggable = true;
          store.draggedElement = parent;
        }}
      >
        <div data-drag-icon>
          <HolderOutlined />
        </div>
      </span>
    </Tooltip>
  );
};

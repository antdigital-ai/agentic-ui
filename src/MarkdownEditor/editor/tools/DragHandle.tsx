import { HolderOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { CSSProperties, useContext } from 'react';
import { I18nContext } from '../../../I18n';
import { useEditorStore } from '../store';

export const DragHandle = (props: { style?: CSSProperties }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { store, editorProps, readonly } = useEditorStore();
  const { locale } = useContext(I18nContext);
  if (!store) return null;

  if (readonly === true) return null;
  if (editorProps?.drag?.enable !== true) return null;
  return (
    <Tooltip title={locale?.dragToMove || '拖拽移动'}>
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

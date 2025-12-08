import { ExportOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { Node } from 'slate';
import { ElementProps, FootnoteDefinitionNode } from '../../../el';
import { useEditorStore } from '../../store';
import { DragHandle } from '../../tools/DragHandle';

export const FootnoteDefinition = (
  props: ElementProps<FootnoteDefinitionNode>,
) => {
  const { store, readonly, markdownContainerRef } = useEditorStore();
  const element = props.element;
  useMemo(() => {
    store.footnoteDefinitionMap = store.footnoteDefinitionMap.set(
      element.identifier,
      element,
    );
  }, [element]);
  return React.useMemo(() => {
    const str = Node.string(props.element);
    return (
      <div
        {...props.attributes}
        style={{
          fontSize: '12px',
          margin: '5px 0',
          display: 'flex',
          gap: 4,
        }}
        data-be={'footnoteDefinition'}
        data-drag-el
        className={!str ? 'empty' : undefined}
        onDragStart={(e) => store.dragStart(e, markdownContainerRef.current!)}
      >
        <DragHandle />
        {element.identifier}.
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {props.children}
          {readonly ? <ExportOutlined /> : null}
        </span>
      </div>
    );
  }, [props.element.children]);
};

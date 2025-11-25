import React from 'react';
import { Node } from 'slate';
import { ElementProps, FootnoteDefinitionNode } from '../../el';
import { useSelStatus } from '../../hooks/editor';
import { useEditorStore } from '../store';
import { DragHandle } from '../tools/DragHandle';

export const FootnoteReference = (
  props: ElementProps<FootnoteDefinitionNode>,
) => {
  const { store, markdownContainerRef } = useEditorStore();
  const [selected] = useSelStatus(props.element);
  return React.useMemo(() => {
    const str = Node.string(props.element);
    return (
      <p
        {...props.attributes}
        data-be={'paragraph'}
        data-testid="footnote-reference"
        data-drag-el
        className={!str ? 'empty' : undefined}
        onDragStart={(e) => store.dragStart(e, markdownContainerRef.current!)}
        data-empty={!str && selected ? 'true' : undefined}
      >
        <DragHandle />
        {props.children}
      </p>
    );
  }, [props.element.children, selected]);
};

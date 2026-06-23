import React from 'react';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, ParagraphNode } from '../../../el';
import { useSelStatus } from '../../../hooks/editor';
import { useEditorStore } from '../../store';
import { DragHandle } from '../../tools/DragHandle';

export const Paragraph = (props: ElementProps<ParagraphNode>) => {
  const align = props.element.align ?? props.element.otherProps?.align;
  debugInfo('Paragraph - 渲染段落', {
    align,
    children: props.element.children,
  });
  const { store, markdownContainerRef, readonly } = useEditorStore();
  const [selected] = useSelStatus(props.element);

  debugInfo('Paragraph - 渲染', {
    selected,
    readonly,
    align,
  });

  return (
    <div
      {...props.attributes}
      data-be={'paragraph'}
      data-drag-el
      data-align={align}
      onDragStart={(e) => {
        store.dragStart(e, markdownContainerRef.current!);
      }}
      style={{
        textAlign: align,
      }}
    >
      <DragHandle />
      {props.children}
    </div>
  );
};

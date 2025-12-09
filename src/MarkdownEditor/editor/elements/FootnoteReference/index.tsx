import React from 'react';
import { Node } from 'slate';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, FootnoteDefinitionNode } from '../../../el';
import { useSelStatus } from '../../../hooks/editor';
import { useEditorStore } from '../../store';
import { DragHandle } from '../../tools/DragHandle';

export const FootnoteReference = (
  props: ElementProps<FootnoteDefinitionNode>,
) => {
  debugInfo('FootnoteReference - 渲染脚注引用', {
    identifier: props.element.identifier,
  });
  const { store, markdownContainerRef } = useEditorStore();
  const [selected] = useSelStatus(props.element);
  return React.useMemo(() => {
    const str = Node.string(props.element);
    debugInfo('FootnoteReference - useMemo 渲染', {
      identifier: props.element.identifier,
      strLength: str.length,
      selected,
    });
    return (
      <p
        {...props.attributes}
        data-be={'paragraph'}
        data-testid="footnote-reference"
        data-drag-el
        className={!str ? 'empty' : undefined}
        onDragStart={(e) => {
          debugInfo('FootnoteReference - 拖拽开始');
          store.dragStart(e, markdownContainerRef.current!);
        }}
        data-empty={!str && selected ? 'true' : undefined}
      >
        <DragHandle />
        {props.children}
      </p>
    );
  }, [props.element.children, selected]);
};

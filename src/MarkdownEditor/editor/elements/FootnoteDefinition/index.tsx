import { ExportOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { Node } from 'slate';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, FootnoteDefinitionNode } from '../../../el';
import { useEditorStore } from '../../store';
import { DragHandle } from '../../tools/DragHandle';

export const FootnoteDefinition = (
  props: ElementProps<FootnoteDefinitionNode>,
) => {
  debugInfo('FootnoteDefinition - 渲染脚注定义', {
    identifier: props.element.identifier,
    url: props.element.url,
  });
  const { store, readonly, markdownContainerRef } = useEditorStore();
  const element = props.element;
  useMemo(() => {
    debugInfo('FootnoteDefinition - 更新脚注定义映射', {
      identifier: element.identifier,
    });
    store.footnoteDefinitionMap = store.footnoteDefinitionMap.set(
      element.identifier,
      element,
    );
  }, [element]);
  return React.useMemo(() => {
    const str = Node.string(props.element);
    debugInfo('FootnoteDefinition - useMemo 渲染', {
      identifier: element.identifier,
      strLength: str.length,
      readonly,
    });
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
        onDragStart={(e) => {
          store.dragStart(e, markdownContainerRef.current!);
        }}
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

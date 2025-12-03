import classNames from 'classnames';
import React, { createElement } from 'react';
import { Node } from 'slate';
import { ElementProps, HeadNode } from '../../el';
import { useSelStatus } from '../../hooks/editor';
import { useEditorStore } from '../store';
import { DragHandle } from '../tools/DragHandle';
import { slugify } from '../utils/dom';

export function Head({
  element,
  attributes,
  children,
}: ElementProps<HeadNode>) {
  const { store = {} as Record<string, any>, markdownContainerRef } =
    useEditorStore();
  const [selected, path] = useSelStatus(element);
  const str = Node.string(element);
  return React.useMemo(() => {
    return createElement(
      `h${element.level}`,
      {
        ...attributes,
        id: slugify(str),
        ['data-be']: 'head',
        ['data-head']: slugify(Node.string(element) || ''),
        ['data-title']: path?.[0] === 0,
        onDragStart: (e) => store.dragStart(e, markdownContainerRef.current!),
        ['data-empty']: !str && selected ? 'true' : undefined,
        ['data-align']: element.align,
        ['data-drag-el']: true,
        className: classNames({
          empty: !str,
        }),
      },
      <>
        <DragHandle />
        {children}
      </>,
    );
  }, [element.level, str, element.children, selected, path]);
}

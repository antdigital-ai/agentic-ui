import classNames from 'classnames';
import React, { createElement } from 'react';
import { Node } from 'slate';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, HeadNode } from '../../../el';
import { useSelStatus } from '../../../hooks/editor';
import { useEditorStore } from '../../store';
import { DragHandle } from '../../tools/DragHandle';
import { slugify } from '../../utils/dom';

export function Head({
  element,
  attributes,
  children,
}: ElementProps<HeadNode>) {
  debugInfo('Head - 渲染标题', {
    level: element.level,
    text: Node.string(element)?.substring(0, 50),
    align: element.align,
  });
  const { store = {} as Record<string, any>, markdownContainerRef } =
    useEditorStore();
  const [selected, path] = useSelStatus(element);
  const str = Node.string(element);

  return React.useMemo(() => {
    debugInfo('Head - useMemo 渲染', {
      level: element.level,
      selected,
      path,
      str: str?.substring(0, 50),
    });
    return createElement(
      `h${element.level}`,
      {
        ...attributes,
        id: slugify(str),
        ['data-be']: 'head',
        ['data-head']: slugify(Node.string(element) || ''),
        ['data-title']: path?.[0] === 0,
        onDragStart: (e) => {
          debugInfo('Head - 拖拽开始', { level: element.level });
          store.dragStart(e, markdownContainerRef.current!);
        },
        ['data-empty']: !str && selected ? 'true' : undefined,
        ['data-align']: element.align,
        ['data-drag-el']: true,
        style: { textAlign: element.align },
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

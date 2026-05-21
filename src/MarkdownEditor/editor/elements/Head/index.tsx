import classNames from 'clsx';
import React, { createElement, useContext } from 'react';
import { Node } from 'slate';
import { I18nContext } from '../../../../I18n';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, HeadNode } from '../../../el';
import { useSelStatus } from '../../../hooks/editor';
import { useEditorComposition } from '../../hooks/useEditorComposition';
import { useHeadEmptyPlaceholderState } from '../../hooks/useHeadEmptyPlaceholderState';
import { useEditorStore } from '../../store';
import { resolveEditorPlaceholderFromProps } from '../../utils/resolveEditorPlaceholder';
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
  const { store = {} as Record<string, any>, markdownContainerRef, editorProps } =
    useEditorStore();
  const { locale } = useContext(I18nContext);
  const [selected, path] = useSelStatus(element);
  const str = Node.string(element);
  const isComposing = useEditorComposition();
  const showPlaceholder = useHeadEmptyPlaceholderState(element, isComposing);
  const placeholderText = resolveEditorPlaceholderFromProps(
    editorProps,
    locale?.inputPlaceholder,
  );

  return createElement(
    `h${element.level}`,
    {
      ...attributes,
      id: slugify(str),
      ['data-be']: 'head',
      ['data-head']: slugify(Node.string(element) || ''),
      ['data-title']: path?.[0] === 0,
      onDragStart: (e) => {
        store.dragStart(e, markdownContainerRef.current!);
      },
      ['data-empty']: !str && selected ? 'true' : undefined,
      ['data-align']: element.align,
      ['data-drag-el']: true,
      ['data-slate-placeholder']: showPlaceholder ? placeholderText : undefined,
      style: { textAlign: element.align },
      className: classNames({
        empty: !str,
      }),
    },
    <>{children}</>,
  );
}

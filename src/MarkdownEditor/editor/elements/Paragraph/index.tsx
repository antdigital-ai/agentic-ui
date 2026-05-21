import classNames from 'clsx';
import React, { useContext } from 'react';
import { I18nContext } from '../../../../I18n';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, ParagraphNode } from '../../../el';
import { useSelStatus } from '../../../hooks/editor';
import { useEditorComposition } from '../../hooks/useEditorComposition';
import { useParagraphEmptyState } from '../../hooks/useParagraphEmptyState';
import { useEditorStore } from '../../store';
import { DragHandle } from '../../tools/DragHandle';
import { resolveEditorPlaceholderFromProps } from '../../utils/resolveEditorPlaceholder';

export const Paragraph = (props: ElementProps<ParagraphNode>) => {
  const align = props.element.align ?? props.element.otherProps?.align;
  debugInfo('Paragraph - 渲染段落', {
    align,
    children: props.element.children,
  });
  const { store, markdownContainerRef, readonly, editorProps } =
    useEditorStore();
  const { locale } = useContext(I18nContext);
  const [selected] = useSelStatus(props.element);
  const isComposing = useEditorComposition();
  const isEmpty = useParagraphEmptyState(props.element, isComposing);
  const placeholderText = resolveEditorPlaceholderFromProps(
    editorProps,
    locale?.inputPlaceholder,
  );

  debugInfo('Paragraph - 渲染', {
    strLength: props.element.children?.length,
    selected,
    readonly,
    align,
    isEmpty,
  });

  return (
    <div
      {...props.attributes}
      data-be={'paragraph'}
      data-drag-el
      className={classNames({
        empty: isEmpty,
      })}
      data-align={align}
      data-slate-placeholder={isEmpty ? placeholderText : undefined}
      onDragStart={(e) => {
        store.dragStart(e, markdownContainerRef.current!);
      }}
      data-empty={isEmpty}
      style={{
        textAlign: align,
      }}
    >
      <DragHandle />
      {props.children}
    </div>
  );
};

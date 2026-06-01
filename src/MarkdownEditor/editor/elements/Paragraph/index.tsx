import classNames from 'clsx';
import React, { useContext, useEffect, useState } from 'react';
import { Node } from 'slate';
import { I18nContext } from '../../../../I18n';
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
  const {
    store,
    markdownEditorRef,
    markdownContainerRef,
    readonly,
    editorProps,
  } = useEditorStore();
  const { locale } = useContext(I18nContext);
  const [selected] = useSelStatus(props.element);

  const [isComposing, setIsComposing] = useState(false);
  useEffect(() => {
    const container = markdownContainerRef.current;
    if (!container) return;

    const onStart = () => setIsComposing(true);
    // 与 Editor 一致：compositionend 后推迟清除，避免微信 WebView 上 Slate 尚未写入就恢复 empty
    const onEnd = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsComposing(false));
      });
    };
    container.addEventListener('compositionstart', onStart);
    container.addEventListener('compositionend', onEnd);
    return () => {
      container.removeEventListener('compositionstart', onStart);
      container.removeEventListener('compositionend', onEnd);
    };
  }, [markdownContainerRef]);

  return React.useMemo(() => {
    const str = Node.string(props.element).trim();
    debugInfo('Paragraph - useMemo 渲染', {
      strLength: str.length,
      selected,
      readonly,
      align,
    });
    const hasOnlyTextNodes = props.element?.children?.every?.(
      (child: any) => !child.type && !child.code && !child.tag,
    );
    const isEmpty =
      !str &&
      !isComposing &&
      markdownEditorRef.current?.children.length === 1 &&
      hasOnlyTextNodes
        ? true
        : undefined;

    return (
      <div
        {...props.attributes}
        data-be={'paragraph'}
        data-drag-el
        className={classNames({
          empty: isEmpty,
        })}
        data-align={align}
        data-slate-placeholder={
          isEmpty
            ? editorProps.titlePlaceholderContent ||
              locale?.inputPlaceholder ||
              '请输入内容...'
            : undefined
        }
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
  }, [
    props.element.children,
    align,
    selected,
    isComposing,
    markdownEditorRef.current?.children.length,
    editorProps.titlePlaceholderContent,
  ]);
};

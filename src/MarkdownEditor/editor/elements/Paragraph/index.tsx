import classNames from 'clsx';
import React, { useContext } from 'react';
import { Node } from 'slate';
import { I18nContext } from '../../../../I18n';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, ParagraphNode } from '../../../el';
import { useSelStatus } from '../../../hooks/editor';
import { useEditorStore } from '../../store';

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

  return React.useMemo(() => {
    const str = Node.string(props.element).trim();
    debugInfo('Paragraph - useMemo 渲染', {
      strLength: str.length,
      selected,
      readonly,
      align,
    });
    // 检查是否为空：trim 后的字符串为空（包括只包含空格的情况），且所有子节点都是纯文本节点（没有 type、code、tag）
    // 当只输入空格时，trim() 后为空字符串，应该显示 placeholder
    const hasOnlyTextNodes = props.element?.children?.every?.(
      (child: any) => !child.type && !child.code && !child.tag,
    );
    // 组合输入进行中时，Slate 模型尚未更新（字符还在 IME 候选区），
    // 此时强制视为非空以隐藏占位符，避免用户输入时占位符仍然可见。
    const isEmpty =
      !str &&
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
          display: !!str || !!props.children?.at(0).type ? undefined : 'none',
          textAlign: align,
        }}
      >
        {props.children}
      </div>
    );
  }, [
    props.element.children,
    align,
    readonly,
    selected,
    markdownEditorRef.current?.children.length,
    editorProps.titlePlaceholderContent,
  ]);
};

import clsx from 'clsx';
import React from 'react';
import { BlockQuoteNode, ElementProps } from '../../../el';
import { useEditorStore } from '../../store';

/**
 * Blockquote 组件 - 引用块组件
 *
 * 该组件用于渲染 Markdown 编辑器中的引用块元素。
 * 当 otherProps 含 markdownContainerType 时渲染为 div.markdown-container（提示块）。
 *
 * @component
 * @description 引用块组件，渲染引用内容
 * @param {ElementProps<BlockQuoteNode>} props - 组件属性
 * @param {BlockQuoteNode} props.element - 引用块节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <Blockquote
 *   element={blockquoteNode}
 *   attributes={attributes}
 * >
 *   引用内容
 * </Blockquote>
 * ```
 *
 * @returns {React.ReactElement} 渲染的引用块组件
 *
 * @remarks
 * - 使用 HTML blockquote 元素，提示块时为 div.markdown-container
 * - 支持拖拽功能
 * - 集成编辑器状态管理
 * - 使用 memo 优化性能
 * - 提供 data-be 属性用于标识
 */
export function Blockquote(props: ElementProps<BlockQuoteNode>) {
  const { store, markdownContainerRef } = useEditorStore();
  const containerType = props.element?.otherProps?.markdownContainerType as
    | string
    | undefined;
  const containerTitle = props.element?.otherProps?.markdownContainerTitle as
    | string
    | undefined;

  return React.useMemo(() => {
    const commonAttrs = {
      ...props.attributes,
      onDragStart: (e: React.DragEvent) => {
        store.dragStart(e, markdownContainerRef.current!);
      },
    };

    if (containerType) {
      return (
        <div
          {...commonAttrs}
          data-be="blockquote"
          data-testid="markdown-container"
          className={clsx(
            'markdown-container',
            containerType,
            (props.attributes as React.HTMLAttributes<HTMLElement>)?.className,
          )}
        >
          {containerTitle ? (
            <div
              className="markdown-container__title"
              data-testid="markdown-container-title"
            >
              {containerTitle}
            </div>
          ) : null}
          {props.children}
        </div>
      );
    }

    return (
      <blockquote
        data-be="blockquote"
        data-testid="blockquote"
        {...commonAttrs}
      >
        {props.children}
      </blockquote>
    );
  }, [props.element.children, containerType, containerTitle]);
}

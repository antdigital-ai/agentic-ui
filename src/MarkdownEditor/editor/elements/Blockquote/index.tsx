import React from 'react';
import { BlockQuoteNode, ElementProps } from '../../../el';
import { useEditorStore } from '../../store';

/**
 * Blockquote 组件 - 引用块组件
 *
 * 该组件用于渲染 Markdown 编辑器中的引用块元素。
 * 支持拖拽功能和编辑器状态管理。
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
 * - 使用 HTML blockquote 元素
 * - 支持拖拽功能
 * - 集成编辑器状态管理
 * - 使用 memo 优化性能
 * - 提供 data-be 属性用于标识
 */
export function Blockquote(props: ElementProps<BlockQuoteNode>) {
  const { store, markdownContainerRef } = useEditorStore();
  return React.useMemo(() => {
    return (
      <blockquote
        data-be={'blockquote'}
        {...props.attributes}
        onDragStart={(e) => {
          store.dragStart(e, markdownContainerRef.current!);
        }}
      >
        {props.children}
      </blockquote>
    );
  }, [props.element.children]);
}

import React from 'react';
import { BlockQuoteNode, ElementProps } from '../../../el';

/**
 * ReadonlyBlockquote 组件 - 只读引用块预览组件
 *
 * 专门针对 readonly 模式优化的引用块组件，移除了拖拽功能。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读引用块预览组件，用于预览模式下的引用块渲染
 * @param {ElementProps<BlockQuoteNode>} props - 组件属性
 * @param {BlockQuoteNode} props.element - 引用块节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyBlockquote
 *   element={blockquoteNode}
 *   attributes={attributes}
 * >
 *   引用内容
 * </ReadonlyBlockquote>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读引用块组件
 *
 * @remarks
 * - 移除拖拽相关事件处理
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyBlockquote: React.FC<ElementProps<BlockQuoteNode>> =
  React.memo((props) => {
    return (
      <blockquote data-be={'blockquote'} {...props.attributes}>
        {props.children}
      </blockquote>
    );
  });

ReadonlyBlockquote.displayName = 'ReadonlyBlockquote';

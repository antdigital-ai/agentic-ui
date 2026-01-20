import React from 'react';
import { Node } from 'slate';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, FootnoteDefinitionNode } from '../../../el';

/**
 * ReadonlyFootnoteReference 组件 - 只读脚注引用预览组件
 *
 * 专门针对 readonly 模式优化的脚注引用组件，移除了拖拽功能。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读脚注引用预览组件，用于预览模式下的脚注引用渲染
 * @param {ElementProps<FootnoteDefinitionNode>} props - 组件属性
 * @param {FootnoteDefinitionNode} props.element - 脚注引用节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyFootnoteReference
 *   element={footnoteReferenceNode}
 *   attributes={attributes}
 * >
 *   引用内容
 * </ReadonlyFootnoteReference>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读脚注引用组件
 *
 * @remarks
 * - 移除拖拽手柄（DragHandle）
 * - 移除拖拽相关事件处理
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyFootnoteReference: React.FC<
  ElementProps<FootnoteDefinitionNode>
> = React.memo((props) => {
  const str = Node.string(props.element);
  debugInfo('ReadonlyFootnoteReference - 渲染', {
    identifier: props.element.identifier,
    strLength: str.length,
  });
  return (
    <p
      {...props.attributes}
      data-be={'paragraph'}
      data-testid="footnote-reference"
      className={!str ? 'empty' : undefined}
    >
      {props.children}
    </p>
  );
});

ReadonlyFootnoteReference.displayName = 'ReadonlyFootnoteReference';

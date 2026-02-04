import React from 'react';
import { RenderElementProps } from 'slate-react';

/**
 * ReadonlyCard 组件 - 只读卡片预览组件
 *
 * 专门针对 readonly 模式优化的卡片组件，移除了选择状态和交互功能。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读卡片预览组件，用于预览模式下的卡片渲染
 * @param {RenderElementProps} props - 组件属性
 * @param {any} props.element - 卡片节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyCard
 *   element={cardNode}
 *   attributes={attributes}
 * >
 *   卡片内容
 * </ReadonlyCard>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读卡片组件
 *
 * @remarks
 * - 移除选择状态管理
 * - 移除交互功能（tabIndex、aria-selected 等）
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyCard: React.FC<RenderElementProps> = React.memo(
  (props) => {
    return (
      <div {...props.attributes} data-be={'card'} role="button">
        {props.children}
      </div>
    );
  },
);

ReadonlyCard.displayName = 'ReadonlyCard';

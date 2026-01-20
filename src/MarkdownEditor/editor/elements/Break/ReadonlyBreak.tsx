import React from 'react';
import { RenderElementProps } from 'slate-react';

/**
 * ReadonlyBreak 组件 - 只读换行预览组件
 *
 * 专门针对 readonly 模式优化的换行组件。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读换行预览组件，用于预览模式下的换行渲染
 * @param {RenderElementProps} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyBreak
 *   attributes={attributes}
 * >
 *   内容
 * </ReadonlyBreak>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读换行组件
 *
 * @remarks
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyBreak: React.FC<RenderElementProps> = React.memo(
  ({ attributes, children }) => {
    return (
      <span {...attributes} contentEditable={false}>
        {children}
        <br />
      </span>
    );
  },
);

ReadonlyBreak.displayName = 'ReadonlyBreak';

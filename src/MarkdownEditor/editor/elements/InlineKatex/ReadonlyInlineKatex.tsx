import React from 'react';
import { RenderElementProps } from 'slate-react';

/**
 * ReadonlyInlineKatex 组件 - 只读行内数学公式预览组件
 *
 * 专门针对 readonly 模式优化的行内数学公式组件。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读行内数学公式预览组件，用于预览模式下的行内数学公式渲染
 * @param {RenderElementProps} props - 组件属性
 * @param {any} props.element - 行内数学公式节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyInlineKatex
 *   element={inlineKatexNode}
 *   attributes={attributes}
 * >
 *   公式内容
 * </ReadonlyInlineKatex>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读行内数学公式组件
 *
 * @remarks
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyInlineKatex: React.FC<RenderElementProps> = React.memo(
  ({ attributes, children, element }) => {
    return (
      <code
        {...attributes}
        style={{
          background: 'rgb(242, 241, 241)',
          color: 'rgb(27, 27, 27)',
          padding: '0.2em 0.4em',
          borderRadius: '0.25em',
          fontSize: '0.9em',
          fontFamily: 'monospace',
        }}
      >
        {element.value}
        {children}
      </code>
    );
  },
);

ReadonlyInlineKatex.displayName = 'ReadonlyInlineKatex';

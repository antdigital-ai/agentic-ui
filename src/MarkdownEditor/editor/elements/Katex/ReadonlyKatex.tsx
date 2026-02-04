import React from 'react';
import { RenderElementProps } from 'slate-react';
import { debugInfo } from '../../../../Utils/debugUtils';

/**
 * ReadonlyKatex 组件 - 只读数学公式块预览组件
 *
 * 专门针对 readonly 模式优化的数学公式块组件。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读数学公式块预览组件，用于预览模式下的数学公式块渲染
 * @param {RenderElementProps} props - 组件属性
 * @param {any} props.element - 数学公式块节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyKatex
 *   element={katexNode}
 *   attributes={attributes}
 * >
 *   公式内容
 * </ReadonlyKatex>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读数学公式块组件
 *
 * @remarks
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyKatex: React.FC<RenderElementProps> = React.memo(
  ({ attributes, children, element }) => {
    debugInfo('ReadonlyKatex - 渲染只读数学公式块', {
      valueLength: element?.value?.length,
    });
    return (
      <pre
        {...attributes}
        style={{
          background: 'rgb(242, 241, 241)',
          color: 'rgb(27, 27, 27)',
          padding: '1em',
          borderRadius: '0.5em',
          margin: '1em 0',
          fontSize: '0.8em',
          fontFamily: 'monospace',
          lineHeight: '1.5',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          wordWrap: 'break-word',
        }}
      >
        <code>{element.value}</code>
        <div
          style={{
            display: 'none',
          }}
        >
          {children}
        </div>
      </pre>
    );
  },
);

ReadonlyKatex.displayName = 'ReadonlyKatex';

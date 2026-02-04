import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { RenderElementProps } from 'slate-react';

/**
 * ReadonlyMermaid 组件 - 只读 Mermaid 图表预览组件
 *
 * 专门针对 readonly 模式优化的 Mermaid 图表组件。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读 Mermaid 图表预览组件，用于预览模式下的 Mermaid 图表渲染
 * @param {RenderElementProps} props - 组件属性
 * @param {any} props.element - Mermaid 图表节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyMermaid
 *   element={mermaidNode}
 *   attributes={attributes}
 * >
 *   图表内容
 * </ReadonlyMermaid>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读 Mermaid 图表组件
 *
 * @remarks
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyMermaid: React.FC<RenderElementProps> = React.memo(
  ({ attributes, children, element }) => {
    const context = useContext(ConfigProvider.ConfigContext);
    const baseCls = context?.getPrefixCls('agentic-md-editor-mermaid');
    const hasError = element?.otherProps?.error === true;

    return (
      <pre
        {...attributes}
        className={classNames(baseCls, {
          [`${baseCls}-error`]: hasError,
        })}
      >
        <code>{children}</code>
      </pre>
    );
  },
);

ReadonlyMermaid.displayName = 'ReadonlyMermaid';

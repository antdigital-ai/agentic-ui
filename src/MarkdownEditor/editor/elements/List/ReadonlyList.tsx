import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { createElement, useContext } from 'react';
import { ElementProps, ListNode } from '../../../el';

/**
 * ReadonlyList 组件 - 只读列表预览组件
 *
 * 专门针对 readonly 模式优化的列表组件，移除了拖拽功能等编辑相关功能。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读列表预览组件，用于预览模式下的列表渲染
 * @param {ElementProps<ListNode>} props - 组件属性
 * @param {ListNode} props.element - 列表节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyList
 *   element={listNode}
 *   attributes={attributes}
 * >
 *   列表项内容
 * </ReadonlyList>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读列表组件
 *
 * @remarks
 * - 移除拖拽相关事件处理
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyList: React.FC<ElementProps<ListNode>> = React.memo(
  ({ element, attributes, children }) => {
    const isOrdered = element.type === 'numbered-list';
    const isBulleted = element.type === 'bulleted-list';

    const context = useContext(ConfigProvider.ConfigContext);
    const baseCls = context.getPrefixCls('agentic-md-editor-list');

    const tag = isOrdered ? 'ol' : 'ul';
    return (
      <div
        className={classNames(`${baseCls}-container`, 'relative')}
        data-be={'list'}
        {...attributes}
      >
        {createElement(
          tag,
          {
            className: classNames(baseCls, isOrdered ? 'ol' : 'ul'),
            start: isOrdered ? element.start : undefined,
            ['data-task']: isBulleted && element.task ? 'true' : undefined,
          },
          children,
        )}
      </div>
    );
  },
);

ReadonlyList.displayName = 'ReadonlyList';

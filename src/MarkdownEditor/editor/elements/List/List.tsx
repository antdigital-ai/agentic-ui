import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { createElement, useContext } from 'react';
import { ElementProps, ListNode } from '../../../el';
import { useEditorStore } from '../../store';

/**
 * 列表组件，用于渲染有序或无序列表。
 *
 * @param {ElementProps<ListNode>} props - 组件的属性。
 * @param {ListNode} props.element - 列表节点元素，包含列表的相关信息。
 * @param {React.HTMLAttributes<HTMLDivElement>} props.attributes - 传递给列表容器的属性。
 * @param {React.ReactNode} props.children - 列表项的子元素。
 *
 * @returns {JSX.Element} 渲染的列表组件。
 *
 * @component
 * @example
 * ```tsx
 * <List element={element} attributes={attributes} children={children} />
 * ```
 */
export const List = ({
  element,
  attributes,
  children,
}: ElementProps<ListNode>) => {
  const { store, markdownContainerRef } = useEditorStore();
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context.getPrefixCls('agentic-md-editor-list');

  const listContent = React.useMemo(() => {
    // 支持新的列表类型和向后兼容
    const isOrdered =
      element.type === 'numbered-list' ||
      ((element as any).type === 'list' && (element as any).order === true);
    const task = (element as any).task;
    const start = isOrdered ? (element as any).start : undefined;
    const tag = isOrdered ? 'ol' : 'ul';

    return (
      <div
        className={classNames(`${baseCls}-container`, 'relative')}
        data-be={'list'}
        {...attributes}
        onDragStart={(e) => {
          store.dragStart(e, markdownContainerRef.current!);
        }}
      >
        {createElement(
          tag,
          {
            className: classNames(baseCls, isOrdered ? 'ol' : 'ul'),
            ...(start !== undefined && { start }),
            ...(task && { 'data-task': 'true' }),
          },
          children,
        )}
      </div>
    );
  }, [
    element.type,
    (element as any).order,
    (element as any).task,
    (element as any).start,
    element.children,
    baseCls,
    attributes,
    children,
    store,
    markdownContainerRef,
  ]);

  return listContent;
};

import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { createElement, useContext } from 'react';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, ListNode } from '../../../el';
import { useEditorStore } from '../../store';
import { useStyle } from './style';

export const ListContext = React.createContext<{
  hashId: string;
} | null>(null);

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
  debugInfo('List - 渲染列表', {
    order: element.order,
    task: element.task,
    start: element.start,
    childrenCount: element.children?.length,
  });
  const { store, markdownContainerRef } = useEditorStore();
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context.getPrefixCls('agentic-md-editor-list');
  const { wrapSSR, hashId } = useStyle(baseCls);

  const listContent = React.useMemo(() => {
    const tag = element.order ? 'ol' : 'ul';
    debugInfo('List - useMemo 渲染', {
      tag,
      order: element.order,
      start: element.start,
      task: element.task,
    });
    return wrapSSR(
      <ListContext.Provider
        value={{
          hashId,
        }}
      >
        <div
          className={classNames(`${baseCls}-container`, hashId, 'relative')}
          data-be={'list'}
          {...attributes}
          onDragStart={(e) => {
            debugInfo('List - 拖拽开始');
            store.dragStart(e, markdownContainerRef.current!);
          }}
        >
          {createElement(
            tag,
            {
              className: classNames(
                baseCls,
                hashId,
                element.order ? 'ol' : 'ul',
              ),
              start: element.start,
              ['data-task']: element.task ? 'true' : undefined,
            },
            children,
          )}
        </div>
      </ListContext.Provider>,
    );
  }, [
    element.task,
    element.order,
    element.start,
    element.children,
    baseCls,
    hashId,
    attributes,
    children,
    store,
    markdownContainerRef,
    wrapSSR,
  ]);

  return listContent;
};

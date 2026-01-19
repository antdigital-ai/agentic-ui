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
  // 支持新的列表类型和向后兼容
  // 新格式：numbered-list 或 bulleted-list
  // 旧格式：list 类型，通过 order 属性判断
  const isOrdered =
    element.type === 'numbered-list' ||
    ((element as any).type === 'list' && (element as any).order === true);
  
  // 获取 task 属性（支持旧格式和新格式）
  const task = (element as any).task;
  
  debugInfo('List - 渲染列表', {
    type: element.type,
    isOrdered,
    task,
    start: isOrdered ? (element as any).start : undefined,
    childrenCount: element.children?.length,
  });
  const { store, markdownContainerRef } = useEditorStore();
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context.getPrefixCls('agentic-md-editor-list');
  const { wrapSSR, hashId } = useStyle(baseCls);

  const listContent = React.useMemo(() => {
    // 支持新的列表类型和向后兼容
    const isOrdered =
      element.type === 'numbered-list' ||
      ((element as any).type === 'list' && (element as any).order === true);
    const task = (element as any).task;
    const start = isOrdered ? (element as any).start : undefined;
    const tag = isOrdered ? 'ol' : 'ul';
    
    debugInfo('List - useMemo 渲染', {
      tag,
      type: element.type,
      start,
      task,
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
                isOrdered ? 'ol' : 'ul',
              ),
              ...(start !== undefined && { start }),
              ...(task && { 'data-task': 'true' }),
            },
            children,
          )}
        </div>
      </ListContext.Provider>,
    );
  }, [
    element.type,
    (element as any).order,
    (element as any).task,
    (element as any).start,
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

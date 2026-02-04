import { Checkbox, ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext, useMemo } from 'react';
import { ElementProps, ListItemNode } from '../../../el';

/**
 * ReadonlyListItem 组件 - 只读列表项预览组件
 *
 * 专门针对 readonly 模式优化的列表项组件，移除了编辑相关功能。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读列表项预览组件，用于预览模式下的列表项渲染
 * @param {ElementProps<ListItemNode>} props - 组件属性
 * @param {ListItemNode} props.element - 列表项节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyListItem
 *   element={listItemNode}
 *   attributes={attributes}
 * >
 *   列表项内容
 * </ReadonlyListItem>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读列表项组件
 *
 * @remarks
 * - 移除拖拽相关事件处理
 * - 任务列表的复选框在预览模式下只读
 * - 移除提及用户编辑功能
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyListItem: React.FC<ElementProps<ListItemNode>> =
  React.memo(({ element, children, attributes }) => {
    const isTask = typeof element.checked === 'boolean';
    const context = useContext(ConfigProvider.ConfigContext);
    const baseCls = context.getPrefixCls('agentic-md-editor-list');

    // 任务列表的复选框（只读模式）
    const checkbox = useMemo(() => {
      if (!isTask) return null;
      return (
        <span
          contentEditable={false}
          data-check-item
          className={classNames(`${baseCls}-check-item`)}
        >
          <Checkbox checked={element.checked} disabled />
        </span>
      );
    }, [element.checked, isTask, baseCls]);

    // 提及用户显示（只读模式，只显示不编辑）
    const mentionsUser = useMemo(() => {
      if (!isTask || !element.mentions?.length) return null;
      return (
        <div style={{ display: 'inline-block', marginLeft: 8 }}>
          {element.mentions.map((u: any) => (
            <div
              key={u.name || u.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                padding: '0 4px',
                borderRadius: 4,
                fontSize: '1em',
                lineHeight: '24px',
                color: '#1677ff',
                marginRight: 4,
              }}
            >
              @
              {u.avatar?.startsWith('http') ? (
                <img
                  width={16}
                  height={16}
                  src={u.avatar}
                  alt={u.name}
                  style={{ marginLeft: 4 }}
                />
              ) : null}
              <span>{u.name}</span>
            </div>
          ))}
        </div>
      );
    }, [element.mentions, isTask]);

    return (
      <li
        className={classNames(`${baseCls}-item`, {
          [`${baseCls}-task`]: isTask,
        })}
        data-be={'list-item'}
        {...attributes}
      >
        {checkbox}
        {mentionsUser}
        {children}
      </li>
    );
  });

ReadonlyListItem.displayName = 'ReadonlyListItem';

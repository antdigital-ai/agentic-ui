import { LoadingOutlined } from '@ant-design/icons';
import { useMountMergeState } from '@ant-design/pro-components';
import { Checkbox, ConfigProvider, Dropdown, Space } from 'antd';
import classNames from 'classnames';
import React, { useContext, useEffect, useMemo } from 'react';
import { ElementProps, ListItemNode } from '../../../el';
import { useMEditor } from '../../../hooks/editor';
import { useEditorStore } from '../../store';
import { ListContext } from './List';

type Mentions = { name: string; avatar?: string; id: string };

const MentionsUser = (props: {
  onSelect: (mentions: Mentions[]) => void;
  mentions?: Mentions[];
}) => {
  const [loading, setLoading] = React.useState(false);
  const [users, setUsers] = React.useState<Mentions[]>([]);

  const [selectedUsers, setSelectedUsers] = useMountMergeState<Mentions[]>(
    props.mentions || [],
    {
      value: props.mentions,
      onChange: props.onSelect,
    },
  );
  const { editorProps, readonly } = useEditorStore();
  const onSearch = async (text: string) => {
    setLoading(true);
    const list =
      (await editorProps?.comment?.loadMentions?.(text)) || ([] as any);
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    onSearch('');
  }, [readonly]);

  useEffect(() => {
    props.onSelect(selectedUsers);
  }, [selectedUsers]);

  const mentionsPlaceholder =
    editorProps?.comment?.mentionsPlaceholder || '指派给';

  return useMemo(() => {
    if (readonly) {
      return (
        <Space>
          {selectedUsers?.length
            ? selectedUsers?.map((u) => (
                <div
                  key={u.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    padding: '0 4px',
                    borderRadius: 4,
                    fontSize: '1em',
                    lineHeight: '24px',
                    color: '#1677ff',
                  }}
                >
                  @
                  {u.avatar?.startsWith('http') ? (
                    <img width={16} height={16} src={u.avatar} alt={u.name} />
                  ) : null}
                  <span>{u.name}</span>
                </div>
              ))
            : null}
        </Space>
      );
    }
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        style={{
          cursor: 'pointer',
        }}
      >
        <Dropdown
          menu={{
            items: users.map((u) => ({
              type: 'item',
              key: u.name,
              label: (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {u.avatar?.startsWith('http') ? (
                    <img width={16} height={16} src={u.avatar} alt={u.name} />
                  ) : null}
                  <span>{u.name}</span>
                </div>
              ),
              value: u.name,
              avatar: u.avatar,
            })),
            onClick: (value) => {
              setSelectedUsers(users.filter((u) => u.name === value.key));
            },
          }}
        >
          {loading ? (
            <LoadingOutlined spin />
          ) : (
            <Space>
              {selectedUsers?.length ? (
                selectedUsers?.map((u) => (
                  <div
                    key={u.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#f5f5f5',
                      padding: '0 4px',
                      borderRadius: 4,
                      fontSize: '1em',
                      lineHeight: '24px',
                      color: '#1677ff',
                    }}
                  >
                    @
                    {u.avatar?.startsWith('http') ? (
                      <img width={16} height={16} src={u.avatar} alt={u.name} />
                    ) : null}
                    <span>{u.name}</span>
                  </div>
                ))
              ) : (
                <span
                  style={{
                    backgroundColor: '#f5f5f5',
                    padding: '0 4px',
                    borderRadius: 4,
                    fontSize: '1em',
                    display: 'inline-block',
                    lineHeight: '24px',
                    color: '#bfbfbf',
                  }}
                >
                  {mentionsPlaceholder}
                </span>
              )}
            </Space>
          )}
        </Dropdown>
      </div>
    );
  }, [
    editorProps?.comment?.mentionsPlaceholder,
    editorProps?.comment?.loadMentions,
    users,
    loading,
    selectedUsers,
    readonly,
  ]);
};

/**
 * 列表项组件，使用 `observer` 包装以响应 MobX 状态变化。
 *
 * @param {ElementProps<ListItemNode>} props - 组件的属性。
 * @param {ListItemNode} props.element - 列表项节点元素。
 * @param {React.ReactNode} props.children - 列表项的子元素。
 * @param {object} props.attributes - 传递给列表项的其他属性。
 *
 * @returns {JSX.Element} 返回一个列表项的 JSX 元素。
 *
 * @remarks
 * - 如果 `element.checked` 是布尔值，则表示这是一个任务列表项。
 * - 使用 `useMemo` 优化渲染性能。
 * - 列表项支持拖拽操作。
 * - 如果是任务列表项，会渲染一个不可编辑的复选框。
 */
export const ListItem = ({
  element,
  children,
  attributes,
}: ElementProps<ListItemNode>) => {
  const [, update] = useMEditor(element);
  const { store, editorProps, markdownContainerRef } = useEditorStore();
  const isTask = typeof element.checked === 'boolean';
  const context = useContext(ConfigProvider.ConfigContext);
  const listItemRender = editorProps?.comment?.listItemRender;
  const { hashId = '' } = useContext(ListContext) || {};
  const baseCls = context.getPrefixCls('agentic-md-editor-list');

  const checkbox = React.useMemo(() => {
    if (!isTask) return null;
    return (
      <span
        contentEditable={false}
        data-check-item
        className={classNames(`${baseCls}-check-item`, hashId)}
      >
        <Checkbox
          checked={element.checked}
          onChange={(e) => update({ checked: e.target.checked })}
        />
      </span>
    );
  }, [element.checked, isTask]);

  const mentionsUser = React.useMemo(() => {
    if (!isTask) return null;
    return (
      <MentionsUser
        onSelect={(mentions) => {
          update({
            mentions,
          });
        }}
        mentions={element.mentions}
      />
    );
  }, [element.mentions]);

  return React.useMemo(() => {
    if (listItemRender) {
      const props = {
        checkbox,
        mentionsUser,
        children,
      };
      return (
        <li
          className={classNames(`${baseCls}-item`, hashId, {
            [`${baseCls}-task`]: isTask,
          })}
          data-be={'list-item'}
          onDragStart={(e) => store.dragStart(e, markdownContainerRef.current!)}
          {...attributes}
        >
          {listItemRender(props, { element, children, attributes })}
        </li>
      );
    }
    return (
      <li
        className={classNames(`${baseCls}-item`, hashId, {
          [`${baseCls}-task`]: isTask,
        })}
        data-be={'list-item'}
        onDragStart={(e) => store.dragStart(e, markdownContainerRef.current!)}
        {...attributes}
      >
        {checkbox}
        {mentionsUser}
        {children}
      </li>
    );
  }, [checkbox, mentionsUser, attributes, element.children, listItemRender]);
};

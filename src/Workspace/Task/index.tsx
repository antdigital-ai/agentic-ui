import { Check, CircleDashed, OctagonX } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { type FC, useContext } from 'react';
import { Loading } from '../../Components/Loading';
import { useTaskStyle } from './style';

export interface TaskItem {
  key: string;
  title?: string;
  content?: React.ReactNode | React.ReactNode[];
  status: 'success' | 'pending' | 'loading' | 'error';
}

export interface TaskItemInput {
  items: TaskItem[];
}

export interface TaskListProps {
  /** 任务列表数据 */
  data: TaskItemInput;
  /** 点击任务项时的回调 */
  onItemClick?: (item: TaskItem) => void;
}

const StatusIcon: FC<{
  status: 'success' | 'pending' | 'loading' | 'error';
}> = ({ status }) => {
  switch (status) {
    case 'success':
      return (
        <Check style={{ color: 'var(--color-green-control-fill-primary)' }} />
      );
    case 'error':
      return (
        <OctagonX style={{ color: 'var(--color-red-control-fill-primary)' }} />
      );
    case 'loading':
      return <Loading style={{ color: 'var(--color-gray-text-disabled)' }} />;
    case 'pending':
    default:
      return (
        <CircleDashed style={{ color: 'var(--color-gray-text-disabled)' }} />
      );
  }
};

export const TaskList: FC<TaskListProps> = ({ data, onItemClick }) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-workspace-task');
  const { wrapSSR, hashId } = useTaskStyle(prefixCls);

  const handleItemClick = (item: TaskItem) => {
    onItemClick?.(item);
  };

  return wrapSSR(
    <div className={classNames(prefixCls, hashId)} data-testid="task-list">
      {data.items.map((item) => (
        <div
          key={item.key}
          className={classNames(
            `${prefixCls}-item`,
            `${prefixCls}-item-${item.status}`,
            hashId,
          )}
          role={onItemClick ? 'button' : undefined}
          tabIndex={onItemClick ? 0 : undefined}
          onClick={onItemClick ? () => handleItemClick(item) : undefined}
          onKeyDown={
            onItemClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick(item);
                  }
                }
              : undefined
          }
          style={{ cursor: onItemClick ? 'pointer' : undefined }}
        >
          <div className={classNames(`${prefixCls}-status`, hashId)}>
            <StatusIcon status={item.status} />
          </div>
          <div className={classNames(`${prefixCls}-content`, hashId)}>
            <div className={classNames(`${prefixCls}-title`, hashId)}>
              {item.title}
            </div>
            {item.content && (
              <div className={classNames(`${prefixCls}-description`, hashId)}>
                {item.content}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>,
  );
};

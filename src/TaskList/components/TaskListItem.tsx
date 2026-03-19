import { ChevronUp } from '@sofa-design/icons';
import classNames from 'clsx';
import React, { memo, useCallback, useContext } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import { getArrowRotation, hasTaskContent } from '../constants';
import type { TaskItem } from '../types';
import { StatusIcon } from './StatusIcon';

interface TaskListItemProps {
  item: TaskItem;
  isLast: boolean;
  prefixCls: string;
  hashId: string;
  expandedKeys: string[];
  onToggle: (key: string) => void;
}

export const TaskListItem: React.FC<TaskListItemProps> = memo(
  ({ item, isLast, prefixCls, hashId, expandedKeys, onToggle }) => {
    const { locale } = useContext(I18nContext);
    const isCollapsed = !expandedKeys.includes(item.key);
    const hasContent = hasTaskContent(item.content);

    const handleToggle = useCallback(() => {
      onToggle(item.key);
    }, [item.key, onToggle]);

    const arrowTitle = isCollapsed
      ? locale?.['taskList.expand'] || '展开'
      : locale?.['taskList.collapse'] || '收起';

    return (
      <div
        key={item.key}
        className={classNames(`${prefixCls}-thoughtChainItem`, hashId)}
        data-testid="task-list-thoughtChainItem"
      >
        <div
          className={classNames(`${prefixCls}-left`, hashId)}
          onClick={handleToggle}
          data-testid="task-list-left"
        >
          <StatusIcon
            status={item.status}
            prefixCls={prefixCls}
            hashId={hashId}
          />
          <div className={classNames(`${prefixCls}-content-left`, hashId)}>
            {!isLast && (
              <div
                className={classNames(`${prefixCls}-dash-line`, hashId)}
                data-testid="task-list-dash-line"
              />
            )}
          </div>
        </div>
        <div className={classNames(`${prefixCls}-right`, hashId)}>
          <div
            className={classNames(`${prefixCls}-top`, hashId)}
            onClick={handleToggle}
          >
            <div className={classNames(`${prefixCls}-title`, hashId)}>
              {item.title}
            </div>
            {hasContent && (
              <div
                className={classNames(`${prefixCls}-arrowContainer`, hashId)}
                data-testid="task-list-arrowContainer"
              >
                <ActionIconBox
                  title={arrowTitle}
                  iconStyle={getArrowRotation(isCollapsed)}
                  loading={false}
                >
                  <ChevronUp data-testid="task-list-arrow" />
                </ActionIconBox>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className={classNames(`${prefixCls}-body`, hashId)}>
              <div className={classNames(`${prefixCls}-content`, hashId)}>
                {item.content}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

TaskListItem.displayName = 'TaskListItem';

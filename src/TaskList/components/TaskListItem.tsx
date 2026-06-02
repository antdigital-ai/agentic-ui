import { ChevronUp } from '@sofa-design/icons';
import classNames from 'clsx';
import React, { memo, useCallback, useContext, useEffect, useRef } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { I18nContext } from '../../I18n';
import { getArrowRotation } from '../constants';
import {
  hasNormalizedTaskContent,
  normalizeTaskContent,
} from '../normalizeTaskContent';
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
    const normalizedContent = normalizeTaskContent(item.content, item.title);
    const hasContent = hasNormalizedTaskContent(item.content, item.title);
    const bodyRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    const handleToggle = useRefFunction(() => {
      onToggle(item.key);
    });

    // 计算并设置展开/收起的高度
    const syncHeight = useCallback(() => {
      const bodyElement = bodyRef.current;
      const innerElement = innerRef.current;
      if (!bodyElement || !innerElement) return;

      if (isCollapsed) {
        // 收起：先将当前高度设为具体像素值（从 auto 无法过渡），再设为 0
        const currentHeight = bodyElement.scrollHeight;
        bodyElement.style.height = `${currentHeight}px`;
        // 强制 reflow 让浏览器记录起始值
        // Force reflow to enable CSS transition from current height to 0
        const _ = bodyElement.offsetHeight; // eslint-disable-line @typescript-eslint/no-unused-vars
        void _;
        bodyElement.style.height = '0px';
      } else {
        // 展开：计算内容高度并过渡到该值
        const targetHeight = innerElement.scrollHeight;
        bodyElement.style.height = `${targetHeight}px`;
      }
    }, [isCollapsed]);

    useEffect(() => {
      syncHeight();
    }, [syncHeight]);

    // 过渡结束后，展开态设为 auto 以适应后续内容变化
    const handleTransitionEnd = useRefFunction(() => {
      const bodyElement = bodyRef.current;
      if (!bodyElement) return;
      if (!isCollapsed) {
        bodyElement.style.height = 'auto';
      }
    });

    const arrowTitle = isCollapsed
      ? locale?.['taskList.expand'] || '展开'
      : locale?.['taskList.collapse'] || '收起';

    return (
      <div
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
        <div
          className={classNames(`${prefixCls}-right`, hashId)}
          data-testid="task-list-right"
        >
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
          <div
            ref={bodyRef}
            className={classNames(
              `${prefixCls}-body`,
              isCollapsed && `${prefixCls}-body-collapsed`,
              hashId,
            )}
            onTransitionEnd={handleTransitionEnd}
          >
            <div
              ref={innerRef}
              className={classNames(`${prefixCls}-content`, hashId)}
            >
              {normalizedContent}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

TaskListItem.displayName = 'TaskListItem';

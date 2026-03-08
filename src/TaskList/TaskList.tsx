import { ChevronUp } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useMergedState } from 'rc-util';
import React, { memo, useContext, useMemo } from 'react';
import { ActionIconBox } from '../Components/ActionIconBox';
import { useRefFunction } from '../Hooks/useRefFunction';
import { I18nContext } from '../I18n';
import { StatusIcon } from './components/StatusIcon';
import { TaskListItem } from './components/TaskListItem';
import {
  COLLAPSE_TRANSITION,
  COLLAPSE_VARIANTS,
  getArrowRotation,
} from './constants';
import { useStyle } from './style';
import type { TaskItem, TaskListProps, TaskStatus } from './types';

const getDefaultExpandedKeys = (
  items: TaskItem[],
  isControlled: boolean,
): string[] => {
  return isControlled ? [] : items.map((item) => item.key);
};

export const TaskList = memo(
  ({
    items,
    className,
    expandedKeys,
    onExpandedKeysChange,
    variant = 'default',
    open,
    onOpenChange,
  }: TaskListProps) => {
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    const prefixCls = getPrefixCls('task-list');
    const { wrapSSR, hashId } = useStyle(prefixCls);
    const { locale } = useContext(I18nContext);

    const isControlled = expandedKeys !== undefined;

    const [internalExpandedKeys, setInternalExpandedKeys] = useMergedState<
      string[]
    >(getDefaultExpandedKeys(items, isControlled), {
      value: expandedKeys,
      onChange: onExpandedKeysChange,
    });

    const handleToggle = useRefFunction((key: string) => {
      const currentExpanded = isControlled
        ? expandedKeys
        : internalExpandedKeys;
      const newExpandedKeys = currentExpanded.includes(key)
        ? currentExpanded.filter((k) => k !== key)
        : [...currentExpanded, key];
      setInternalExpandedKeys(newExpandedKeys);
    });

    const [simpleExpanded, setSimpleExpanded] = useMergedState(false, {
      value: open,
      onChange: (val) => onOpenChange?.(val),
    });

    const handleSimpleToggle = useRefFunction(() => {
      setSimpleExpanded(!simpleExpanded);
    });

    const { summaryStatus, summaryText, progressText } = useMemo(() => {
      const completedCount = items.filter(
        (i) => i.status === 'success',
      ).length;
      const loadingItem = items.find((i) => i.status === 'loading');
      const hasError = items.some((i) => i.status === 'error');
      const allDone = completedCount === items.length && items.length > 0;

      let status: TaskStatus = 'pending';
      let text = locale?.['taskList.taskList'] || '任务列表';

      if (allDone) {
        status = 'success';
        text = locale?.['taskList.taskComplete'] || '任务完成';
      } else if (loadingItem?.title) {
        status = 'loading';
        const tpl =
          locale?.['taskList.taskInProgress'] || '正在进行${taskName}任务';
        text = tpl.replace('${taskName}', String(loadingItem.title));
      } else if (hasError) {
        status = 'error';
        text = locale?.['taskList.taskAborted'] || '任务已取消';
      }

      return {
        summaryStatus: status,
        summaryText: text,
        progressText: `${completedCount}/${items.length}`,
      };
    }, [items, locale]);

    const renderItems = () =>
      items.map((item, index) => (
        <TaskListItem
          key={item.key}
          item={item}
          isLast={index === items.length - 1}
          prefixCls={prefixCls}
          hashId={hashId}
          expandedKeys={internalExpandedKeys}
          onToggle={handleToggle}
        />
      ));

    if (variant !== 'simple') {
      return wrapSSR(<div className={className}>{renderItems()}</div>);
    }

    const simpleCls = `${prefixCls}-simple`;
    const simpleArrowTitle = simpleExpanded
      ? locale?.['taskList.collapse'] || '收起'
      : locale?.['taskList.expand'] || '展开';

    return wrapSSR(
      <div
        className={classNames(`${simpleCls}-wrapper`, hashId, className)}
        data-testid="task-list-simple-wrapper"
      >
        <div
          className={classNames(simpleCls, hashId)}
          onClick={handleSimpleToggle}
          role="button"
          tabIndex={0}
          aria-expanded={simpleExpanded}
          aria-label={simpleArrowTitle}
          data-testid="task-list-simple-bar"
        >
          <div className={classNames(`${simpleCls}-status`, hashId)}>
            <StatusIcon
              status={summaryStatus}
              prefixCls={prefixCls}
              hashId={hashId}
            />
          </div>
          <div className={classNames(`${simpleCls}-text`, hashId)}>
            {summaryText}
          </div>
          <div className={classNames(`${simpleCls}-progress`, hashId)}>
            {progressText}
          </div>
          <div className={classNames(`${simpleCls}-arrow`, hashId)}>
            <ActionIconBox
              title={simpleArrowTitle}
              iconStyle={getArrowRotation(!simpleExpanded)}
              loading={false}
              onClick={(e) => {
                e.stopPropagation();
                handleSimpleToggle();
              }}
            >
              <ChevronUp data-testid="task-list-simple-arrow" />
            </ActionIconBox>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {simpleExpanded && (
            <motion.div
              key="simple-task-list-content"
              variants={COLLAPSE_VARIANTS}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={COLLAPSE_TRANSITION}
              className={classNames(`${simpleCls}-content`, hashId)}
            >
              <div className={classNames(`${simpleCls}-list`, hashId)}>
                {renderItems()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>,
    );
  },
);

TaskList.displayName = 'TaskList';

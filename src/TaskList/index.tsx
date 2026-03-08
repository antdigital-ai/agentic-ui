import { ChevronUp, CircleDashed, SuccessFill, X } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useMergedState } from 'rc-util';
import React, { memo, useCallback, useContext, useMemo, useState } from 'react';
import { ActionIconBox } from '../Components/ActionIconBox';
import { Loading } from '../Components/Loading';
import { useRefFunction } from '../Hooks/useRefFunction';
import { I18nContext } from '../I18n';
import { useStyle } from './style';

const LOADING_SIZE = 16;

const buildClassName = (...args: Parameters<typeof classNames>) =>
  classNames(...args);

const hasTaskContent = (content: React.ReactNode | React.ReactNode[]) => {
  if (Array.isArray(content)) {
    return content.length > 0;
  }
  return !!content;
};

type TaskStatus = 'success' | 'pending' | 'loading' | 'error';

type TaskItem = {
  key: string;
  title?: React.ReactNode;
  content: React.ReactNode | React.ReactNode[];
  status: TaskStatus;
};

/** 组件变体 */
export type TaskListVariant = 'default' | 'simple';

/**
 * TaskList 组件属性
 */
export type TaskListProps = {
  /** 任务列表数据 */
  items: TaskItem[];
  /** 自定义类名 */
  className?: string;
  /** 受控模式：指定当前展开的任务项 key 数组 */
  expandedKeys?: string[];
  /** 受控模式：展开状态变化时的回调函数 */
  onExpandedKeysChange?: (expandedKeys: string[]) => void;
  /** 组件变体，simple 模式将任务列表收起为紧凑的单行摘要 */
  variant?: TaskListVariant;
};

/**
 * @deprecated @since 2.30.0 请使用 TaskListProps 替代
 */
export type ThoughtChainProps = TaskListProps;

const getArrowRotation = (collapsed: boolean): React.CSSProperties => ({
  transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: 'transform 0.3s ease',
});

const StatusIcon: React.FC<{
  status: TaskStatus;
  prefixCls: string;
  hashId: string;
}> = memo(({ status, prefixCls, hashId }) => {
  const statusMap: Record<TaskStatus, React.ReactNode> = {
    success: <SuccessFill />,
    loading: <Loading size={LOADING_SIZE} />,
    pending: (
      <div className={buildClassName(`${prefixCls}-status-idle`, hashId)}>
        <CircleDashed />
      </div>
    ),
    error: <X />,
  };

  return (
    <div
      className={buildClassName(
        `${prefixCls}-status`,
        `${prefixCls}-status-${status}`,
        hashId,
      )}
      data-testid={`task-list-status-${status}`}
    >
      {statusMap[status]}
    </div>
  );
});

StatusIcon.displayName = 'StatusIcon';

interface TaskListItemProps {
  item: TaskItem;
  isLast: boolean;
  prefixCls: string;
  hashId: string;
  expandedKeys: string[];
  onToggle: (key: string) => void;
}

const TaskListItem: React.FC<TaskListItemProps> = memo(
  ({ item, isLast, prefixCls, hashId, expandedKeys, onToggle }) => {
    const { locale } = useContext(I18nContext);
    const isCollapsed = !expandedKeys.includes(item.key);
    const hasContent = hasTaskContent(item.content);

    // 使用 useCallback 优化切换处理函数
    const handleToggle = useCallback(() => {
      onToggle(item.key);
    }, [item.key, onToggle]);

    const arrowTitle = isCollapsed
      ? locale?.['taskList.expand'] || '展开'
      : locale?.['taskList.collapse'] || '收起';

    const contentVariants = useMemo(
      () => ({
        expanded: {
          height: 'auto',
          opacity: 1,
        },
        collapsed: {
          height: 0,
          opacity: 0,
        },
      }),
      [],
    );

    const contentTransition = useMemo(
      () => ({
        height: {
          duration: 0.26,
          ease: [0.4, 0, 0.2, 1],
        },
        opacity: {
          duration: 0.2,
          ease: 'linear',
        },
      }),
      [],
    );
    return (
      <div
        key={item.key}
        className={buildClassName(`${prefixCls}-thoughtChainItem`, hashId)}
        data-testid="task-list-thoughtChainItem"
      >
        <div
          className={buildClassName(`${prefixCls}-left`, hashId)}
          onClick={handleToggle}
          data-testid="task-list-left"
        >
          <StatusIcon
            status={item.status}
            prefixCls={prefixCls}
            hashId={hashId}
          />
          <div className={buildClassName(`${prefixCls}-content-left`, hashId)}>
            {!isLast && (
              <div
                className={buildClassName(`${prefixCls}-dash-line`, hashId)}
                data-testid="task-list-dash-line"
              />
            )}
          </div>
        </div>
        <div className={buildClassName(`${prefixCls}-right`, hashId)}>
          <div
            className={buildClassName(`${prefixCls}-top`, hashId)}
            onClick={handleToggle}
          >
            <div className={buildClassName(`${prefixCls}-title`, hashId)}>
              {item.title}
            </div>
            {hasContent && (
              <div
                className={buildClassName(
                  `${prefixCls}-arrowContainer`,
                  hashId,
                )}
                onClick={handleToggle}
                data-testid="task-list-arrowContainer"
              >
                <ActionIconBox
                  title={arrowTitle}
                  iconStyle={getArrowRotation(isCollapsed)}
                  loading={false}
                  onClick={handleToggle}
                >
                  <ChevronUp data-testid="task-list-arrow" />
                </ActionIconBox>
              </div>
            )}
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                key="task-content"
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                transition={contentTransition}
                className={buildClassName(`${prefixCls}-body`, hashId)}
              >
                <div className={buildClassName(`${prefixCls}-content`, hashId)}>
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);

TaskListItem.displayName = 'TaskListItem';

const getDefaultExpandedKeys = (
  items: TaskItem[],
  isControlled: boolean,
): string[] => {
  return isControlled ? [] : items.map((item) => item.key);
};

const getTaskSummary = (items: TaskItem[]) => {
  const completedCount = items.filter((item) => item.status === 'success').length;
  const loadingItem = items.find((item) => item.status === 'loading');
  const errorItem = items.find((item) => item.status === 'error');
  const hasRunning = !!loadingItem;
  const hasError = !!errorItem;
  const allDone = completedCount === items.length && items.length > 0;

  return { completedCount, loadingItem, errorItem, hasRunning, hasError, allDone };
};

interface SimpleTaskListBarProps {
  items: TaskItem[];
  prefixCls: string;
  hashId: string;
  expanded: boolean;
  onToggle: () => void;
}

const SimpleTaskListBar: React.FC<SimpleTaskListBarProps> = memo(
  ({ items, prefixCls, hashId, expanded, onToggle }) => {
    const { locale } = useContext(I18nContext);
    const { completedCount, loadingItem, hasRunning, hasError, allDone } =
      useMemo(() => getTaskSummary(items), [items]);

    const simpleCls = `${prefixCls}-simple`;

    const summaryStatus: TaskStatus = allDone
      ? 'success'
      : hasError
        ? 'error'
        : hasRunning
          ? 'loading'
          : 'pending';

    const summaryText = useMemo(() => {
      if (allDone) {
        return locale?.['taskList.taskComplete'] || '任务完成';
      }
      if (loadingItem?.title) {
        const template =
          locale?.['taskList.taskInProgress'] || '正在进行${taskName}任务';
        return template.replace('${taskName}', String(loadingItem.title));
      }
      if (hasError) {
        return locale?.['taskList.taskAborted'] || '任务已取消';
      }
      return locale?.['taskList.taskList'] || '任务列表';
    }, [allDone, loadingItem, hasError, locale]);

    const progressText = `${completedCount}/${items.length}`;

    const arrowTitle = expanded
      ? locale?.['taskList.collapse'] || '收起'
      : locale?.['taskList.expand'] || '展开';

    return (
      <div
        className={buildClassName(simpleCls, hashId)}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={arrowTitle}
        data-testid="task-list-simple-bar"
      >
        <div className={buildClassName(`${simpleCls}-status`, hashId)}>
          <StatusIcon
            status={summaryStatus}
            prefixCls={prefixCls}
            hashId={hashId}
          />
        </div>
        <div className={buildClassName(`${simpleCls}-text`, hashId)}>
          {summaryText}
        </div>
        <div className={buildClassName(`${simpleCls}-progress`, hashId)}>
          {progressText}
        </div>
        <div className={buildClassName(`${simpleCls}-arrow`, hashId)}>
          <ActionIconBox
            title={arrowTitle}
            iconStyle={getArrowRotation(!expanded)}
            loading={false}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            <ChevronUp data-testid="task-list-simple-arrow" />
          </ActionIconBox>
        </div>
      </div>
    );
  },
);

SimpleTaskListBar.displayName = 'SimpleTaskListBar';

/**
 * TaskList 组件
 *
 * 显示任务列表，支持展开/折叠、状态管理等功能
 * 支持受控和非受控两种模式
 * 支持 variant="simple" 模式，将列表收起为紧凑的摘要条
 *
 * @example
 * ```tsx
 * // 非受控模式
 * <TaskList
 *   items={[
 *     { key: 'task1', title: '任务1', content: '内容', status: 'success' }
 *   ]}
 * />
 *
 * // 受控模式
 * <TaskList
 *   items={tasks}
 *   expandedKeys={expandedKeys}
 *   onExpandedKeysChange={setExpandedKeys}
 * />
 *
 * // Simple 模式
 * <TaskList items={tasks} variant="simple" />
 * ```
 */
export const TaskList = memo(
  ({
    items,
    className,
    expandedKeys,
    onExpandedKeysChange,
    variant = 'default',
  }: TaskListProps) => {
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    const prefixCls = getPrefixCls('task-list');
    const { wrapSSR, hashId } = useStyle(prefixCls);

    const isControlled = expandedKeys !== undefined;
    const defaultKeys = getDefaultExpandedKeys(items, isControlled);

    const [internalExpandedKeys, setInternalExpandedKeys] = useMergedState<
      string[]
    >(defaultKeys, {
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

    const [simpleExpanded, setSimpleExpanded] = useState(false);

    const handleSimpleToggle = useCallback(() => {
      setSimpleExpanded((prev) => !prev);
    }, []);

    if (variant === 'simple') {
      const contentVariants = {
        expanded: { height: 'auto', opacity: 1 },
        collapsed: { height: 0, opacity: 0 },
      };

      const contentTransition = {
        height: { duration: 0.26, ease: [0.4, 0, 0.2, 1] as const },
        opacity: { duration: 0.2, ease: 'linear' as const },
      };

      return wrapSSR(
        <div
          className={buildClassName(
            `${prefixCls}-simple-wrapper`,
            hashId,
            className,
          )}
          data-testid="task-list-simple-wrapper"
        >
          <SimpleTaskListBar
            items={items}
            prefixCls={prefixCls}
            hashId={hashId}
            expanded={simpleExpanded}
            onToggle={handleSimpleToggle}
          />
          <AnimatePresence initial={false}>
            {simpleExpanded && (
              <motion.div
                key="simple-task-list-content"
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                transition={contentTransition}
                className={buildClassName(
                  `${prefixCls}-simple-content`,
                  hashId,
                )}
              >
                <div className={buildClassName(`${prefixCls}-simple-list`, hashId)}>
                  {items.map((item, index) => (
                    <TaskListItem
                      key={item.key}
                      item={item}
                      isLast={index === items.length - 1}
                      prefixCls={prefixCls}
                      hashId={hashId}
                      expandedKeys={internalExpandedKeys}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>,
      );
    }

    return wrapSSR(
      <div className={className}>
        {items.map((item, index) => (
          <TaskListItem
            key={item.key}
            item={item}
            isLast={index === items.length - 1}
            prefixCls={prefixCls}
            hashId={hashId}
            expandedKeys={internalExpandedKeys}
            onToggle={handleToggle}
          />
        ))}
      </div>,
    );
  },
);

TaskList.displayName = 'TaskList';

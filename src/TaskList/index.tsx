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

const COLLAPSE_VARIANTS = {
  expanded: { height: 'auto', opacity: 1 },
  collapsed: { height: 0, opacity: 0 },
};

const COLLAPSE_TRANSITION = {
  height: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
  opacity: { duration: 0.2, ease: 'linear' },
};

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
      <div className={classNames(`${prefixCls}-status-idle`, hashId)}>
        <CircleDashed />
      </div>
    ),
    error: <X />,
  };

  return (
    <div
      className={classNames(
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
                variants={COLLAPSE_VARIANTS}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                transition={COLLAPSE_TRANSITION}
                className={classNames(`${prefixCls}-body`, hashId)}
              >
                <div className={classNames(`${prefixCls}-content`, hashId)}>
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

/**
 * TaskList 组件
 *
 * 显示任务列表，支持展开/折叠、状态管理等功能
 * 支持受控和非受控两种模式
 * 支持 variant="simple" 模式，将列表收起为紧凑的摘要条
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
    const { locale } = useContext(I18nContext);

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

    const { summaryStatus, summaryText, progressText } = useMemo(() => {
      const completedCount = items.filter((i) => i.status === 'success').length;
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
        {/* 摘要条 */}
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

        {/* 展开的任务列表 */}
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

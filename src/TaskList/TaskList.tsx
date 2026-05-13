import { ChevronUp } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import { useMergedState } from 'rc-util';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActionIconBox } from '../Components/ActionIconBox';
import { TextSwap } from '../Components/TextSwap';
import { useRefFunction } from '../Hooks/useRefFunction';
import { I18nContext } from '../I18n';
import { StatusIcon } from './components/StatusIcon';
import { TaskListItem } from './components/TaskListItem';
import { getArrowRotation } from './constants';
import { useStyle } from './style';
import type { TaskItem, TaskListProps, TaskStatus } from './types';

const SIMPLE_COLLAPSE_DURATION_MS = 350;

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
    taskCompleteText,
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

    const [shouldRenderContent, setShouldRenderContent] = useState(true);

    const handleSimpleToggle = useRefFunction(() => {
      setSimpleExpanded((prev: boolean) => !prev);
    });

    useEffect(() => {
      if (simpleExpanded) {
        setShouldRenderContent(true);
        return;
      }

      const timer = window.setTimeout(() => {
        setShouldRenderContent(false);
      }, SIMPLE_COLLAPSE_DURATION_MS);

      return () => {
        window.clearTimeout(timer);
      };
    }, [simpleExpanded]);

    const { summaryStatus, summaryText, summarySwapKey, hasError, lastItem } =
      useMemo(() => {
        const completedCount = items.filter(
          (i) => i.status === 'success',
        ).length;
        const loadingItem = items.find((i) => i.status === 'loading');
        const errorExists = items.some((i) => i.status === 'error');
        const allDone = completedCount === items.length && items.length > 0;

        let status: TaskStatus = 'pending';
        let text: React.ReactNode = locale?.['taskList.taskList'] || '任务列表';
        let swapKey = `idle:${items.map((i) => `${i.key}:${i.status}`).join('|')}`;

        if (allDone) {
          status = 'success';
          const customCompleteText =
            typeof taskCompleteText === 'function'
              ? taskCompleteText({ items })
              : taskCompleteText;
          text =
            customCompleteText ?? locale?.['taskList.taskComplete'] ?? '任务完成';
          swapKey = `done:${items.map((i) => i.key).join(',')}`;
        } else if (loadingItem) {
          status = 'loading';
          const tpl =
            locale?.['taskList.taskInProgress'] || '正在进行${taskName}任务';
          const title = loadingItem.title;
          const taskName =
            typeof title === 'string' || typeof title === 'number'
              ? String(title)
              : '';
          text = tpl.replace('${taskName}', taskName);
          swapKey = `loading:${loadingItem.key}:${taskName}`;
        } else if (errorExists) {
          status = 'error';
          const tpl = locale?.['taskList.taskInProgress'] || '正在进行任务';
          text = tpl.replace('${taskName}', '');
          swapKey = 'error';
        }

        return {
          summaryStatus: status,
          summaryText: text,
          summarySwapKey: swapKey,
          hasError: errorExists,
          lastItem: items[items.length - 1] as TaskItem | undefined,
        };
      }, [items, locale, taskCompleteText]);

    // 注意：此处必须用 useCallback 而非 useRefFunction。
    // renderItems 在父组件渲染期被同步调用（`{renderItems(items)}`），
    // 而 useRefFunction 通过 useLayoutEffect 在 commit 阶段才刷新 ref，
    // 渲染期调用会拿到上一帧的闭包，导致 internalExpandedKeys 等状态用旧值。
    const renderItems = useCallback(
      (visibleItems: TaskItem[]) => {
        return visibleItems.map((item, index) => (
          <TaskListItem
            key={item.key}
            item={item}
            isLast={index === visibleItems.length - 1}
            prefixCls={prefixCls}
            hashId={hashId}
            expandedKeys={internalExpandedKeys}
            onToggle={handleToggle}
          />
        ));
      },
      [prefixCls, hashId, internalExpandedKeys, handleToggle],
    );

    if (variant !== 'simple') {
      return wrapSSR(
        <div className={className} data-testid={prefixCls}>
          {renderItems(items)}
        </div>,
      );
    }

    const simpleCls = `${prefixCls}-simple`;
    const simpleArrowTitle = simpleExpanded
      ? locale?.['taskList.collapse'] || '收起'
      : locale?.['taskList.expand'] || '展开';

    const visibleItems = simpleExpanded
      ? hasError
        ? items.slice(-1)
        : items
      : lastItem
        ? [lastItem]
        : [];

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
              statusTestId={`task-list-simple-summary-status-${summaryStatus}`}
            />
          </div>
          <div className={classNames(`${simpleCls}-text`, hashId)}>
            <TextSwap swapKey={summarySwapKey}>{summaryText}</TextSwap>
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
        <div
          className={classNames(`${simpleCls}-content`, hashId, {
            [`${simpleCls}-content-expanded`]: simpleExpanded,
          })}
        >
          {shouldRenderContent ? (
            <div className={classNames(`${simpleCls}-list`, hashId)}>
              {renderItems(visibleItems)}
            </div>
          ) : null}
        </div>
      </div>,
    );
  },
);

TaskList.displayName = 'TaskList';

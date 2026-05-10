import {
  CloseCircleFill,
  FileCheckFill,
  WarningFill,
} from '@sofa-design/icons';
import { Checkbox, ConfigProvider, Divider, Tooltip } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import React, { useContext } from 'react';
import { useAdaptiveTooltipProps } from '../../Hooks/useAdaptiveTooltipProps';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { I18nContext } from '../../I18n';
import { getMaskStyle } from '../constants';
import { useFormatTimeLocale } from '../hooks/useFormatTimeLocale';
import { useTextOverflow } from '../hooks/useTextOverflow';
import { useStyle } from '../style';
import {
  HistoryDataType,
  TaskStatusData,
  TaskStatusEnum,
} from '../types/HistoryData';
import { formatTime } from '../utils';
import { HistoryActionsBox } from './HistoryActionsBox';
import { HistoryRunningIcon } from './HistoryRunningIcon';

// ──────────────────────────────────────────────────────────────────────────
// 任务状态图标（#26）
//
// 这块代码由两个 module-level 常量 + 一个工厂函数协同工作：
//
//   TASK_STATUS_ICON       —— 状态枚举到「裸图标」的映射（仅 React Element 本体）
//   renderTaskStatusIcon() —— 在调用点把图标包到带样式的容器里
//
// 设计动机：
// 1) 之前 `TaskIconMap` 是工厂函数，每次渲染都会重建 3 个 React Element，
//    破坏 `React.memo` 的引用稳定性，造成下游不必要的 reconcile。
// 2) 把图标提到 module 级后引用恒定，但容器 className 仍依赖运行时拿到的
//    `prefixCls + hashId`，无法静态固化——因此用 `renderTaskStatusIcon`
//    在调用点动态包裹一层 div。
// 3) 仅 3 个状态有图标 (`success` / `error` / `cancel`)，其它状态走兜底
//    （HistoryItem 多行模式下回落到 '📄'，单行模式下不展示图标）。
// ──────────────────────────────────────────────────────────────────────────

/**
 * 任务状态对应的图标（模块级常量，仅创建一次）。
 * 仅缓存图标本体，外层 `<div className="-task-icon">` 由调用点按需包裹，避免重复创建。
 */
const TASK_STATUS_ICON: Partial<Record<TaskStatusEnum, React.ReactNode>> = {
  success: <FileCheckFill />,
  error: <WarningFill />,
  cancel: <CloseCircleFill />,
};

/**
 * 把状态图标包到带样式的容器里，className 由调用点决定。
 *
 * @param status 任务状态；缺失或未在 `TASK_STATUS_ICON` 内的状态返回 `null`
 *               （由调用点决定是否走 fallback，例如 '📄'）
 * @param containerClassName 容器 div 的 className，通常为 `taskIconClassName` useMemo 结果
 */
const renderTaskStatusIcon = (
  status: TaskStatusEnum | undefined,
  containerClassName: string,
): React.ReactNode => {
  if (!status) return null;
  const icon = TASK_STATUS_ICON[status];
  if (!icon) return null;
  return <div className={containerClassName}>{icon}</div>;
};

/**
 * 判断单个 ReactNode 是否「足够实质化」，需要渲染。
 * 仅检查叶子节点，不递归数组。
 */
const isLeafNodeValid = (node: React.ReactNode): boolean => {
  if (!node) return false;
  if (React.isValidElement(node)) return true;
  if (typeof node === 'string' && node.trim()) return true;
  return false;
};

/**
 * 检查自定义操作区域是否有效。
 *
 * 之前实现用「递归 + Array.some」处理嵌套数组，最坏情况 O(n) 递归调用栈，
 * 在大型 children 数组下既有性能开销也有可读性问题。
 * 现在改成显式 stack 迭代平展，规避递归 + 提前 return：
 * 只要发现一个有效叶子节点即可立即返回 true，不必遍历完整个树。
 */
const isValidCustomOperation = (extra: React.ReactNode): boolean => {
  // 单值直接走叶子判断
  if (!Array.isArray(extra)) return isLeafNodeValid(extra);

  // 数组情况：迭代式深度优先扫描，遇到第一个有效叶子立即返回
  const stack: React.ReactNode[] = [...extra];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (Array.isArray(cur)) {
      // 嵌套数组继续展开（在 React.ReactNode 类型里数组可以嵌套）
      stack.push(...cur);
      continue;
    }
    if (isLeafNodeValid(cur)) return true;
  }
  return false;
};

/**
 * 历史记录项组件的属性接口
 */
interface HistoryItemProps {
  /** 历史记录数据项 */
  item: HistoryDataType;
  /** 当前选中的历史记录ID列表 */
  selectedIds: string[];
  /** 选择状态变化回调函数 */
  onSelectionChange: (sessionId: string, checked: boolean) => void;
  /** 点击历史记录项的回调函数 */
  onClick: (sessionId: string, item: HistoryDataType) => void;
  /** 删除历史记录项的回调函数 */
  onDeleteItem?: (sessionId: string) => Promise<void>;
  /** 收藏/取消收藏的回调函数 */
  onFavorite?: (sessionId: string, isFavorite: boolean) => void;
  /** 智能代理相关配置和回调 */
  agent?: {
    /** 是否启用智能代理功能 */
    enabled?: boolean;
    /** 搜索关键词回调 */
    onSearch?: (keyword: string) => void;
    /** 智能代理收藏回调 */
    onFavorite?: (sessionId: string, isFavorite: boolean) => void;
    /** 智能代理选择变化回调 */
    onSelectionChange?: (selectedIds: string[]) => void;
    /** 加载更多数据回调 */
    onLoadMore?: () => void;
    /** 是否正在加载更多数据 */
    loadingMore?: boolean;
  };
  /** 额外的渲染内容，接收历史记录项作为参数 */
  extra?: (item: HistoryDataType) => React.ReactElement;
  /** 自定义操作区域 */
  customOperationExtra?: React.ReactNode;
  /** 历史记录类型：聊天记录或任务记录 */
  type?: 'chat' | 'task';
  /** 正在运行的记录ID列表，这些记录将显示运行图标 */
  runningId?: string[];
  /** 格式化Item右下角日期函数 */
  itemDateFormatter?: (date: number | string | Date) => string;
}

/**
 * 单行模式历史记录项组件
 *
 * 用于显示简单的历史记录项，只显示标题和时间，适用于聊天记录等简单内容
 *
 * @param props - 组件属性
 * @param props.item - 历史记录数据项
 * @param props.selectedIds - 当前选中的历史记录ID列表
 * @param props.onSelectionChange - 选择状态变化回调函数
 * @param props.onClick - 点击历史记录项的回调函数
 * @param props.onFavorite - 收藏/取消收藏的回调函数
 * @param props.onDeleteItem - 删除历史记录项的回调函数
 * @param props.agent - 智能代理相关配置和回调
 * @param props.extra - 额外的渲染内容
 *
 * @returns 单行模式的历史记录项组件
 */
const HistoryItemSingle = React.memo<HistoryItemProps>(
  ({
    item,
    selectedIds,
    onSelectionChange,
    onClick,
    onFavorite,
    onDeleteItem,
    agent,
    extra,
    runningId,
    customOperationExtra,
    itemDateFormatter,
  }) => {
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    const prefixCls = getPrefixCls('agentic-chat-history-menu');
    const { hashId } = useStyle(prefixCls);
    const formatTimeLocale = useFormatTimeLocale();
    // 任务状态图标容器 className：单行模式下也会出现在 isRunning 分支
    const taskIconClassName = React.useMemo(
      () => `${prefixCls}-task-icon ${hashId}`,
      [prefixCls, hashId],
    );
    const displayText = React.useMemo(
      () => item.displayTitle || item.sessionTitle,
      [item.displayTitle, item.sessionTitle],
    );
    const { textRef, isTextOverflow } = useTextOverflow(displayText);
    const isRunning = React.useMemo(
      () => runningId?.includes(String(item.id || '')),
      [runningId, item.id],
    );
    const isSelected = React.useMemo(
      () => selectedIds.includes(item.sessionId!),
      [selectedIds, item.sessionId],
    );
    const adaptiveTitleTooltip = useAdaptiveTooltipProps('informational');

    const handleClick = useRefFunction((e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onClick(item.sessionId!, item);
    });

    /**
     * 处理复选框状态变化事件
     * @param e - 复选框变化事件对象
     */
    const handleCheckboxChange = useRefFunction((e: CheckboxChangeEvent) => {
      e.stopPropagation();
      onSelectionChange(item.sessionId!, e.target.checked);
    });

    /**
     * 处理删除历史记录项事件
     */
    const handleDelete = useRefFunction(async () => {
      if (onDeleteItem) {
        await onDeleteItem(item.sessionId!);
      }
    });

    /**
     * 渲染单行模式的历史记录项
     * @returns 历史记录项组件
     */
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          minWidth: 140,
          alignItems: 'center',
          width: '100%',
        }}
        onClick={handleClick}
      >
        {agent?.onSelectionChange && (
          <Checkbox checked={isSelected} onChange={handleCheckboxChange} />
        )}

        {isRunning && (
          <div
            className={taskIconClassName}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HistoryRunningIcon
              width={16}
              height={16}
              animated={true}
              duration={2}
            />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            minWidth: 0,
            gap: 8,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <div
              ref={textRef}
              style={{
                position: 'relative',
                width: 'calc(100% - 10px)',
                overflow: 'hidden',
                ...getMaskStyle(isTextOverflow),
              }}
            >
              <Tooltip
                title={isTextOverflow ? displayText : null}
                mouseEnterDelay={0.3}
                open={isTextOverflow ? undefined : false}
                {...adaptiveTitleTooltip}
              >
                <div
                  style={{
                    whiteSpace: 'nowrap',
                    font: isSelected
                      ? 'var(--font-text-h6-base)'
                      : 'var(--font-text-body-base)',
                    letterSpacing: 'var(--letter-spacing-body-base, normal)',
                    color: 'var(--color-gray-text-default)',
                  }}
                >
                  {displayText}
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <HistoryActionsBox
            onDeleteItem={onDeleteItem ? handleDelete : undefined}
            agent={agent}
            item={item}
            onFavorite={onFavorite}
          >
            {itemDateFormatter
              ? itemDateFormatter(item.gmtCreate as number)
              : formatTime(item.gmtCreate, formatTimeLocale)}
          </HistoryActionsBox>
          {isValidCustomOperation(customOperationExtra) && (
            <div className={`${prefixCls}-extra-actions ${hashId}`}>
              {customOperationExtra}
            </div>
          )}
        </div>
        {extra?.(item)}
      </div>
    );
  },
);

HistoryItemSingle.displayName = 'HistoryItemSingle';

/**
 * 多行模式历史记录项组件
 *
 * 用于显示复杂的历史记录项，包含图标、标题、描述和时间，适用于任务记录等复杂内容
 *
 * @param props - 组件属性
 * @param props.item - 历史记录数据项
 * @param props.selectedIds - 当前选中的历史记录ID列表
 * @param props.onSelectionChange - 选择状态变化回调函数
 * @param props.onClick - 点击历史记录项的回调函数
 * @param props.onFavorite - 收藏/取消收藏的回调函数
 * @param props.onDeleteItem - 删除历史记录项的回调函数
 * @param props.agent - 智能代理相关配置和回调
 * @param props.extra - 额外的渲染内容
 * @param props.type - 历史记录类型，影响图标和描述的显示逻辑
 * @param props.customOperationExtra - 自定义操作区域
 *
 * @returns 多行模式的历史记录项组件
 */
const HistoryItemMulti = React.memo<HistoryItemProps>(
  ({
    item,
    selectedIds,
    onSelectionChange,
    onClick,
    onFavorite,
    onDeleteItem,
    agent,
    extra,
    type,
    runningId,
    customOperationExtra,
    itemDateFormatter,
  }) => {
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    const prefixCls = getPrefixCls('agentic-chat-history-menu');
    const { hashId } = useStyle(prefixCls);
    const displayText = React.useMemo(
      () => item.displayTitle || item.sessionTitle,
      [item.displayTitle, item.sessionTitle],
    );
    const { textRef, isTextOverflow } = useTextOverflow(displayText);
    const isTask = React.useMemo(() => type === 'task', [type]);
    const formatTimeLocale = useFormatTimeLocale();
    // 多行模式下的 description 兜底文案需要读 `task.default` i18n key，
    // 这里仍需要直接持有 locale；formatTime 相关 i18n 已被 useFormatTimeLocale 收口。
    const { locale } = React.useContext(I18nContext);
    // 任务状态图标容器 className：在多行模式里被 5 处使用，统一缓存避免重复字符串拼接
    const taskIconClassName = React.useMemo(
      () => `${prefixCls}-task-icon ${hashId}`,
      [prefixCls, hashId],
    );
    const shouldShowIcon = React.useMemo(
      () => isTask && (!!item.icon || TaskStatusData.includes(item.status!)),
      [isTask, item.icon, item.status],
    );
    const shouldShowDescription = React.useMemo(
      () => isTask && !!item.description,
      [isTask, item.description],
    );
    const isRunning = React.useMemo(
      () => runningId?.includes(String(item.id || '')),
      [runningId, item.id],
    );
    const isSelected = React.useMemo(
      () => selectedIds.includes(item.sessionId!),
      [selectedIds, item.sessionId],
    );
    const adaptiveTitleTooltip = useAdaptiveTooltipProps('informational');

    /**
     * 处理点击事件
     * @param e - 鼠标点击事件对象
     */
    const handleClick = useRefFunction((e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onClick(item.sessionId!, item);
    });

    /**
     * 处理复选框状态变化事件
     * @param e - 复选框变化事件对象
     */
    const handleCheckboxChange = useRefFunction((e: CheckboxChangeEvent) => {
      e.stopPropagation();
      onSelectionChange(item.sessionId!, e.target.checked);
    });

    /**
     * 处理删除事件
     */
    const handleDelete = useRefFunction(async () => {
      if (onDeleteItem) {
        await onDeleteItem(item.sessionId!);
      }
    });

    /**
     * 渲染多行模式的历史记录项
     * @returns 历史记录项组件
     */
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          minWidth: 140,
          alignItems: 'center',
          width: '100%',
        }}
        onClick={handleClick}
      >
        {agent?.onSelectionChange && (
          <Checkbox
            checked={isSelected}
            onChange={handleCheckboxChange}
            style={{ marginTop: 4 }}
          />
        )}

        {(shouldShowIcon || isRunning) && (
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isRunning ? (
              <div className={taskIconClassName}>
                <HistoryRunningIcon
                  width={16}
                  height={16}
                  animated={true}
                  duration={2}
                  color="var(--color-primary-text-secondary)"
                />
              </div>
            ) : React.isValidElement(item.icon) ? (
              item.icon
            ) : item.icon ? (
              <div className={taskIconClassName}>
                {item.icon ||
                  (isTask
                    ? renderTaskStatusIcon(item.status, taskIconClassName)
                    : '📄')}
              </div>
            ) : (
              renderTaskStatusIcon(item.status, taskIconClassName)
            )}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            flex: 1,
            minWidth: 0,
            gap: 8,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              ref={textRef}
              style={{
                position: 'relative',
                maxWidth: 'calc(100% - 10px)',
                overflow: 'hidden',
                ...getMaskStyle(isTextOverflow),
              }}
            >
              <Tooltip
                title={isTextOverflow ? displayText : null}
                mouseEnterDelay={0.3}
                open={isTextOverflow ? undefined : false}
                {...adaptiveTitleTooltip}
              >
                <div
                  style={{
                    whiteSpace: 'nowrap',
                    font: isSelected
                      ? 'var(--font-text-h6-base)'
                      : 'var(--font-text-body-base)',

                    color: 'var(--color-gray-text-default)',
                  }}
                >
                  {displayText}
                </div>
              </Tooltip>
            </div>

            {shouldShowDescription && (item.description || isTask) && (
              <Tooltip
                open={
                  typeof item.description === 'string' &&
                  item.description.length > 20
                    ? undefined
                    : false
                }
                title={
                  item.description ||
                  (isTask ? locale?.['task.default'] || '任务' : '')
                }
                {...adaptiveTitleTooltip}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    font: 'var(--font-text-body-xs)',
                    color: 'var(--color-gray-text-secondary)',
                    letterSpacing: 'var(--letter-spacing-body-xs, normal)',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.description ||
                      (isTask ? locale?.['task.default'] || '任务' : '')}
                  </div>
                  <Divider type="vertical" />
                  <span style={{ minWidth: 26 }}>
                    {itemDateFormatter
                      ? itemDateFormatter(item.gmtCreate as number)
                      : formatTime(item.gmtCreate, formatTimeLocale)}
                  </span>
                </div>
              </Tooltip>
            )}
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <HistoryActionsBox
            onDeleteItem={onDeleteItem ? handleDelete : undefined}
            agent={agent}
            item={item}
            onFavorite={onFavorite}
          >
            {itemDateFormatter
              ? itemDateFormatter(item.gmtCreate as number)
              : formatTime(item.gmtCreate, formatTimeLocale)}
          </HistoryActionsBox>
          {isValidCustomOperation(customOperationExtra) && (
            <div className={`${prefixCls}-extra-actions ${hashId}`}>
              {customOperationExtra}
            </div>
          )}
        </div>

        {extra?.(item)}
      </div>
    );
  },
);

HistoryItemMulti.displayName = 'HistoryItemMulti';

/**
 * 历史记录项组件 - 根据条件选择单行或多行模式
 *
 * 这是一个智能组件，会根据传入的属性自动选择合适的显示模式：
 * - 单行模式：适用于简单的聊天记录，只显示标题和时间
 * - 多行模式：适用于复杂的任务记录，显示图标、标题、描述和时间
 *
 * 自动选择逻辑：
 * - 当 type 为 'task' 时，自动使用多行模式
 * - 当同时存在 icon 和 description 时，自动使用多行模式
 * - 其他情况使用单行模式
 *
 * @param props - 组件属性
 * @param props.item - 历史记录数据项
 * @param props.selectedIds - 当前选中的历史记录ID列表
 * @param props.onSelectionChange - 选择状态变化回调函数
 * @param props.onClick - 点击历史记录项的回调函数
 * @param props.onFavorite - 收藏/取消收藏的回调函数
 * @param props.onDeleteItem - 删除历史记录项的回调函数
 * @param props.agent - 智能代理相关配置和回调
 * @param props.extra - 额外的渲染内容
 * @param props.type - 历史记录类型，影响显示模式的选择
 *
 * @returns 根据条件渲染的单行或多行历史记录项组件
 *
 * @example
 * ```tsx
 * // 单行模式示例
 * <HistoryItem
 *   item={chatItem}
 *   selectedIds={selectedIds}
 *   onSelectionChange={handleSelectionChange}
 *   onClick={handleClick}
 *   type="chat"
 * />
 *
 * // 多行模式示例
 * <HistoryItem
 *   item={taskItem}
 *   selectedIds={selectedIds}
 *   onSelectionChange={handleSelectionChange}
 *   onClick={handleClick}
 *   type="task"
 * />
 * ```
 */
export const HistoryItem = React.memo<HistoryItemProps>(
  ({
    item,
    selectedIds,
    onSelectionChange,
    onClick,
    onFavorite,
    onDeleteItem,
    agent,
    extra,
    type,
    runningId,
    customOperationExtra,
    itemDateFormatter,
  }) => {
    const isTask = type === 'task';
    const shouldShowIcon =
      isTask && (!!item.icon || TaskStatusData.includes(item.status!));
    const shouldShowDescription = isTask && !!item.description;
    const isMultiMode = isTask || (shouldShowIcon && shouldShowDescription);

    /**
     * 获取组件的属性
     * @returns 组件属性
     */
    const props = {
      item,
      selectedIds,
      onSelectionChange,
      onClick,
      onFavorite,
      onDeleteItem,
      agent,
      extra,
      type,
      runningId,
      customOperationExtra,
      itemDateFormatter,
    };

    /**
     * 根据模式选择渲染组件
     * @returns 历史记录项组件
     */
    return isMultiMode ? (
      <HistoryItemMulti {...props} />
    ) : (
      <HistoryItemSingle {...props} />
    );
  },
);

HistoryItem.displayName = 'HistoryItem';

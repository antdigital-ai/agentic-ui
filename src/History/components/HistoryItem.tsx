import {
  CloseCircleFill,
  FileCheckFill,
  WarningFill,
} from '@sofa-design/icons';
import { Checkbox, ConfigProvider, Divider, Tooltip } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import React, { useContext } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { I18nContext } from '../../I18n';
import { useStyle } from '../style';
import {
  HistoryDataType,
  TaskStatusData,
  TaskStatusEnum,
} from '../types/HistoryData';
import { formatTime } from '../utils';
import { HistoryActionsBox } from './HistoryActionsBox';
import { HistoryRunningIcon } from './HistoryRunningIcon';

const TaskIconMap: (
  prefixCls: string,
  hashId: string,
) => Partial<Record<TaskStatusEnum, React.ReactNode>> = (
  prefixCls: string,
  hashId: string,
) => {
  return {
    success: (
      <div className={`${prefixCls}-task-icon ${hashId}`}>
        <FileCheckFill />
      </div>
    ),
    error: (
      <div className={`${prefixCls}-task-icon ${hashId}`}>
        <WarningFill />
      </div>
    ),
    cancel: (
      <div className={`${prefixCls}-task-icon ${hashId}`}>
        <CloseCircleFill />
      </div>
    ),
  };
};

const FADE_OUT_GRADIENT = 'linear-gradient(to left, transparent, black 20%)';

const getMaskStyle = (isOverflow: boolean) => ({
  WebkitMaskImage: isOverflow ? FADE_OUT_GRADIENT : 'none',
  maskImage: isOverflow ? FADE_OUT_GRADIENT : 'none',
});

/**
 * 文本溢出检测的额外滚动偏移量，用于确保文本滚动动画的平滑过渡
 * 当文本滚动到末尾时，这个偏移量会让文本多滚动一段距离，使其看起来更自然
 */
const EXTRA_SCROLL_OFFSET = 100;

/**
 * 检查自定义操作区域是否有效
 * @param extra - 自定义操作区域内容
 * @returns 是否应该渲染自定义操作区域
 */
const isValidCustomOperation = (extra: React.ReactNode): boolean => {
  if (!extra) return false;
  if (React.isValidElement(extra)) return true;
  if (typeof extra === 'string' && extra.trim()) return true;
  if (
    Array.isArray(extra) &&
    extra.some((item) => isValidCustomOperation(item))
  )
    return true;
  return false;
};

/**
 * 自定义 hook，用于检测文本溢出并设置相关样式
 * @param text - 需要检测溢出的文本内容
 * @returns 包含文本溢出状态和 ref 的对象
 */
const useTextOverflow = (text: React.ReactNode) => {
  const textRef = React.useRef<HTMLDivElement>(null);
  const [isTextOverflow, setIsTextOverflow] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const isOverflow = el.scrollWidth > el.clientWidth;
    // 仅在 isOverflow 状态变化时更新，避免不必要的渲染
    setIsTextOverflow((prev) => (prev === isOverflow ? prev : isOverflow));
    el.setAttribute('data-overflow', String(isOverflow));

    if (isOverflow) {
      const scrollDistance = -(
        el.scrollWidth -
        el.clientWidth +
        EXTRA_SCROLL_OFFSET
      );
      el.style.setProperty('--scroll-width', `${scrollDistance}px`);
      // 根据滚动距离动态计算动画时长，保持恒定滚动速度（每 100px 约 1.5s）
      const duration = Math.max(2, (Math.abs(scrollDistance) / 100) * 1.5);
      el.style.setProperty('--scroll-duration', `${duration}s`);
    }
  }, [text]); // 仅在文本内容变化时重新计算

  return { textRef, isTextOverflow };
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
              : formatTime(item.gmtCreate)}
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
    const { locale } = React.useContext(I18nContext);
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
              <div className={`${prefixCls}-task-icon ${hashId}`}>
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
              <div className={`${prefixCls}-task-icon ${hashId}`}>
                {item.icon ||
                  (isTask
                    ? TaskIconMap(prefixCls, hashId)[item.status!]
                    : '📄')}
              </div>
            ) : (
              TaskIconMap(prefixCls, hashId)[item.status!]
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
                      : formatTime(item.gmtCreate)}
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
              : formatTime(item.gmtCreate)}
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

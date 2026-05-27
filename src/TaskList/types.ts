import React from 'react';

/** `pending` 与 `loading` 在 UI 上合并为同一进行中样式（主色 + Loading 图标） */
export type TaskStatus = 'success' | 'pending' | 'loading' | 'error';

export interface TaskItem {
  key: string;
  title?: React.ReactNode;
  content: React.ReactNode | React.ReactNode[];
  status: TaskStatus;
}

export type TaskListVariant = 'default' | 'simple';

export interface TaskListProps {
  /** 任务列表数据 */
  items: TaskItem[];
  /**
   * 外部加载状态。当存在 `status: 'loading' | 'pending'` 的 item 且无 error 时，
   * 与 `loading={true}` 一并参与摘要「进行中」判定；若全部 item 已为 `success`，摘要显示完成态（忽略本 prop）。
   * 流式结束后请置为 `false`，避免摘要滞留。
   */
  loading?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 受控模式：指定当前展开的任务项 key 数组 */
  expandedKeys?: string[];
  /** 受控模式：展开状态变化时的回调函数 */
  onExpandedKeysChange?: (expandedKeys: string[]) => void;
  /** 组件变体，simple 模式将任务列表收起为紧凑的单行摘要 */
  variant?: TaskListVariant;
  /** simple 模式下摘要条是否展开（受控） */
  open?: boolean;
  /** simple 模式下摘要条展开状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /**
   * 任务全部完成时摘要条的文案，未配置时回退到 i18n 默认值（如「任务完成」）。
   * 支持直接传入 `React.ReactNode`，也支持传入函数基于当前任务列表动态生成。
   *
   * 注：当前仅在 `variant="simple"` 的摘要条上渲染，`default` 模式不展示摘要条。
   */
  taskCompleteText?:
    | React.ReactNode
    | ((params: { items: TaskItem[] }) => React.ReactNode);
  /**
   * simple 模式下是否展示进度信息：摘要条内显示「已完成/总数」计数，条底部展示细线进度条。
   * 仅在 `variant="simple"` 时生效。
   */
  showProgress?: boolean;
  /**
   * simple 模式下展开摘要条时是否将组件滚动到视窗内。
   * 传入 `true` 时使用默认参数 `{ behavior: 'smooth', block: 'nearest' }`，
   * 也可直接传入 `ScrollIntoViewOptions` 自定义滚动行为。
   * 仅在 `variant="simple"` 时生效，初次挂载不触发。
   */
  scrollIntoViewOnExpand?: boolean | ScrollIntoViewOptions;
}

/**
 * @deprecated @since 2.30.0 请使用 TaskListProps 替代
 */
export type ThoughtChainProps = TaskListProps;

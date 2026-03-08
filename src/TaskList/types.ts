import React from 'react';

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
}

/**
 * @deprecated @since 2.30.0 请使用 TaskListProps 替代
 */
export type ThoughtChainProps = TaskListProps;

import React from 'react';
import type { TaskStatus } from './types';

export const LOADING_SIZE = 16;

/** pending 与 loading 在展示上视为同一「进行中」态 */
export const isTaskInProgress = (status: TaskStatus): boolean =>
  status === 'loading' || status === 'pending';

/** 合并后的样式类名（pending 复用 loading） */
export const getTaskStatusStyleKey = (status: TaskStatus): TaskStatus =>
  isTaskInProgress(status) ? 'loading' : status;

const ARROW_STYLE_COLLAPSED: React.CSSProperties = {
  transform: 'rotate(0deg)',
  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
};

const ARROW_STYLE_EXPANDED: React.CSSProperties = {
  transform: 'rotate(180deg)',
  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const getArrowRotation = (collapsed: boolean): React.CSSProperties =>
  collapsed ? ARROW_STYLE_COLLAPSED : ARROW_STYLE_EXPANDED;

export const hasTaskContent = (
  content: React.ReactNode | React.ReactNode[],
) => {
  if (Array.isArray(content)) {
    return content.length > 0;
  }
  return !!content;
};

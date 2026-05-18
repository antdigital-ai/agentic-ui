import type { ComponentType } from 'react';
import type { WorkspacePanelType } from './types';

/** 子面板类型标记，用于识别 memo / forwardRef 包裹后的组件 */
export const WORKSPACE_PANEL_TYPE = Symbol.for(
  '@ant-design/agentic-ui/workspace-panel-type',
);

export type WorkspacePanelComponent = ComponentType<unknown> & {
  [WORKSPACE_PANEL_TYPE]?: WorkspacePanelType;
};

export function markWorkspacePanel<P extends WorkspacePanelType, C>(
  component: C,
  panelType: P,
): C {
  (component as WorkspacePanelComponent)[WORKSPACE_PANEL_TYPE] = panelType;
  return component;
}

const isWorkspacePanelType = (value: unknown): value is WorkspacePanelType =>
  value === 'realtime' ||
  value === 'browser' ||
  value === 'task' ||
  value === 'file' ||
  value === 'fileTree' ||
  value === 'custom';

/**
 * 从 React 元素 type 链（含 memo / forwardRef 外层）解析内置子面板类型
 */
export function resolveWorkspacePanelType(
  type: unknown,
): WorkspacePanelType | undefined {
  const visited = new Set<unknown>();
  let current: unknown = type;

  while (current && !visited.has(current)) {
    visited.add(current);
    const marked = (current as WorkspacePanelComponent)[WORKSPACE_PANEL_TYPE];
    if (isWorkspacePanelType(marked)) {
      return marked;
    }
    current = (current as { type?: unknown }).type;
  }

  return undefined;
}

export const isFileWorkspacePanel = (
  panelType: WorkspacePanelType | undefined,
): boolean => panelType === 'file' || panelType === 'fileTree';

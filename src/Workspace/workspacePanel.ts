import type { ComponentType } from 'react';
import type { WorkspacePanelType } from './types';

/** 子面板类型标记，用于识别 memo / forwardRef 包裹后的组件 */
export const WORKSPACE_PANEL_TYPE = Symbol.for(
  '@ant-design/agentic-ui/workspace-panel-type',
);

export type WorkspacePanelComponent = ComponentType<unknown> & {
  [WORKSPACE_PANEL_TYPE]?: WorkspacePanelType;
};

/** Segmented 首个「实时跟随」后的占位分隔项，禁止作为业务 tab key */
export const WORKSPACE_SEGMENTED_DIVIDER_KEY = '__divider__';

const MAX_PANEL_TYPE_WALK_DEPTH = 32;

export function markWorkspacePanel<P extends WorkspacePanelType, C>(
  component: C,
  panelType: P,
): C {
  if (component == null) {
    return component;
  }
  if (!isWorkspacePanelType(panelType)) {
    return component;
  }
  (component as WorkspacePanelComponent)[WORKSPACE_PANEL_TYPE] = panelType;
  return component;
}

export const isWorkspacePanelType = (
  value: unknown,
): value is WorkspacePanelType =>
  value === 'realtime' ||
  value === 'browser' ||
  value === 'task' ||
  value === 'file' ||
  value === 'fileTree' ||
  value === 'custom';

export const isWorkspaceSegmentedDividerKey = (key: unknown): boolean =>
  normalizeTabKey(key) === WORKSPACE_SEGMENTED_DIVIDER_KEY;

/** 归一化标签 key，避免 `null` / 空白字符串参与比较 */
export const normalizeTabKey = (key: unknown): string => {
  if (key == null) {
    return '';
  }
  return String(key).trim();
};

/**
 * 从 React 元素 type 链（含 memo / forwardRef 外层）解析内置子面板类型
 */
export function resolveWorkspacePanelType(
  type: unknown,
): WorkspacePanelType | undefined {
  const visited = new Set<unknown>();
  let current: unknown = type;
  let depth = 0;

  while (current && !visited.has(current) && depth < MAX_PANEL_TYPE_WALK_DEPTH) {
    visited.add(current);
    depth += 1;
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

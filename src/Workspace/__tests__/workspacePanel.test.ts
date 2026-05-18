import type { FC } from 'react';
import { describe, expect, it } from 'vitest';
import {
  isWorkspacePanelType,
  isWorkspaceSegmentedDividerKey,
  markWorkspacePanel,
  normalizeTabKey,
  resolveWorkspacePanelType,
  WORKSPACE_PANEL_TYPE,
  WORKSPACE_SEGMENTED_DIVIDER_KEY,
} from '../workspacePanel';

describe('resolveWorkspacePanelType', () => {
  it('应从 memo 外层解析到已标记的内层组件', () => {
    const Inner = () => null;
    markWorkspacePanel(Inner, 'file');
    const MemoInner = Object.assign(
      (() => null) as FC,
      { type: Inner },
    );

    expect(resolveWorkspacePanelType(MemoInner)).toBe('file');
  });

  it('应读取组件上的 WORKSPACE_PANEL_TYPE 标记', () => {
    const Comp = () => null;
    (Comp as { [key: symbol]: string })[WORKSPACE_PANEL_TYPE] = 'task';

    expect(resolveWorkspacePanelType(Comp)).toBe('task');
  });

  it('markWorkspacePanel 对 null 与非法 panelType 应原样返回', () => {
    const Comp = () => null;
    expect(markWorkspacePanel(null, 'file')).toBe(null);
    expect(
      (Comp as { [key: symbol]: unknown })[WORKSPACE_PANEL_TYPE],
    ).toBeUndefined();
    markWorkspacePanel(Comp, 'not-a-panel' as 'file');
    expect(
      (Comp as { [key: symbol]: unknown })[WORKSPACE_PANEL_TYPE],
    ).toBeUndefined();
  });

  it('normalizeTabKey 应裁剪空白并处理 null', () => {
    expect(normalizeTabKey('  browser  ')).toBe('browser');
    expect(normalizeTabKey(null)).toBe('');
    expect(normalizeTabKey(undefined)).toBe('');
  });

  it('isWorkspaceSegmentedDividerKey 应识别分隔占位 key', () => {
    expect(isWorkspaceSegmentedDividerKey(WORKSPACE_SEGMENTED_DIVIDER_KEY)).toBe(
      true,
    );
    expect(isWorkspaceSegmentedDividerKey('__divider__')).toBe(true);
    expect(isWorkspaceSegmentedDividerKey('file')).toBe(false);
  });

  it('isWorkspacePanelType 应校验合法面板类型', () => {
    expect(isWorkspacePanelType('file')).toBe(true);
    expect(isWorkspacePanelType('unknown')).toBe(false);
  });

  it('type 链存在环时不应死循环', () => {
    const a: { type?: unknown } = {};
    const b: { type?: unknown } = {};
    a.type = b;
    b.type = a;
    expect(resolveWorkspacePanelType(a)).toBeUndefined();
  });
});

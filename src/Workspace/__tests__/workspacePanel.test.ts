import type { FC } from 'react';
import { describe, expect, it } from 'vitest';
import {
  markWorkspacePanel,
  resolveWorkspacePanelType,
  WORKSPACE_PANEL_TYPE,
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
});

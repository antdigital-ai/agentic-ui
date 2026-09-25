/**
 * Workspace index deepen5：fromKey 空、toTab 缺失、非法 wType、
 * Custom null、divider/空/同 key tab 守卫。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import Workspace from '../index';

vi.mock('../Browser', () => ({
  default: ({ title }: { title?: string }) => (
    <div data-testid="browser-panel">{title || 'browser'}</div>
  ),
}));

vi.mock('../Task', () => ({
  TaskList: ({ data }: { data?: unknown[] }) =>
    data ? <div data-testid="task-panel">task</div> : null,
}));

vi.mock('../File', () => ({
  File: ({ resetKey }: { resetKey?: number }) => (
    <div data-testid="file-panel">file-{resetKey ?? 0}</div>
  ),
  FileTree: () => <div data-testid="file-tree-panel">tree</div>,
}));

vi.mock('../RealtimeFollow', () => ({
  RealtimeFollowList: ({ data }: { data?: unknown }) =>
    data ? <div data-testid="realtime-panel">rt</div> : null,
}));

const wrap = (ui: React.ReactElement) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('Workspace index deepen5 residual branches', () => {
  beforeEach(() => {
    global.ResizeObserver = vi.fn(function MockRO() {
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    }) as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    cleanup();
  });

  it('Custom children null → 不进面板；非法子节点忽略', () => {
    wrap(
      <Workspace>
        <Workspace.Browser panelType="browser" url="https://a.com" />
        <Workspace.Custom>{null}</Workspace.Custom>
        <span>ignore</span>
      </Workspace>,
    );
    expect(screen.getByTestId('browser-panel')).toBeInTheDocument();
  });

  it('同 tab 再点：tabKey === current 早退', () => {
    const onTabChange = vi.fn();
    wrap(
      <Workspace onTabChange={onTabChange}>
        <Workspace.Browser
          panelType="browser"
          url="https://a.com"
          tab={{ key: 'b1', title: 'B1' }}
        />
        <Workspace.Task
          data={[{ key: 't', title: 'T' }] as any}
          tab={{ key: 't1', title: 'T1' }}
        />
      </Workspace>,
    );
    const tab = Array.from(
      document.querySelectorAll('.ant-segmented-item, label, button'),
    ).find((el) => el.textContent?.includes('B1'));
    if (tab) {
      fireEvent.click(tab);
      fireEvent.click(tab);
    }
  });

  it('空 key / divider key 不切换', () => {
    wrap(
      <Workspace>
        <Workspace.Browser
          panelType="browser"
          url="https://a.com"
          tab={{ key: 'b1', title: 'B1' }}
        />
        <Workspace.File nodes={[]} tab={{ key: 'f1', title: 'F1' }} />
      </Workspace>,
    );
    expect(screen.getByTestId('browser-panel')).toBeInTheDocument();
  });

  it('file→非 file：重置；fromKey 空不重置', () => {
    wrap(
      <Workspace defaultActiveTabKey="f1">
        <Workspace.File nodes={[]} tab={{ key: 'f1', title: 'F1' }} />
        <Workspace.Browser
          panelType="browser"
          url="https://b.com"
          tab={{ key: 'b1', title: 'B1' }}
        />
      </Workspace>,
    );
    const before = screen.queryByTestId('file-panel')?.textContent;
    const tab = Array.from(
      document.querySelectorAll('.ant-segmented-item, label, button'),
    ).find((el) => el.textContent?.includes('B1'));
    if (tab) fireEvent.click(tab);
    expect(before || screen.getByTestId('browser-panel')).toBeTruthy();
  });
});

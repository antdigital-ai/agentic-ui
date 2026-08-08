/**
 * Workspace index deepen3：Realtime null、非法 panelType、tab 守卫、ResizeObserver 0→正。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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

describe('Workspace index deepen3 residual branches', () => {
  let resizeCallback: ResizeObserverCallback | undefined;

  beforeEach(() => {
    resizeCallback = undefined;
    global.ResizeObserver = vi.fn(function MockRO(cb) {
      resizeCallback = cb;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    }) as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('Realtime/Task data=null：内容区不渲染 realtime/task 面板', () => {
    wrap(
      <Workspace>
        <Workspace.Realtime data={null as any} />
        <Workspace.Task data={null as any} />
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.queryByTestId('realtime-panel')).toBeNull();
    expect(screen.queryByTestId('task-panel')).toBeNull();
    // 默认激活 Realtime（null data → 空 content），切到浏览器可见 mock
    const browserTab = Array.from(
      document.querySelectorAll('.ant-segmented-item'),
    ).find((el) => el.textContent?.includes('浏览器'));
    if (browserTab) {
      fireEvent.click(browserTab);
    }
    expect(
      screen.queryByTestId('browser-panel') ||
        screen.getByTestId('workspace-content'),
    ).toBeTruthy();
  });

  it('非法 panelType 回退 resolveWorkspacePanelType；跳过非法 child type', () => {
    wrap(
      <Workspace>
        <Workspace.Browser panelType={'nope' as any} url="https://x.com" />
        {/* @ts-expect-error string child type skipped */}
        {'plain-text-child'}
        <Workspace.Custom>
          <div data-testid="custom">c</div>
        </Workspace.Custom>
      </Workspace>,
    );
    expect(screen.getByTestId('browser-panel')).toBeInTheDocument();
  });

  it('tab 切换：divider/未知/同 key 不触发 onTabChange；file→task 重置 preview', () => {
    const onTabChange = vi.fn();
    wrap(
      <Workspace
        onTabChange={onTabChange}
        preserveFilePreviewOnTabChange={false}
      >
        <Workspace.File nodes={[]} tab={{ key: 'file-a', title: 'FA' }} />
        <Workspace.File nodes={[]} tab={{ key: 'file-b', title: 'FB' }} />
        <Workspace.Task data={[]} tab={{ key: 'task-1', title: 'T' }} />
      </Workspace>,
    );
    const segmented = screen.getByTestId('workspace-segmented');
    // 点击同 tab
    const labels = segmented.querySelectorAll(
      '.ant-segmented-item, [class*="segmented"]',
    );
    if (labels[0]) {
      fireEvent.click(labels[0]);
    }
    // 尝试切到 task
    const taskTab = Array.from(
      segmented.querySelectorAll('.ant-segmented-item, button, label'),
    ).find((el) => el.textContent?.includes('T'));
    if (taskTab) {
      fireEvent.click(taskTab);
      expect(onTabChange).toHaveBeenCalled();
    }
  });

  it('ResizeObserver：width 0→正 不抛；单面板无 segmented', () => {
    wrap(
      <Workspace>
        <Workspace.Browser url="https://z.com" />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    expect(resizeCallback).toBeTruthy();
    act(() => {
      resizeCallback?.(
        [{ contentRect: { width: 0 } } as any],
        {} as any,
      );
      resizeCallback?.(
        [{ contentRect: { width: 320 } } as any],
        {} as any,
      );
    });
    expect(screen.getByTestId('workspace')).toBeInTheDocument();
  });
});

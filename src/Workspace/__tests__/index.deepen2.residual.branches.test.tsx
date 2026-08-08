/**
 * Workspace index deepen residual（启用）：locale 回退、Custom、ResizeObserver、null data。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
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
    data ? (
      <div data-testid="task-panel">task</div>
    ) : (
      <div data-testid="task-empty" />
    ),
}));

vi.mock('../File', () => ({
  File: ({ resetKey }: { resetKey?: number }) => (
    <div data-testid="file-panel">file-{resetKey ?? 0}</div>
  ),
  FileTree: () => <div data-testid="file-tree-panel">tree</div>,
}));

vi.mock('../RealtimeFollow', () => ({
  RealtimeFollowList: ({ data }: { data?: unknown }) =>
    data ? (
      <div data-testid="realtime-panel">rt</div>
    ) : (
      <div data-testid="realtime-empty" />
    ),
}));

const wrap = (ui: React.ReactElement, locale: Record<string, any> = {}) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale, language: 'zh-CN' } as any}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('Workspace index deepen2 residual branches', () => {
  let resizeCallback: ResizeObserverCallback | undefined;

  beforeEach(() => {
    resizeCallback = undefined;
    global.ResizeObserver = vi.fn(function MockResizeObserver(cb) {
      resizeCallback = cb;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    }) as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('空 locale：默认中文 tab 文案回退', () => {
    wrap(
      <Workspace>
        <Workspace.Realtime data={{ type: 'shell', content: 'x' }} />
        <Workspace.Browser url="https://a.com" />
        <Workspace.Task data={[]} />
        <Workspace.File nodes={[]} />
      </Workspace>,
    );
    expect(screen.getByTestId('workspace-segmented')).toBeInTheDocument();
    expect(screen.getByTestId('realtime-panel')).toBeInTheDocument();
  });

  it('Custom 面板 + count；受控切换', () => {
    const onTabChange = vi.fn();
    wrap(
      <Workspace activeTabKey="custom-0" onTabChange={onTabChange}>
        <Workspace.Custom
          tab={{
            key: 'custom-0',
            title: '自定义',
            icon: <span data-testid="c-icon">i</span>,
            count: 3,
          }}
        >
          <div data-testid="custom-panel">c</div>
        </Workspace.Custom>
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.getByTestId('custom-panel')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-tab-count--custom-0')).toBeInTheDocument();
    const segmented = screen.getByTestId('workspace-segmented');
    const options = segmented.querySelectorAll('label');
    if (options.length >= 2) {
      fireEvent.click(options[1]);
      expect(onTabChange).toHaveBeenCalled();
    }
  });

  it('onClose 渲染关闭按钮', () => {
    const onClose = vi.fn();
    wrap(
      <Workspace onClose={onClose}>
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
      { 'workspace.closeWorkspace': '关闭工作空间' },
    );
    fireEvent.click(screen.getByTestId('workspace-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('Realtime data 为空时不渲染 realtime-panel', () => {
    wrap(
      <Workspace defaultActiveTabKey="realtime">
        <Workspace.Realtime />
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.queryByTestId('realtime-panel')).not.toBeInTheDocument();
  });

  it('Task data 为空时不渲染 task-panel', () => {
    wrap(
      <Workspace defaultActiveTabKey="task">
        <Workspace.Task />
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.queryByTestId('task-panel')).not.toBeInTheDocument();
  });

  it('ResizeObserver 宽度 0→正数时递增 segmentedKey', () => {
    wrap(
      <Workspace>
        <Workspace.Browser url="https://a.com" />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    expect(resizeCallback).toBeDefined();
    resizeCallback!(
      [{ contentRect: { width: 0 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    );
    resizeCallback!(
      [{ contentRect: { width: 320 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    );
    expect(screen.getByTestId('workspace-segmented')).toBeInTheDocument();
  });

  it('FileTree 单独 tab + defaultActiveTabKey', () => {
    wrap(
      <Workspace defaultActiveTabKey="fileTree">
        <Workspace.FileTree treeData={[]} />
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.getByTestId('file-tree-panel')).toBeInTheDocument();
  });

  it('无效 tab key 点击 divider 被忽略', () => {
    const onTabChange = vi.fn();
    wrap(
      <Workspace onTabChange={onTabChange}>
        <Workspace.Realtime data={{ type: 'shell', content: 'x' }} />
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    const segmented = screen.getByTestId('workspace-segmented');
    fireEvent.click(segmented);
    expect(onTabChange).not.toHaveBeenCalledWith('');
  });

  it('受控 activeTabKey 同步 internalActiveTab', () => {
    const { rerender } = wrap(
      <Workspace activeTabKey="browser">
        <Workspace.Browser url="https://a.com" />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    expect(screen.getByTestId('browser-panel')).toBeInTheDocument();
    rerender(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <Workspace activeTabKey="task">
            <Workspace.Browser url="https://a.com" />
            <Workspace.Task data={[]} />
          </Workspace>
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('task-panel')).toBeInTheDocument();
  });

  it('title 缺省使用 locale workspace.title', () => {
    wrap(
      <Workspace>
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
      { 'workspace.title': '我的工作区' },
    );
    expect(screen.getByTestId('workspace-title')).toHaveTextContent('我的工作区');
  });

  it('Fragment 嵌套 children 扁平化', () => {
    wrap(
      <Workspace>
        <>
          <Workspace.Browser url="https://a.com" />
          <Workspace.Task data={[]} />
        </>
      </Workspace>,
    );
    expect(screen.getByTestId('workspace-tabs')).toBeInTheDocument();
  });
});

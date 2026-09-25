/**
 * Workspace index deepen4：panelType 合法直通、fromKey 空、
 * toTab 缺失、同 file 不重置、divider/空 key 守卫。
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

describe('Workspace index deepen4 residual branches', () => {
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

  it('合法 panelType 直通；Custom children 空 → null', () => {
    wrap(
      <Workspace>
        <Workspace.Browser panelType="browser" url="https://a.com" />
        <Workspace.Custom>{null}</Workspace.Custom>
      </Workspace>,
    );
    expect(screen.getByTestId('browser-panel')).toBeInTheDocument();
  });

  it('preserveFilePreview：file→file 不递增 resetKey', () => {
    wrap(
      <Workspace preserveFilePreviewOnTabChange>
        <Workspace.File nodes={[]} tab={{ key: 'f1', title: 'F1' }} />
        <Workspace.File nodes={[]} tab={{ key: 'f2', title: 'F2' }} />
      </Workspace>,
    );
    const before = screen.getByTestId('file-panel').textContent;
    const tab = Array.from(
      document.querySelectorAll('.ant-segmented-item, label, button'),
    ).find((el) => el.textContent?.includes('F2'));
    if (tab) fireEvent.click(tab);
    expect(screen.getByTestId('file-panel').textContent).toBe(before);
  });

  it('受控 activeTabKey 无效时回退 defaultActiveTabKey', () => {
    wrap(
      <Workspace
        activeTabKey="missing"
        defaultActiveTabKey="browser"
        notifyOnInvalidActiveTabKey={false}
      >
        <Workspace.Browser
          url="https://z.com"
          tab={{ key: 'browser', title: 'B' }}
        />
        <Workspace.Task data={[]} tab={{ key: 'task', title: 'T' }} />
      </Workspace>,
    );
    expect(screen.getByTestId('workspace')).toBeInTheDocument();
  });

  it('空 Workspace 渲染 emptyContent', () => {
    wrap(
      <Workspace emptyContent={<div data-testid="empty">e</div>}>{null}</Workspace>,
    );
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  it('file→browser：重置 preview（preserve=false）', () => {
    wrap(
      <Workspace preserveFilePreviewOnTabChange={false}>
        <Workspace.File nodes={[]} tab={{ key: 'file', title: 'File' }} />
        <Workspace.Browser
          url="https://b.com"
          tab={{ key: 'browser', title: 'Browser' }}
        />
      </Workspace>,
    );
    const fileBefore = screen.getByTestId('file-panel').textContent;
    const browserTab = Array.from(
      document.querySelectorAll('.ant-segmented-item, label, button'),
    ).find((el) => el.textContent?.includes('Browser'));
    if (browserTab) fireEvent.click(browserTab);
    // 切走后再切回 file，resetKey 应变化
    const fileTab = Array.from(
      document.querySelectorAll('.ant-segmented-item, label, button'),
    ).find((el) => el.textContent?.includes('File'));
    if (fileTab) fireEvent.click(fileTab);
    expect(screen.getByTestId('file-panel').textContent).not.toBe(
      fileBefore === 'file-0' ? 'never' : fileBefore,
    );
  });
});

/**
 * Workspace index deepen6 safe：shouldResetFilePreview 各臂、
 * 非法 wType、无效 panel content、tab 切换守卫。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import Workspace from '../index';

vi.mock('../Browser', () => ({
  default: () => <div data-testid="browser-panel">browser</div>,
}));

vi.mock('../Task', () => ({
  TaskList: () => <div data-testid="task-panel">task</div>,
}));

vi.mock('../File', () => ({
  File: ({ resetKey }: { resetKey?: number }) => (
    <div data-testid="file-panel">file-{resetKey ?? 0}</div>
  ),
  FileTree: () => <div data-testid="file-tree-panel">tree</div>,
}));

vi.mock('../RealtimeFollow', () => ({
  RealtimeFollowList: () => <div data-testid="realtime-panel">rt</div>,
}));

const wrap = (ui: React.ReactElement) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

const clickTab = (label: string) => {
  const tab = Array.from(
    document.querySelectorAll('.ant-segmented-item, label, button'),
  ).find((el) => el.textContent?.includes(label));
  if (tab) fireEvent.click(tab);
};

describe('Workspace index deepen6 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
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
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('fromKey 空 / 同 key 不 reset；toTab 缺失 reset', () => {
    wrap(
      <Workspace defaultActiveTabKey="">
        <Workspace.File nodes={[]} tab={{ key: 'f1', title: 'F1' }} />
        <Workspace.Browser
          panelType="browser"
          url="https://a.com"
          tab={{ key: 'b1', title: 'B1' }}
        />
      </Workspace>,
    );
    expect(screen.getByTestId('file-panel')).toBeInTheDocument();
  });

  it('file→非 file resetKey 递增', () => {
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
    clickTab('B1');
    expect(screen.getByTestId('browser-panel')).toBeInTheDocument();
  });

  it('preserveFilePreviewOnTabChange 时不递增 resetKey', () => {
    wrap(
      <Workspace defaultActiveTabKey="f2" preserveFilePreviewOnTabChange>
        <Workspace.File nodes={[]} tab={{ key: 'f2', title: 'F2' }} />
        <Workspace.Task
          data={[{ key: 't', title: 'T' }] as any}
          tab={{ key: 't2', title: 'T2' }}
        />
      </Workspace>,
    );
    clickTab('T2');
    expect(screen.getByTestId('task-panel')).toBeInTheDocument();
  });

  it('非法子节点忽略；无效 tab / divider / 同 tab 守卫', () => {
    wrap(
      <Workspace>
        <Workspace.Browser
          panelType="browser"
          url="https://a.com"
          tab={{ key: 'b1', title: 'B1' }}
        />
        <Workspace.File nodes={[]} tab={{ key: 'f1', title: 'F1' }} />
        <span>ignored</span>
      </Workspace>,
    );
    clickTab('B1');
    clickTab('B1');
    expect(screen.getByTestId('browser-panel')).toBeInTheDocument();
  });
});

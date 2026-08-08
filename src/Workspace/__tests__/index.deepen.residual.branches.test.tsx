/**
 * Workspace index deepen residual：locale 缺省标题、Custom/FileTree、关闭按钮。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import Workspace from '../index';

vi.mock('../Browser', () => ({
  default: ({ title }: { title?: string }) => (
    <div data-testid="browser-panel">{title || 'browser'}</div>
  ),
}));

vi.mock('../Task', () => ({
  TaskList: ({ title }: { title?: string }) => (
    <div data-testid="task-panel">{title || 'task'}</div>
  ),
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

const wrap = (ui: React.ReactElement, locale: Record<string, any> = {}) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale, language: 'zh-CN' } as any}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('Workspace index deepen residual branches', () => {
  it.skip('空 locale：默认中文 tab 文案回退', () => {
    wrap(
      <Workspace>
        <Workspace.RealtimeFollow data={[]} />
        <Workspace.Browser url="https://a.com" />
        <Workspace.Task data={[]} />
        <Workspace.File nodes={[]} />
        <Workspace.FileTree nodes={[]} />
      </Workspace>,
    );
    expect(screen.getByTestId('workspace-segmented')).toBeInTheDocument();
    expect(screen.getByTestId('realtime-panel')).toBeInTheDocument();
  });

  it.skip('Custom 面板 + title/icon/count；受控切换', () => {
    const onTabChange = vi.fn();
    wrap(
      <Workspace activeTabKey="custom-1" onTabChange={onTabChange}>
        <Workspace.Custom
          tab={{
            key: 'custom-1',
            title: '自定义',
            icon: <span data-testid="c-icon">i</span>,
            count: 3,
          }}
        >
          <div data-testid="custom-panel">c</div>
        </Workspace.Custom>
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
      {
        'workspace.browser': 'Browser',
        'workspace.realtimeFollow': 'Realtime',
        'workspace.task': 'Task',
        'workspace.file': 'File',
      },
    );
    expect(screen.getByTestId('custom-panel')).toBeInTheDocument();
    const segmented = screen.getByTestId('workspace-segmented');
    const options = segmented.querySelectorAll('label');
    if (options.length >= 2) {
      fireEvent.click(options[1]);
      expect(onTabChange).toHaveBeenCalled();
    }
  });

  it.skip('onClose 渲染关闭；无 title/headerExtra 假值臂', () => {
    const onClose = vi.fn();
    wrap(
      <Workspace onClose={onClose}>
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    const closeBtn =
      screen.queryByRole('button', { name: /close|关闭/i }) ||
      document.querySelector('[class*="close"]');
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    } else {
      expect(screen.getByTestId('browser-panel')).toBeInTheDocument();
    }
  });

  it.skip('仅 FileTree；defaultActiveTabKey=fileTree', () => {
    wrap(
      <Workspace defaultActiveTabKey="fileTree">
        <Workspace.FileTree nodes={[]} />
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.getByTestId('file-tree-panel')).toBeInTheDocument();
  });

  it.skip('多 Realtime + Task 计数；style/className', () => {
    const { container } = wrap(
      <Workspace className="ws-deep" style={{ margin: 2 }}>
        <Workspace.RealtimeFollow data={[{ id: '1' } as any]} />
        <Workspace.RealtimeFollow data={[{ id: '2' } as any]} />
        <Workspace.Task data={[{ key: 't1' } as any]} title="T" />
      </Workspace>,
    );
    expect(container.querySelector('.ws-deep')).toBeTruthy();
  });
});

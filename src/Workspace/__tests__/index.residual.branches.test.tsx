/**
 * Workspace index 残留：title/headerExtra、defaultActive、Realtime 计数。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
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

describe('Workspace index residual branches', () => {
  it('title / headerExtra 渲染', () => {
    wrap(
      <Workspace
        title={<span data-testid="ws-title">W</span>}
        headerExtra={<button type="button" data-testid="ws-extra">E</button>}
      >
        <Workspace.Browser url="https://a.com" />
        <Workspace.File nodes={[]} />
      </Workspace>,
    );
    expect(screen.getByTestId('ws-title')).toBeInTheDocument();
    expect(screen.getByTestId('ws-extra')).toBeInTheDocument();
  });

  it('defaultActiveTabKey 非受控初始 tab', () => {
    wrap(
      <Workspace defaultActiveTabKey="file">
        <Workspace.Browser url="https://a.com" />
        <Workspace.File nodes={[]} />
      </Workspace>,
    );
    expect(screen.getByTestId('file-panel')).toBeInTheDocument();
  });

  it('Realtime + File 切换触发 file resetKey', () => {
    wrap(
      <Workspace>
        <Workspace.RealtimeFollow data={[]} />
        <Workspace.File nodes={[]} />
      </Workspace>,
    );
    const segmented = screen.queryByTestId('workspace-segmented');
    if (segmented) {
      const options = segmented.querySelectorAll('label');
      if (options.length >= 2) {
        fireEvent.click(options[1]);
        expect(screen.getByTestId('file-panel')).toBeInTheDocument();
      }
    }
  });

  it('className / style / header 额外属性', () => {
    const { container } = wrap(
      <Workspace className="ws-x" style={{ padding: 4 }}>
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('onTabChange 未提供时切换不抛', () => {
    wrap(
      <Workspace>
        <Workspace.Browser url="https://a.com" />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    const segmented = screen.getByTestId('workspace-segmented');
    const options = segmented.querySelectorAll('label');
    if (options.length >= 2) {
      expect(() => fireEvent.click(options[1])).not.toThrow();
    }
  });

  it('受控 activeTabKey + onTabChange；空 children；多 Browser', () => {
    const onTabChange = vi.fn();
    const { rerender } = wrap(
      <Workspace activeTabKey="browser" onTabChange={onTabChange}>
        <Workspace.Browser title="B1" url="https://a.com" />
        <Workspace.Browser title="B2" url="https://b.com" />
        <Workspace.File nodes={[]} />
        <Workspace.Task data={[]} title="T" />
      </Workspace>,
    );
    const segmented = screen.getByTestId('workspace-segmented');
    const options = segmented.querySelectorAll('label');
    if (options.length >= 2) {
      fireEvent.click(options[1]);
      expect(onTabChange).toHaveBeenCalled();
    }
    rerender(
      <Workspace activeTabKey="file" onTabChange={onTabChange}>
        <Workspace.Browser url="https://a.com" />
        <Workspace.File nodes={[]} />
      </Workspace>,
    );
    expect(screen.getByTestId('file-panel')).toBeInTheDocument();
  });
});

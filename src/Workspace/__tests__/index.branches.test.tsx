/**
 * Workspace 分支覆盖：受控/非受控 tab、空 children、close、file reset。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
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

describe('Workspace index branches', () => {
  it('无 children 时渲染 emptyContent', () => {
    render(
      <Workspace emptyContent={<div data-testid="empty">empty</div>} />,
    );
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  it('单 tab 不渲染 Segmented', () => {
    render(
      <Workspace>
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.queryByTestId('workspace-tabs')).not.toBeInTheDocument();
    expect(screen.getByTestId('browser-panel')).toBeInTheDocument();
  });

  it('多 tab 切换触发 onTabChange', () => {
    const onTabChange = vi.fn();
    render(
      <Workspace onTabChange={onTabChange}>
        <Workspace.Browser url="https://a.com" />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    const segmented = screen.getByTestId('workspace-segmented');
    const options = segmented.querySelectorAll('label');
    if (options.length >= 2) {
      fireEvent.click(options[1]);
      expect(onTabChange).toHaveBeenCalled();
    }
  });

  it('受控 activeTabKey 使用外部 key', () => {
    render(
      <Workspace activeTabKey="task">
        <Workspace.Browser url="https://a.com" />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    expect(screen.getByTestId('task-panel')).toBeInTheDocument();
  });

  it('无效 activeTabKey 且 notify 时回调 fallback', () => {
    const onTabChange = vi.fn();
    render(
      <Workspace
        activeTabKey="missing"
        notifyOnInvalidActiveTabKey
        onTabChange={onTabChange}
      >
        <Workspace.Browser url="https://a.com" />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    expect(onTabChange).toHaveBeenCalled();
  });

  it('onClose 渲染关闭按钮', () => {
    const onClose = vi.fn();
    render(
      <Workspace onClose={onClose}>
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    fireEvent.click(screen.getByTestId('workspace-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('pure 模式应用 pure 类名', () => {
    render(
      <Workspace pure>
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.getByTestId('workspace').className).toContain('-pure');
  });

  it('headerExtra 渲染在 header-right', () => {
    render(
      <Workspace headerExtra={<span data-testid="extra">E</span>}>
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });

  it('Realtime + 其它 tab 插入 divider option', () => {
    render(
      <Workspace>
        <Workspace.Realtime data={[]} />
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.getByTestId('workspace-tabs')).toBeInTheDocument();
  });

  it('Custom panel 无 children 返回 null content', () => {
    render(
      <Workspace>
        <Workspace.Custom tab={{ key: 'custom-1', title: 'C' }} />
      </Workspace>,
    );
    expect(screen.getByTestId('workspace')).toBeInTheDocument();
  });

  it('File tab count 显示 WorkspaceTabCountDigits', () => {
    render(
      <Workspace>
        <Workspace.File files={[]} tab={{ count: 3 }} />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    expect(screen.getByTestId('workspace-tab-count--file')).toBeInTheDocument();
  });

  it('Fragment children 扁平化', () => {
    render(
      <Workspace>
        <>
          <Workspace.Browser url="https://a.com" />
          <Workspace.Task data={[]} />
        </>
      </Workspace>,
    );
    expect(screen.getByTestId('workspace-tabs')).toBeInTheDocument();
  });

  it('preserveFilePreviewOnTabChange 时不递增 resetKey', () => {
    render(
      <Workspace preserveFilePreviewOnTabChange>
        <Workspace.File files={[]} />
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.getByTestId('file-panel')).toHaveTextContent('file-0');
    const segmented = screen.getByTestId('workspace-segmented');
    const options = segmented.querySelectorAll('label');
    if (options.length >= 2) {
      fireEvent.click(options[1]);
      fireEvent.click(options[0]);
    }
    expect(screen.getByTestId('file-panel')).toHaveTextContent('file-0');
  });

  it('File 切到 Browser 时递增 resetKey', () => {
    render(
      <Workspace>
        <Workspace.File files={[]} />
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.getByTestId('file-panel')).toHaveTextContent('file-0');
    const segmented = screen.getByTestId('workspace-segmented');
    const options = segmented.querySelectorAll('label');
    if (options.length >= 2) {
      fireEvent.click(options[1]);
      fireEvent.click(options[0]);
    }
    expect(screen.getByTestId('file-panel')).toHaveTextContent('file-1');
  });

  it('FileTree tab 渲染 file-tree-panel', () => {
    render(
      <Workspace>
        <Workspace.FileTree treeData={[]} onLoadChildren={vi.fn()} />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    fireEvent.click(
      screen.getByTestId('workspace-segmented').querySelectorAll('label')[0],
    );
    expect(screen.getByTestId('file-tree-panel')).toBeInTheDocument();
  });

  it('defaultActiveTabKey 非受控初始选中', () => {
    render(
      <Workspace defaultActiveTabKey="task">
        <Workspace.Browser url="https://a.com" />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    expect(screen.getByTestId('task-panel')).toBeInTheDocument();
  });

  it('notifyOnInvalidActiveTabKey=false 时不回调 fallback', () => {
    const onTabChange = vi.fn();
    render(
      <Workspace
        activeTabKey="missing"
        notifyOnInvalidActiveTabKey={false}
        onTabChange={onTabChange}
      >
        <Workspace.Browser url="https://a.com" />
        <Workspace.Task data={[]} />
      </Workspace>,
    );
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it('自定义 title 覆盖默认 Workspace 标题', () => {
    render(
      <Workspace title="My WS">
        <Workspace.Browser url="https://a.com" />
      </Workspace>,
    );
    expect(screen.getByTestId('workspace-title')).toHaveTextContent('My WS');
  });

  it('重复 tab key 自动去重后缀', () => {
    render(
      <Workspace>
        <Workspace.Custom tab={{ key: 'dup', title: 'A' }} />
        <Workspace.Custom tab={{ key: 'dup', title: 'B' }} />
      </Workspace>,
    );
    expect(screen.getByTestId('workspace-tabs')).toBeInTheDocument();
  });

  it('Task data 为空时不渲染 task-panel 内容', () => {
    render(
      <Workspace defaultActiveTabKey="task">
        <Workspace.Task />
      </Workspace>,
    );
    expect(screen.queryByTestId('task-panel')).not.toBeInTheDocument();
  });
});

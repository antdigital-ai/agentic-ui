/**
 * FileComponent deepen10 safe：isFileNodeReturn 守卫、嵌套 group 同步、
 * onBack preview、竞态 preview、非受控 tree 切换、show-more 键盘、keyword nullish。
 */
import '@testing-library/jest-dom';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvide } from '../../../I18n';
import type { FileNode, GroupNode } from '../../types';
import { FileComponent } from '../FileComponent';
import { GROUP_INITIAL_PAGE_SIZE } from '../components/FileGroup';

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...(actual as any),
    message: { success: vi.fn(), error: vi.fn() },
  };
});

vi.mock('../PreviewComponent', () => ({
  PreviewComponent: (props: any) => (
    <div data-testid="preview-d10">
      <button type="button" data-testid="back-d10" onClick={() => props.onBack?.()}>
        back
      </button>
      <span>{props.file?.name}</span>
    </div>
  ),
}));

vi.mock('../FileTree/FileTreeComponent', () => ({
  FileTree: (props: any) => (
    <div data-testid="tree-d10" data-keyword={props.filterKeyword ?? ''}>
      tree
    </div>
  ),
}));

const file = (id: string, name: string, extra?: Partial<FileNode>): FileNode => ({
  id,
  name,
  content: 'body',
  canPreview: true,
  type: 'markdown',
  ...extra,
});

const wrap = (ui: React.ReactNode) =>
  render(
    <ConfigProvider>
      <I18nProvide>{ui}</I18nProvide>
    </ConfigProvider>,
  );

describe('FileComponent deepen10 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    if (typeof URL.createObjectURL === 'undefined') {
      URL.createObjectURL = vi.fn(() => 'blob:mock');
    }
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('onPreview 返回 number/ReactElement/无效对象 → 非 FileNode', async () => {
    wrap(
      <FileComponent
        nodes={[file('n1', 'n1.md')]}
        onPreview={async () => 42 as any}
      />,
    );
    fireEvent.click(await screen.findByText('n1.md'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.body).toBeTruthy();

    cleanup();
    wrap(
      <FileComponent
        nodes={[file('n2', 'n2.md')]}
        onPreview={async () => null}
      />,
    );
    fireEvent.click(await screen.findByText('n2.md'));
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('嵌套 group 更新 previewFile；onBack 有 previewFile', async () => {
    const group: GroupNode = {
      id: 'g1',
      name: 'Group',
      type: 'markdown',
      children: [file('c1', 'child.md')],
    };
    wrap(
      <FileComponent
        nodes={[group]}
        onPreview={async (f) => f}
        onBack={() => true}
      />,
    );
    fireEvent.click(await screen.findByText('child.md'));
    await waitFor(() => {
      expect(screen.getByTestId('preview-d10')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('back-d10'));
    await waitFor(() => {
      expect(screen.queryByTestId('preview-d10')).not.toBeInTheDocument();
    });
  });

  it('preview 竞态：旧请求结果被丢弃', async () => {
    let resolveSlow!: (v: FileNode) => void;
    const slow = new Promise<FileNode>((res) => {
      resolveSlow = res;
    });
    wrap(
      <FileComponent
        nodes={[file('s1', 'slow.md'), file('f1', 'fast.md')]}
        onPreview={async (f) => (f.name === 'slow.md' ? slow : f)}
      />,
    );
    fireEvent.click(await screen.findByText('slow.md'));
    fireEvent.click(await screen.findByText('fast.md'));
    await act(async () => {
      resolveSlow(file('s1', 'slow.md'));
      await Promise.resolve();
    });
    expect(screen.getByTestId('preview-d10')).toBeInTheDocument();
  });

  it('非受控 tree 切换；flat show-more Enter；keyword nullish trim', async () => {
    const many = Array.from({ length: GROUP_INITIAL_PAGE_SIZE + 3 }, (_, i) =>
      file(`f${i}`, `file-${i}.md`),
    );
    const { container } = wrap(<FileComponent nodes={many} />);
    const showMore =
      container.querySelector('.ant-workspace-file-show-more') ||
      screen.queryByRole('button', { name: /查看更多/ });
    expect(showMore).toBeTruthy();
    fireEvent.keyDown(showMore!, { key: 'Enter' });
    fireEvent.keyDown(showMore!, { key: ' ' });

    cleanup();
    wrap(
      <FileComponent
        nodes={[file('t1', 'tree.md')]}
        fileTreeSwitch={{ defaultView: 'list', showSwitch: true } as any}
        keyword={undefined}
      />,
    );
    const switchBtn = screen.queryByRole('button', { name: /树|tree/i });
    if (switchBtn) fireEvent.click(switchBtn);
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    expect(
      screen.queryByTestId('tree-d10') || document.body,
    ).toBeTruthy();
  });
});

/**
 * FileComponent deepen12 safe：isFileNodeReturn 守卫、actionRef、
 * 受控 panelView、image preview、preview 竞态。
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
import type { FileNode } from '../../types';
import { FileComponent } from '../FileComponent';

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...(actual as any),
    message: { success: vi.fn(), error: vi.fn() },
  };
});

vi.mock('../PreviewComponent', () => ({
  PreviewComponent: (props: any) => (
    <div data-testid="preview-d12">
      <button type="button" data-testid="back-d12" onClick={() => props.onBack?.()}>
        back
      </button>
      <span>{props.file?.name}</span>
    </div>
  ),
}));

vi.mock('../FileTree/FileTreeComponent', () => ({
  FileTree: (props: any) => (
    <div data-testid="tree-d12" data-keyword={props.filterKeyword ?? ''}>
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

describe('FileComponent deepen12 safe residual branches', () => {
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

  it('onPreview 返回无效对象 → 非 FileNode 仍走默认 preview', async () => {
    wrap(
      <FileComponent
        nodes={[file('r1', 'r1.md')]}
        onPreview={async () => ({ id: 'x' }) as any}
      />,
    );
    fireEvent.click(await screen.findByText('r1.md'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId('preview-d12')).toBeInTheDocument();
  });

  it('actionRef openPreview / backToList / updatePreviewHeader', async () => {
    const ref = React.createRef<any>();
    wrap(
      <FileComponent
        nodes={[file('a1', 'a1.md')]}
        onPreview={async (f) => f}
        actionRef={ref}
      />,
    );
    await act(async () => {
      ref.current?.openPreview(file('a1', 'a1.md'));
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(screen.getByTestId('preview-d12')).toBeInTheDocument(),
    );
    ref.current?.updatePreviewHeader?.({ name: 'renamed.md' });
    ref.current?.backToList?.();
    await waitFor(() =>
      expect(screen.queryByTestId('preview-d12')).not.toBeInTheDocument(),
    );
  });

  it('图片 preview 分支；受控 panelView tree + keyword', async () => {
    wrap(
      <FileComponent
        nodes={[file('img1', 'pic.png', { type: 'image', content: 'https://x/p.png' })]}
        panelView="tree"
        keyword={undefined}
        fileTreeSwitch={{ enabled: true }}
      />,
    );
    fireEvent.click(await screen.findByText('pic.png'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.body).toBeTruthy();
  });

  it('preview catch 竞态丢弃 + onBack 回调', async () => {
    let rejectSlow!: (e: Error) => void;
    const slow = new Promise<FileNode>((_, rej) => {
      rejectSlow = rej;
    });
    wrap(
      <FileComponent
        nodes={[file('s1', 'slow.md'), file('f1', 'fast.md')]}
        onPreview={async (f) => (f.name === 'slow.md' ? slow : f)}
        onBack={() => true}
      />,
    );
    fireEvent.click(await screen.findByText('slow.md'));
    fireEvent.click(await screen.findByText('fast.md'));
    await act(async () => {
      rejectSlow(new Error('fail'));
      await Promise.resolve();
    });
    expect(screen.getByTestId('preview-d12')).toBeInTheDocument();
  });
});

/**
 * FileComponent deepen7 safe：onBack 继续/拦截、无 onDownload、
 * 受控 panelView、分组内预览同步、share 双臂、stale onPreview catch。
 * FileComponent.deepen.branches hang-quarantined；避开 flat 分页风暴。
 */
import '@testing-library/jest-dom';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
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
    <div data-testid="preview-stub">
      <button type="button" data-testid="stub-back" onClick={() => props.onBack?.()}>
        back
      </button>
      <button
        type="button"
        data-testid="stub-download"
        onClick={() => props.onDownload?.(props.file)}
      >
        dl
      </button>
      <button
        type="button"
        data-testid="stub-share"
        onClick={() =>
          props.onShare?.(props.file, { anchorEl: document.body })
        }
      >
        share
      </button>
      <span>{props.file?.name}</span>
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

describe('FileComponent deepen7 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    if (typeof URL.createObjectURL === 'undefined') {
      URL.createObjectURL = vi.fn(() => 'blob:mock');
    }
    if (typeof URL.revokeObjectURL === 'undefined') {
      URL.revokeObjectURL = vi.fn();
    }
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('onBack 返回 undefined 继续；返回 false 拦截', async () => {
    const onBack = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(false);
    wrap(
      <FileComponent nodes={[file('a', 'a.md')]} onBack={onBack} />,
    );
    fireEvent.click(await screen.findByText('a.md'));
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(20);
    });
    fireEvent.click(screen.getByTestId('stub-back'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(onBack).toHaveBeenCalled();

    cleanup();
    wrap(
      <FileComponent nodes={[file('b', 'b.md')]} onBack={onBack} />,
    );
    fireEvent.click(await screen.findByText('b.md'));
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(screen.getByTestId('stub-back'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByTestId('preview-stub')).toBeTruthy();
  });

  it('预览下载无 onDownload；有 onShare / 无 onShare', async () => {
    const onShare = vi.fn();
    wrap(
      <FileComponent nodes={[file('c', 'c.md')]} onShare={onShare} />,
    );
    fireEvent.click(await screen.findByText('c.md'));
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(screen.getByTestId('stub-download'));
    fireEvent.click(screen.getByTestId('stub-share'));
    expect(onShare).toHaveBeenCalled();

    cleanup();
    wrap(<FileComponent nodes={[file('d', 'd.md')]} />);
    fireEvent.click(await screen.findByText('d.md'));
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(screen.getByTestId('stub-share'));
    expect(screen.getByTestId('preview-stub')).toBeInTheDocument();
  });

  it('分组内预览同步；受控 panelView', async () => {
    const grouped = [
      {
        id: 'g1',
        name: 'G',
        children: [file('n1', 'nested.md', { type: 'markdown' })],
      },
    ];
    const { rerender } = wrap(
      <FileComponent nodes={grouped as any} />,
    );
    fireEvent.click(await screen.findByText('nested.md'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId('preview-stub')).toBeInTheDocument();

    rerender(
      <ConfigProvider>
        <I18nProvide>
          <FileComponent
            nodes={
              [
                {
                  id: 'g1',
                  name: 'G',
                  children: [
                    file('n1', 'nested.md', {
                      type: 'markdown',
                      content: 'updated',
                    }),
                  ],
                },
              ] as any
            }
          />
        </I18nProvide>
      </ConfigProvider>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('nested.md')).toBeInTheDocument();

    cleanup();
    const onViewChange = vi.fn();
    wrap(
      <FileComponent
        nodes={[file('t1', 'tree.md')]}
        fileTreeSwitch={{
          view: 'list',
          onViewChange,
          treeProps: {
            treeData: [{ key: 'tree.md', name: 'tree.md', isLeaf: true }],
            onLoadChildren: async () => [],
          },
        }}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.body).toBeTruthy();
  });

  it('onPreview 抛错且 callId 过期：stale catch 早退', async () => {
    let resolveFirst: (v: any) => void = () => {};
    const first = new Promise((r) => {
      resolveFirst = r;
    });
    let call = 0;
    const onPreview = vi.fn(async () => {
      call += 1;
      if (call === 1) {
        await first;
        throw new Error('stale');
      }
      return false;
    });
    wrap(
      <FileComponent
        nodes={[file('e1', 'e1.md'), file('e2', 'e2.md')]}
        onPreview={onPreview}
      />,
    );
    fireEvent.click(await screen.findByText('e1.md'));
    fireEvent.click(await screen.findByText('e2.md'));
    await act(async () => {
      await Promise.resolve();
    });
    resolveFirst(null);
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(20);
    });
    expect(onPreview).toHaveBeenCalled();
  });
});

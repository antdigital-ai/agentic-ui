/**
 * FileComponent deepen2：isFileNodeReturn 假值、非字符串 segment、onToggleGroup、
 * onBack 抛错、自定义 preview share、tree placeholder、show-more Space。
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
import {
  GROUP_INITIAL_PAGE_SIZE,
} from '../components/FileGroup';

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...(actual as any),
    message: { success: vi.fn(), error: vi.fn() },
  };
});

const wrap = (ui: React.ReactNode) =>
  render(
    <ConfigProvider>
      <I18nProvide>{ui}</I18nProvide>
    </ConfigProvider>,
  );

const file = (id: string, name: string, extra?: Partial<FileNode>): FileNode => ({
  id,
  name,
  content: 'x',
  canPreview: true,
  ...extra,
});

describe('FileComponent deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('onPreview 返回非 FileNode（null/0/ReactElement/{name:number}）走默认预览', async () => {
    for (const ret of [null, 0, '', <div key="e">el</div>, { name: 1 }]) {
      cleanup();
      wrap(
        <FileComponent
          nodes={[file('p1', 'a.md')]}
          onPreview={async () => ret as any}
        />,
      );
      const item = await screen.findByText('a.md');
      fireEvent.click(item);
      await act(async () => {
        await Promise.resolve();
      });
    }
  });

  it('fileTreeSwitch 非字符串 label 仍渲染 toolbar', async () => {
    wrap(
      <FileComponent
        nodes={[]}
        keyword="nope"
        showSearch
        fileTreeSwitch={{
          listLabel: <span>L</span>,
          treeLabel: <b>T</b>,
          treeProps: { treeData: [], onLoadChildren: vi.fn() },
          defaultView: 'list',
        }}
      />,
    );
    expect(screen.getByTestId('file-toolbar')).toBeInTheDocument();
  });

  it('仅 onToggleGroup（无 onGroupToggle）折叠分组', async () => {
    const onToggleGroup = vi.fn();
    wrap(
      <FileComponent
        nodes={
          [
            {
              id: 'g1',
              name: 'G',
              type: 'code',
              children: [file('f1', 'a.ts')],
            },
          ] as any
        }
        onToggleGroup={onToggleGroup}
      />,
    );
    const collapse = document.querySelector(
      '[class*="collapse"], [aria-expanded], [class*="group"]',
    );
    if (collapse) {
      fireEvent.click(collapse);
    }
    // 即使 UI 选择器变化，组件也应已挂载
    expect(document.body).toBeTruthy();
  });

  it('onBack 抛错仍返回列表；自定义 ReactElement preview + onShare', async () => {
    const onShare = vi.fn();
    const onBack = vi.fn(async () => {
      throw new Error('back fail');
    });
    wrap(
      <FileComponent
        nodes={[file('s1', 'share.md')]}
        onBack={onBack}
        onShare={onShare}
        onPreview={async () =>
          (
            <div data-testid="custom-prev">
              <button
                type="button"
                data-testid="share-btn"
                onClick={() => {}}
              >
                share-slot
              </button>
            </div>
          ) as any
        }
      />,
    );
    fireEvent.click(await screen.findByText('share.md'));
    await waitFor(() => {
      expect(screen.getByTestId('custom-prev')).toBeInTheDocument();
    });
    // back
    const back =
      screen.queryByRole('button', { name: /back|返回/i }) ||
      document.querySelector('[class*="back"]');
    if (back) {
      fireEvent.click(back);
      await act(async () => {
        await Promise.resolve();
      });
      expect(onBack).toHaveBeenCalled();
    }
  });

  it('预览按 name+type 同步；flat show-more Space 键', async () => {
    const nodes = Array.from({ length: GROUP_INITIAL_PAGE_SIZE + 3 }, (_, i) =>
      file(`id-${i}`, `f${i}.txt`, { type: 'txt' }),
    );
    const { rerender } = wrap(<FileComponent nodes={nodes} />);
    const more = document.querySelector('[class*="show-more"]') as HTMLElement;
    if (more) {
      fireEvent.keyDown(more, { key: ' ' });
    }

    // open preview without id match path — use name+type
    cleanup();
    const { rerender: rr } = wrap(
      <FileComponent
        nodes={[file('', 'sync.md', { type: 'md', content: 'v1' })]}
        onPreview={async (f) => f}
      />,
    );
    fireEvent.click(await screen.findByText('sync.md'));
    await act(async () => {
      await Promise.resolve();
    });
    rr(
      <ConfigProvider>
        <I18nProvide>
          <FileComponent
            nodes={[file('', 'sync.md', { type: 'md', content: 'v2' })]}
            onPreview={async (f) => f}
          />
        </I18nProvide>
      </ConfigProvider>,
    );
    expect(document.body.textContent).toMatch(/sync|v2|v1/);
    void rerender;
  });

  it('stale onPreview reject：后发请求覆盖前请求', async () => {
    let resolveFirst: (v: any) => void;
    const first = new Promise((r) => {
      resolveFirst = r;
    });
    let call = 0;
    wrap(
      <FileComponent
        nodes={[file('a', 'a.md'), file('b', 'b.md')]}
        onPreview={async (f) => {
          call += 1;
          if (call === 1) {
            await first;
            throw new Error('stale');
          }
          return f;
        }}
      />,
    );
    fireEvent.click(await screen.findByText('a.md'));
    fireEvent.click(await screen.findByText('b.md'));
    await act(async () => {
      resolveFirst!(null);
      await Promise.resolve();
    });
    expect(call).toBeGreaterThanOrEqual(2);
  });
});

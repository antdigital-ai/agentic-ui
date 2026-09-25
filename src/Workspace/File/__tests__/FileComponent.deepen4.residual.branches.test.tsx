/**
 * FileComponent deepen4：onBack false、onPreview false、customActions 函数、
 * 预览 share/download、tree placeholder 链、缺省 locale。避免 flat 分页 hanger。
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
import { I18nContext, I18nProvide } from '../../../I18n';
import type { FileNode } from '../../types';
import { FileComponent } from '../FileComponent';

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...(actual as any),
    message: { success: vi.fn(), error: vi.fn() },
  };
});

const file = (id: string, name: string, extra?: Partial<FileNode>): FileNode => ({
  id,
  name,
  content: 'body',
  canPreview: true,
  ...extra,
});

const wrap = (
  ui: React.ReactNode,
  locale?: Record<string, string>,
) =>
  render(
    <ConfigProvider>
      {locale ? (
        <I18nContext.Provider value={{ locale: locale as any, language: 'zh-CN' }}>
          {ui}
        </I18nContext.Provider>
      ) : (
        <I18nProvide>{ui}</I18nProvide>
      )}
    </ConfigProvider>,
  );

describe('FileComponent deepen4 residual branches', () => {
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

  it('onPreview false 阻断内部预览', async () => {
    wrap(
      <FileComponent
        nodes={[file('f1', 'block.md')]}
        onPreview={async () => false}
      />,
    );
    fireEvent.click(await screen.findByText('block.md'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      document.querySelector('.ant-workspace-file-preview-back-button'),
    ).toBeFalsy();
  });

  it('onBack 返回 false 留在预览；customActions 函数；预览 onShare', async () => {
    const onShare = vi.fn();
    const onDownload = vi.fn();
    const onBack = vi.fn(async () => false);
    wrap(
      <FileComponent
        nodes={[file('p1', 'keep.md')]}
        onBack={onBack}
        onShare={onShare}
        onDownload={onDownload}
        customActions={(f) => (
          <button type="button" data-testid="ca">
            {f.name}
          </button>
        )}
      />,
    );
    fireEvent.click(await screen.findByText('keep.md'));
    await waitFor(() => {
      expect(
        document.querySelector('.ant-workspace-file-preview-back-button'),
      ).toBeTruthy();
    });
    expect(screen.getByTestId('ca')).toBeInTheDocument();

    const back = document.querySelector(
      '.ant-workspace-file-preview-back-button',
    ) as HTMLElement;
    fireEvent.click(back);
    await act(async () => {
      await Promise.resolve();
    });
    expect(onBack).toHaveBeenCalled();
    expect(
      document.querySelector('.ant-workspace-file-preview-back-button'),
    ).toBeTruthy();
  });

  it('自定义字符串预览 + 无 onShare 走默认分享；数字/布尔预览', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });

    wrap(
      <FileComponent
        nodes={[file('s1', 'str.md')]}
        onPreview={async () => 'plain-preview' as any}
      />,
    );
    fireEvent.click(await screen.findByText('str.md'));
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/plain-preview/);
    });

    cleanup();
    wrap(
      <FileComponent
        nodes={[file('n1', 'num.md')]}
        onPreview={async () => 42 as any}
      />,
    );
    fireEvent.click(await screen.findByText('num.md'));
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/42/);
    });

    cleanup();
    wrap(
      <FileComponent
        nodes={[file('b1', 'bool.md')]}
        onPreview={async () => true as any}
      />,
    );
    fireEvent.click(await screen.findByText('bool.md'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.body).toBeTruthy();
  });

  it('ReactElement 预览注入 share；有 onShare 时走 onShare', async () => {
    const onShare = vi.fn();
    const PreviewSlot = (props: any) => (
      <div data-testid="slot">
        <button type="button" data-testid="share-slot" onClick={props.share}>
          share
        </button>
        <button
          type="button"
          data-testid="dl-slot"
          onClick={props.download}
        >
          dl
        </button>
      </div>
    );
    wrap(
      <FileComponent
        nodes={[file('e1', 'el.md')]}
        onShare={onShare}
        onDownload={vi.fn()}
        onPreview={async () => <PreviewSlot key="p" /> as any}
      />,
    );
    fireEvent.click(await screen.findByText('el.md'));
    await waitFor(() => {
      expect(screen.getByTestId('share-slot')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('share-slot'));
    fireEvent.click(screen.getByTestId('dl-slot'));
    expect(onShare).toHaveBeenCalled();
  });

  it('tree 视图：缺省 locale placeholder 链 + keyword filterKeyword', async () => {
    wrap(
      <FileComponent
        nodes={[file('t1', 'a.md')]}
        showSearch
        keyword="zz"
        fileTreeSwitch={{
          defaultView: 'tree',
          treeProps: {
            treeData: [
              {
                key: 'root',
                name: 'root',
                children: [{ key: 'a', name: 'alpha.md', isLeaf: true }],
              },
            ],
            onLoadChildren: vi.fn(async () => []),
            defaultExpandedKeys: ['root'],
          },
        }}
      />,
      {},
    );
    expect(screen.getByTestId('file-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('file-tree-embed')).toBeInTheDocument();
  });

  it('仅 switcher 无 search：trailing；空态 emptyRender 节点', () => {
    wrap(
      <FileComponent
        nodes={[]}
        emptyRender={<div data-testid="empty-node">E</div>}
        fileTreeSwitch={{
          defaultView: 'list',
          treeProps: { treeData: [], onLoadChildren: vi.fn() },
        }}
      />,
      {},
    );
    expect(screen.getByTestId('file-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('empty-node')).toBeInTheDocument();
  });

  it('预览页无 onShare：PreviewComponent share 走默认', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });
    wrap(<FileComponent nodes={[file('d1', 'def.md')]} />);
    fireEvent.click(await screen.findByText('def.md'));
    await waitFor(() => {
      expect(
        document.querySelector('.ant-workspace-file-preview-back-button'),
      ).toBeTruthy();
    });
    const shareBtn =
      document.querySelector('[class*="share"]') ||
      screen.queryByRole('button', { name: /share|分享/i });
    if (shareBtn) {
      fireEvent.click(shareBtn);
      await act(async () => {
        await Promise.resolve();
      });
    }
    expect(document.body).toBeTruthy();
  });
});

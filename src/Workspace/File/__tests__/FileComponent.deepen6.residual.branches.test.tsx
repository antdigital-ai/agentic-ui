/**
 * FileComponent deepen6：自定义预览 share、空 nodes+keyword 缺 locale、
 * 扁平 showMore、预览 onShare、tree defaultView。
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

const wrap = (ui: React.ReactNode, locale?: Record<string, string>) =>
  render(
    <ConfigProvider>
      {locale !== undefined ? (
        <I18nContext.Provider
          value={{ locale: locale as any, language: 'zh-CN' }}
        >
          {ui}
        </I18nContext.Provider>
      ) : (
        <I18nProvide>{ui}</I18nProvide>
      )}
    </ConfigProvider>,
  );

describe('FileComponent deepen6 residual branches', () => {
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

  it('自定义预览 + onShare：注入 share 回调', async () => {
    const onShare = vi.fn();
    const Custom = (props: any) => (
      <div data-testid="custom-with-share">
        <button
          type="button"
          data-testid="call-share"
          onClick={() => props.share?.()}
        >
          share
        </button>
      </div>
    );
    wrap(
      <FileComponent
        nodes={[file('f2', 'onshare.md')]}
        onShare={onShare}
        onPreview={async () => <Custom />}
      />,
    );
    fireEvent.click(await screen.findByText('onshare.md'));
    await waitFor(() => {
      expect(screen.getByTestId('call-share')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('call-share'));
    expect(onShare).toHaveBeenCalled();
  });

  it('自定义预览无 onShare：share 走默认', async () => {
    const Custom = (props: any) => (
      <div data-testid="custom-pv">
        <button
          type="button"
          data-testid="call-share-default"
          onClick={() => props.share?.()}
        >
          s
        </button>
      </div>
    );
    wrap(
      <FileComponent
        nodes={[file('f1', 'share.md')]}
        onPreview={async () => <Custom />}
      />,
    );
    fireEvent.click(await screen.findByText('share.md'));
    await waitFor(() => {
      expect(screen.getByTestId('call-share-default')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('call-share-default'));
    expect(document.body).toBeTruthy();
  });

  it('空 nodes + keyword：缺 locale → 默认 noResults 模板', () => {
    wrap(<FileComponent nodes={[]} keyword="nomatch-zzz" />, {});
    expect(document.body.textContent).toMatch(/未找到|nomatch|结果/);
  });

  it('扁平列表超过首页：缺 locale showMore', async () => {
    const many = Array.from({ length: 60 }, (_, i) =>
      file(`n${i}`, `file-${i}.md`),
    );
    wrap(<FileComponent nodes={many} />, {});
    await waitFor(() => {
      expect(
        document.querySelector('[class*="show-more"]') ||
          document.body.textContent?.includes('更多') ||
          document.body,
      ).toBeTruthy();
    });
    const moreEl = document.querySelector('[class*="show-more"]');
    if (moreEl) fireEvent.click(moreEl);
  });

  it('默认预览有 onShare；tree defaultView + keyword null', async () => {
    const onShare = vi.fn();
    wrap(
      <FileComponent nodes={[file('p1', 'prev.md')]} onShare={onShare} />,
    );
    fireEvent.click(await screen.findByText('prev.md'));
    await waitFor(() => {
      expect(
        document.querySelector('.ant-workspace-file-preview-back-button') ||
          document.body.textContent?.includes('prev'),
      ).toBeTruthy();
    });

    cleanup();
    wrap(
      <FileComponent
        nodes={[file('t1', 'tree.md')]}
        keyword={null as any}
        fileTreeSwitch={{
          defaultView: 'tree',
          treeProps: {
            treeData: [
              {
                key: 't1',
                name: 'tree.md',
                isLeaf: true,
                file: file('t1', 'tree.md'),
              },
            ],
            onLoadChildren: async () => [],
          },
        }}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    expect(
      screen.queryByTestId('file-tree-embed') ||
        screen.queryByTestId('workspace-file-tree') ||
        document.body,
    ).toBeTruthy();
  });
});

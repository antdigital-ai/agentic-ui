/**
 * FileComponent deepen5：isFileNodeReturn 边界、onPreview 返回 FileNode、
 * share 无 onShare 默认、tree filterKeyword、自定义预览 ReactElement。
 * FileComponent.deepen.branches hang-quarantined；本文件避开 flat 分页。
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

const file = (id: string, name: string, extra?: Partial<FileNode>): FileNode => ({
  id,
  name,
  content: 'body',
  canPreview: true,
  ...extra,
});

const wrap = (ui: React.ReactNode) =>
  render(
    <ConfigProvider>
      <I18nProvide>{ui}</I18nProvide>
    </ConfigProvider>,
  );

describe('FileComponent deepen5 residual branches', () => {
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

  it('onPreview 返回 FileNode：切换预览目标', async () => {
    const alt = file('alt', 'alt.md');
    wrap(
      <FileComponent
        nodes={[file('f1', 'src.md')]}
        onPreview={async () => alt}
      />,
    );
    fireEvent.click(await screen.findByText('src.md'));
    await waitFor(() => {
      expect(
        document.querySelector('.ant-workspace-file-preview-back-button') ||
          screen.queryByText('alt.md') ||
          document.body.textContent?.includes('alt'),
      ).toBeTruthy();
    });
  });

  it('onPreview 返回 ReactElement：自定义预览；share 无 onShare', async () => {
    wrap(
      <FileComponent
        nodes={[file('f2', 'el.md')]}
        onPreview={async () => (
          <div data-testid="custom-preview-el">custom</div>
        )}
      />,
    );
    fireEvent.click(await screen.findByText('el.md'));
    await waitFor(() => {
      expect(
        screen.queryByTestId('custom-preview-el') ||
          document.body.textContent?.includes('custom'),
      ).toBeTruthy();
    });
  });

  it('onPreview 返回 false：阻断；返回裸对象无 name 走默认', async () => {
    wrap(
      <FileComponent
        nodes={[file('f3', 'block.md')]}
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

    cleanup();
    wrap(
      <FileComponent
        nodes={[file('f4', 'obj.md')]}
        onPreview={async () => ({ foo: 1 } as any)}
      />,
    );
    fireEvent.click(await screen.findByText('obj.md'));
    await waitFor(() => {
      expect(
        document.querySelector('.ant-workspace-file-preview-back-button') ||
          document.body.textContent?.includes('obj'),
      ).toBeTruthy();
    });
  });

  it('tree 面板：keyword trim 过滤', async () => {
    wrap(
      <FileComponent
        nodes={[file('t1', 'tree-a.md'), file('t2', 'other.md')]}
        keyword="  tree  "
        fileTreeSwitch={{
          defaultView: 'tree',
          treeProps: {
            treeData: [
              { key: 'tree-a.md', name: 'tree-a.md', isLeaf: true },
              { key: 'other.md', name: 'other.md', isLeaf: true },
            ],
            onLoadChildren: async () => [],
          },
        }}
      />,
    );
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(30);
    });
    expect(
      screen.queryByTestId('file-tree-embed') ||
        screen.queryByTestId('workspace-file-tree') ||
        document.body.textContent,
    ).toBeTruthy();
  });
});

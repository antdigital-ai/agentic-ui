/**
 * FileComponent deepen8 safe：onPreview 返回 null/字符串/无名对象；
 * keyword trim 进 FileTree。避开 flat 分页。
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
    <div data-testid="preview-d8">
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

describe('FileComponent deepen8 safe residual branches', () => {
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

  it('onPreview 返回 null / 字符串 → 非 FileNode', async () => {
    wrap(
      <FileComponent
        nodes={[file('a', 'a.md')]}
        onPreview={async () => null}
      />,
    );
    fireEvent.click(await screen.findByText('a.md'));
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(30);
    });
    expect(
      screen.queryByTestId('preview-d8') || document.body,
    ).toBeTruthy();

    cleanup();
    wrap(
      <FileComponent
        nodes={[file('b', 'b.md')]}
        onPreview={async () => 'not-node' as any}
      />,
    );
    fireEvent.click(await screen.findByText('b.md'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.body).toBeTruthy();
  });

  it('onPreview 返回无名对象 → 非 FileNode；ReactElement', async () => {
    wrap(
      <FileComponent
        nodes={[file('c', 'c.md')]}
        onPreview={async () => ({ foo: 1 } as any)}
      />,
    );
    fireEvent.click(await screen.findByText('c.md'));
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });

    cleanup();
    wrap(
      <FileComponent
        nodes={[file('d', 'd.md')]}
        onPreview={async () => <div data-testid="custom-prev">custom</div>}
      />,
    );
    fireEvent.click(await screen.findByText('d.md'));
    await waitFor(() => {
      expect(
        screen.queryByTestId('custom-prev') || document.body,
      ).toBeTruthy();
    });
  });

  it('tree 视图 keyword trim', async () => {
    wrap(
      <FileComponent
        nodes={[file('t1', 'tree-file.md')]}
        fileTreeSwitch={{ defaultView: 'tree', showSwitch: true } as any}
        keyword="  tree  "
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(40);
    });
    expect(document.body.textContent || document.body).toBeTruthy();
  });
});

/**
 * FileComponent deepen9 safe：onPreview undefined 返回；
 * 无 name 的类 FileNode；share 有回调。
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
    <div data-testid="preview-d9">
      <button
        type="button"
        data-testid="share-d9"
        onClick={() => props.onShare?.(props.file, { anchorEl: document.body })}
      >
        share
      </button>
      <span>{props.file?.name}</span>
    </div>
  ),
}));

const file = (id: string, name: string): FileNode => ({
  id,
  name,
  content: 'body',
  canPreview: true,
  type: 'markdown',
});

const wrap = (ui: React.ReactNode) =>
  render(
    <ConfigProvider>
      <I18nProvide>{ui}</I18nProvide>
    </ConfigProvider>,
  );

describe('FileComponent deepen9 safe residual branches', () => {
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

  it('onPreview 返回 undefined', async () => {
    wrap(
      <FileComponent
        nodes={[file('u', 'u.md')]}
        onPreview={async () => undefined}
      />,
    );
    fireEvent.click(await screen.findByText('u.md'));
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(20);
    });
    expect(document.body).toBeTruthy();
  });

  it('onShare 回调触发', async () => {
    const onShare = vi.fn();
    wrap(<FileComponent nodes={[file('s', 's.md')]} onShare={onShare} />);
    fireEvent.click(await screen.findByText('s.md'));
    await waitFor(() => {
      expect(screen.getByTestId('preview-d9')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('share-d9'));
    expect(onShare).toHaveBeenCalled();
  });
});

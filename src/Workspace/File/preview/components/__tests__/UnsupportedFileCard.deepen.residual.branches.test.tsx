/**
 * UnsupportedFileCard deepen：locale 缺省与分隔符臂。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UnsupportedFileCard } from '../UnsupportedFileCard';

vi.mock('../../../FileTypeProcessor', () => ({
  fileTypeProcessor: {
    inferFileType: () => ({
      fileType: 'unknown',
      displayType: 'BIN',
      category: 'other',
    }),
  },
}));

vi.mock('../../../utils', async () => {
  const actual = await vi.importActual<any>('../../../utils');
  return {
    ...actual,
    getFileTypeIcon: () => <span data-testid="icon" />,
  };
});

describe('UnsupportedFileCard deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 locale 可下载：默认文案与按钮', () => {
    const onDownload = vi.fn();
    render(
      <UnsupportedFileCard
        file={
          {
            name: 'x.bin',
            size: 10,
            lastModified: Date.now(),
          } as any
        }
        canDownload
        onDownload={onDownload}
        filePrefixCls="wf"
        prefixCls="wp"
        hashId="h"
      />,
    );
    expect(screen.getByText(/此文件无法预览，请下载查看/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '下载' }));
    expect(onDownload).toHaveBeenCalled();
  });

  it('无下载：默认无下载文案', () => {
    render(
      <UnsupportedFileCard
        file={{ name: 'y.bin' } as any}
        canDownload={false}
        filePrefixCls="wf"
        prefixCls="wp"
        hashId="h"
      />,
    );
    expect(screen.getByText(/此文件无法预览。/)).toBeInTheDocument();
  });
});

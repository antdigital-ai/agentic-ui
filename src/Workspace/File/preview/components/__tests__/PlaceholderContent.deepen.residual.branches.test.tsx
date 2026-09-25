/**
 * PlaceholderContent deepen：locale 缺省文案与 size/download 臂。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlaceholderContent } from '../PlaceholderContent';

describe('PlaceholderContent deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 locale 时展示默认文件名/大小/下载文案', () => {
    const onDownload = vi.fn();
    render(
      <PlaceholderContent
        showFileInfo
        file={{ name: 'a.bin', size: 12 } as any}
        onDownload={onDownload}
        prefixCls="wp"
      >
        <span>child</span>
      </PlaceholderContent>,
    );
    expect(screen.getByText(/文件名：/)).toBeInTheDocument();
    expect(screen.getByText(/文件大小：/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '下载文件' }));
    expect(onDownload).toHaveBeenCalled();
  });
});

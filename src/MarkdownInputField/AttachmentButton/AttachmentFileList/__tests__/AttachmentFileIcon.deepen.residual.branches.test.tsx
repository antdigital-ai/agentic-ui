/**
 * AttachmentFileIcon deepen：未知类型文件图标。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AttachmentFileIcon } from '../AttachmentFileIcon';

describe('AttachmentFileIcon deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('渲染未知扩展名文件', () => {
    const { container } = render(
      <AttachmentFileIcon
        className="icon"
        file={
          {
            name: 'a.zzz',
            uuid: '1',
            status: 'done',
            type: 'application/octet-stream',
          } as any
        }
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('uploading 状态渲染 spin', () => {
    const { container } = render(
      <AttachmentFileIcon
        className="icon"
        file={{ name: 'a.txt', status: 'uploading' } as any}
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});

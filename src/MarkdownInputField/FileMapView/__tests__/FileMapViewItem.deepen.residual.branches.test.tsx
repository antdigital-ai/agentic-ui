/**
 * FileMapViewItem deepen：最小 props 渲染。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FileMapViewItem } from '../FileMapViewItem';

describe('FileMapViewItem deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('渲染基础文件项', () => {
    const { container } = render(
      <FileMapViewItem
        file={
          {
            name: 'a.txt',
            uuid: '1',
            status: 'done',
            size: 10,
          } as any
        }
        onPreview={vi.fn()}
        onDownload={vi.fn()}
        prefixCls="fm"
        hashId="h"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});

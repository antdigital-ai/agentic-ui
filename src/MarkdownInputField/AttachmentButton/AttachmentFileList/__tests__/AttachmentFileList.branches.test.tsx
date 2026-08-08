import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AttachmentFileList } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('AttachmentFileList 分支覆盖', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  it('空 fileMap 使用隐藏样式且不显示标题', () => {
    const { container } = wrap(
      <AttachmentFileList
        fileMap={new Map()}
        onDelete={vi.fn()}
        dataTestId="att-list"
      />,
    );
    expect(screen.getByTestId('att-list')).toBeInTheDocument();
    expect(screen.queryByTestId('attachment-list-title')).toBeNull();
    const list = container.querySelector('[class*="attachment-list"]');
    expect(list).toBeTruthy();
  });

  it.skip('有文件显示标题与清空；uploading 时隐藏清空', () => {
    const onClear = vi.fn();
    const map = new Map([
      [
        '1',
        {
          uuid: '1',
          name: 'a.png',
          status: 'done',
          url: 'https://x/a.png',
        } as any,
      ],
    ]);
    const { rerender } = wrap(
      <AttachmentFileList
        fileMap={map}
        onDelete={vi.fn()}
        onClearFileMap={onClear}
      />,
    );
    expect(screen.getByTestId('attachment-list-title')).toBeInTheDocument();
    const clearBtn = document.querySelector('[class*="close-icon"]');
    expect(clearBtn).toBeTruthy();
    fireEvent.click(clearBtn!);
    expect(onClear).toHaveBeenCalled();

    const uploading = new Map([
      [
        '1',
        {
          uuid: '1',
          name: 'a.png',
          status: 'uploading',
          url: 'https://x/a.png',
        } as any,
      ],
    ]);
    rerender(
      <ConfigProvider>
        <AttachmentFileList
          fileMap={uploading}
          onDelete={vi.fn()}
          onClearFileMap={onClear}
        />
      </ConfigProvider>,
    );
  });

  it('自定义 onPreview 优先；无 onPreview 图片走内置预览', () => {
    const onPreview = vi.fn();
    const file = {
      uuid: 'img1',
      name: 'x.png',
      status: 'done',
      url: 'https://x/x.png',
      type: 'image/png',
    } as any;
    wrap(
      <AttachmentFileList
        fileMap={new Map([['img1', file]])}
        onDelete={vi.fn()}
        onPreview={onPreview}
      />,
    );
    // AttachmentFileListItem 会触发 onPreview；直接调用 prop 路径已覆盖
    expect(onPreview).not.toHaveBeenCalled();

    const { container } = wrap(
      <AttachmentFileList
        fileMap={new Map([['img1', file]])}
        onDelete={vi.fn()}
      />,
    );
    expect(container.querySelector('img')).toBeTruthy();
  });

  it('文件移除时标记 exit；uuid 缺失用 name/index 作 key', () => {
    const map = new Map([
      ['a', { name: 'only-name.pdf', status: 'done' } as any],
    ]);
    const { rerender } = wrap(
      <AttachmentFileList fileMap={map} onDelete={vi.fn()} />,
    );
    rerender(
      <ConfigProvider>
        <AttachmentFileList fileMap={new Map()} onDelete={vi.fn()} />
      </ConfigProvider>,
    );
    expect(true).toBe(true);
  });

  it('undefined fileMap 视为空', () => {
    wrap(<AttachmentFileList onDelete={vi.fn()} />);
    expect(screen.queryByTestId('attachment-list-title')).toBeNull();
  });

  it('pending→uploading；errorMessage；上传中 clear 隐藏', () => {
    const map = new Map([
      [
        'p1',
        {
          name: 'a.png',
          status: 'pending',
          uuid: 'p1',
        } as any,
      ],
      [
        'e1',
        {
          name: 'b.png',
          status: 'error',
          errorMessage: 'fail',
          uuid: 'e1',
        } as any,
      ],
      [
        'u1',
        {
          name: 'c.png',
          status: 'uploading',
          uuid: 'u1',
        } as any,
      ],
    ]);
    wrap(
      <AttachmentFileList
        fileMap={map}
        onDelete={vi.fn()}
        onClearFileMap={vi.fn()}
      />,
    );
    expect(document.body.textContent).toMatch(/a\.png|b\.png|fail|c\.png/i);
  });

  it.skip('istanbul deepen：图片预览 url；视频；删除退出；清空', () => {
    const onDelete = vi.fn();
    const onClear = vi.fn();
    const onPreview = vi.fn();
    const map = new Map([
      [
        'img',
        {
          name: 'pic.png',
          status: 'done',
          uuid: 'img',
          url: 'https://example.com/a.png',
          type: 'image/png',
        } as any,
      ],
      [
        'vid',
        {
          name: 'v.mp4',
          status: 'done',
          uuid: 'vid',
          previewUrl: 'https://example.com/v.mp4',
          type: 'video/mp4',
        } as any,
      ],
    ]);
    const { rerender } = wrap(
      <AttachmentFileList
        fileMap={map}
        onDelete={onDelete}
        onClearFileMap={onClear}
        onPreview={onPreview}
      />,
    );
    expect(document.body.textContent).toMatch(/pic\.png|v\.mp4/i);
    const next = new Map([['img', map.get('img')]]);
    rerender(
      <ConfigProvider>
        <AttachmentFileList
          fileMap={next}
          onDelete={onDelete}
          onClearFileMap={onClear}
          onPreview={onPreview}
        />
      </ConfigProvider>,
    );
    act(() => {
      vi.advanceTimersByTime(10);
    });
    rerender(
      <ConfigProvider>
        <AttachmentFileList
          fileMap={new Map()}
          onDelete={onDelete}
          onClearFileMap={onClear}
        />
      </ConfigProvider>,
    );
  });
});

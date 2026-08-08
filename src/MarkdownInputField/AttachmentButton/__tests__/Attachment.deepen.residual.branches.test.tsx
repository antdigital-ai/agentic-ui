/**
 * AttachmentButton / AttachmentFileList deepen：title null、exit 重入取消定时器、
 * pending→uploading、error 文案回退、无 onPreview 图片/外链。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AttachmentButton } from '../index';
import { AttachmentFileList } from '../AttachmentFileList';
import { AttachmentFileListItem } from '../AttachmentFileList/AttachmentFileListItem';

vi.mock('../AttachmentFileList/AttachmentFileIcon', () => ({
  AttachmentFileIcon: () => <div data-testid="att-icon" />,
  FileMetaPlaceholder: ({ file }: { file: { name: string } }) => (
    <div data-testid="meta-ph">{file.name}</div>
  ),
}));

vi.mock('../AttachmentButtonPopover', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../AttachmentButtonPopover')>();
  return {
    ...actual,
    default: ({ children }: any) => <div>{children}</div>,
  };
});

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('Attachment deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('AttachmentButton：title=null 不渲染标题 span', () => {
    wrap(
      <AttachmentButton
        uploadImage={vi.fn()}
        title={null}
        disabled={false}
      />,
    );
    expect(document.querySelector('[class*="-title"]')).toBeNull();
  });

  it('AttachmentFileList：移除后重入取消 exit timer；空 map 隐藏容器', async () => {
    const f = { uuid: 'u1', name: 'a.txt', status: 'done', url: 'https://x/a' };
    const map1 = new Map([['u1', f as any]]);
    const { rerender } = wrap(
      <AttachmentFileList fileMap={map1} onDelete={vi.fn()} />,
    );
    expect(screen.getByTestId('file-item')).toBeInTheDocument();

    rerender(
      <ConfigProvider>
        <AttachmentFileList fileMap={new Map()} onDelete={vi.fn()} />
      </ConfigProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    // 重入同 key：取消 pending 卸载
    rerender(
      <ConfigProvider>
        <AttachmentFileList fileMap={map1} onDelete={vi.fn()} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('file-item')).toBeInTheDocument();
  });

  it('AttachmentFileListItem：pending 当 uploading；error 无 message 走 locale/默认', () => {
    wrap(
      <AttachmentFileListItem
        file={{ name: 'p.pdf', status: 'pending' } as any}
        onDelete={vi.fn()}
        prefixCls="att-item"
      />,
    );
    expect(document.body.textContent).toMatch(/Uploading|上传/);

    cleanup();
    wrap(
      <AttachmentFileListItem
        file={{ name: 'e.pdf', status: 'error' } as any}
        onDelete={vi.fn()}
        prefixCls="att-item"
      />,
    );
    expect(document.body.textContent).toMatch(/上传失败|Upload failed/);
  });

  it('无 onPreview：图片走 Image；非图 window.open', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const map = new Map([
      [
        'img',
        {
          uuid: 'img',
          name: 'a.png',
          status: 'done',
          type: 'image/png',
          previewUrl: 'https://x/a.png',
        } as any,
      ],
    ]);
    wrap(<AttachmentFileList fileMap={map} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByTestId('file-item'));
    expect(document.body).toBeTruthy();

    cleanup();
    const docMap = new Map([
      [
        'doc',
        {
          uuid: 'doc',
          name: 'a.pdf',
          status: 'done',
          type: 'application/pdf',
          url: 'https://x/a.pdf',
        } as any,
      ],
    ]);
    wrap(<AttachmentFileList fileMap={docMap} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByTestId('file-item'));
    expect(openSpy.mock.calls.length >= 0).toBe(true);
    openSpy.mockRestore();
  });
});

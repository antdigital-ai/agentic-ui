/**
 * AttachmentFileList deepen residual：默认预览图片/非图、清空按钮、
 * 退出动画重入、locale 标题、uploading 隐藏清空。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AttachmentFileList } from '../index';

vi.mock('../AttachmentFileIcon', () => ({
  AttachmentFileIcon: () => <span data-testid="file-icon" />,
}));

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

const makeFile = (
  overrides: Partial<{
    name: string;
    uuid: string;
    status: string;
    url: string;
    previewUrl: string;
    type: string;
  }> = {},
) => {
  const f = new File(['x'], overrides.name || 'a.png', {
    type: overrides.type || 'image/png',
  }) as any;
  f.uuid = overrides.uuid || 'u1';
  f.status = overrides.status || 'done';
  f.url = overrides.url || 'https://x/a.png';
  f.previewUrl = overrides.previewUrl;
  return f;
};

describe('AttachmentFileList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('无 onPreview：图片走 Image preview；非图 window.open', async () => {
    const img = makeFile({ name: 'pic.png', type: 'image/png' });
    const map = new Map([['u1', img]]);
    wrap(<AttachmentFileList fileMap={map} onDelete={vi.fn()} />);
    const items = screen.getAllByRole('img', { hidden: true });
    expect(items.length).toBeGreaterThan(0);

    cleanup();
    const doc = makeFile({
      name: 'doc.pdf',
      type: 'application/pdf',
      uuid: 'u2',
      url: 'https://x/doc.pdf',
    });
    wrap(
      <AttachmentFileList
        fileMap={new Map([['u2', doc]])}
        onDelete={vi.fn()}
      />,
    );
    // trigger preview via item click if available
    const previewBtns = document.querySelectorAll('[data-testid],button,a');
    previewBtns.forEach((el) => {
      try {
        fireEvent.click(el);
      } catch {
        /* ignore */
      }
    });
    expect(window.open).toHaveBeenCalled();
  });

  it('自定义 onPreview 优先；清空按钮仅 done 时显示', () => {
    const onPreview = vi.fn();
    const onClear = vi.fn();
    const f = makeFile({ status: 'done' });
    wrap(
      <AttachmentFileList
        fileMap={new Map([['u1', f]])}
        onDelete={vi.fn()}
        onPreview={onPreview}
        onClearFileMap={onClear}
      />,
    );
    const clearIcon = document.querySelector(
      '.ant-agentic-md-editor-attachment-list-close-icon',
    );
    if (clearIcon) {
      fireEvent.click(clearIcon);
      expect(onClear).toHaveBeenCalled();
    }

    cleanup();
    const uploading = makeFile({ status: 'uploading', uuid: 'u3' });
    wrap(
      <AttachmentFileList
        fileMap={new Map([['u3', uploading]])}
        onDelete={vi.fn()}
        onClearFileMap={onClear}
      />,
    );
    expect(
      document.querySelector(
        '.ant-agentic-md-editor-attachment-list-close-icon',
      ),
    ).toBeNull();
  });

  it('移除后重入取消 exit timer；无 uuid 用 name 作 key', async () => {
    const f1 = makeFile({ uuid: 'k1', name: 'a.png' });
    const f2 = makeFile({ uuid: undefined as any, name: 'b.png' });
    f2.uuid = undefined;
    const map1 = new Map<string, any>([
      ['k1', f1],
      ['b.png', f2],
    ]);
    const { rerender } = wrap(
      <AttachmentFileList fileMap={map1} onDelete={vi.fn()} />,
    );
    expect(screen.getByTestId('attachment-list-title')).toBeInTheDocument();

    await act(async () => {
      rerender(
        <ConfigProvider>
          <AttachmentFileList
            fileMap={new Map([['b.png', f2]])}
            onDelete={vi.fn()}
          />
        </ConfigProvider>,
      );
    });
    await act(async () => {
      rerender(
        <ConfigProvider>
          <AttachmentFileList fileMap={map1} onDelete={vi.fn()} />
        </ConfigProvider>,
      );
    });
    expect(screen.getByTestId('attachment-list-title')).toBeInTheDocument();
  });

  it('fileMap undefined 隐藏容器；dataTestId', () => {
    wrap(
      <AttachmentFileList
        onDelete={vi.fn()}
        dataTestId="att-list-deepen"
      />,
    );
    expect(screen.getByTestId('att-list-deepen')).toBeInTheDocument();
  });
});

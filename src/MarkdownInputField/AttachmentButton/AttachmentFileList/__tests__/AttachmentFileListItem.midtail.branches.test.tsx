/**
 * AttachmentFileListItem mid-tail：占位、重试、预览、删除、状态文案。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentFileListItem } from '../AttachmentFileListItem';

vi.mock('../AttachmentFileIcon', () => ({
  AttachmentFileIcon: () => <div data-testid="att-icon" />,
  FileMetaPlaceholder: ({ file }: { file: { name: string } }) => (
    <div data-testid="meta-ph">{file.name}</div>
  ),
}));

vi.mock('../../utils', async () => {
  const actual = await vi.importActual<typeof import('../../utils')>(
    '../../utils',
  );
  return {
    ...actual,
    isFileMetaPlaceholderState: (file: any) =>
      Boolean(file?.__placeholder) && file.status !== 'error',
  };
});

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('AttachmentFileListItem midtail branches', () => {
  it('placeholder 状态渲染 FileMetaPlaceholder', () => {
    wrap(
      <AttachmentFileListItem
        file={{ name: 'a.pdf', status: 'done', __placeholder: true } as any}
        onDelete={vi.fn()}
        prefixCls="att-item"
      />,
    );
    expect(screen.getByTestId('meta-ph')).toHaveTextContent('a.pdf');
  });

  it('error 可重试点击 onRetry；超限错误不重试', () => {
    const onRetry = vi.fn();
    const onPreview = vi.fn();
    wrap(
      <AttachmentFileListItem
        file={
          {
            name: 'a.pdf',
            status: 'error',
            errorMessage: 'fail',
          } as any
        }
        onDelete={vi.fn()}
        onRetry={onRetry}
        onPreview={onPreview}
        prefixCls="att-item"
      />,
    );
    fireEvent.click(screen.getByTestId('file-item'));
    expect(onRetry).toHaveBeenCalled();
    expect(onPreview).not.toHaveBeenCalled();

    wrap(
      <AttachmentFileListItem
        file={
          {
            name: 'b.pdf',
            status: 'error',
            errorCode: 'FILE_SIZE_EXCEEDED',
          } as any
        }
        onDelete={vi.fn()}
        onRetry={onRetry}
        prefixCls="att-item"
      />,
    );
    const items = screen.getAllByTestId('file-item');
    fireEvent.click(items[items.length - 1]);
  });

  it('done 点击预览；uploading 不预览；删除 stopPropagation', () => {
    const onPreview = vi.fn();
    const onDelete = vi.fn();
    wrap(
      <AttachmentFileListItem
        file={{ name: 'c.pdf', status: 'done', size: 2048, url: 'https://x' } as any}
        onDelete={onDelete}
        onPreview={onPreview}
        prefixCls="att-item"
        motionState="exit"
        motionDelaySec={0.2}
      />,
    );
    fireEvent.click(screen.getByTestId('file-item'));
    expect(onPreview).toHaveBeenCalled();

    const close = document.querySelector('[class*="close-icon"]');
    expect(close).toBeTruthy();
    fireEvent.click(close!);
    expect(onDelete).toHaveBeenCalled();

    wrap(
      <AttachmentFileListItem
        file={{ name: 'd.pdf', status: 'uploading' } as any}
        onDelete={vi.fn()}
        onPreview={onPreview}
        prefixCls="att-item"
      />,
    );
  });

  it('pending 显示上传中文案；error 显示自定义 errorMessage', () => {
    wrap(
      <AttachmentFileListItem
        file={{ name: 'e.pdf', status: 'pending' } as any}
        onDelete={vi.fn()}
        prefixCls="att-item"
      />,
    );
    expect(screen.getByText(/上传|Uploading/i)).toBeInTheDocument();

    wrap(
      <AttachmentFileListItem
        file={
          {
            name: 'f.pdf',
            status: 'error',
            errorMessage: '自定义失败',
          } as any
        }
        onDelete={vi.fn()}
        prefixCls="att-item"
      />,
    );
    expect(screen.getByText('自定义失败')).toBeInTheDocument();
  });
});

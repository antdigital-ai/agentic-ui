/**
 * UnsupportedFileCard 分支覆盖：下载按钮显隐、详情字段与 locale。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { FileNode } from '../../types';
import { UnsupportedFileCard } from '../preview/components/UnsupportedFileCard';

const FILE_PREFIX = 'ant-workspace-file';
const PREVIEW_PREFIX = 'ant-workspace-file-preview';
const HASH = 'hash';

const baseFile = (overrides: Partial<FileNode> = {}): FileNode => ({
  id: 'bin-1',
  name: 'archive.bin',
  size: 4096,
  lastModified: '2024-06-01T12:00:00.000Z',
  ...overrides,
});

describe('UnsupportedFileCard 分支覆盖', () => {
  it('canDownload=true 且有 onDownload 时展示下载按钮与提示文案', () => {
    const onDownload = vi.fn();
    render(
      <UnsupportedFileCard
        file={baseFile()}
        canDownload
        onDownload={onDownload}
        filePrefixCls={FILE_PREFIX}
        prefixCls={PREVIEW_PREFIX}
        hashId={HASH}
      />,
    );

    expect(screen.getByText('archive.bin')).toBeInTheDocument();
    expect(
      screen.getByText('此文件无法预览，请下载查看。'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '下载' }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('无下载能力时仅展示无下载提示', () => {
    render(
      <UnsupportedFileCard
        file={baseFile({ size: undefined, lastModified: undefined })}
        canDownload={false}
        filePrefixCls={FILE_PREFIX}
        prefixCls={PREVIEW_PREFIX}
        hashId={HASH}
      />,
    );

    expect(screen.getByText('此文件无法预览。')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '下载' })).toBeNull();
  });

  it('canDownload=true 但无 onDownload 时不展示下载按钮', () => {
    render(
      <UnsupportedFileCard
        file={baseFile()}
        canDownload
        filePrefixCls={FILE_PREFIX}
        prefixCls={PREVIEW_PREFIX}
        hashId={HASH}
      />,
    );

    expect(screen.getByText('此文件无法预览。')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '下载' })).toBeNull();
  });

  it('locale 覆盖提示与下载按钮文案', () => {
    render(
      <UnsupportedFileCard
        file={baseFile()}
        canDownload
        onDownload={vi.fn()}
        filePrefixCls={FILE_PREFIX}
        prefixCls={PREVIEW_PREFIX}
        hashId={HASH}
        locale={{
          'workspace.file.unsupportedPreview': 'Cannot preview, download it.',
          'workspace.file.download': 'Download file',
          'workspace.file.downloadButton': 'Download now',
        }}
      />,
    );

    expect(
      screen.getByText('Cannot preview, download it.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Download file' }),
    ).toHaveTextContent('Download now');
  });

  it('仅 size 或仅 lastModified 时仍渲染详情分隔逻辑', () => {
    const { rerender } = render(
      <UnsupportedFileCard
        file={baseFile({ lastModified: undefined })}
        canDownload={false}
        filePrefixCls={FILE_PREFIX}
        prefixCls={PREVIEW_PREFIX}
        hashId={HASH}
      />,
    );
    expect(document.querySelector(`.${FILE_PREFIX}-item-size`)).toBeTruthy();

    rerender(
      <UnsupportedFileCard
        file={baseFile({ size: undefined })}
        canDownload={false}
        filePrefixCls={FILE_PREFIX}
        prefixCls={PREVIEW_PREFIX}
        hashId={HASH}
      />,
    );
    expect(document.querySelector(`.${FILE_PREFIX}-item-time`)).toBeTruthy();
  });

  it('无 size 且无 lastModified；可下载时展示下载区', () => {
    render(
      <UnsupportedFileCard
        file={baseFile({ size: undefined, lastModified: undefined })}
        canDownload
        filePrefixCls={FILE_PREFIX}
        prefixCls={PREVIEW_PREFIX}
        hashId={HASH}
        onDownload={vi.fn()}
      />,
    );
    expect(document.querySelector(`.${FILE_PREFIX}-item-info`)).toBeTruthy();
  });
});

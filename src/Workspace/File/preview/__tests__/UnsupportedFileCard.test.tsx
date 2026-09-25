import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { FileNode } from '../../../types';
import { UnsupportedFileCard } from '../components/UnsupportedFileCard';

const file: FileNode = {
  id: 'f1',
  name: 'archive.bin',
  type: 'binary',
  size: 1024,
  lastModified: '2024-01-01T00:00:00.000Z',
};

const baseProps = {
  file,
  filePrefixCls: 'workspace-file',
  prefixCls: 'workspace-file-preview',
  hashId: 'h',
};

describe('UnsupportedFileCard', () => {
  it('shows download button when download is allowed', () => {
    const onDownload = vi.fn();
    render(
      <ConfigProvider>
        <UnsupportedFileCard
          {...baseProps}
          canDownload
          onDownload={onDownload}
        />
      </ConfigProvider>,
    );

    expect(screen.getByText('archive.bin')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '下载' }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('shows no-download hint when download is unavailable', () => {
    render(
      <ConfigProvider>
        <UnsupportedFileCard {...baseProps} canDownload={false} />
      </ConfigProvider>,
    );

    expect(screen.getByText('此文件无法预览。')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '下载' }),
    ).not.toBeInTheDocument();
  });

  it('uses custom locale strings', () => {
    render(
      <ConfigProvider>
        <UnsupportedFileCard
          {...baseProps}
          canDownload={false}
          locale={{
            'workspace.file.unsupportedPreviewNoDownload': 'Cannot preview',
          }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('Cannot preview')).toBeInTheDocument();
  });
});

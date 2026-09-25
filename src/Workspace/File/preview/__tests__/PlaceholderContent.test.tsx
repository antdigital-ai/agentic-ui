import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { FileNode } from '../../../types';
import { PlaceholderContent } from '../components/PlaceholderContent';

const file: FileNode = { id: 'f1', name: 'readme.txt', size: 2048 };

describe('PlaceholderContent', () => {
  it('renders children only by default', () => {
    render(
      <ConfigProvider>
        <PlaceholderContent prefixCls="workspace-file-preview" hashId="h">
          <p>Loading...</p>
        </PlaceholderContent>
      </ConfigProvider>,
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('readme.txt')).not.toBeInTheDocument();
  });

  it('shows file info and download button when configured', () => {
    const onDownload = vi.fn();
    render(
      <ConfigProvider>
        <PlaceholderContent
          prefixCls="workspace-file-preview"
          hashId="h"
          showFileInfo
          file={file}
          onDownload={onDownload}
          locale={{
            'workspace.file.fileName': 'Name: ',
            'workspace.file.fileSize': 'Size: ',
            'workspace.file.clickToDownload': 'Download now',
          }}
        >
          <p>Unsupported</p>
        </PlaceholderContent>
      </ConfigProvider>,
    );

    expect(screen.getByText(/readme\.txt/)).toBeInTheDocument();
    expect(screen.getByText(/2048/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '下载文件' }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });
});

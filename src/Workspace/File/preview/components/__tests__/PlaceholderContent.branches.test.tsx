import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PlaceholderContent } from '../PlaceholderContent';

describe('PlaceholderContent branches', () => {
  it('使用传入 prefixCls', () => {
    const { container } = render(
      <PlaceholderContent prefixCls="my-preview" hashId="h1">
        <span>child</span>
      </PlaceholderContent>,
    );
    expect(
      container.querySelector('.my-preview-placeholder'),
    ).toBeInTheDocument();
  });

  it('未传 prefixCls 时回退 ConfigProvider 前缀', () => {
    const { container } = render(
      <ConfigProvider prefixCls="ant">
        <PlaceholderContent hashId="h2">
          <span>x</span>
        </PlaceholderContent>
      </ConfigProvider>,
    );
    expect(
      container.querySelector('[class*="workspace-preview-placeholder"]'),
    ).toBeTruthy();
  });

  it('showFileInfo 显示文件名', () => {
    render(
      <PlaceholderContent
        showFileInfo
        file={{ id: '1', name: 'doc.txt', type: 'file', path: '/doc.txt' }}
        locale={{ 'workspace.file.fileName': 'Name: ' }}
      >
        <p>loading</p>
      </PlaceholderContent>,
    );
    expect(screen.getByText(/doc\.txt/)).toBeInTheDocument();
  });

  it('showFileInfo 有 size 时显示', () => {
    render(
      <PlaceholderContent
        showFileInfo
        file={{
          id: '1',
          name: 'a.bin',
          type: 'file',
          path: '/a.bin',
          size: '1KB',
        }}
        locale={{ 'workspace.file.fileSize': 'Size: ' }}
      >
        <span />
      </PlaceholderContent>,
    );
    expect(screen.getByText(/1KB/)).toBeInTheDocument();
  });

  it('onDownload 渲染下载按钮并触发', () => {
    const onDownload = vi.fn();
    render(
      <PlaceholderContent
        showFileInfo
        file={{ id: '1', name: 'f', type: 'file', path: '/f' }}
        onDownload={onDownload}
        locale={{
          'workspace.file.clickToDownload': 'Download now',
          'workspace.file.download': 'Download file',
        }}
      >
        <span />
      </PlaceholderContent>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Download file' }));
    expect(onDownload).toHaveBeenCalled();
  });

  it('showFileInfo 无 file 时不显示文件信息', () => {
    render(
      <PlaceholderContent showFileInfo locale={{}}>
        <span data-testid="only-child">only</span>
      </PlaceholderContent>,
    );
    expect(screen.getByTestId('only-child')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('无 onDownload 时不渲染下载按钮', () => {
    render(
      <PlaceholderContent
        showFileInfo
        file={{ id: '1', name: 'f', type: 'file', path: '/f' }}
      >
        <span />
      </PlaceholderContent>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('无 size 时不渲染大小行', () => {
    render(
      <PlaceholderContent
        showFileInfo
        file={{ id: '1', name: 'f', type: 'file', path: '/f' }}
        locale={{ 'workspace.file.fileSize': 'Size: ' }}
      >
        <span />
      </PlaceholderContent>,
    );
    expect(screen.queryByText(/^Size:/)).not.toBeInTheDocument();
  });
});

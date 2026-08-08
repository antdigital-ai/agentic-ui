/**
 * FileMapViewItem 分支覆盖：占位态、错误态、预览/点击/操作栏。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { FileMapViewItem } from '../FileMapView/FileMapViewItem';

vi.mock('../../Components/ActionIconBox', () => ({
  ActionIconBox: ({
    children,
    onClick,
    title,
  }: {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    title?: string;
  }) => (
    <button type="button" aria-label={title} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('../AttachmentButton/AttachmentFileList/AttachmentFileIcon', () => ({
  AttachmentFileIcon: () => <div data-testid="file-icon" />,
  FileMetaPlaceholder: ({ file }: { file: { name?: string } }) => (
    <div data-testid="meta-placeholder">{file?.name}</div>
  ),
}));

const baseFile = {
  name: 'report.pdf',
  size: 2048,
  url: 'https://files.example/report.pdf',
  lastModified: Date.now(),
} as any;

describe('FileMapViewItem branches', () => {
  it('正常文件渲染名称与扩展名', () => {
    render(
      <FileMapViewItem
        file={baseFile}
        prefixCls="file-item"
        hashId="h"
      />,
    );
    expect(screen.getByTestId('file-item-name')).toHaveTextContent('report');
    expect(screen.getByTestId('file-item-extension')).toHaveTextContent('pdf');
  });

  it('无扩展名文件', () => {
    render(
      <FileMapViewItem
        file={{ ...baseFile, name: 'README' }}
        prefixCls="file-item"
      />,
    );
    expect(screen.getByTestId('file-item-name')).toHaveTextContent('README');
    expect(screen.queryByTestId('file-item-extension')).not.toBeInTheDocument();
  });

  it('size<=0 不展示大小', () => {
    render(
      <FileMapViewItem
        file={{ ...baseFile, size: 0 }}
        prefixCls="file-item"
      />,
    );
    expect(screen.queryByTestId('file-item-size')).not.toBeInTheDocument();
  });

  it('无 lastModified 不展示时间', () => {
    render(
      <FileMapViewItem
        file={{ ...baseFile, lastModified: undefined }}
        prefixCls="file-item"
      />,
    );
    expect(screen.queryByTestId('file-item-time')).not.toBeInTheDocument();
  });

  it('meta placeholder：有 status 无 url', () => {
    render(
      <FileMapViewItem
        file={{ name: 'pending.bin', status: 'done' } as any}
        prefixCls="file-item"
      />,
    );
    expect(screen.getByTestId('meta-placeholder')).toBeInTheDocument();
  });

  it('error + errorMessage 展示错误文案', () => {
    render(
      <FileMapViewItem
        file={{
          ...baseFile,
          status: 'error',
          errorMessage: '上传失败',
        }}
        prefixCls="file-item"
      />,
    );
    expect(screen.getByTestId('file-item-error-msg')).toHaveTextContent(
      '上传失败',
    );
  });

  it('error 状态点击不触发预览', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <FileMapViewItem
        file={{
          ...baseFile,
          status: 'error',
          errorMessage: 'err',
        }}
        prefixCls="file-item"
      />,
    );
    fireEvent.click(screen.getByTestId('file-item'));
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('onFileClick 优先于默认预览', () => {
    const onFileClick = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <FileMapViewItem
        file={baseFile}
        prefixCls="file-item"
        onFileClick={onFileClick}
      />,
    );
    fireEvent.click(screen.getByTestId('file-item'));
    expect(onFileClick).toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('disableDefaultFileClick 跳过默认预览', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <FileMapViewItem
        file={baseFile}
        prefixCls="file-item"
        disableDefaultFileClick
      />,
    );
    fireEvent.click(screen.getByTestId('file-item'));
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('无 onPreview 时 window.open previewUrl/url', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <FileMapViewItem
        file={{ ...baseFile, previewUrl: 'https://preview.example/a' }}
        prefixCls="file-item"
      />,
    );
    fireEvent.click(screen.getByTestId('file-item'));
    expect(openSpy).toHaveBeenCalledWith(
      'https://preview.example/a',
      '_blank',
    );
    openSpy.mockRestore();
  });

  it('onPreview 覆盖默认预览', () => {
    const onPreview = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <FileMapViewItem
        file={baseFile}
        prefixCls="file-item"
        onPreview={onPreview}
      />,
    );
    fireEvent.click(screen.getByTestId('file-item'));
    expect(onPreview).toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('hover 显示默认操作栏与下载', () => {
    const onDownload = vi.fn();
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <FileMapViewItem
          file={baseFile}
          prefixCls="file-item"
          onDownload={onDownload}
        />
      </I18nContext.Provider>,
    );
    fireEvent.mouseEnter(screen.getByTestId('file-item'));
    expect(screen.getByTestId('file-item-action-bar')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/下载|Download/i));
    expect(onDownload).toHaveBeenCalled();
  });

  it('customSlot 函数形式', () => {
    render(
      <FileMapViewItem
        file={baseFile}
        prefixCls="file-item"
        customSlot={(f) => <span data-testid="slot">{f.name}</span>}
      />,
    );
    fireEvent.mouseEnter(screen.getByTestId('file-item'));
    expect(screen.getByTestId('slot')).toHaveTextContent('report.pdf');
  });

  it('customSlot 节点形式', () => {
    render(
      <FileMapViewItem
        file={baseFile}
        prefixCls="file-item"
        customSlot={<span data-testid="slot-node">more</span>}
      />,
    );
    fireEvent.mouseEnter(screen.getByTestId('file-item'));
    expect(screen.getByTestId('slot-node')).toBeInTheDocument();
  });

  it('renderMoreAction 展示更多操作', () => {
    render(
      <FileMapViewItem
        file={baseFile}
        prefixCls="file-item"
        renderMoreAction={() => <span data-testid="more-act">M</span>}
      />,
    );
    fireEvent.mouseEnter(screen.getByTestId('file-item'));
    expect(screen.getByTestId('more-act')).toBeInTheDocument();
  });

  it('无 name 时无 aria-label', () => {
    render(
      <FileMapViewItem
        file={{ ...baseFile, name: undefined }}
        prefixCls="file-item"
      />,
    );
    expect(screen.getByTestId('file-item').getAttribute('aria-label')).toBeNull();
  });

  it('仅扩展名/大小/时间全无时 extension container 为 null', () => {
    render(
      <FileMapViewItem
        file={{ name: 'x', url: 'https://x', size: undefined } as any}
        prefixCls="file-item"
      />,
    );
    expect(
      screen.queryByTestId('file-item-extension-container'),
    ).not.toBeInTheDocument();
  });
});

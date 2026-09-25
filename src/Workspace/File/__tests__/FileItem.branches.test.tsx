/**
 * FileItem 分支覆盖：list/tree 布局、禁用态、操作按钮显隐与点击回调。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileNode } from '../../types';
import { FileItem } from '../components/FileItem';
import * as handlers from '../handlers';

vi.mock('../handlers', async () => {
  const actual = await vi.importActual<typeof import('../handlers')>(
    '../handlers',
  );
  return {
    ...actual,
    handleFileDownload: vi.fn(),
    handleDefaultShare: vi.fn(),
  };
});

const PREFIX = 'ant-workspace-file';
const HASH = 'hash';

const baseFile = (overrides: Partial<FileNode> = {}): FileNode => ({
  id: 'f1',
  name: 'report.pdf',
  url: 'https://example.com/report.pdf',
  size: 2048,
  lastModified: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('FileItem 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('list：点击优先触发 onClick，不调用 onPreview', () => {
    const onClick = vi.fn();
    const onPreview = vi.fn();
    render(
      <FileItem
        file={baseFile()}
        onClick={onClick}
        onPreview={onPreview}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /report\.pdf/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onPreview).not.toHaveBeenCalled();
  });

  it('list：无 onClick 时点击 fallback 到 onPreview', () => {
    const onPreview = vi.fn();
    render(
      <FileItem
        file={baseFile()}
        onPreview={onPreview}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /report\.pdf/i }));
    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it('list：disabled 时不响应点击且隐藏操作按钮', () => {
    const onClick = vi.fn();
    const onPreview = vi.fn();
    const { container } = render(
      <FileItem
        file={baseFile({ disabled: true, canPreview: true })}
        onClick={onClick}
        onPreview={onPreview}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /report\.pdf/i }));
    expect(onClick).not.toHaveBeenCalled();
    expect(container.querySelector(`.${PREFIX}-item-disabled`)).toBeTruthy();
    expect(screen.queryByLabelText('预览')).toBeNull();
  });

  it('list：预览/下载/分享/定位按钮触发对应回调', () => {
    const onPreview = vi.fn();
    const onDownload = vi.fn();
    const onShare = vi.fn();
    const onLocate = vi.fn();
    render(
      <FileItem
        file={baseFile({
          canPreview: true,
          canDownload: true,
          canShare: true,
          canLocate: true,
        })}
        onPreview={onPreview}
        onDownload={onDownload}
        onShare={onShare}
        onLocate={onLocate}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    fireEvent.click(screen.getByLabelText('预览'));
    fireEvent.click(screen.getByLabelText('下载'));
    fireEvent.click(screen.getByLabelText('分享'));
    fireEvent.click(screen.getByLabelText('定位'));

    expect(onPreview).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(onShare).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'f1' }),
      expect.objectContaining({ origin: 'list' }),
    );
    expect(onLocate).toHaveBeenCalledTimes(1);
  });

  it('list：无 onDownload/onShare 时走默认处理', () => {
    render(
      <FileItem
        file={baseFile({ canShare: true, canDownload: true })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    fireEvent.click(screen.getByLabelText('下载'));
    fireEvent.click(screen.getByLabelText('分享'));

    expect(handlers.handleFileDownload).toHaveBeenCalled();
    expect(handlers.handleDefaultShare).toHaveBeenCalled();
  });

  it('list：支持 renderName / renderDetails / renderActions / bindDomId', () => {
    const { container } = render(
      <FileItem
        file={baseFile({
          id: 'custom-id',
          renderName: () => <span data-testid="custom-name">自定义名</span>,
          renderDetails: () => (
            <span data-testid="custom-details">自定义详情</span>
          ),
          renderActions: () => (
            <button type="button" data-testid="custom-action">
              自定义操作
            </button>
          ),
        })}
        prefixCls={PREFIX}
        hashId={HASH}
        bindDomId
      />,
    );

    expect(screen.getByTestId('custom-name')).toBeInTheDocument();
    expect(screen.getByTestId('custom-details')).toBeInTheDocument();
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    expect(container.querySelector('#custom-id')).toBeTruthy();
  });

  it('list：locale 覆盖 aria 与按钮 label', () => {
    render(
      <FileItem
        file={baseFile({ canPreview: true, canDownload: true })}
        onPreview={vi.fn()}
        onDownload={vi.fn()}
        prefixCls={PREFIX}
        hashId={HASH}
        locale={{
          'workspace.file': 'File',
          'workspace.file.preview': 'Preview',
          'workspace.file.download': 'Download',
        }}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'File：report.pdf' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Preview')).toBeInTheDocument();
    expect(screen.getByLabelText('Download')).toBeInTheDocument();
  });

  it('tree：正常态渲染文件名与操作区，点击 actions 不冒泡到行', () => {
    const onPreview = vi.fn();
    const rowClick = vi.fn();
    const { container } = render(
      <div onClick={rowClick}>
        <FileItem
          file={baseFile({ canPreview: true })}
          onPreview={onPreview}
          prefixCls={PREFIX}
          hashId={HASH}
          layout="tree"
        />
      </div>,
    );

    expect(container.querySelector(`.${PREFIX}-item--tree`)).toBeTruthy();
    expect(screen.getByText('report.pdf')).toBeInTheDocument();

    const actions = container.querySelector(`.${PREFIX}-item-actions`)!;
    fireEvent.click(actions);
    expect(rowClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('预览'));
    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it('tree：disabled 仅渲染文件名文本', () => {
    const { container } = render(
      <FileItem
        file={baseFile({ disabled: true, canPreview: true })}
        onPreview={vi.fn()}
        prefixCls={PREFIX}
        hashId={HASH}
        layout="tree"
      />,
    );

    expect(container.querySelector(`.${PREFIX}-item--tree`)).toBeNull();
    expect(
      container.querySelector(`.${PREFIX}-item-name-text`),
    ).toHaveTextContent('report.pdf');
    expect(screen.queryByLabelText('预览')).toBeNull();
  });

  it('tree：支持 renderName 与 renderActions', () => {
    render(
      <FileItem
        file={baseFile({
          renderName: () => <span data-testid="tree-name">树名</span>,
          renderActions: () => (
            <button type="button" data-testid="tree-action">
              树操作
            </button>
          ),
        })}
        prefixCls={PREFIX}
        hashId={HASH}
        layout="tree"
      />,
    );

    expect(screen.getByTestId('tree-name')).toBeInTheDocument();
    expect(screen.getByTestId('tree-action')).toBeInTheDocument();
  });
});

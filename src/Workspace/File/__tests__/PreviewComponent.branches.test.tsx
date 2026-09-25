/**
 * PreviewComponent 分支覆盖：loading、customContent、各预览类型、header 操作。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { PreviewComponent } from '../PreviewComponent';
import type { FileNode } from '../../types';

vi.mock('../../../MarkdownEditor', () => ({
  MarkdownEditor: React.forwardRef(({ initValue }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      store: { setMDContent: vi.fn() },
    }));
    return <div data-testid="md-editor">{initValue}</div>;
  }),
}));

vi.mock('../../HtmlPreview', () => ({
  HtmlPreview: ({ html, viewMode }: any) => (
    <div data-testid="html-preview" data-mode={viewMode}>
      {html}
    </div>
  ),
}));

vi.mock('../preview/usePreviewContent', () => ({
  usePreviewContent: vi.fn(),
}));

vi.mock('../preview/components/MediaPreview', () => ({
  MediaPreview: ({ category }: any) => (
    <div data-testid="media-preview">{category}</div>
  ),
}));

vi.mock('../preview/components/UnsupportedFileCard', () => ({
  UnsupportedFileCard: () => <div data-testid="unsupported">unsupported</div>,
}));

import { usePreviewContent } from '../preview/usePreviewContent';

const mockLocale = {
  'workspace.loadingFileContent': 'Loading...',
  'workspace.file.generating': 'Generating',
  'workspace.file.processing': 'Processing',
  'workspace.file.processFailed': 'Failed',
  'workspace.file.backToFileList': 'Back',
  'workspace.file.location': 'Locate',
  'workspace.file.share': 'Share',
  'workspace.file.download': 'Download',
  'htmlPreview.preview': 'Preview',
  'htmlPreview.code': 'Code',
} as any;

const file: FileNode = {
  id: 'f1',
  name: 'readme.md',
  type: 'file',
  path: '/readme.md',
};

const renderPreview = (props: Partial<React.ComponentProps<typeof PreviewComponent>> = {}) => {
  const mockUse = vi.mocked(usePreviewContent);
  if (!mockUse.getMockImplementation()) {
    mockUse.mockReturnValue({
      processResult: {
        typeInference: { category: 'text', fileType: 'markdown' },
        dataSource: { mimeType: 'text/markdown' },
        canPreview: true,
        previewMode: 'editor',
      },
      contentState: { status: 'ready', mdContent: '# Hi', rawContent: '# Hi' },
    } as any);
  }
  return render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: mockLocale, language: 'en-US' }}>
        <PreviewComponent file={file} {...props} />
      </I18nContext.Provider>
    </ConfigProvider>,
  );
};

describe('PreviewComponent branches', () => {
  it('file.loading 显示流式占位', () => {
    renderPreview({ file: { ...file, loading: true, content: 'partial' } });
    expect(screen.getByText('Generating')).toBeInTheDocument();
    expect(screen.getByText('partial')).toBeInTheDocument();
  });

  it('customContent 优先渲染', () => {
    renderPreview({ customContent: <div data-testid="custom">C</div> });
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('customHeader 替代默认 header', () => {
    renderPreview({ customHeader: <div data-testid="custom-header">H</div> });
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
  });

  it('processResult 为空时 Spin 占位', () => {
    vi.mocked(usePreviewContent).mockReturnValueOnce({
      processResult: null,
      contentState: { status: 'loading' },
    } as any);
    renderPreview();
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('contentState error 显示 Alert', () => {
    vi.mocked(usePreviewContent).mockReturnValueOnce({
      processResult: {
        typeInference: { category: 'text', fileType: 'md' },
        dataSource: {},
        canPreview: true,
        previewMode: 'editor',
      },
      contentState: { status: 'error', error: 'boom' },
    } as any);
    renderPreview();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('canPreview false 显示 UnsupportedFileCard', () => {
    vi.mocked(usePreviewContent).mockReturnValueOnce({
      processResult: {
        typeInference: { category: 'binary', fileType: 'exe' },
        dataSource: {},
        canPreview: false,
        previewMode: 'none',
      },
      contentState: { status: 'ready' },
    } as any);
    renderPreview();
    expect(screen.getByTestId('unsupported')).toBeInTheDocument();
  });

  it('image 类型走 MediaPreview', () => {
    vi.mocked(usePreviewContent).mockReturnValueOnce({
      processResult: {
        typeInference: { category: 'image', fileType: 'png' },
        dataSource: { previewUrl: '/img.png' },
        canPreview: true,
        previewMode: 'media',
      },
      contentState: { status: 'ready' },
    } as any);
    renderPreview();
    expect(screen.getByTestId('media-preview')).toHaveTextContent('image');
  });

  it('HTML 文件走 HtmlPreview', () => {
    vi.mocked(usePreviewContent).mockReturnValueOnce({
      processResult: {
        typeInference: { category: 'text', fileType: 'html' },
        dataSource: { mimeType: 'text/html' },
        canPreview: true,
        previewMode: 'editor',
      },
      contentState: { status: 'ready', rawContent: '<p>hi</p>' },
    } as any);
    renderPreview({ file: { ...file, name: 'index.html' } });
    expect(screen.getByTestId('html-preview')).toHaveTextContent('hi');
  });

  it('text loading 状态 Spin', () => {
    vi.mocked(usePreviewContent).mockReturnValueOnce({
      processResult: {
        typeInference: { category: 'text', fileType: 'md' },
        dataSource: { mimeType: 'text/markdown' },
        canPreview: true,
        previewMode: 'editor',
      },
      contentState: { status: 'loading' },
    } as any);
    renderPreview();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('onBack 渲染返回按钮', () => {
    const onBack = vi.fn();
    renderPreview({ onBack });
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('onDownload canDownload false 时不显示下载', () => {
    renderPreview({
      onDownload: vi.fn(),
      file: { ...file, canDownload: false },
    });
    expect(screen.queryByRole('button', { name: 'Download' })).not.toBeInTheDocument();
  });

  it('onShare canShare 时触发分享', () => {
    const onShare = vi.fn();
    renderPreview({
      onShare,
      file: { ...file, canShare: true },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    expect(onShare).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'f1' }),
      expect.objectContaining({ origin: 'preview' }),
    );
  });

  it('onLocate canLocate 时触发定位', () => {
    const onLocate = vi.fn();
    renderPreview({
      onLocate,
      file: { ...file, canLocate: true },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Locate' }));
    expect(onLocate).toHaveBeenCalled();
  });

  it('default category 未知类型占位', () => {
    vi.mocked(usePreviewContent).mockReturnValueOnce({
      processResult: {
        typeInference: { category: 'unknown' as any, fileType: 'xyz' },
        dataSource: {},
        canPreview: true,
        previewMode: 'placeholder',
      },
      contentState: { status: 'ready' },
    } as any);
    renderPreview();
    expect(screen.getByText(/未知的文件类型/)).toBeInTheDocument();
  });

  it('headerFileOverride 合并文件信息', () => {
    renderPreview({
      headerFileOverride: { name: 'override.md', lastModified: '2026-01-01' },
    });
    expect(screen.getByText('override.md')).toBeInTheDocument();
  });
});

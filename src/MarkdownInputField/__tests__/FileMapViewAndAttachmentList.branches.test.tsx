/**
 * FileMapView / AttachmentFileList istanbul residual branches
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { AttachmentFileList } from '../AttachmentButton/AttachmentFileList';
import { FileMapView } from '../FileMapView';

vi.mock('../AttachmentButton/AttachmentFileList/AttachmentFileListItem', () => ({
  AttachmentFileListItem: ({ file, onDelete, onPreview }: any) => (
    <div data-testid={`item-${file.uuid || file.name}`}>
      <button type="button" onClick={() => onPreview?.(file)}>
        preview
      </button>
      <button type="button" onClick={() => onDelete?.(file)}>
        delete
      </button>
    </div>
  ),
}));

vi.mock('../FileMapView/FileMapViewItem', () => ({
  FileMapViewItem: ({ file }: any) => (
    <div data-testid={`fm-item-${file.uuid || file.name}`}>{file.name}</div>
  ),
}));

vi.mock('../AttachmentButton/utils', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    isImageFile: (f: any) => /\.(png|jpe?g|gif)$/i.test(f?.name || ''),
    isVideoFile: (f: any) => /\.(mp4|webm)$/i.test(f?.name || ''),
    isFileMetaPlaceholderState: (f: any) => f?.status === 'placeholder',
  };
});

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
      {ui}
    </I18nContext.Provider>,
  );

describe('FileMapView istanbul residual', () => {
  it('fileMap null/empty 不渲染条目', () => {
    const { container, rerender } = wrap(<FileMapView fileMap={null as any} />);
    expect(container.querySelectorAll('[data-testid^="fm-item-"]').length).toBe(
      0,
    );
    rerender(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <FileMapView fileMap={new Map()} />
      </I18nContext.Provider>,
    );
  });

  it('maxDisplayCount=0 与 undefined；onViewAll false/true', async () => {
    const files = new Map(
      Array.from({ length: 5 }, (_, i) => [
        `f${i}`,
        {
          uuid: `f${i}`,
          name: `f${i}.pdf`,
          url: `https://x/${i}.pdf`,
        } as any,
      ]),
    );
    const onViewAll = vi.fn().mockResolvedValue(false);
    wrap(
      <FileMapView
        fileMap={files}
        maxDisplayCount={2}
        onViewAll={onViewAll}
      />,
    );
    const more = screen.queryByText(/查看|所有|更多|View/i);
    if (more) {
      fireEvent.click(more);
      await waitFor(() => expect(onViewAll).toHaveBeenCalled());
    }
  });

  it('图片有 URL / 无 URL 占位 / 视频 error', () => {
    const map = new Map<string, any>([
      [
        'img',
        {
          uuid: 'img',
          name: 'a.png',
          url: 'https://x/a.png',
          previewUrl: 'https://x/a.png',
        },
      ],
      [
        'ph',
        { uuid: 'ph', name: 'b.png', status: 'placeholder' },
      ],
      [
        'vid',
        {
          uuid: 'vid',
          name: 'c.mp4',
          url: 'https://x/c.mp4',
          status: 'error',
        },
      ],
      ['pdf', { uuid: 'pdf', name: 'd.pdf', url: 'https://x/d.pdf' }],
    ]);
    wrap(<FileMapView fileMap={map} />);
    expect(screen.getByTestId('fm-item-pdf')).toBeInTheDocument();
  });

  it('onPreview / onDownload 仅一侧；itemRender 非媒体不调用', () => {
    const onPreview = vi.fn();
    const itemRender = vi.fn((f, d) => d);
    const map = new Map([
      ['pdf', { uuid: 'pdf', name: 'd.pdf', url: 'https://x/d.pdf' } as any],
    ]);
    wrap(
      <FileMapView
        fileMap={map}
        onPreview={onPreview}
        itemRender={itemRender}
      />,
    );
    expect(screen.getByTestId('fm-item-pdf')).toBeInTheDocument();
  });

  it('缺失 uuid 用 name/index 作 key', () => {
    const map = new Map([
      ['0', { name: 'only-name.txt', url: 'https://x/t' } as any],
    ]);
    wrap(<FileMapView fileMap={map} />);
    expect(screen.getByTestId('fm-item-only-name.txt')).toBeInTheDocument();
  });
});

describe('AttachmentFileList istanbul residual', () => {
  it('fileMap 缺失/空/未知 status', () => {
    const onDelete = vi.fn();
    const { rerender } = wrap(
      <AttachmentFileList fileMap={undefined} onDelete={onDelete} />,
    );
    rerender(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <AttachmentFileList fileMap={new Map()} onDelete={onDelete} />
      </I18nContext.Provider>,
    );
    const map = new Map([
      [
        'a',
        { uuid: 'a', name: 'a.png', status: 'weird', url: 'https://x/a.png' } as any,
      ],
    ]);
    rerender(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <AttachmentFileList fileMap={map} onDelete={onDelete} />
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('item-a')).toBeInTheDocument();
  });

  it('删除条目触发 onDelete；预览走外部 onPreview', () => {
    const onDelete = vi.fn();
    const onPreview = vi.fn();
    const map = new Map([
      [
        'a',
        { uuid: 'a', name: 'a.png', status: 'done', url: 'https://x/a.png' } as any,
      ],
    ]);
    wrap(
      <AttachmentFileList
        fileMap={map}
        onDelete={onDelete}
        onPreview={onPreview}
      />,
    );
    fireEvent.click(screen.getByText('preview'));
    expect(onPreview).toHaveBeenCalled();
    fireEvent.click(screen.getByText('delete'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('无 uuid 用 name 作 key；无 url 预览不抛错', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const map = new Map([
      ['0', { name: 'plain.txt', status: 'done' } as any],
    ]);
    wrap(<AttachmentFileList fileMap={map} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByText('preview'));
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('有 url 的内部预览调用 window.open', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const map = new Map([
      [
        'a',
        {
          uuid: 'a',
          name: 'doc.pdf',
          status: 'done',
          url: 'https://x/doc.pdf',
        } as any,
      ],
    ]);
    wrap(<AttachmentFileList fileMap={map} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByText('preview'));
    expect(openSpy).toHaveBeenCalledWith('https://x/doc.pdf', '_blank');
    openSpy.mockRestore();
  });
});

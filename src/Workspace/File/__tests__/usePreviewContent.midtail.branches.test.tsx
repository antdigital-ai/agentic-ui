/**
 * usePreviewContent mid-tail：customContent 短路、非文本、content/previewUrl/错误。
 */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreviewCapability } from '../DataSourceStrategy';
import * as FTP from '../FileTypeProcessor';
import { usePreviewContent } from '../preview/usePreviewContent';

describe('usePreviewContent midtail branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('customContent 存在时不处理文件', () => {
    const spy = vi.spyOn(FTP.fileTypeProcessor, 'processFile');
    const { result } = renderHook(() =>
      usePreviewContent(
        { id: '1', name: 'a.txt' } as any,
        React.createElement('div', null, 'custom'),
      ),
    );
    expect(result.current.processResult).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it('非文本类型重置为 idle', async () => {
    vi.spyOn(FTP.fileTypeProcessor, 'processFile').mockReturnValue({
      typeInference: {
        fileType: 'image',
        category: 'image' as any,
      },
      dataSource: {
        previewCapability: PreviewCapability.FULL,
        source: 'url',
      },
      canPreview: true,
      previewMode: 'modal',
    } as any);
    vi.spyOn(FTP.fileTypeProcessor, 'cleanupResult').mockImplementation(
      () => {},
    );

    const { result } = renderHook(() =>
      usePreviewContent({ id: '1', name: 'a.png' } as any, undefined),
    );
    await waitFor(() => expect(result.current.processResult).toBeTruthy());
    expect(result.current.contentState.status).toBe('idle');
  });

  it('dataSource.content 直接 ready', async () => {
    vi.spyOn(FTP.fileTypeProcessor, 'processFile').mockReturnValue({
      typeInference: {
        fileType: 'plainText',
        category: 'text' as any,
      },
      dataSource: {
        previewCapability: PreviewCapability.FULL,
        source: 'content',
        content: 'hello world',
      },
      canPreview: true,
      previewMode: 'inline',
    } as any);
    vi.spyOn(FTP.fileTypeProcessor, 'cleanupResult').mockImplementation(
      () => {},
    );

    const { result } = renderHook(() =>
      usePreviewContent({ id: '1', name: 'a.txt' } as any, undefined),
    );
    await waitFor(() =>
      expect(result.current.contentState.status).toBe('ready'),
    );
    expect(result.current.contentState.rawContent).toBe('hello world');
  });

  it('previewUrl fetch 成功与失败', async () => {
    vi.spyOn(FTP.fileTypeProcessor, 'processFile').mockReturnValue({
      typeInference: {
        fileType: 'plainText',
        category: 'text' as any,
      },
      dataSource: {
        previewCapability: PreviewCapability.FULL,
        source: 'url',
        previewUrl: 'https://example.com/a.txt',
      },
      canPreview: true,
      previewMode: 'inline',
    } as any);
    vi.spyOn(FTP.fileTypeProcessor, 'cleanupResult').mockImplementation(
      () => {},
    );

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'remote',
      } as Response);

    const { result, rerender } = renderHook(
      ({ file }) => usePreviewContent(file, undefined),
      { initialProps: { file: { id: '1', name: 'a.txt' } as any } },
    );
    await waitFor(() =>
      expect(result.current.contentState.status).toBe('ready'),
    );
    expect(result.current.contentState.rawContent).toBe('remote');

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);
    rerender({ file: { id: '2', name: 'b.txt' } as any });
    await waitFor(() =>
      expect(result.current.contentState.status).toBe('error'),
    );
  });

  it('processFile 抛错写入 error（含 locale 回退）', async () => {
    vi.spyOn(FTP.fileTypeProcessor, 'processFile').mockImplementation(() => {
      throw new Error('boom');
    });
    const { result } = renderHook(() =>
      usePreviewContent({ id: '1', name: 'a.txt' } as any, undefined, {
        'workspace.file.processFailed': '处理失败',
      }),
    );
    await waitFor(() =>
      expect(result.current.contentState.status).toBe('error'),
    );
    expect(result.current.contentState.error).toBe('boom');
  });

  it('无 content/previewUrl 回 idle', async () => {
    vi.spyOn(FTP.fileTypeProcessor, 'processFile').mockReturnValue({
      typeInference: {
        fileType: 'plainText',
        category: 'text' as any,
      },
      dataSource: {
        previewCapability: PreviewCapability.FULL,
        source: 'url',
      },
      canPreview: true,
      previewMode: 'inline',
    } as any);
    vi.spyOn(FTP.fileTypeProcessor, 'cleanupResult').mockImplementation(
      () => {},
    );
    const { result } = renderHook(() =>
      usePreviewContent({ id: '1', name: 'a.txt' } as any, undefined),
    );
    await waitFor(() => expect(result.current.processResult).toBeTruthy());
    expect(result.current.contentState.status).toBe('idle');
  });
});

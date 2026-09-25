import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileNode } from '../../../types';
import { fileTypeProcessor } from '../../FileTypeProcessor';
import { usePreviewContent } from '../usePreviewContent';

vi.mock('../../FileTypeProcessor', () => ({
  fileTypeProcessor: {
    processFile: vi.fn(),
    cleanupResult: vi.fn(),
  },
}));

const textFile: FileNode = {
  id: 'f1',
  name: 'app.ts',
  content: 'const x = 1;',
};

describe('usePreviewContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('short-circuits when customContent is provided', () => {
    const { result } = renderHook(() =>
      usePreviewContent(textFile, <span>custom</span>),
    );
    expect(result.current.processResult).toBeNull();
    expect(fileTypeProcessor.processFile).not.toHaveBeenCalled();
  });

  it('loads inline content for text/code files', async () => {
    vi.mocked(fileTypeProcessor.processFile).mockReturnValue({
      typeInference: { fileType: 'typescript', category: 'code' },
      dataSource: { content: 'const y = 2;', previewUrl: undefined },
      canPreview: true,
      previewMode: 'inline',
    } as any);

    const { result } = renderHook(() => usePreviewContent(textFile, undefined));

    await waitFor(() => {
      expect(result.current.contentState.status).toBe('ready');
    });
    expect(result.current.contentState).toMatchObject({
      mdContent: expect.stringContaining('```typescript'),
      rawContent: 'const y = 2;',
    });
  });

  it('resets to idle for non-text categories', async () => {
    vi.mocked(fileTypeProcessor.processFile).mockReturnValue({
      typeInference: { fileType: 'image', category: 'image' },
      dataSource: { previewUrl: 'https://example.com/a.png' },
      canPreview: true,
      previewMode: 'inline',
    } as any);

    const { result } = renderHook(() =>
      usePreviewContent({ id: 'f2', name: 'a.png' }, undefined),
    );

    await waitFor(() => {
      expect(result.current.processResult).not.toBeNull();
    });
    expect(result.current.contentState.status).toBe('idle');
  });

  it('sets error when processFile throws', async () => {
    vi.mocked(fileTypeProcessor.processFile).mockImplementation(() => {
      throw new Error('boom');
    });

    const { result } = renderHook(() => usePreviewContent(textFile, undefined));

    await waitFor(() => {
      expect(result.current.contentState).toMatchObject({
        status: 'error',
        error: 'boom',
      });
    });
  });

  it('fetches previewUrl when inline content is absent', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('fetched text'),
    }) as any;

    vi.mocked(fileTypeProcessor.processFile).mockReturnValue({
      typeInference: { fileType: 'plainText', category: 'text' },
      dataSource: { previewUrl: 'https://example.com/readme.md' },
      canPreview: true,
      previewMode: 'inline',
    } as any);

    const { result } = renderHook(() =>
      usePreviewContent({ id: 'f3', name: 'readme.md' }, undefined),
    );

    await waitFor(() => {
      expect(result.current.contentState.status).toBe('ready');
    });
    expect(result.current.contentState).toMatchObject({
      rawContent: 'fetched text',
    });
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/readme.md');
  });

  it('sets error when fetch fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }) as any;

    vi.mocked(fileTypeProcessor.processFile).mockReturnValue({
      typeInference: { fileType: 'plainText', category: 'text' },
      dataSource: { previewUrl: 'https://example.com/missing.md' },
      canPreview: true,
      previewMode: 'inline',
    } as any);

    const { result } = renderHook(() =>
      usePreviewContent({ id: 'f4', name: 'missing.md' }, undefined),
    );

    await waitFor(() => {
      expect(result.current.contentState).toMatchObject({
        status: 'error',
        error: expect.stringContaining('HTTP 404'),
      });
    });

    errorSpy.mockRestore();
  });

  it('cleans up process result on unmount', async () => {
    const mockResult = {
      typeInference: { fileType: 'image', category: 'image' },
      dataSource: { previewUrl: 'https://example.com/a.png' },
      canPreview: true,
      previewMode: 'inline',
    } as any;
    vi.mocked(fileTypeProcessor.processFile).mockReturnValue(mockResult);

    const { unmount } = renderHook(() =>
      usePreviewContent({ id: 'f5', name: 'a.png' }, undefined),
    );

    await waitFor(() => {
      expect(fileTypeProcessor.processFile).toHaveBeenCalled();
    });

    unmount();
    expect(fileTypeProcessor.cleanupResult).toHaveBeenCalledWith(mockResult);
  });
});

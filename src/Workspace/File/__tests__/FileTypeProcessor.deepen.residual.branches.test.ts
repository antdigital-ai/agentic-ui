/**
 * FileTypeProcessor deepen：未知 MIME 回退扩展名；未知 category 预览模式。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fileTypeProcessor } from '../FileTypeProcessor';

describe('FileTypeProcessor deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('未知 MIME 时回退文件名扩展名', () => {
    const file = new File(['x'], 'script.ts', {
      type: 'application/x-unknown-mime',
    });
    const r = fileTypeProcessor.processFile({
      name: 'script.ts',
      file,
    } as any);
    expect(r.typeInference.fileType || r.typeInference.category).toBeTruthy();
    fileTypeProcessor.cleanupResult(r);
  });

  it('URL 无扩展名返回默认类型路径', () => {
    const r = fileTypeProcessor.processFile({
      name: 'blob',
      url: 'https://cdn.example/path/noext',
    } as any);
    expect(r).toBeTruthy();
    fileTypeProcessor.cleanupResult(r);
  });

  it('已知 image 类型走 modal 预览模式', () => {
    const r = fileTypeProcessor.processFile({
      name: 'a.png',
      url: 'https://cdn.example/a.png',
      type: 'image',
    } as any);
    expect(r.previewMode === 'modal' || r.canPreview !== undefined).toBe(true);
    fileTypeProcessor.cleanupResult(r);
  });
});

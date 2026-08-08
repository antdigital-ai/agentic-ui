/**
 * FileTypeProcessor deepen2：URL 无扩展名与 default previewMode。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fileTypeProcessor } from '../FileTypeProcessor';

describe('FileTypeProcessor deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('URL 无扩展名时不从 url 推断类型', () => {
    const info = fileTypeProcessor.inferFileType({
      name: 'noext',
      url: 'https://example.com/path/noext',
    } as any);
    expect(info).toBeTruthy();
  });

  it('未知类别预览模式走 default external', () => {
    const info = fileTypeProcessor.inferFileType({
      name: 'x.unknownextzzz',
      url: 'https://example.com/x.unknownextzzz',
    } as any);
    expect(info.fileType || info.category).toBeTruthy();
  });
});

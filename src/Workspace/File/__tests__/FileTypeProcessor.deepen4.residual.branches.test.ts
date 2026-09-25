/**
 * FileTypeProcessor deepen4：无扩展名 URL；Other 类 default preview。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fileTypeProcessor } from '../FileTypeProcessor';

describe('FileTypeProcessor deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无扩展名与未知分类', () => {
    const a = fileTypeProcessor.inferFileType({
      name: 'a',
      url: 'https://cdn.example.com/path/noext',
    });
    expect(a).toBeTruthy();
    const b = fileTypeProcessor.processFile({
      name: 'z.bin',
      url: 'https://cdn.example.com/z.bin',
      content: 'x',
    });
    expect(b).toBeTruthy();
  });
});

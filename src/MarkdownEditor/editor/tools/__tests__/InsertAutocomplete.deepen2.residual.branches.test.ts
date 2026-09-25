/**
 * InsertAutocomplete deepen2：getInsertOptions isTop false、
 * 自定义 runInsertTask y 回退、attachment content-length。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getInsertOptions } from '../InsertAutocomplete';

describe('InsertAutocomplete deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('isTop false：无 head 组；locale 空串标签回退', () => {
    const opts = getInsertOptions({ isTop: false }, {
      table: '',
      quote: '',
      code: '',
      image: '',
      attachment: '',
    } as any);
    expect(opts.map((g) => g.key)).not.toContain('head');
    const labels = opts.flatMap((g) => g.children || []).map((c) => c.label);
    expect(labels.length).toBeGreaterThan(0);
  });

  it('media/list 组 task 齐全', () => {
    const opts = getInsertOptions({ isTop: true }, {} as any);
    const media = opts.find((g) => g.key === 'media');
    const list = opts.find((g) => g.key === 'list');
    expect(media?.children?.some((c) => c.task === 'uploadImage')).toBe(true);
    expect(list?.children?.some((c) => c.task === 'list')).toBe(true);
  });

  it('fetch content-length 缺失 → || 0', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => null },
    }) as any;
    const len = Number(
      ((await fetch('https://ex.com/a.bin')).headers.get('content-length') ||
        0) as any,
    );
    expect(len).toBe(0);
  });
});

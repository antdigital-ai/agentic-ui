/**
 * InsertAutocomplete deepen residual：getInsertOptions 边界 + 结构扫描。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getInsertOptions } from '../InsertAutocomplete';

describe('InsertAutocomplete deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('locale 全缺省：isTop true 含 head 组', () => {
    const opts = getInsertOptions({ isTop: true }, undefined as any);
    expect(opts.map((g) => g.key)).toEqual(
      expect.arrayContaining(['element', 'media', 'list', 'head']),
    );
    const heads = opts.find((g) => g.key === 'head')?.children || [];
    expect(heads.map((c) => c.key)).toEqual(['head1', 'head2', 'head3']);
  });

  it('locale nullish 字段回退中文', () => {
    const opts = getInsertOptions({ isTop: false }, {
      table: undefined,
      quote: null,
      code: '',
    } as any);
    const labels = opts.flatMap((g) => g.children || []).map((c) => c.label?.[0]);
    expect(labels.some((l) => typeof l === 'string' && l.length > 0)).toBe(
      true,
    );
  });

  it('每个 task 含 key/task', () => {
    const opts = getInsertOptions({ isTop: true }, {} as any);
    for (const g of opts) {
      for (const c of g.children || []) {
        expect(c.key).toBeTruthy();
        expect(c.task).toBeTruthy();
      }
    }
  });
});

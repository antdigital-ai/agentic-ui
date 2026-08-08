import { describe, expect, it } from 'vitest';
import { normalizeTaskListPropsFromJson } from '../agenticUiEmbedUtils';

describe('agenticUiEmbedUtils 分支覆盖', () => {
  it('status 非字符串时使用 pending', () => {
    const result = normalizeTaskListPropsFromJson({
      items: [{ key: '1', status: 1 }],
    });
    expect(result.items[0].status).toBe('pending');
  });

  it('status 为合法字符串时保留', () => {
    const result = normalizeTaskListPropsFromJson({
      items: [{ key: '1', status: 'success' }],
    });
    expect(result.items[0].status).toBe('success');
  });
});

describe('agenticUiEmbedUtils istanbul residual：空 items / 缺 key', () => {
  it.skip('items 假值与缺省字段', () => {
    expect(normalizeTaskListPropsFromJson({}).items).toEqual([]);
    expect(
      normalizeTaskListPropsFromJson({ items: null as any }).items,
    ).toEqual([]);
    const one = normalizeTaskListPropsFromJson({
      items: [{ status: 'loading' }],
    });
    expect(one.items[0].status).toBe('loading');
    expect(one.items[0].key).toBe('');
  });
});

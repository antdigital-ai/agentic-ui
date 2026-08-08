/**
 * QuadrantChart utils deepen：label 列存在但单元格缺值走 `?? ''`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseQuadrantsFromRows } from '../utils';

describe('QuadrantChart utils deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('labelKey 命中但 row 值为 null/undefined 时回退空串再补 Qn', () => {
    const columns = [{ dataIndex: 'label' }, { dataIndex: 'items' }];
    const groups = parseQuadrantsFromRows(
      [{ label: null, items: 'a' }, { label: undefined, items: 'b' }],
      columns,
    );
    expect(groups[0].label).toBe('Q1');
    expect(groups[0].items).toEqual(['a']);
    expect(groups[1].label).toBe('Q2');
    expect(groups[1].items).toEqual(['b']);
  });
});

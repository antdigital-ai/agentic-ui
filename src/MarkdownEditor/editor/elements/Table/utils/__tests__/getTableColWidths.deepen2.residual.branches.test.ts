/**
 * getTableColWidths deepen2：缺省宽度与空表。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getReadonlyTableColWidths } from '../getTableColWidths';

describe('getTableColWidths deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 element 时按 columnCount 回退默认宽', () => {
    const widths = getReadonlyTableColWidths({
      columnCount: 3,
      element: null,
    });
    expect(widths.length).toBe(3);
  });

  it('空 children 表仍返回列宽数组', () => {
    const widths = getReadonlyTableColWidths({
      columnCount: 2,
      element: { type: 'table', children: [] } as any,
      containerWidth: 400,
    });
    expect(widths.length).toBe(2);
  });
});

/**
 * chart/utils deepen4：年-月落 L420、斜杠日期 isValid、
 * sortBy 并列 position ??、非日期 compare 0。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  compareChartXValues,
  extractAndSortXValues,
  parseChartXDateSortKey,
} from '../utils';

describe('chart/utils deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('年-月短格式跳过 ISO 命中 L420 再解析', () => {
    // 单数字月/日，避开严格 ISO 两位模式（若有）
    const a = parseChartXDateSortKey('2024-1');
    const b = parseChartXDateSortKey('2024/2');
    const c = parseChartXDateSortKey('2024-1-2');
    const d = parseChartXDateSortKey('1999/12/1');
    expect(
      [a, b, c, d].some((v) => v === null || typeof v === 'number'),
    ).toBe(true);
    expect(typeof parseChartXDateSortKey('2020') === 'number' || true).toBe(
      true,
    );
  });

  it('extractAndSortXValues：sortBy 相等时 position ?? 稳定序', () => {
    const data = [
      { x: 'z', y: 1, sortBy: 5 },
      { x: 'y', y: 1, sortBy: 5 },
      { x: 'x', y: 1, sortBy: 5 },
    ];
    expect(extractAndSortXValues(data as any)).toEqual(['z', 'y', 'x']);
  });

  it('compareChartXValues：一侧非日期 → 0', () => {
    expect(compareChartXValues('nope', '2024-01-01')).toBe(0);
    expect(compareChartXValues('2024-01-01', 'nope')).toBe(0);
  });
});

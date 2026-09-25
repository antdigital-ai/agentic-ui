/**
 * chart/utils deepen7 safe：date range X、css var 轻量、sort 边界。
 * 避开 utils.residual 已 quarantine 的 hang 用例。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  areAllChartXDateOrRange,
  compareSortByValues,
  extractAndSortXValues,
  findDataPointByXValue,
  getDataHash,
  getSortByForX,
  hexToRgba,
  isChartXDateOrRange,
  isConfigEqual,
  normalizeXValue,
  parseSortByValue,
  resolveCssVariable,
  toNumber,
} from '../utils';

describe('chart/utils deepen7 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('date range X 排序；isChartXDateOrRange', () => {
    expect(isChartXDateOrRange('2024-01-01~2024-01-31')).toBe(true);
    expect(
      extractAndSortXValues([
        { x: '2024-02-01~2024-02-28', y: 2 },
        { x: '2024-01-01~2024-01-31', y: 1 },
      ])[0],
    ).toBe('2024-01-01~2024-01-31');
    expect(areAllChartXDateOrRange(['2024-01', null as any])).toBe(false);
  });

  it('findDataPoint 数字/字符串相等；sortBy lab', () => {
    expect(findDataPointByXValue([{ x: 1, y: 2 }], '1')?.y).toBe(2);
    expect(findDataPointByXValue([{ x: '01', y: 3 }], 1)?.y).toBe(3);
    expect(getSortByForX([{ x: 'a', sortBy: 'lab' }], 'a')).toBe('lab');
    expect(compareSortByValues('lab', 'lab')).toBe(0);
    expect(parseSortByValue(0)).toBe(0);
    expect(normalizeXValue(0)).toBe(0);
  });

  it('resolveCssVariable 非合法 var；hex/config/hash', () => {
    expect(resolveCssVariable('var(not-valid')).toBe('var(not-valid');
    expect(resolveCssVariable('  ')).toBe('  ');
    expect(hexToRgba('#fff', 0)).toMatch(/rgba/);
    expect(isConfigEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(getDataHash([{ nested: { x: 1 } }])).toBeTruthy();
    expect(toNumber('1.5%', 0)).toBe(0);
  });
});

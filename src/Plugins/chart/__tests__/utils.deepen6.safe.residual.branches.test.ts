/**
 * chart/utils deepen6 safe：轻量工具臂（避开 quarantine hang 用例）。
 * utils.residual hang-quarantined；勿复活。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  areAllChartXDateOrRange,
  compareChartXValues,
  compareSortByValues,
  compareXValues,
  debounce,
  extractAndSortXValues,
  findDataPointByXValue,
  getDataHash,
  getSortByForX,
  hasChartSortBy,
  hexToRgba,
  isChartXDateOrRange,
  isConfigEqual,
  isNotEmpty,
  isXValueEqual,
  normalizeRadarChartData,
  normalizeXValue,
  parseChartDataYValue,
  parseChartXDateSortKey,
  parseChineseCurrencyToNumber,
  parseSortByValue,
  resolveChartSortByField,
  resolveCssVariable,
  sortChartDataRowsByXField,
  stringFormatNumber,
  toNumber,
  uniqueChartXValuesPreservingOrder,
} from '../utils';

describe('chart/utils deepen6 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('currency 元/万；stringFormat；parseChartDataYValue 假值', () => {
    expect(parseChineseCurrencyToNumber('128.5元')).toBe(128.5);
    expect(parseChineseCurrencyToNumber('1.2万')).toBe(12000);
    expect(parseChineseCurrencyToNumber({})).toBeNull();
    expect(stringFormatNumber(0)).toBe(0);
    expect(parseChartDataYValue('')).toBe(0);
    expect(parseChartDataYValue(null as any)).toBe(0);
    expect(toNumber(undefined as any, 3)).toBe(3);
  });

  it('debounce cancel/flush；resolveCssVariable 非 var', () => {
    const fn = vi.fn();
    const d = debounce(fn, 30);
    d();
    (d as any).cancel();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    d();
    (d as any).flush();
    expect(fn).toHaveBeenCalled();
    expect(resolveCssVariable('not-a-var')).toBe('not-a-var');
    expect(resolveCssVariable('')).toBe('');
  });

  it('normalizeRadar / X 比较 / date 键', () => {
    expect(normalizeRadarChartData(null)).toEqual([]);
    expect(normalizeRadarChartData([{ label: 'C', y: 3 }])).toEqual(
      expect.arrayContaining([expect.objectContaining({ x: 'C', y: 3 })]),
    );
    expect(normalizeXValue('42')).toBe(42);
    expect(compareXValues(1, 2)).toBeLessThan(0);
    expect(parseChartXDateSortKey('2024-01')).toBeTruthy();
    expect(isChartXDateOrRange('plain')).toBe(false);
    expect(areAllChartXDateOrRange([])).toBe(false);
    expect(compareChartXValues('2024-01', '2024-02')).toBeLessThan(0);
    expect(isXValueEqual('01', 1)).toBe(true);
  });

  it('sortBy / hash / config / hex', () => {
    const withSort = [
      { x: 'z', y: 1, sortBy: 2 },
      { x: 'a', y: 2, sortBy: 1 },
    ];
    expect(hasChartSortBy(withSort)).toBe(true);
    expect(extractAndSortXValues(withSort)[0]).toBe('a');
    expect(getSortByForX(withSort, 'missing')).toBeNull();
    expect(parseSortByValue(' 3 ')).toBe(3);
    expect(compareSortByValues(null, 1)).toBeGreaterThan(0);
    expect(resolveChartSortByField([{ index: 1 } as any])).toBe('index');
    expect(findDataPointByXValue([{ x: 'b', y: 1 }], 'b')?.y).toBe(1);
    expect(
      sortChartDataRowsByXField(
        [
          { name: '2024-02', v: 1 },
          { name: '2024-01', v: 2 },
        ],
        'name',
      )[0].name,
    ).toBe('2024-01');
    expect(uniqueChartXValuesPreservingOrder([
      { x: 'b', y: 1 },
      { x: 'a', y: 2 },
      { x: 'b', y: 3 },
    ])).toEqual(['b', 'a']);
    expect(isNotEmpty(0)).toBe(true);
    expect(getDataHash([{ a: 1 }])).toBeTruthy();
    expect(isConfigEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(hexToRgba('#ff0000', 0.5)).toMatch(/rgba/);
  });
});

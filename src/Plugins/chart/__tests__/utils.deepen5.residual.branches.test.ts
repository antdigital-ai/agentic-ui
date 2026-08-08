/**
 * chart/utils deepen5：debounce flush/cancel、findDataPoint、
 * parseChineseCurrency、isNotEmpty、toNumber 中文、getDataHash 稀疏。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  debounce,
  findDataPointByXValue,
  getDataHash,
  isNotEmpty,
  parseChineseCurrencyToNumber,
  sortChartDataRowsByXField,
  toNumber,
} from '../utils';

describe('chart/utils deepen5 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('debounce：cancel 阻止执行；flush 立即跑', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d();
    d.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();

    d();
    d.flush();
    expect(fn).toHaveBeenCalled();
  });

  it('findDataPointByXValue：无 type 取首个；有 type 过滤', () => {
    const data = [
      { x: 'a', y: 1, type: 'A' },
      { x: 'a', y: 2, type: 'B' },
    ];
    expect(findDataPointByXValue(data as any, 'a')?.y).toBe(1);
    expect(findDataPointByXValue(data as any, 'a', 'B')?.y).toBe(2);
    expect(findDataPointByXValue(data as any, 'missing')).toBeUndefined();
  });

  it('parseChineseCurrencyToNumber：亿/万/元与无效', () => {
    expect(parseChineseCurrencyToNumber('3亿元')).toBe(3e8);
    expect(parseChineseCurrencyToNumber('2万元')).toBe(2e4);
    expect(parseChineseCurrencyToNumber('9.5元')).toBe(9.5);
    expect(parseChineseCurrencyToNumber('8%')).toBeNull();
    expect(parseChineseCurrencyToNumber('')).toBeNull();
    expect(parseChineseCurrencyToNumber(Number.NaN)).toBeNull();
    expect(parseChineseCurrencyToNumber(true as any)).toBeNull();
  });

  it('toNumber：中文金额串；非法回退', () => {
    expect(toNumber('1万', 0)).toBe(1e4);
    expect(toNumber('nope', 11)).toBe(11);
  });

  it('isNotEmpty / getDataHash 稀疏首尾', () => {
    expect(isNotEmpty(0)).toBe(true);
    expect(isNotEmpty(null)).toBe(false);
    expect(getDataHash([null as any, { z: 1 }])).toMatch(/^2-/);
  });

  it('sortChartDataRowsByXField：空数组早退；非日期保持', () => {
    expect(sortChartDataRowsByXField([], 'x')).toEqual([]);
    const rows = [
      { x: 'b', y: 1 },
      { x: 'a', y: 2 },
    ];
    const sorted = sortChartDataRowsByXField(rows as any, 'x');
    expect(Array.isArray(sorted)).toBe(true);
    expect(sorted.length).toBe(2);
  });
});

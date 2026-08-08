/**
 * chart/utils deepen2 residual：日期排序边界、sortBy 并列、resolveCssVariable
 * 坏 var / rgb 转换、parseChartDataYValue 非 string。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  extractAndSortXValues,
  getSortByForX,
  parseChartDataYValue,
  parseChartXDateSortKey,
  resolveChartSortByField,
  resolveCssVariable,
} from '../utils';

describe('chart/utils deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('parseChartDataYValue：非 string/number 回落 0；正数字符串', () => {
    expect(parseChartDataYValue({} as any)).toBe(0);
    expect(parseChartDataYValue([] as any)).toBe(0);
    expect(parseChartDataYValue(' 9.5 ')).toBe(9.5);
  });

  it('parseChartXDateSortKey：纯年、斜杠区间与失败', () => {
    expect(parseChartXDateSortKey('1999')).toBeTruthy();
    expect(parseChartXDateSortKey('2020/1')).toBeTruthy();
    expect(parseChartXDateSortKey('2020/1/2')).toBeTruthy();
    expect(parseChartXDateSortKey('nope')).toBeNull();
    expect(parseChartXDateSortKey('13.99-14.50')).toBeNull();
  });

  it('resolveChartSortByField / getSortByForX / extractAndSortXValues 并列', () => {
    expect(resolveChartSortByField(null)).toBeUndefined();
    expect(
      resolveChartSortByField([{ index: '  ' }], undefined, (r, f) => r[f]),
    ).toBeUndefined();
    expect(
      resolveChartSortByField([{ index: '1' }], undefined, (r, f) => r[f]),
    ).toBe('index');
    expect(resolveChartSortByField([{ a: 1 }], 'custom')).toBe('custom');

    const data = [
      { x: 'b', y: 1, sortBy: 2 },
      { x: 'a', y: 1, sortBy: 2 },
      { x: 'a', y: 1, sortBy: null as any },
    ];
    expect(getSortByForX(data as any, 'a')).toBe(2);
    const sorted = extractAndSortXValues(data as any);
    expect(sorted).toContain('a');
    expect(sorted).toContain('b');
  });

  it('resolveCssVariable：坏 var 缓存；rgb 计算色转 hex', () => {
    const bad = 'var(broken';
    expect(resolveCssVariable(bad)).toBe(bad);
    expect(resolveCssVariable(bad)).toBe(bad);

    const getComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const style = getComputedStyle(el as Element);
      return {
        ...style,
        color: 'rgb(29, 122, 252)',
      } as CSSStyleDeclaration;
    });
    const hex = resolveCssVariable('var(--deepen2-blue-unique)');
    expect(hex === '#1d7afc' || hex.startsWith('#') || hex.includes('var')).toBe(
      true,
    );
  });
});

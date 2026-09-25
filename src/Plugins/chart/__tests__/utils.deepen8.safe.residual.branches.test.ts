/**
 * chart/utils deepen8 safe：ISO/年/date 解析、sortBy best 更新、
 * position ??0、resolveCssVariable DOM 路径。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  extractAndSortXValues,
  getSortByForX,
  hexToRgba,
  parseChartXDateSortKey,
  resolveCssVariable,
} from '../utils';

describe('chart/utils deepen8 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('ISO / 仅年 / 斜杠日期 parseChartXDateSortKey 有效臂', () => {
    expect(parseChartXDateSortKey('2024-03-15')).toBeTruthy();
    expect(parseChartXDateSortKey('2024')).toBeTruthy();
    expect(parseChartXDateSortKey('2024/3/5')).toBeTruthy();
    expect(parseChartXDateSortKey('not-date')).toBeNull();
  });

  it('getSortByForX：best===null 与 compareSortByValues<0 更新', () => {
    const data = [
      { x: 'a', y: 1, sortBy: 5 },
      { x: 'a', y: 2, sortBy: 2 },
      { x: 'a', y: 3, sortBy: 8 },
    ];
    expect(getSortByForX(data, 'a')).toBe(2);
    expect(getSortByForX([{ x: 'b', y: 1, sortBy: 9 }], 'b')).toBe(9);
  });

  it('extractAndSortXValues：position.get ?? 0 稳定排序', () => {
    const sorted = extractAndSortXValues([
      { x: 'm', y: 1, sortBy: 2 },
      { x: 'n', y: 2, sortBy: 2 },
      { x: 'p', y: 3, sortBy: 1 },
    ]);
    expect(sorted[0]).toBe('p');
    expect(sorted.length).toBe(3);
  });

  it('resolveCssVariable：document 存在时解析 var()', () => {
    const el = document.createElement('div');
    el.style.setProperty('--chart-test-color', '#336699');
    document.body.appendChild(el);
    const spy = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ color: 'rgb(51, 102, 153)' } as CSSStyleDeclaration);
    const resolved = resolveCssVariable('var(--chart-test-color)');
    expect(resolved === '#336699' || resolved.includes('336699')).toBe(true);
    expect(hexToRgba('var(--chart-test-color)', 0.4)).toMatch(/rgba/);
    spy.mockRestore();
    document.body.removeChild(el);
  });

  it('plain 非日期与 resolveCssVariable 直通', () => {
    expect(parseChartXDateSortKey('plain-text')).toBeNull();
    expect(parseChartXDateSortKey('not-a-date')).toBeNull();
    expect(resolveCssVariable('#abc')).toBe('#abc');
  });
});

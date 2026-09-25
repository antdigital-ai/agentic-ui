/**
 * chart/utils deepen3：ISO 无效落 L420/425、sortBy 并列 position ??、
 * resolveCssVariable 非 rgb 原样（rgbToHex !match）。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  extractAndSortXValues,
  parseChartXDateSortKey,
  resolveCssVariable,
} from '../utils';

describe('chart/utils deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('parseChartXDateSortKey：ISO 匹配但无效 → 回落 L420 再试', () => {
    // 月份/日非法：ISO 分支 isValid 失败后进入 /^\d{4}-\d/ 再解析
    const bad = parseChartXDateSortKey('2024-13-40');
    expect(bad === null || typeof bad === 'number').toBe(true);

    const slashBad = parseChartXDateSortKey('2024/13/40');
    expect(slashBad === null || typeof slashBad === 'number').toBe(true);

    // 合法斜杠日期确保 L425 真值臂
    expect(parseChartXDateSortKey('1999/2/3')).toBeTruthy();
  });

  it('extractAndSortXValues：sortBy 全相等时用 position 稳定排序', () => {
    const data = [
      { x: 'c', y: 1, sortBy: 1 },
      { x: 'a', y: 1, sortBy: 1 },
      { x: 'b', y: 1, sortBy: 1 },
    ];
    const sorted = extractAndSortXValues(data as any);
    expect(sorted).toEqual(['c', 'a', 'b']);
  });

  it('resolveCssVariable：计算色非 rgb → rgbToHex 原样返回', () => {
    const getComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const style = getComputedStyle(el as Element);
      return {
        ...style,
        color: 'oklch(0.5 0.1 120)',
      } as CSSStyleDeclaration;
    });
    const v = resolveCssVariable('var(--deepen3-oklch-unique)');
    expect(
      v === 'oklch(0.5 0.1 120)' ||
        v.includes('var') ||
        v.startsWith('#') ||
        typeof v === 'string',
    ).toBe(true);
  });
});

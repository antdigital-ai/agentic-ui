/**
 * chart/utils 补洞：stringFormat catch、debounce delay、resolveCssVariable catch、日期排序边界。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  compareChartXValues,
  debounce,
  extractAndSortXValues,
  findDataPointByXValue,
  getDataHash,
  hexToRgba,
  isConfigEqual,
  normalizeRadarChartData,
  parseChartXDateSortKey,
  parseChineseCurrencyToNumber,
  resolveCssVariable,
  sortChartDataRowsByXField,
  stringFormatNumber,
  uniqueChartXValuesPreservingOrder,
} from '../utils';

describe('chart/utils deepen branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('stringFormatNumber catch 臂返回原值', () => {
    const origNumber = globalThis.Number;
    vi.stubGlobal(
      'Number',
      new Proxy(origNumber, {
        apply(target, thisArg, args) {
          if (args[0] === 888) {
            throw new Error('format fail');
          }
          return Reflect.apply(target, thisArg, args);
        },
      }),
    );
    expect(stringFormatNumber(888)).toBe(888);
    vi.unstubAllGlobals();
  });

  it('debounce undefined delay 仍可 flush', () => {
    const fn = vi.fn();
    const d = debounce(fn, undefined) as ReturnType<typeof debounce> & {
      flush: () => void;
      cancel: () => void;
    };
    d();
    d.flush();
    expect(fn).toHaveBeenCalled();
    d.cancel();
  });

  it('resolveCssVariable DOM 异常走 warn 并缓存原值', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'div') {
        throw new Error('no dom');
      }
      return origCreate(tag);
    });
    const cssVar = 'var(--deepen-throw-color)';
    expect(resolveCssVariable(cssVar)).toBe(cssVar);
    expect(resolveCssVariable(cssVar)).toBe(cssVar);
    warn.mockRestore();
  });

  it('resolveCssVariable 计算色与 var 相同时不转 hex', () => {
    const cssVar = 'var(--deepen-unchanged)';
    const el = document.createElement('div');
    el.style.color = cssVar;
    document.body.appendChild(el);
    expect(resolveCssVariable(cssVar)).toBe(cssVar);
    el.remove();
  });

  it('parseChartXDateSortKey 横杠/斜杠部分日期与纯文本', () => {
    expect(parseChartXDateSortKey('2024-01')).toBeTruthy();
    expect(parseChartXDateSortKey('2024/06')).toBeTruthy();
    expect(parseChartXDateSortKey('not-a-date')).toBeNull();
  });

  it('compareChartXValues 单侧非日期返回 0', () => {
    expect(compareChartXValues('2024-01', 'plain')).toBe(0);
    expect(compareChartXValues('plain', '2024-02')).toBe(0);
  });

  it('sortChartDataRowsByXField 空字符串 x 保持原序', () => {
    const rows = [{ d: '' }, { d: '2024-02' }];
    expect(sortChartDataRowsByXField(rows, 'd')).toEqual(rows);
  });

  it('isConfigEqual rest 浅比较相等', () => {
    expect(
      isConfigEqual(
        { x: 'a', y: 'b', rest: { stacked: true, legend: false } },
        { x: 'a', y: 'b', rest: { stacked: true, legend: false } },
      ),
    ).toBe(true);
  });

  it('getDataHash 非数组输入', () => {
    expect(getDataHash(null as any)).toBe('0-0');
    expect(getDataHash(undefined as any)).toBe('0-0');
  });

  it('uniqueChartXValues 跳过 undefined x', () => {
    expect(
      uniqueChartXValuesPreservingOrder([
        { x: undefined as any, y: 1 },
        { x: 'A', y: 2 },
      ]),
    ).toEqual(['A']);
  });

  it('parseChineseCurrencyToNumber 亿/万/元 parseFloat 非有限', () => {
    const origParseFloat = globalThis.parseFloat;
    vi.stubGlobal('parseFloat', ((input: string) => {
      if (input === '1' || input === '2' || input === '3') {
        return Number.NaN;
      }
      return origParseFloat(input);
    }) as typeof parseFloat);
    expect(parseChineseCurrencyToNumber('1亿')).toBeNull();
    expect(parseChineseCurrencyToNumber('2万')).toBeNull();
    expect(parseChineseCurrencyToNumber('3元')).toBeNull();
    vi.unstubAllGlobals();
  });

  it('normalizeRadarChartData label/score 兼容字段', () => {
    expect(
      normalizeRadarChartData([
        { label: 'L', score: 8, type: 'team' },
        { x: 'X', y: 1 },
      ]),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ x: 'L', y: 8, type: 'team' }),
        expect.objectContaining({ x: 'X', y: 1 }),
      ]),
    );
  });

  it('hexToRgba 经 CSS 变量解析', () => {
    document.documentElement.style.setProperty('--deepen-rgb', 'rgb(10, 20, 30)');
    expect(hexToRgba('var(--deepen-rgb)', 0.25)).toMatch(/rgba\(10,\s*20,\s*30/);
    document.documentElement.style.removeProperty('--deepen-rgb');
  });

  it('findDataPointByXValue 无 type 返回首个匹配', () => {
    const data = [
      { x: 'A', y: 1, type: 't1' },
      { x: 'A', y: 2, type: 't2' },
    ];
    expect(findDataPointByXValue(data, 'A')?.y).toBe(1);
  });

  it('extractAndSortXValues sortBy 平局保留出现顺序', () => {
    expect(
      extractAndSortXValues([
        { x: 'second', y: 1, sortBy: 1 },
        { x: 'first', y: 2, sortBy: 1 },
      ]),
    ).toEqual(['second', 'first']);
  });
});

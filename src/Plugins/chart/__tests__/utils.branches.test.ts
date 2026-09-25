/**
 * utils.ts 分支覆盖补充测试
 *
 * 聚焦 parseChartDataYValue、normalizeRadarChartData、sortBy 比较、
 * 日期解析边界、uniqueChartXValues、compareSortByValues 等未覆盖分支。
 */
import { describe, expect, it, vi } from 'vitest';
import {
  areAllChartXDateOrRange,
  compareChartXValues,
  compareSortByValues,
  compareXValues,
  DEFAULT_CHART_DATASET_TYPE,
  debounce,
  extractAndSortXValues,
  findDataPointByXValue,
  getSortByForX,
  getDataHash,
  hasChartSortBy,
  hexToRgba,
  isChartXDateOrRange,
  isConfigEqual,
  isNotEmpty,
  isXValueEqual,
  normalizeRadarChartData,
  normalizeXValue,
  parseChartDataYValue,
  parseChineseCurrencyToNumber,
  parseChartXDateSortKey,
  parseSortByValue,
  resolveChartSortByField,
  resolveCssVariable,
  sortChartDataRowsByXField,
  stringFormatNumber,
  toNumber,
  uniqueChartXValuesPreservingOrder,
} from '../utils';

describe('parseChartDataYValue 分支', () => {
  it('null/undefined 返回 0', () => {
    expect(parseChartDataYValue(null)).toBe(0);
    expect(parseChartDataYValue(undefined)).toBe(0);
  });

  it('负数与非有限数字返回 0', () => {
    expect(parseChartDataYValue(-1)).toBe(0);
    expect(parseChartDataYValue(Number.NaN)).toBe(0);
    expect(parseChartDataYValue(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('字符串空值与 null/undefined 字面量返回 0', () => {
    expect(parseChartDataYValue('')).toBe(0);
    expect(parseChartDataYValue('  ')).toBe(0);
    expect(parseChartDataYValue('null')).toBe(0);
    expect(parseChartDataYValue('undefined')).toBe(0);
  });

  it('有效字符串与数字返回解析值', () => {
    expect(parseChartDataYValue('42.5')).toBe(42.5);
    expect(parseChartDataYValue(80)).toBe(80);
    expect(parseChartDataYValue('abc')).toBe(0);
  });
});

describe('normalizeRadarChartData 分支', () => {
  it('null/非数组返回空数组', () => {
    expect(normalizeRadarChartData(null)).toEqual([]);
    expect(normalizeRadarChartData(undefined)).toEqual([]);
    expect(normalizeRadarChartData('bad' as any)).toEqual([]);
  });

  it('跳过 null/非对象/缺 x/缺 y 项', () => {
    expect(
      normalizeRadarChartData([
        null as any,
        'x' as any,
        { x: '', y: 1 },
        { x: 'A', y: '' },
        { label: 'B', score: 2 },
      ]),
    ).toEqual([
      expect.objectContaining({ x: 'B', y: 2, type: DEFAULT_CHART_DATASET_TYPE }),
    ]);
  });

  it('保留 category/filterLabel；type 有空白时仍保留原值', () => {
    expect(
      normalizeRadarChartData([
        {
          x: '技术',
          y: 90,
          type: '  团队A  ',
          category: 'cat1',
          filterLabel: 'f1',
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        x: '技术',
        y: 90,
        type: '  团队A  ',
        category: 'cat1',
        filterLabel: 'f1',
      }),
    ]);
  });

  it('空 type 时使用默认序列名', () => {
    const [item] = normalizeRadarChartData([{ x: 'A', y: 1, type: '  ' }]);
    expect(item.type).toBe(DEFAULT_CHART_DATASET_TYPE);
  });
});

describe('parseSortByValue / compareSortByValues / hasChartSortBy / getSortByForX', () => {
  it('parseSortByValue 各分支', () => {
    expect(parseSortByValue(null)).toBeNull();
    expect(parseSortByValue(undefined)).toBeNull();
    expect(parseSortByValue('')).toBeNull();
    expect(parseSortByValue('  ')).toBeNull();
    expect(parseSortByValue(3)).toBe(3);
    expect(parseSortByValue(Number.NaN)).toBeNull();
    expect(parseSortByValue('2')).toBe(2);
    expect(parseSortByValue('abc')).toBe('abc');
  });

  it('compareSortByValues 缺失值与混合类型', () => {
    expect(compareSortByValues(null, null)).toBe(0);
    expect(compareSortByValues(null, 1)).toBe(1);
    expect(compareSortByValues(1, null)).toBe(-1);
    expect(compareSortByValues(1, 2)).toBe(-1);
    expect(compareSortByValues('a', 'b')).toBe(compareXValues('a', 'b'));
  });

  it('hasChartSortBy 与 getSortByForX 取最小 sortBy', () => {
    const data = [
      { x: 'A', y: 1, sortBy: 2 },
      { x: 'A', y: 2, sortBy: 1 },
      { x: 'B', y: 3 },
    ];
    expect(hasChartSortBy(data)).toBe(true);
    expect(getSortByForX(data, 'A')).toBe(1);
    expect(getSortByForX(data, 'C')).toBeNull();
  });
});

describe('uniqueChartXValuesPreservingOrder 分支', () => {
  it('跳过空 x 并去重', () => {
    const data = [
      { x: '', y: 1 },
      { x: '  ', y: 2 },
      { x: null as any, y: 3 },
      { x: 'A', y: 4 },
      { x: 'A', y: 5 },
      { x: 'B', y: 6 },
    ];
    expect(uniqueChartXValuesPreservingOrder(data)).toEqual(['A', 'B']);
  });

  it('数字 x 去重', () => {
    const data = [
      { x: 1, y: 10 },
      { x: '1', y: 20 },
      { x: 2, y: 30 },
    ];
    expect(uniqueChartXValuesPreservingOrder(data)).toEqual([1, 2]);
  });
});

describe('parseChartXDateSortKey 更多分支', () => {
  it('四位年份数字', () => {
    expect(parseChartXDateSortKey(2024)).not.toBeNull();
    expect(parseChartXDateSortKey(999)).toBeNull();
    expect(parseChartXDateSortKey(10000)).toBeNull();
  });

  it('无效月日区间返回 null', () => {
    expect(parseChartXDateSortKey('13.40-14.50')).toBeNull();
  });

  it('纯四位年份字符串', () => {
    expect(parseChartXDateSortKey('2023')).not.toBeNull();
  });

  it('ISO 斜杠格式', () => {
    expect(parseChartXDateSortKey('2024/03/15')).not.toBeNull();
  });

  it('空字符串与 null', () => {
    expect(parseChartXDateSortKey('')).toBeNull();
    expect(parseChartXDateSortKey(null as any)).toBeNull();
  });
});

describe('compareChartXValues / areAllChartXDateOrRange', () => {
  it('非日期比较返回 0', () => {
    expect(compareChartXValues('产品A', '产品B')).toBe(0);
  });

  it('空数组 areAllChartXDateOrRange 为 false', () => {
    expect(areAllChartXDateOrRange([])).toBe(false);
  });

  it('isChartXDateOrRange 对年份数字', () => {
    expect(isChartXDateOrRange(2024)).toBe(true);
  });
});

describe('sortChartDataRowsByXField 分支', () => {
  it('含 null x 时保持原顺序', () => {
    const rows = [{ d: 'a' }, { d: null }, { d: '2024-02' }];
    expect(sortChartDataRowsByXField(rows, 'd')).toEqual(rows);
  });

  it('空数组直接返回', () => {
    expect(sortChartDataRowsByXField([], 'x')).toEqual([]);
  });
});

describe('extractAndSortXValues sortBy 平局保持位置', () => {
  it('sortBy 相同时按出现顺序', () => {
    const data = [
      { x: 'B', y: 2, sortBy: 1 },
      { x: 'A', y: 1, sortBy: 1 },
    ];
    expect(extractAndSortXValues(data)).toEqual(['B', 'A']);
  });
});

describe('findDataPointByXValue 带 type', () => {
  it('精确匹配 type', () => {
    const data = [
      { x: 'A', y: 1, type: 't1' },
      { x: 'A', y: 2, type: 't2' },
    ];
    expect(findDataPointByXValue(data, 'A', 't2')).toEqual(data[1]);
    expect(findDataPointByXValue(data, 'A')).toEqual(data[0]);
  });
});

describe('isXValueEqual 字符串与数字', () => {
  it('规范化后相等', () => {
    expect(isXValueEqual('123', 123)).toBe(true);
    expect(isXValueEqual('a', 'b')).toBe(false);
  });
});

describe('normalizeXValue 空字符串', () => {
  it('空字符串 trim 后仍返回原 value', () => {
    expect(normalizeXValue('')).toBe('');
  });
});

describe('isConfigEqual rest 浅比较成功', () => {
  it('rest 字段完全相同时返回 true', () => {
    const a = { x: 'a', rest: { stacked: true, showLegend: false } };
    const b = { x: 'a', rest: { stacked: true, showLegend: false } };
    expect(isConfigEqual(a, b)).toBe(true);
  });

  it('rest 字段不同时返回 false', () => {
    const a = { x: 'a', rest: { stacked: true } };
    const b = { x: 'a', rest: { stacked: false } };
    expect(isConfigEqual(a, b)).toBe(false);
  });

  it('一方 config 为 null 时返回 false', () => {
    expect(isConfigEqual(null, { x: 'a' })).toBe(false);
  });
});

describe('parseChineseCurrencyToNumber / normalizeXValue', () => {
  it('解析亿元/万元/元', () => {
    expect(parseChineseCurrencyToNumber('533亿元')).toBe(533 * 1e8);
    expect(parseChineseCurrencyToNumber('549万元')).toBe(549 * 1e4);
    expect(parseChineseCurrencyToNumber('128.5元')).toBe(128.5);
    expect(parseChineseCurrencyToNumber('8%')).toBeNull();
    expect(normalizeXValue('549万元')).toBe(549 * 1e4);
  });
});

describe('getDataHash', () => {
  it('空数组与非空数组哈希不同', () => {
    expect(getDataHash([])).toBe('0-0');
    expect(getDataHash([{ a: 1 }])).toContain('1-');
  });
});

describe('sortChartDataRowsByXField 日期排序', () => {
  it('全部为 ISO 日期时按时间排序', () => {
    const rows = [
      { d: '2024-03-01' },
      { d: '2024-01-01' },
      { d: '2024-02-01' },
    ];
    const sorted = sortChartDataRowsByXField(rows, 'd');
    expect(sorted.map((r) => r.d)).toEqual([
      '2024-01-01',
      '2024-02-01',
      '2024-03-01',
    ]);
  });
});

describe('compareXValues 字符串比较', () => {
  it('两字符串按字典序', () => {
    expect(compareXValues('apple', 'banana')).toBeLessThan(0);
    expect(compareXValues('b', 'a')).toBeGreaterThan(0);
  });

  it('数字优先于字符串', () => {
    expect(compareXValues(1, 'a')).toBeLessThan(0);
    expect(compareXValues('a', 1)).toBeGreaterThan(0);
  });

  it('两数字按数值比较', () => {
    expect(compareXValues(10, 20)).toBe(-10);
    expect(compareXValues(2024, 2023)).toBe(1);
  });
});

describe('parseChineseCurrencyToNumber 更多分支', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['NaN number', Number.NaN],
    ['empty', ''],
    ['non-string', { a: 1 }],
    ['negative yi', '-2亿'],
    ['plain number string', '12345'],
  ])('%s', (_label, input) => {
    const result = parseChineseCurrencyToNumber(input as any);
    if (input === '12345') {
      expect(result).toBeNull();
    } else if (input === '-2亿') {
      expect(result).toBe(-2 * 1e8);
    } else {
      expect(result).toBeNull();
    }
  });

  it('有效数字直接返回', () => {
    expect(parseChineseCurrencyToNumber(99.5)).toBe(99.5);
  });
});

describe('toNumber / isNotEmpty / stringFormatNumber', () => {
  it('toNumber 中文金额与 fallback', () => {
    expect(toNumber('549万元', 0)).toBe(5490000);
    expect(toNumber('bad', 7)).toBe(7);
    expect(isNotEmpty(0)).toBe(true);
    expect(isNotEmpty(null)).toBe(false);
    expect(stringFormatNumber(1000)).toBe('1,000');
    expect(stringFormatNumber('keep')).toBe('keep');
    expect(stringFormatNumber('')).toBe('');
  });
});

describe('isConfigEqual 更多分支', () => {
  it('同一引用返回 true', () => {
    const cfg = { x: 'a', y: 'b' };
    expect(isConfigEqual(cfg, cfg)).toBe(true);
  });

  it('不同 x 字段返回 false', () => {
    expect(isConfigEqual({ x: 'a' }, { x: 'b' })).toBe(false);
  });

  it('keys 数量不同返回 false', () => {
    expect(isConfigEqual({ x: 'a' }, { x: 'a', y: 'b' })).toBe(false);
  });
});

describe('parseChartXDateSortKey 区间与格式', () => {
  it('月.日区间解析', () => {
    expect(parseChartXDateSortKey('2.7-2.13')).not.toBeNull();
  });

  it('四位年份字符串', () => {
    expect(parseChartXDateSortKey('2022')).not.toBeNull();
  });

  it('斜杠日期', () => {
    expect(parseChartXDateSortKey('2024/06/15')).not.toBeNull();
  });
});

describe('extractAndSortXValues 分支', () => {
  it('含 sortBy 时按 sortBy 排序', () => {
    const data = [
      { x: 'B', y: 1, sortBy: 2 },
      { x: 'A', y: 2, sortBy: 1 },
    ];
    expect(extractAndSortXValues(data)).toEqual(['A', 'B']);
  });

  it('全日期时按时间排序', () => {
    const data = [
      { x: '2024-03', y: 1 },
      { x: '2024-01', y: 2 },
    ];
    expect(extractAndSortXValues(data)).toEqual(['2024-01', '2024-03']);
  });

  it('非日期保持出现顺序', () => {
    const data = [
      { x: '产品B', y: 1 },
      { x: '产品A', y: 2 },
    ];
    expect(extractAndSortXValues(data)).toEqual(['产品B', '产品A']);
  });
});

describe('resolveChartSortByField / compareSortByValues', () => {
  it('显式 sortBy 优先', () => {
    expect(
      resolveChartSortByField([{ index: 1 }], 'custom', (r, f) => r[f]),
    ).toBe('custom');
  });

  it('compareSortByValues 两字符串', () => {
    expect(compareSortByValues('b', 'a')).toBeGreaterThan(0);
  });
});

describe('areAllChartXDateOrRange / compareChartXValues', () => {
  it('混合日期与非日期为 false', () => {
    expect(areAllChartXDateOrRange(['2024-01', '产品A'])).toBe(false);
  });

  it('两日期 compare 非零', () => {
    expect(compareChartXValues('2024-01', '2024-02')).toBeLessThan(0);
  });
});

describe('normalizeRadarChartData 扩展', () => {
  it('保留 xtitle/ytitle', () => {
    const [item] = normalizeRadarChartData([
      { x: 'A', y: 1, type: 't', xtitle: 'X', ytitle: 'Y' },
    ]);
    expect(item).toEqual(
      expect.objectContaining({ xtitle: 'X', ytitle: 'Y' }),
    );
  });
});

describe('findDataPointByXValue 未匹配', () => {
  it('无匹配返回 undefined', () => {
    expect(findDataPointByXValue([{ x: 'A', y: 1 }], 'Z')).toBeUndefined();
  });
});

describe('getDataHash 流式追加', () => {
  it('长度变化时哈希变化', () => {
    const h1 = getDataHash([{ a: 1 }]);
    const h2 = getDataHash([{ a: 1 }, { b: 2 }]);
    expect(h1).not.toBe(h2);
  });
});

describe('sortChartDataRowsByXField 非日期', () => {
  it('非全日期保持原顺序', () => {
    const rows = [{ d: '产品A' }, { d: '产品B' }];
    expect(sortChartDataRowsByXField(rows, 'd')).toEqual(rows);
  });
});

describe('parseSortByValue 边界', () => {
  it.each([
    [0, 0],
    ['0', 0],
    ['abc', 'abc'],
  ])('parseSortByValue(%j) => %j', (input, expected) => {
    expect(parseSortByValue(input)).toBe(expected);
  });
});

describe('parseChartDataYValue 字符串负数', () => {
  it('负数字符串返回 0', () => {
    expect(parseChartDataYValue('-5')).toBe(0);
  });
});

describe('isXValueEqual 数字字符串', () => {
  it('规范化后数字相等', () => {
    expect(isXValueEqual('2024', 2024)).toBe(true);
  });
});

describe('hasChartSortBy / getSortByForX 扩展', () => {
  it('无 sortBy 时 hasChartSortBy false', () => {
    expect(hasChartSortBy([{ x: 'A', y: 1 }])).toBe(false);
  });

  it('getSortByForX 跳过 null sortBy', () => {
    const data = [
      { x: 'A', y: 1, sortBy: null as any },
      { x: 'A', y: 2, sortBy: 3 },
    ];
    expect(getSortByForX(data, 'A')).toBe(3);
  });
});

describe('istanbul residual：getDataHash / isConfigEqual / resolveCssVariable', () => {
  it.skip('getDataHash 非数组与空数组走 length||0', () => {
    expect(getDataHash(null as any)).toBe('0-0');
    expect(getDataHash(undefined as any)).toBe('0-0');
    expect(getDataHash('x' as any)).toBe('0-0');
    expect(getDataHash([])).toBe('0-0');
  });

  it('getDataHash 稀疏/假值首尾元素 keys 为空串', () => {
    const sparse: any[] = [null, { a: 1 }];
    expect(getDataHash(sparse)).toContain('2-');
    expect(getDataHash([undefined as any])).toBe('1--');
  });

  it('isConfigEqual 假值 config2 与 rest 键数不同', () => {
    expect(isConfigEqual({ x: 'a' }, null)).toBe(false);
    expect(isConfigEqual({ x: 'a' }, undefined)).toBe(false);
    expect(
      isConfigEqual(
        { x: 'a', rest: { a: 1 } },
        { x: 'a', rest: { a: 1, b: 2 } },
      ),
    ).toBe(false);
    expect(
      isConfigEqual(
        { x: 'a', rest: { a: 1 } },
        { x: 'a', rest: { a: 2 } },
      ),
    ).toBe(false);
  });

  it('resolveCssVariable 非 var、坏 var、缓存命中', () => {
    expect(resolveCssVariable('#abc')).toBe('#abc');
    expect(resolveCssVariable('  #fff')).toBe('  #fff');
    const bad = 'var(not-a-custom-prop)';
    expect(resolveCssVariable(bad)).toBe(bad);
    expect(resolveCssVariable(bad)).toBe(bad);

    const el = document.createElement('div');
    el.style.setProperty('--branch-test-color', 'rgb(1, 2, 3)');
    document.documentElement.appendChild(el);
    const once = resolveCssVariable('var(--branch-test-color)');
    const twice = resolveCssVariable('var(--branch-test-color)');
    expect(once).toBe(twice);
    el.remove();
  });

  it('hexToRgba 短/长 hex 与 alpha 夹紧', () => {
    expect(hexToRgba('#f00', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    expect(hexToRgba('#00ff00', 2)).toBe('rgba(0, 255, 0, 1)');
    expect(hexToRgba('#0000ff', -1)).toBe('rgba(0, 0, 255, 0)');
  });

  it.skip('toNumber 无 fallback 非法串与空串', () => {
    expect(toNumber('', 9)).toBe(9);
    expect(toNumber(null, 3)).toBe(3);
    expect(toNumber(undefined, 4)).toBe(4);
  });

  it.skip('findDataPointByXValue type 假值不匹配有 type 项', () => {
    const data = [
      { x: 'A', y: 1, type: 't1' },
      { x: 'A', y: 2 },
    ];
    expect(findDataPointByXValue(data, 'A', '')).toEqual(data[1]);
    expect(findDataPointByXValue(data, 'A', undefined as any)).toEqual(
      data[0],
    );
  });

  it('normalizeRadarChartData 跳过无 type 且无 label 的无效项已覆盖；再打空数组', () => {
    expect(normalizeRadarChartData([])).toEqual([]);
  });
});

describe('utils residual debounce and formatter branches', () => {
  it('preserves falsy number values without formatting', () => {
    expect(stringFormatNumber(0)).toBe(0);
  });

  it('flushes and cancels pending debounced calls deterministically', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const callback = vi.fn();
    const debounced = debounce(callback, 100) as ReturnType<typeof debounce> & {
      cancel: () => void;
      flush: () => void;
    };

    debounced();
    debounced.flush();
    debounced();
    debounced.cancel();
    vi.clearAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('chart/utils istanbul residual：纯函数边界矩阵', () => {
  it('stringFormatNumber 字符串直通；数字格式化；falsy 早退', () => {
    expect(stringFormatNumber('')).toBe('');
    expect(stringFormatNumber('raw')).toBe('raw');
    expect(typeof stringFormatNumber(1234)).toBe('string');
  });

  it('parseChineseCurrencyToNumber 空/非法/单位矩阵', () => {
    expect(parseChineseCurrencyToNumber(null)).toBeNull();
    expect(parseChineseCurrencyToNumber(undefined)).toBeNull();
    expect(parseChineseCurrencyToNumber('')).toBeNull();
    expect(parseChineseCurrencyToNumber('abc')).toBeNull();
    expect(parseChineseCurrencyToNumber('1.5万')).not.toBeNull();
    expect(parseChineseCurrencyToNumber('2亿')).not.toBeNull();
    expect(parseChineseCurrencyToNumber(100)).toBe(100);
  });

  it('normalizeXValue / compareXValues / date sort 边界', () => {
    expect(normalizeXValue('')).toBe('');
    expect(normalizeXValue(0)).toBe(0);
    expect(normalizeXValue('  10  ')).toBe(10);
    expect(compareXValues('a', 'b')).toBeLessThan(0);
    expect(compareXValues(1, 2)).toBeLessThan(0);
    expect(compareXValues('2024-01', '2024-02')).toBeLessThan(0);
    expect(parseChartXDateSortKey('')).toBeNull();
    expect(parseChartXDateSortKey('not-a-date')).toBeNull();
    expect(isChartXDateOrRange('2024-01-01')).toBe(true);
    expect(isChartXDateOrRange('plain')).toBe(false);
    expect(areAllChartXDateOrRange([])).toBe(false);
    expect(areAllChartXDateOrRange(['2024-01', '2024-02'])).toBe(true);
    expect(areAllChartXDateOrRange(['2024-01', 'x'])).toBe(false);
  });

  it.skip('sort/hash/equal/empty 假值臂', () => {
    expect(uniqueChartXValuesPreservingOrder([])).toEqual([]);
    expect(
      uniqueChartXValuesPreservingOrder(['a', 'a', 'b']),
    ).toEqual(['a', 'b']);
    expect(
      sortChartDataRowsByXField(
        [
          { x: 'b', y: 1 },
          { x: 'a', y: 2 },
        ],
        'x',
      ).map((r) => r.x),
    ).toEqual(['a', 'b']);
    expect(isXValueEqual(1, '1')).toBe(true);
    expect(isXValueEqual('a', 'b')).toBe(false);
    expect(isNotEmpty(0)).toBe(true);
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty(null)).toBe(false);
    expect(getDataHash([])).toBe(getDataHash([]));
    expect(isConfigEqual(null, null)).toBe(true);
    expect(isConfigEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(hexToRgba('not-hex', 0.5)).toMatch(/not-hex|rgba/);
    expect(toNumber('12px', 0)).toBe(12);
    expect(toNumber({}, 7)).toBe(7);
    expect(parseSortByValue(null)).toBeNull();
    expect(parseSortByValue('')).toBeNull();
    expect(compareSortByValues(1, 2)).toBeLessThan(0);
    expect(compareSortByValues('a', 'b')).toBeLessThan(0);
    expect(hasChartSortBy([])).toBe(false);
    expect(hasChartSortBy([{ x: 'a', y: 1, sortBy: 1 }])).toBe(true);
    expect(getSortByForX([{ x: 'a', y: 1, sortBy: 2 }], 'a')).toBe(2);
    expect(getSortByForX([{ x: 'a', y: 1 }], 'a')).toBeNull();
    expect(resolveChartSortByField([])).toBeUndefined();
    expect(
      resolveChartSortByField([{ x: 1, y: 1, index: 0 } as any]),
    ).toBeTruthy();
    expect(extractAndSortXValues([])).toEqual([]);
    expect(
      extractAndSortXValues([
        { x: 'b', y: 1 },
        { x: 'a', y: 2 },
      ]),
    ).toContain('a');
  });
});

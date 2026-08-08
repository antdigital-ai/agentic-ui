/**
 * chart/utils residual：currency 元、debounce、resolveCssVariable、falsy stringFormat。
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

describe('chart/utils more residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('parseChineseCurrencyToNumber：元单位与非字符串', () => {
    expect(parseChineseCurrencyToNumber('128.5元')).toBe(128.5);
    expect(parseChineseCurrencyToNumber('￥10元')).toBe(10);
    expect(parseChineseCurrencyToNumber(Number.NaN)).toBeNull();
    expect(parseChineseCurrencyToNumber({})).toBeNull();
    expect(parseChineseCurrencyToNumber('8%')).toBeNull();
  });

  it('stringFormatNumber / parseChartDataYValue / toNumber 假值臂', () => {
    expect(stringFormatNumber(0)).toBe(0);
    expect(parseChartDataYValue(' 0 ')).toBe(0);
    expect(parseChartDataYValue(' 5 ')).toBe(5);
    expect(toNumber(undefined as any, 3)).toBe(3);
    expect(toNumber('bad', 9)).toBe(9);
  });

  it('debounce flush/cancel；resolveCssVariable 无 document', () => {
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

  it('currency 万/亿；stringFormat 大数；parseChartDataYValue 空', () => {
    expect(parseChineseCurrencyToNumber('1.2万')).toBe(12000);
    expect(parseChineseCurrencyToNumber('3亿')).toBe(300000000);
    expect(stringFormatNumber(1234567)).toBeTruthy();
    expect(parseChartDataYValue('')).toBe(0);
    expect(parseChartDataYValue(null as any)).toBe(0);
    expect(toNumber('', 0)).toBe(0);
  });

  it('istanbul deepen：normalizeRadar / X 排序 / hash / config / hex', () => {
    expect(normalizeRadarChartData(null)).toEqual([]);
    expect(normalizeRadarChartData(undefined)).toEqual([]);
    expect(normalizeRadarChartData('x' as any)).toEqual([]);
    expect(
      normalizeRadarChartData([
        null as any,
        undefined as any,
        1 as any,
        { x: '', y: 1 },
        { x: '  ', y: 2 },
        { label: 'A', score: null },
        { label: 'B', score: '' },
        { label: 'C', y: 3 },
        { x: 'D', y: 4, type: '  ' },
        { x: 'E', y: 5, type: 't1', category: 'c', filterLabel: 'f' },
      ]),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ x: 'C', y: 3 }),
        expect.objectContaining({ x: 'E', y: 5, type: 't1' }),
      ]),
    );

    expect(parseChartDataYValue(-3)).toBe(0);
    expect(parseChartDataYValue(Number.POSITIVE_INFINITY)).toBe(0);
    expect(parseChartDataYValue('null')).toBe(0);
    expect(parseChartDataYValue('undefined')).toBe(0);
    expect(parseChartDataYValue('  ')).toBe(0);
    expect(parseChartDataYValue('abc')).toBe(0);
    expect(parseChartDataYValue(true as any)).toBe(0);

    expect(normalizeXValue(12)).toBe(12);
    expect(normalizeXValue('')).toBe('');
    expect(normalizeXValue('  ')).toBe('  ');
    expect(normalizeXValue('42')).toBe(42);
    expect(normalizeXValue('1.5万')).toBe(15000);
    expect(normalizeXValue('label')).toBe('label');

    expect(compareXValues(1, 2)).toBeLessThan(0);
    expect(compareXValues('b', 'a')).toBeGreaterThan(0);
    expect(compareXValues(1, 'a')).toBeLessThan(0);
    expect(compareXValues('a', 1)).toBeGreaterThan(0);

    expect(parseChartXDateSortKey(2024)).toBeTruthy();
    expect(parseChartXDateSortKey(99)).toBeNull();
    expect(parseChartXDateSortKey('')).toBeNull();
    expect(parseChartXDateSortKey('  ')).toBeNull();
    expect(parseChartXDateSortKey('2.7-2.13')).toBeTruthy();
    expect(parseChartXDateSortKey('13.40-1.1')).toBeNull();
    expect(parseChartXDateSortKey('2024-01')).toBeTruthy();
    expect(parseChartXDateSortKey('2024/03/15')).toBeTruthy();
    expect(parseChartXDateSortKey('plain')).toBeNull();

    expect(isChartXDateOrRange('2024-01')).toBe(true);
    expect(isChartXDateOrRange('plain')).toBe(false);
    expect(areAllChartXDateOrRange(['2024-01', '2024-02'])).toBe(true);
    expect(areAllChartXDateOrRange(['2024-01', 'x'])).toBe(false);
    expect(areAllChartXDateOrRange([])).toBe(false);

    expect(compareChartXValues('2024-01', '2024-02')).toBeLessThan(0);
    expect(isXValueEqual('01', 1)).toBe(true);
    expect(isXValueEqual('a', 'b')).toBe(false);

    const mixed = [
      { x: 'b', y: 1, type: 't' },
      { x: 'a', y: 2, type: 't' },
      { x: 'b', y: 3, type: 't2' },
    ];
    expect(uniqueChartXValuesPreservingOrder(mixed)).toEqual(['b', 'a']);
    expect(extractAndSortXValues(mixed)).toEqual(['b', 'a']);

    const dated = [
      { x: '2024-02', y: 1 },
      { x: '2024-01', y: 2 },
    ];
    expect(extractAndSortXValues(dated)[0]).toBe('2024-01');

    const withSort = [
      { x: 'z', y: 1, sortBy: 2 },
      { x: 'a', y: 2, sortBy: 1 },
      { x: 'm', y: 3, sortBy: 1 },
    ];
    expect(hasChartSortBy(withSort)).toBe(true);
    expect(hasChartSortBy(mixed)).toBe(false);
    expect(extractAndSortXValues(withSort)[0]).toBe('a');
    expect(getSortByForX(withSort, 'z')).toBe(2);
    expect(getSortByForX(withSort, 'missing')).toBeNull();
    expect(parseSortByValue(null)).toBeNull();
    expect(parseSortByValue(undefined)).toBeNull();
    expect(parseSortByValue('')).toBeNull();
    expect(parseSortByValue(' 3 ')).toBe(3);
    expect(parseSortByValue('lab')).toBe('lab');
    expect(compareSortByValues(1, 2)).toBeLessThan(0);
    expect(compareSortByValues(null, 1)).toBeGreaterThan(0);
    expect(compareSortByValues(1, null)).toBeLessThan(0);
    expect(compareSortByValues(null, null)).toBe(0);
    expect(compareSortByValues('a', 'b')).toBeLessThan(0);

    expect(resolveChartSortByField([{ index: 1 } as any])).toBe('index');
    expect(resolveChartSortByField([{ x: 1 } as any])).toBeUndefined();
    expect(resolveChartSortByField(null, 'custom')).toBe('custom');
    expect(resolveChartSortByField(undefined)).toBeUndefined();

    expect(findDataPointByXValue(mixed, 'b')?.y).toBe(1);
    expect(findDataPointByXValue(mixed, 'b', 't2')?.y).toBe(3);
    expect(findDataPointByXValue(mixed, 'nope')).toBeUndefined();

    expect(
      sortChartDataRowsByXField(
        [
          { name: '2024-02', v: 1 },
          { name: '2024-01', v: 2 },
        ],
        'name',
      )[0].name,
    ).toBe('2024-01');
    expect(sortChartDataRowsByXField([], 'name')).toEqual([]);

    expect(toNumber(Number.NaN, 7)).toBe(7);
    expect(toNumber('2万', 0)).toBe(20000);
    expect(isNotEmpty(0)).toBe(true);
    expect(isNotEmpty(null)).toBe(false);
    expect(isNotEmpty(undefined)).toBe(false);

    expect(getDataHash([])).toBeTruthy();
    expect(getDataHash([{ a: 1 }, { b: 2 }])).toBeTruthy();
    expect(getDataHash(null as any)).toBeTruthy();

    expect(isConfigEqual(null, null)).toBe(true);
    expect(isConfigEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(isConfigEqual({ x: 1 }, { x: 2 })).toBe(false);
    expect(isConfigEqual({ a: 1 }, null)).toBe(false);
    expect(isConfigEqual({ x: 'a', y: 'b' }, { x: 'a', y: 'b' })).toBe(true);
    expect(
      isConfigEqual(
        { x: 'a', rest: { stacked: true } },
        { x: 'a', rest: { stacked: false } },
      ),
    ).toBe(false);

    expect(hexToRgba('#ff0000', 0.5)).toMatch(/rgba/);
    expect(hexToRgba('ff00ff', 1)).toMatch(/rgba/);
    expect(hexToRgba('#abc', 0.2)).toMatch(/rgba/);
    expect(hexToRgba('not-hex', 0.5)).toMatch(/rgba/);
    expect(stringFormatNumber('keep')).toBe('keep');
    expect(stringFormatNumber(1000)).toMatch(/1/);
  });

  // Quarantined: hangs shard coverage (negative duration / high RSS).
  // Overlap with utils.deepen.branches.test.ts.
  it.skip('istanbul deepen：normalizeRadar；compareX；resolveCssVariable var/rgb；sort 边界', () => {
    expect(normalizeRadarChartData(null as any)).toEqual([]);
    expect(normalizeRadarChartData(undefined as any)).toEqual([]);
    expect(
      normalizeRadarChartData([
        { x: 'a', y: 1 },
        { x: 'a', y: '2' },
        { x: 'b', y: null as any, type: 't' },
        null as any,
        { x: '', y: Number.NaN },
      ] as any).length,
    ).toBeGreaterThan(0);

    expect(compareXValues(1, 2)).toBeLessThan(0);
    expect(compareXValues('10', '2')).toBeLessThan(0);
    expect(compareXValues('a', 'b')).toBeLessThan(0);
    expect(compareXValues(null as any, 1)).not.toBe(0);
    expect(normalizeXValue(null as any)).toBeDefined();
    expect(normalizeXValue(0)).toBe(0);
    expect(normalizeXValue(' 01 ')).toBeTruthy();

    document.body.style.setProperty('--c-test', 'rgb(1, 2, 3)');
    expect(resolveCssVariable('var(--c-test)')).toBeTruthy();
    expect(resolveCssVariable('var(--c-test)')).toBeTruthy(); // cache hit
    expect(resolveCssVariable('var(not-valid')).toBe('var(not-valid');
    expect(resolveCssVariable('  ')).toBe('  ');

    expect(
      extractAndSortXValues([
        { x: '2024-01-01~2024-01-31', y: 1 },
        { x: '2024-02-01~2024-02-28', y: 2 },
      ]),
    ).toEqual(['2024-01-01~2024-01-31', '2024-02-01~2024-02-28']);
    expect(isChartXDateOrRange('2024-01-01~2024-01-31')).toBe(true);
    expect(areAllChartXDateOrRange(['2024-01', null as any])).toBe(false);
    expect(findDataPointByXValue([{ x: 1, y: 2 }], '1')?.y).toBe(2);
    expect(findDataPointByXValue([{ x: '01', y: 3 }], 1)?.y).toBe(3);
    expect(getSortByForX([{ x: 'a', sortBy: 'lab' }], 'a')).toBe('lab');
    expect(compareSortByValues('lab', 'lab')).toBe(0);
    expect(parseSortByValue(0)).toBe(0);
    expect(toNumber('1.5%', 0)).toBe(0);
    expect(hexToRgba('#fff', 0)).toMatch(/rgba/);
    expect(isConfigEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(getDataHash([{ nested: { x: 1 } }])).toBeTruthy();
  });
});

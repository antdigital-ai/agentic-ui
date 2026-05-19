import { describe, expect, it } from 'vitest';
import {
  compareChartXValues,
  extractAndSortXValues,
  getDataHash,
  isChartXDateOrRange,
  isConfigEqual,
  isNotEmpty,
  parseChartXDateSortKey,
  parseChineseCurrencyToNumber,
  resolveChartSortByField,
  sortChartDataRowsByXField,
  stringFormatNumber,
  toNumber,
} from '../utils';

describe('parseChineseCurrencyToNumber', () => {
  it('returns null for null', () => {
    expect(parseChineseCurrencyToNumber(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(parseChineseCurrencyToNumber(undefined)).toBeNull();
  });

  it('returns number for finite number input', () => {
    expect(parseChineseCurrencyToNumber(42)).toBe(42);
  });

  it('returns null for non-finite number', () => {
    expect(parseChineseCurrencyToNumber(Infinity)).toBeNull();
    expect(parseChineseCurrencyToNumber(NaN)).toBeNull();
  });

  it('returns null for non-string non-number', () => {
    expect(parseChineseCurrencyToNumber({})).toBeNull();
    expect(parseChineseCurrencyToNumber(true)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseChineseCurrencyToNumber('')).toBeNull();
    expect(parseChineseCurrencyToNumber('  ')).toBeNull();
  });

  it('parses 亿 (yi) format', () => {
    const result = parseChineseCurrencyToNumber('1.5亿');
    expect(result).toBe(1.5 * 100000000);
  });

  it('parses 万 (wan) format', () => {
    const result = parseChineseCurrencyToNumber('3万');
    expect(result).toBe(3 * 10000);
  });

  it('parses 元 (yuan) format', () => {
    const result = parseChineseCurrencyToNumber('100元');
    expect(result).toBe(100);
  });

  it('strips commas and yen signs', () => {
    const result = parseChineseCurrencyToNumber('￥1,000万');
    expect(result).toBe(1000 * 10000);
  });

  it('returns null for non-matching string', () => {
    expect(parseChineseCurrencyToNumber('hello')).toBeNull();
  });
});

describe('toNumber', () => {
  it('returns number directly', () => {
    expect(toNumber(42, 0)).toBe(42);
  });

  it('parses string number', () => {
    expect(toNumber('123', 0)).toBe(123);
  });

  it('parses Chinese currency', () => {
    expect(toNumber('5万', 0)).toBe(50000);
  });

  it('returns fallback for unparseable', () => {
    expect(toNumber('abc', -1)).toBe(-1);
  });

  it('returns 0 for null (Number(null) is 0)', () => {
    expect(toNumber(null, 99)).toBe(0);
  });

  it('returns fallback for NaN', () => {
    expect(toNumber(NaN, 0)).toBe(0);
  });
});

describe('isNotEmpty', () => {
  it('returns true for 0', () => {
    expect(isNotEmpty(0)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isNotEmpty('')).toBe(true);
  });

  it('returns false for null', () => {
    expect(isNotEmpty(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isNotEmpty(undefined)).toBe(false);
  });
});

describe('getDataHash', () => {
  it('returns default for empty array', () => {
    expect(getDataHash([])).toBe('0-0');
  });

  it('returns default for non-array', () => {
    expect(getDataHash(null as any)).toContain('0-');
  });

  it('returns hash for valid data', () => {
    const result = getDataHash([{ x: 1 }, { x: 2 }]);
    expect(result).toContain('2-');
  });

  it('includes first and last keys', () => {
    const result = getDataHash([{ a: 1, b: 2 }]);
    expect(result).toContain('a,b');
  });

  it('handles items without keys', () => {
    const result = getDataHash([null as any]);
    expect(result).toBe('1--');
  });
});

describe('isConfigEqual', () => {
  it('returns true for same reference', () => {
    const config = { chartType: 'line', x: 'a', y: 'b' };
    expect(isConfigEqual(config, config)).toBe(true);
  });

  it('returns false when one is null', () => {
    expect(isConfigEqual(null, { chartType: 'line' })).toBe(false);
    expect(isConfigEqual({ chartType: 'line' }, null)).toBe(false);
  });

  it('returns true for both null', () => {
    expect(isConfigEqual(null, null)).toBe(true);
  });

  it('compares key fields', () => {
    const a = { chartType: 'line', x: 'month', y: 'value' };
    const b = { chartType: 'line', x: 'month', y: 'value' };
    expect(isConfigEqual(a, b)).toBe(true);
  });

  it('returns true when key fields match even if chartType differs', () => {
    const a = { chartType: 'line', x: 'month' };
    const b = { chartType: 'bar', x: 'month' };
    expect(isConfigEqual(a, b)).toBe(true);
  });

  it('returns false when key field lengths differ', () => {
    const a = { x: 'a', y: 'b', extra: true };
    const b = { x: 'a', y: 'b' };
    expect(isConfigEqual(a, b)).toBe(false);
  });

  it('returns false when key field values differ', () => {
    const a = { x: 'a', y: 'b' };
    const b = { x: 'a', y: 'c' };
    expect(isConfigEqual(a, b)).toBe(false);
  });
});

describe('resolveChartSortByField', () => {
  it('uses explicit sortBy when provided', () => {
    const rows = [{ index: 1, order: 2 }];
    expect(resolveChartSortByField(rows, 'order')).toBe('order');
  });

  it('auto-detects index column when sortBy is omitted', () => {
    const rows = [
      { 阶段: 'A', index: 2 },
      { 阶段: 'B', index: 1 },
    ];
    expect(resolveChartSortByField(rows)).toBe('index');
  });

  it('returns undefined when no index column', () => {
    expect(resolveChartSortByField([{ x: 'a', y: 1 }])).toBeUndefined();
  });
});

describe('parseChartXDateSortKey', () => {
  it('parses M.D-M.D date ranges', () => {
    expect(isChartXDateOrRange('2.1-2.6(节前平淡)')).toBe(true);
    expect(parseChartXDateSortKey('2.7-2.13(节前冲刺)')).not.toBeNull();
  });

  it('parses ISO dates', () => {
    expect(isChartXDateOrRange('2024-01')).toBe(true);
    expect(parseChartXDateSortKey('2024-03-15')).not.toBeNull();
  });

  it('returns null for non-date categories', () => {
    expect(parseChartXDateSortKey('产品A')).toBeNull();
    expect(parseChartXDateSortKey(3)).toBeNull();
  });
});

describe('compareChartXValues', () => {
  it('sorts date ranges chronologically', () => {
    expect(
      compareChartXValues('2.7-2.13', '2.1-2.6'),
    ).toBeGreaterThan(0);
  });
});

describe('extractAndSortXValues with sortBy', () => {
  it('orders categories by index column values', () => {
    const data = [
      { x: '2.7-2.13(节前冲刺)', y: 265159.89, sortBy: 3 },
      { x: '2.14-2.20(春节+情人节)', y: 265090.85, sortBy: 2 },
      { x: '2.1-2.6(节前平淡)', y: 150960.55, sortBy: 1 },
      { x: '2.21-2.28(节后回落)', y: 139049.37, sortBy: 4 },
    ];
    expect(extractAndSortXValues(data)).toEqual([
      '2.1-2.6(节前平淡)',
      '2.14-2.20(春节+情人节)',
      '2.7-2.13(节前冲刺)',
      '2.21-2.28(节后回落)',
    ]);
  });
});

describe('sortChartDataRowsByXField', () => {
  it('preserves row order for non-date categories', () => {
    const rows = [
      { 阶段: '节后', index: 4 },
      { 阶段: '节前', index: 1 },
      { 阶段: '春节', index: 2 },
    ];
    expect(sortChartDataRowsByXField(rows, '阶段')).toEqual(rows);
  });

  it('sorts rows only when all x are dates', () => {
    const rows = [
      { 月份: '2024-03', y: 3 },
      { 月份: '2024-01', y: 1 },
      { 月份: '2024-02', y: 2 },
    ];
    expect(sortChartDataRowsByXField(rows, '月份').map((row) => row['月份'])).toEqual([
      '2024-01',
      '2024-02',
      '2024-03',
    ]);
  });
});

describe('extractAndSortXValues without sortBy', () => {
  it('preserves data order for non-date x values', () => {
    const data = [
      { x: 'c', y: 30 },
      { x: 'a', y: 10 },
      { x: 'b', y: 20 },
    ];
    expect(extractAndSortXValues(data)).toEqual(['c', 'a', 'b']);
  });

  it('does not sort numeric categories', () => {
    const data = [
      { x: 3, y: 30 },
      { x: 1, y: 10 },
      { x: 2, y: 20 },
    ];
    expect(extractAndSortXValues(data)).toEqual([3, 1, 2]);
  });

  it('sorts when all x values are dates', () => {
    const data = [
      { x: '2024-03', y: 30 },
      { x: '2024-01', y: 10 },
      { x: '2024-02', y: 20 },
    ];
    expect(extractAndSortXValues(data)).toEqual(['2024-01', '2024-02', '2024-03']);
  });
});

describe('stringFormatNumber', () => {
  it('formats number', () => {
    expect(stringFormatNumber(1234567)).toBe('1,234,567');
  });

  it('returns string as-is', () => {
    expect(stringFormatNumber('hello')).toBe('hello');
  });

  it('returns falsy value as-is', () => {
    expect(stringFormatNumber(0)).toBe(0);
  });
});

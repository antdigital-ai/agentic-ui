import { describe, expect, it } from 'vitest';
import {
  getDataHash,
  isConfigEqual,
  isNotEmpty,
  parseChineseCurrencyToNumber,
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

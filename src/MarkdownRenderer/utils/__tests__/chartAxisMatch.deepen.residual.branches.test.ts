/**
 * chartAxisMatch deepen residual：空 trim、精确/后缀命中、null/空字段原样返回。
 */
import { describe, expect, it } from 'vitest';
import {
  columnKeyMatchesConfiguredField,
  normalizeChartConfigAxisFields,
  resolveChartAxisFieldToColumnKey,
} from '../chartAxisMatch';

describe('chartAxisMatch deepen residual branches', () => {
  it('空 columnKey / configuredField 返回 false', () => {
    expect(columnKeyMatchesConfiguredField('', 'x')).toBe(false);
    expect(columnKeyMatchesConfiguredField('x', '')).toBe(false);
    expect(columnKeyMatchesConfiguredField('  ', 'x')).toBe(false);
    expect(columnKeyMatchesConfiguredField('x', '  ')).toBe(false);
  });

  it('精确相等与单位后缀命中', () => {
    expect(columnKeyMatchesConfiguredField('客单价', '客单价')).toBe(true);
    expect(columnKeyMatchesConfiguredField('客单价(元)', '客单价')).toBe(true);
    expect(columnKeyMatchesConfiguredField('客单价-元', '客单价')).toBe(false);
  });

  it('resolve：undefined/null/空白原样；精确/模糊/未命中', () => {
    expect(resolveChartAxisFieldToColumnKey(undefined, ['a'])).toBeUndefined();
    expect(resolveChartAxisFieldToColumnKey(null as any, ['a'])).toBeNull();
    expect(resolveChartAxisFieldToColumnKey('  ', ['a'])).toBe('  ');
    expect(resolveChartAxisFieldToColumnKey('时段', ['时段', '值'])).toBe('时段');
    expect(
      resolveChartAxisFieldToColumnKey('客单价', ['客单价(元)', '量']),
    ).toBe('客单价(元)');
    expect(resolveChartAxisFieldToColumnKey('未知', ['a', 'b'])).toBe('未知');
  });

  it('normalizeChartConfigAxisFields 不改无 x/y 字段', () => {
    const cfg = { chartType: 'line' as const };
    expect(normalizeChartConfigAxisFields(cfg as any, ['a'])).toEqual(cfg);
    expect(
      normalizeChartConfigAxisFields(
        { x: '客单价', y: '量' },
        ['客单价(元)', '量'],
      ),
    ).toEqual({ x: '客单价(元)', y: '量' });
  });
});

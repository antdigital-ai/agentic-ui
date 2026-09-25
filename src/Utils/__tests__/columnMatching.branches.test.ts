import { describe, expect, it } from 'vitest';
import { columnKeyMatchesConfiguredField } from '../columnMatching';

describe('columnMatching 分支覆盖', () => {
  it('columnKey / configuredField 为 null 或 undefined 时不命中', () => {
    expect(columnKeyMatchesConfiguredField(null as any, '年份')).toBe(false);
    expect(columnKeyMatchesConfiguredField(undefined as any, '年份')).toBe(
      false,
    );
    expect(columnKeyMatchesConfiguredField('年份', null as any)).toBe(false);
    expect(columnKeyMatchesConfiguredField('年份', undefined as any)).toBe(
      false,
    );
  });
});

describe('columnMatching istanbul residual：trim / 相等命中', () => {
  it('空白与精确匹配', () => {
    expect(columnKeyMatchesConfiguredField('  年份  ', '年份')).toBe(true);
    expect(columnKeyMatchesConfiguredField('年份', ' 年份 ')).toBe(true);
    expect(columnKeyMatchesConfiguredField('a', 'b')).toBe(false);
  });
});

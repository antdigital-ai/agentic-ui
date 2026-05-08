import { describe, expect, it } from 'vitest';
import {
  columnKeyMatchesConfiguredField,
  normalizeChartConfigAxisFields,
  resolveChartAxisFieldToColumnKey,
} from '../../utils/chartAxisMatch';

/**
 * 与 src/MarkdownEditor/editor/parser/parse/parseTable.ts 中
 * 同名函数行为完全对齐（详见 chartAxisMatch.ts 模块注释）。
 *
 * 本测试覆盖：
 * 1. 精确匹配 / 大小写敏感 / 内部空格不忽略
 * 2. 中英文括号单位后缀容忍（核心需求）
 * 3. resolveChartAxisFieldToColumnKey 的空值与未命中边界
 * 4. normalizeChartConfigAxisFields 不修改入参且仅归一化 x/y
 */
describe('columnKeyMatchesConfiguredField', () => {
  it('returns true when both sides equal after trim', () => {
    expect(columnKeyMatchesConfiguredField('value', 'value')).toBe(true);
    expect(columnKeyMatchesConfiguredField('  时段  ', '时段')).toBe(true);
  });

  it('matches column with English parenthesis unit suffix', () => {
    expect(columnKeyMatchesConfiguredField('客单价(元)', '客单价')).toBe(true);
    expect(columnKeyMatchesConfiguredField('销量(万台)', '销量')).toBe(true);
  });

  it('matches column with Chinese parenthesis unit suffix', () => {
    expect(columnKeyMatchesConfiguredField('GDP总量（万亿元）', 'GDP总量')).toBe(
      true,
    );
    expect(columnKeyMatchesConfiguredField('客单价（元）', '客单价')).toBe(
      true,
    );
  });

  it('matches column with multiple parenthesis suffixes', () => {
    expect(
      columnKeyMatchesConfiguredField('销量(万台)(同比)', '销量'),
    ).toBe(true);
    expect(
      columnKeyMatchesConfiguredField('GDP（万亿元）（季调）', 'GDP'),
    ).toBe(true);
  });

  it('rejects when remainder is not a pure parenthesis suffix', () => {
    // 剩余部分不是「全是括号注释」→ 不命中
    expect(columnKeyMatchesConfiguredField('客单价_元', '客单价')).toBe(false);
    expect(columnKeyMatchesConfiguredField('客单价 元', '客单价')).toBe(false);
    expect(columnKeyMatchesConfiguredField('客单价(元) extra', '客单价')).toBe(
      false,
    );
  });

  it('is case sensitive', () => {
    expect(columnKeyMatchesConfiguredField('Value', 'value')).toBe(false);
  });

  it('returns false on empty inputs', () => {
    expect(columnKeyMatchesConfiguredField('', '客单价')).toBe(false);
    expect(columnKeyMatchesConfiguredField('客单价(元)', '')).toBe(false);
    expect(columnKeyMatchesConfiguredField('   ', '客单价')).toBe(false);
  });

  it('does not partial-match when columnKey does not start with configuredField', () => {
    expect(columnKeyMatchesConfiguredField('总客单价(元)', '客单价')).toBe(
      false,
    );
  });
});

describe('resolveChartAxisFieldToColumnKey', () => {
  const columns = ['时段', '客单价(元)', '销量（万台）'];

  it('returns the field as-is when undefined / null', () => {
    expect(resolveChartAxisFieldToColumnKey(undefined, columns)).toBeUndefined();
    expect(
      resolveChartAxisFieldToColumnKey(null as unknown as string, columns),
    ).toBeNull();
  });

  it('returns the field as-is when blank after trim', () => {
    expect(resolveChartAxisFieldToColumnKey('   ', columns)).toBe('   ');
    expect(resolveChartAxisFieldToColumnKey('', columns)).toBe('');
  });

  it('returns the exact match short-circuit', () => {
    expect(resolveChartAxisFieldToColumnKey('时段', columns)).toBe('时段');
    expect(resolveChartAxisFieldToColumnKey('客单价(元)', columns)).toBe(
      '客单价(元)',
    );
  });

  it('resolves logical name to a column with parenthesis unit suffix', () => {
    expect(resolveChartAxisFieldToColumnKey('客单价', columns)).toBe(
      '客单价(元)',
    );
    expect(resolveChartAxisFieldToColumnKey('销量', columns)).toBe('销量（万台）');
  });

  it('returns the original configuredField when no column matches', () => {
    expect(resolveChartAxisFieldToColumnKey('利润', columns)).toBe('利润');
  });

  it('handles empty column list by returning the configured field', () => {
    expect(resolveChartAxisFieldToColumnKey('客单价', [])).toBe('客单价');
  });
});

describe('normalizeChartConfigAxisFields', () => {
  const columns = ['时段', '客单价(元)'];

  it('rewrites x/y while preserving other fields and not mutating input', () => {
    const cfg = {
      chartType: 'line' as const,
      x: '时段',
      y: '客单价',
      title: 'x',
    };
    const out = normalizeChartConfigAxisFields(cfg, columns);

    expect(out).toEqual({
      chartType: 'line',
      x: '时段',
      y: '客单价(元)',
      title: 'x',
    });
    // 不修改入参
    expect(cfg.y).toBe('客单价');
    // 返回的是新对象
    expect(out).not.toBe(cfg);
  });

  it('keeps x/y undefined when configs do not declare them', () => {
    const cfg = { chartType: 'pie' as const };
    const out = normalizeChartConfigAxisFields(cfg, columns);
    expect(out.x).toBeUndefined();
    expect(out.y).toBeUndefined();
    expect(out.chartType).toBe('pie');
  });
});

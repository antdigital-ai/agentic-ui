/**
 * parseTable 分支覆盖：字段规范化、列对齐、预处理、parseTableOrChart 配置来源。
 */
import { describe, expect, it, vi } from 'vitest';
import {
  getColumnAlignment,
  normalizeFieldName,
  parseTableOrChart,
  preprocessMarkdownTableNewlines,
} from '../parse/parseTable';

const parseNodes = vi.fn(() => [{ type: 'paragraph', children: [] }]);

describe('parseTable branches', () => {
  it('normalizeFieldName 转义下划线', () => {
    expect(normalizeFieldName('index\\_value')).toBe('index_value');
    expect(normalizeFieldName('')).toBe('');
  });

  it('getColumnAlignment 数值列右对齐', () => {
    const align = getColumnAlignment(
      [{ a: '10' }, { a: '20' }, { a: '30' }],
      [{ dataIndex: 'a' }],
    );
    expect(align[0]).toBe('right');
  });

  it('getColumnAlignment 空数据返回空数组', () => {
    expect(getColumnAlignment([], [{ dataIndex: 'a' }])).toEqual([]);
  });

  it('getColumnAlignment 不完整数字输入保持 null', () => {
    const align = getColumnAlignment(
      [{ a: '12.' }, { a: '3' }],
      [{ dataIndex: 'a' }],
    );
    expect(align[0]).toBeNull();
  });

  it('getColumnAlignment 非数值列 null', () => {
    const align = getColumnAlignment(
      [{ a: 'foo' }, { a: 'bar' }],
      [{ dataIndex: 'a' }],
    );
    expect(align[0]).toBeNull();
  });

  it('preprocessMarkdownTableNewlines 无表格原样返回', () => {
    expect(preprocessMarkdownTableNewlines('hello')).toBe('hello');
  });

  it('preprocessMarkdownTableNewlines 表格单换行补双换行', () => {
    const md = '| a | b |\n| --- | --- |\n| 1 | 2 |\nnext';
    const out = preprocessMarkdownTableNewlines(md);
    expect(out).toContain('| 1 | 2 |');
  });

  it('preprocessMarkdownTableNewlines 代码块段跳过', () => {
    const md = '```\n| x |\n```\n\n| h |\n| --- |\n| v |';
    expect(preprocessMarkdownTableNewlines(md)).toContain('```');
  });

  it('parseTableOrChart 普通表格产出 table 类型', () => {
    const table = {
      type: 'table',
      children: [
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [{ type: 'text', value: 'Col' }],
            },
          ],
        },
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [{ type: 'text', value: 'Val' }],
            },
          ],
        },
      ],
    } as any;
    const node = parseTableOrChart(
      table,
      { type: 'paragraph' } as any,
      [],
      parseNodes,
    );
    expect(node).toBeDefined();
  });

  it('parseTableOrChart 使用 contextChartConfig 回退', () => {
    const table = {
      type: 'table',
      children: [
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [{ type: 'text', value: 'x' }],
            },
            {
              type: 'tableCell',
              children: [{ type: 'text', value: 'y' }],
            },
          ],
        },
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [{ type: 'text', value: '1' }],
            },
            {
              type: 'tableCell',
              children: [{ type: 'text', value: '2' }],
            },
          ],
        },
      ],
    } as any;
    const node = parseTableOrChart(
      table,
      { type: 'paragraph' } as any,
      [],
      parseNodes,
      undefined,
      { chartType: 'line', x: 'x', y: 'y' },
    );
    expect(node).toBeDefined();
  });
});

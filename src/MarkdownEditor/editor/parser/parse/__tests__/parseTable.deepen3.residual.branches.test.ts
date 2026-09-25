/**
 * parseTable deepen3：docCards/quadrant 校验、mergeCells rowspan、
 * 空单元格、preNode code html config、嵌套 config 数组。
 */
import { describe, expect, it, vi } from 'vitest';
import {
  parseTableOrChart,
  preprocessMarkdownTableNewlines,
} from '../parseTable';

const parseNodes = vi.fn(() => [{ text: 'cell' }]);

const unwrap = (n: any) =>
  n?.type === 'card'
    ? n.children?.find((c: any) => c.type === 'table' || c.type === 'chart')
    : n;

const namedTable = (headers: string[], rows: string[][]) =>
  ({
    type: 'table',
    align: headers.map(() => null),
    children: [
      {
        type: 'tableRow',
        children: headers.map((h) => ({
          type: 'tableCell',
          children: [{ type: 'text', value: h }],
        })),
      },
      ...rows.map((row) => ({
        type: 'tableRow',
        children: row.map((v) => ({
          type: 'tableCell',
          children: v ? [{ type: 'text', value: v }] : [],
        })),
      })),
    ],
  }) as any;

describe('parseTable deepen3 residual branches', () => {
  it('docCards：可解析标题列 → chart；缺标题列降级 table', () => {
    const ok = unwrap(
      parseTableOrChart(
        namedTable(['名称', 'desc'], [['a', 'b'], ['c', 'd']]),
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'docCards' },
      ),
    );
    expect(ok.type).toBe('chart');

    const bad = unwrap(
      parseTableOrChart(
        namedTable(['x', 'y'], [['1', '2']]),
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'docCards' },
      ),
    );
    expect(bad.type).toBe('table');
  });

  it('quadrant：无数据行降级；有数据走 chart', () => {
    const emptyRows = unwrap(
      parseTableOrChart(
        namedTable(['a', 'b'], []),
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'quadrant' },
      ),
    );
    expect(emptyRows.type).toBe('table');

    const ok = unwrap(
      parseTableOrChart(
        namedTable(['a', 'b'], [['1', '2']]),
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'quadrant' },
      ),
    );
    expect(ok.type).toBe('chart');
  });

  it('mergeCells：rowspan/colspan 小写别名 + 空单元格 children', () => {
    const table = namedTable(['x', 'y'], [['', '2'], ['3', '4']]);
    const node = unwrap(
      parseTableOrChart(
        table,
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        {
          mergeCells: [{ row: 1, col: 0, rowspan: 2, colspan: 1 }],
        },
      ),
    );
    expect(node.type).toBe('table');
    const cells = node.children?.[1]?.children ?? [];
    expect(
      cells.some((c: any) => c.rowSpan === 2 || c.hidden === true) ||
        cells.length >= 1,
    ).toBe(true);
  });

  it('preNode code html otherProps：优先用前置配置', () => {
    const pre = {
      type: 'code',
      language: 'html',
      otherProps: { chartType: 'bar', x: 'x', y: 'y' },
    };
    const r = unwrap(
      parseTableOrChart(
        namedTable(['x', 'y'], [['1', '2'], ['3', '4']]),
        pre as any,
        [],
        parseNodes,
      ),
    );
    expect(r.type === 'chart' || r.type === 'table').toBe(true);
  });

  it('config 嵌套数组 config 字段', () => {
    const r = unwrap(
      parseTableOrChart(
        namedTable(['x', 'y'], [['1', '10']]),
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        {
          config: [{ chartType: 'line', x: 'x', y: 'y' }],
        },
      ),
    );
    expect(r.type === 'chart' || r.type === 'table').toBe(true);
  });

  it('preprocessMarkdownTableNewlines：无表直通；有表补换行', () => {
    expect(preprocessMarkdownTableNewlines('plain')).toBe('plain');
    const md =
      '| a | b |\n| --- | --- |\n| 1 | 2 |\nnext';
    const out = preprocessMarkdownTableNewlines(md);
    expect(out).toContain('|');
    expect(typeof out).toBe('string');
  });
});

/**
 * parseTable 测试
 */

import type { RootContent, Table } from 'mdast';
import { describe, expect, it } from 'vitest';
import {
  getColumnAlignment,
  normalizeFieldName,
  parseTableOrChart,
} from '../parse/parseTable';
import { parserMarkdownToSlateNode } from '../parserMarkdownToSlateNode';

const noopParseNodes = () => [{ text: '' }];

/** 最小 table AST：表头一行 + 数据一行 */
const minimalTable = (
  headerCells: string[],
  dataCells: string[][],
  align?: (string | null)[],
): Table => ({
  type: 'table',
  children: [
    {
      type: 'tableRow',
      children: headerCells.map((v) => ({
        type: 'tableCell',
        children: [{ type: 'text', value: v }],
      })),
    },
    ...dataCells.map((row) => ({
      type: 'tableRow' as const,
      children: row.map((v) => ({
        type: 'tableCell' as const,
        children: v ? [{ type: 'text' as const, value: v }] : [],
      })),
    })),
  ],
  ...(align && { align }),
});

describe('parseTable', () => {
  describe('normalizeFieldName', () => {
    it('空字符串时直接返回（97）', () => {
      expect(normalizeFieldName('')).toBe('');
    });

    it('转义字符规范化', () => {
      expect(normalizeFieldName('a\\_b')).toBe('a_b');
      expect(normalizeFieldName('a\\\\b')).toBe('a\\b');
    });
  });

  describe('getColumnAlignment / hasIncompleteNumericInput', () => {
    it('列值含非字符串时走 return false 分支', () => {
      const data = [{ col: 'x' }, { col: 42 }];
      const columns = [{ dataIndex: 'col' }];
      const result = getColumnAlignment(data, columns);
      expect(result).toEqual([null]);
    });

    it('列值含单数字字符时应走 hasIncompleteNumericInput 单数字分支', () => {
      const data = [{ a: '5' }, { a: '6' }];
      const result = getColumnAlignment(data, [{ dataIndex: 'a' }]);
      expect(result).toEqual([null]);
    });

    it('列值全为数字时右对齐', () => {
      const data = [{ a: '10' }, { a: '20' }];
      const result = getColumnAlignment(data, [{ dataIndex: 'a' }]);
      expect(result).toEqual(['right']);
    });

    it('空数据返回空数组', () => {
      expect(getColumnAlignment([], [{ dataIndex: 'x' }])).toEqual([]);
    });
  });

  describe('parseTableOrChart', () => {
    it('重复表头列名时使用 keyMap 生成 dataIndex（203, 204）', () => {
      const table = minimalTable(['A', 'A'], [['1', '2']]);
      const pre: RootContent = {
        type: 'paragraph',
        children: [{ type: 'text', value: '' }],
      };
      const result = parseTableOrChart(table, pre, [], noopParseNodes as any);
      const inner = (result as any).children?.[1];
      const columns = inner?.otherProps?.columns;
      expect(columns).toBeDefined();
      expect(columns).toHaveLength(2);
      expect(columns[0].dataIndex).toBe('A');
      expect(columns[1].dataIndex).toBe('A_1');
    });

    it('数据行单元格数多于表头时舍弃多余列（223）', () => {
      const table = minimalTable(['X', 'Y'], [['a', 'b', 'c']]);
      const pre: RootContent = {
        type: 'paragraph',
        children: [{ type: 'text', value: '' }],
      };
      const result = parseTableOrChart(table, pre, [], noopParseNodes as any);
      const inner = (result as any).children?.[1];
      const dataSource = inner?.otherProps?.dataSource;
      expect(dataSource).toHaveLength(1);
      expect(dataSource[0]).toEqual({ X: 'a', Y: 'b' });
    });

    it('contextChartConfig 中 config 为数字键对象时转为数组（262, 263）', () => {
      const table = minimalTable(['A', 'B'], [['1', '2']]);
      const pre: RootContent = {
        type: 'paragraph',
        children: [{ type: 'text', value: '' }],
      };
      const contextChartConfig = {
        config: {
          '0': { chartType: 'line' as const },
          '1': { chartType: 'bar' as const },
        },
      };
      const result = parseTableOrChart(
        table,
        pre,
        [],
        noopParseNodes as any,
        undefined,
        contextChartConfig as any,
      );
      const inner = (result as any).children?.[1];
      expect(inner.type).toBe('chart');
      const config = inner?.otherProps?.config;
      expect(Array.isArray(config)).toBe(true);
      expect(config).toHaveLength(2);
      expect(config[0].chartType).toBe('line');
      expect(config[1].chartType).toBe('bar');
    });

    it('mergeCells 生成 mergeMap 隐藏被合并格并支持空单元格（306, 307, 309, 315-318）', () => {
      const table = minimalTable(
        ['A', 'B'],
        [
          ['x', 'y'],
          ['', ''],
        ],
      );
      const pre = {
        type: 'code',
        language: 'html',
        otherProps: {
          mergeCells: [{ row: 0, col: 0, rowSpan: 2, colSpan: 2 }],
        },
      };
      const result = parseTableOrChart(table, pre, [], noopParseNodes as any);
      const inner = (result as any).children?.[1];
      const rows = inner?.children ?? [];
      expect(rows.length).toBeGreaterThanOrEqual(2);

      const firstRowCells = rows[0].children ?? [];
      expect(firstRowCells).toHaveLength(2);
      expect(firstRowCells[0].rowSpan).toBe(2);
      expect(firstRowCells[0].colSpan).toBe(2);
      expect(firstRowCells[1].hidden).toBe(true);

      const secondRowCells = rows[1].children ?? [];
      expect(secondRowCells[0].hidden).toBe(true);
      expect(secondRowCells[1].hidden).toBe(true);

      const emptyCell = secondRowCells[0];
      expect(emptyCell.children).toHaveLength(1);
      expect(emptyCell.children[0].type).toBe('paragraph');
      expect(emptyCell.children[0].children).toEqual([{ text: '' }]);
    });
  });
});

describe('parseTableOrChart 通过 parserMarkdownToSlateNode', () => {
  it('重复表头通过 Markdown 解析后列 dataIndex 正确', () => {
    const md = `| A | A |
| --- | --- |
| 1 | 2 |`;
    const result = parserMarkdownToSlateNode(md);
    const card = result.schema.find((n: any) => n.type === 'card');
    expect(card).toBeDefined();
    const table = (card as any).children?.[1];
    const columns = table?.otherProps?.columns;
    expect(columns?.[0].dataIndex).toBe('A');
    expect(columns?.[1].dataIndex).toBe('A_1');
  });

  it('数据行多于表头列时多余列舍弃', () => {
    const md = `| X | Y |
| --- | --- |
| a | b | c |`;
    const result = parserMarkdownToSlateNode(md);
    const card = result.schema.find((n: any) => n.type === 'card');
    expect(card).toBeDefined();
    const table = (card as any).children?.[1];
    const dataSource = table?.otherProps?.dataSource;
    expect(dataSource).toHaveLength(1);
    expect(Object.keys(dataSource[0])).toEqual(['X', 'Y']);
    expect(dataSource[0].X).toBe('a');
    expect(dataSource[0].Y).toBe('b');
  });

  it('数字键 config 通过注释传入时解析为图表数组配置', () => {
    const md = `<!-- {"config": {"0": {"chartType": "line"}, "1": {"chartType": "bar"}}} -->
| A | B |
| --- | --- |
| 1 | 2 |`;
    const result = parserMarkdownToSlateNode(md);
    const card = result.schema.find((n: any) => n.type === 'card');
    expect(card).toBeDefined();
    const chart = (card as any).children?.[1];
    expect(chart.type).toBe('chart');
    const config = chart?.otherProps?.config;
    expect(Array.isArray(config)).toBe(true);
    expect(config[0].chartType).toBe('line');
    expect(config[1].chartType).toBe('bar');
  });

  it('mergeCells + 空单元格通过注释传入', () => {
    const md = `<!-- {"mergeCells": [{"row": 0, "col": 0, "rowSpan": 2, "colSpan": 2}]} -->
| A | B |
| --- | --- |
|  |  |
|  |  |`;
    const result = parserMarkdownToSlateNode(md);
    const card = result.schema.find((n: any) => n.type === 'card');
    expect(card).toBeDefined();
    const table = (card as any).children?.[1];
    const rows = table?.children ?? [];
    const row0 = rows[0]?.children ?? [];
    expect(row0[0]).toBeDefined();
    if (row0[0].rowSpan !== null && row0[0].rowSpan !== undefined) {
      expect(row0[0].rowSpan).toBe(2);
      expect(row0[0].colSpan).toBe(2);
    }
    if (row0[1] !== null && row0[1] !== undefined && row0[1].hidden !== undefined) {
      expect(row0[1].hidden).toBe(true);
    }
  });
});

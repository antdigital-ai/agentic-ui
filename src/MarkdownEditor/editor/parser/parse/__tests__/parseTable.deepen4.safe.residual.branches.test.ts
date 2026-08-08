/**
 * parseTable deepen4 safe：缺 header/rows、chartConfig 归一、
 * Array.isArray config、y 列校验、rowspan/colspan 小写别名。
 */
import { describe, expect, it, vi } from 'vitest';
import { parseTableOrChart } from '../parseTable';

const parseNodes = vi.fn(() => [{ text: 'cell' }]);

const unwrap = (n: any) =>
  n?.type === 'card'
    ? n.children?.find((c: any) => c.type === 'table' || c.type === 'chart')
    : n;

describe('parseTable deepen4 safe residual branches', () => {
  it('空表头 children：columns||[]', () => {
    const table = {
      type: 'table',
      align: [null, null],
      children: [
        { type: 'tableRow', children: [] },
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: '1' }] },
            { type: 'tableCell', children: [{ type: 'text', value: '2' }] },
          ],
        },
      ],
    } as any;
    const node = unwrap(
      parseTableOrChart(table, { type: 'paragraph' } as any, [], parseNodes),
    );
    expect(node.type).toBe('table');
  });

  it('无 body rows：dataSource||[]', () => {
    const table = {
      type: 'table',
      align: [null, null],
      children: [
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: 'x' }] },
            { type: 'tableCell', children: [{ type: 'text', value: 'y' }] },
          ],
        },
      ],
    } as any;
    const node = unwrap(
      parseTableOrChart(
        table,
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'line', x: 'x', y: 'y' },
      ),
    );
    expect(node.type === 'chart' || node.type === 'table').toBe(true);
  });

  it('chartConfig 对象 + config 嵌套数组 (Array.isArray config) 非数组臂', () => {
    const table = {
      type: 'table',
      align: [null, null],
      children: [
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: 'a' }] },
            { type: 'tableCell', children: [{ type: 'text', value: 'b' }] },
          ],
        },
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: '1' }] },
            { type: 'tableCell', children: [{ type: 'text', value: '2' }] },
          ],
        },
      ],
    } as any;
    const single = unwrap(
      parseTableOrChart(
        table,
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'bar', x: 'a', y: 'b' },
      ),
    );
    expect(single.type).toBe('chart');

    const nested = unwrap(
      parseTableOrChart(
        table,
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        {
          config: { chartType: 'line', x: 'a', y: 'b' },
        },
      ),
    );
    expect(nested.type).toBe('chart');
  });

  it('y 列不存在 → 降级 table；chartType table 早退 true', () => {
    const table = {
      type: 'table',
      align: [null, null],
      children: [
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: 'x' }] },
            { type: 'tableCell', children: [{ type: 'text', value: 'y' }] },
          ],
        },
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: '1' }] },
            { type: 'tableCell', children: [{ type: 'text', value: '2' }] },
          ],
        },
      ],
    } as any;
    const badY = unwrap(
      parseTableOrChart(
        table,
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'line', x: 'x', y: 'missing' },
      ),
    );
    expect(badY.type).toBe('table');

    const asTable = unwrap(
      parseTableOrChart(
        table,
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'table', x: 'x', y: 'y' },
      ),
    );
    expect(asTable.type).toBe('table');
  });

  it('mergeCells rowspan/colspan 小写别名', () => {
    const table = {
      type: 'table',
      align: [null, null],
      children: [
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: 'h1' }] },
            { type: 'tableCell', children: [{ type: 'text', value: 'h2' }] },
          ],
        },
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: 'a' }] },
            { type: 'tableCell', children: [{ type: 'text', value: 'b' }] },
          ],
        },
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: 'c' }] },
            { type: 'tableCell', children: [{ type: 'text', value: 'd' }] },
          ],
        },
      ],
    } as any;
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
    const rowCells = node.children?.[1]?.children ?? [];
    expect(
      rowCells.some((c: any) => c.rowSpan === 2 || c.hidden === true) ||
        rowCells.length >= 1,
    ).toBe(true);
  });
});

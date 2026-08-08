/**
 * parseTable deepen2：config.at chartType、cfg 空/缺列降级、
 * rowspan/colspan 回退。
 */
import { describe, expect, it, vi } from 'vitest';
import { parseTableOrChart } from '../parseTable';

const parseNodes = vi.fn(() => [{ type: 'paragraph', children: [] }]);

const twoColTable = () =>
  ({
    type: 'table',
    align: ['left', 'left'],
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
          {
            type: 'tableCell',
            rowspan: 2,
            children: [{ type: 'text', value: '1' }],
          },
          {
            type: 'tableCell',
            colspan: 1,
            children: [{ type: 'text', value: '2' }],
          },
        ],
      },
    ],
  }) as any;

const unwrap = (n: any) =>
  n?.type === 'card'
    ? n.children?.find((c: any) => c.type === 'table' || c.type === 'chart')
    : n;

describe('parseTable deepen2 residual branches', () => {
  it('chartType=table 与非法 x/y 降级', () => {
    const asTable = unwrap(
      parseTableOrChart(
        twoColTable(),
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'table', x: 'x', y: 'y' },
      ),
    );
    expect(asTable.type).toBe('table');

    const invalid = unwrap(
      parseTableOrChart(
        twoColTable(),
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'bar', x: 'missing', y: 'also-missing' },
      ),
    );
    expect(invalid.type).toBe('table');
  });

  it('config 数组 + 缺 y 列；rowspan 路径', () => {
    const r = unwrap(
      parseTableOrChart(
        twoColTable(),
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        [{ chartType: 'line', x: 'x', y: 'nope' }] as any,
      ),
    );
    expect(r.type).toBe('table');
  });

  it('空表头仍可解析', () => {
    const emptyHeader = {
      type: 'table',
      children: [
        { type: 'tableRow', children: [] },
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: '1' }] },
          ],
        },
      ],
    } as any;
    expect(() =>
      parseTableOrChart(
        emptyHeader,
        { type: 'paragraph' } as any,
        [],
        parseNodes,
      ),
    ).not.toThrow();
  });
});

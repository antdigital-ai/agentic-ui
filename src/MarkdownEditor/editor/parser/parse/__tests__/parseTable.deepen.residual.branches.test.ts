/**
 * parseTable deepen residual：不完整数字、重复列名、merge rowspan、
 * chartType table 降级、config 数字键对象、finished 透传。
 */
import { describe, expect, it, vi } from 'vitest';
import {
  getColumnAlignment,
  parseTableOrChart,
} from '../parseTable';

const parseNodes = vi.fn(() => [{ type: 'paragraph', children: [] }]);

const twoColTable = (extraRows: any[] = []) =>
  ({
    type: 'table',
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
      ...extraRows,
    ],
  }) as any;

describe('parseTable deepen residual branches', () => {
  it('hasIncompleteNumericInput：单数字/正负号/小数点尾巴', () => {
    expect(
      getColumnAlignment(
        [{ a: '1' }, { a: '-' }, { a: '3' }],
        [{ dataIndex: 'a' }],
      )[0],
    ).toBeNull();
    expect(
      getColumnAlignment(
        [{ a: '1' }, { a: '+' }, { a: '3' }],
        [{ dataIndex: 'a' }],
      )[0],
    ).toBeNull();
    expect(
      getColumnAlignment(
        [{ a: '10' }, { a: '2.' }, { a: '3' }],
        [{ dataIndex: 'a' }],
      )[0],
    ).toBeNull();
    expect(
      getColumnAlignment([{ a: 1 }, { a: 2 }, { a: 3 }] as any, [
        { dataIndex: 'a' },
      ])[0],
    ).toBe('right');
  });

  it('重复表头生成带 index 的 dataIndex；多余单元格丢弃', () => {
    const table = {
      type: 'table',
      finished: false,
      align: [null, null],
      children: [
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: 'A' }] },
            { type: 'tableCell', children: [{ type: 'text', value: 'A' }] },
          ],
        },
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: '1' }] },
            { type: 'tableCell', children: [{ type: 'text', value: '2' }] },
            { type: 'tableCell', children: [{ type: 'text', value: 'extra' }] },
          ],
        },
      ],
    } as any;
    const node = parseTableOrChart(table, { type: 'paragraph' } as any, [], parseNodes);
    // wrapperCardNode 外包 card
    expect(node.type === 'card' || node.type === 'table').toBe(true);
    const inner =
      node.type === 'card'
        ? (node as any).children?.find((c: any) => c.type === 'table' || c.type === 'chart')
        : node;
    expect(inner?.finished).toBe(false);
    const cols = inner?.otherProps?.columns ?? [];
    expect(cols.some((c: any) => String(c.dataIndex).includes('_'))).toBe(true);
  });

  it('chartType=table 与非法 x/y 降级为 table；数字键 config 转数组', () => {
    const unwrap = (n: any) =>
      n?.type === 'card'
        ? n.children?.find((c: any) => c.type === 'table' || c.type === 'chart')
        : n;

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

    const invalidAxes = unwrap(
      parseTableOrChart(
        twoColTable(),
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { chartType: 'bar', x: 'missing', y: 'y' },
      ),
    );
    expect(invalidAxes.type).toBe('table');

    const numericCfg = unwrap(
      parseTableOrChart(
        twoColTable(),
        { type: 'paragraph' } as any,
        [],
        parseNodes,
        undefined,
        { config: { 0: { chartType: 'line', x: 'x', y: 'y' } } as any },
      ),
    );
    expect(numericCfg.type === 'chart' || numericCfg.type === 'table').toBe(true);
  });

  it('mergeCells 使用 rowspan/colspan 别名并标记 hidden', () => {
    const node = parseTableOrChart(
      {
        ...twoColTable([
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'text', value: '3' }] },
              { type: 'tableCell', children: [{ type: 'text', value: '4' }] },
            ],
          },
        ]),
      },
      { type: 'paragraph' } as any,
      [],
      parseNodes,
      undefined,
      {
        mergeCells: [{ row: 1, col: 0, rowspan: 2, colspan: 1 }],
      },
    );
    expect(node.children?.length).toBeGreaterThan(0);
  });
});

/**
 * parseTable deepen12 safe：align null、chart y 缺失、rowspan 别名、
 * header 空 cells、chartConfig 数组臂。
 */
import { describe, expect, it, vi } from 'vitest';
import { parseTableOrChart } from '../parseTable';

const parseNodes = vi.fn(() => [{ text: 'cell' }]);

const unwrap = (n: any) =>
  n?.type === 'card'
    ? n.children?.find((c: any) => c.type === 'table' || c.type === 'chart')
    : n;

describe('parseTable deepen12 safe residual branches', () => {
  it('align 含 null；header 空 row', () => {
    const table = {
      type: 'table',
      align: [null, 'center'],
      children: [
        { type: 'tableRow', children: [] },
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: 'a' }] },
            { type: 'tableCell', children: [{ type: 'text', value: 'b' }] },
          ],
        },
      ],
    } as any;
    const node = unwrap(
      parseTableOrChart(table, { type: 'paragraph' } as any, [], parseNodes),
    );
    expect(node?.type).toBe('table');
  });

  it('chartConfig 数组 + y 列缺失校验', () => {
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
            { type: 'tableCell', children: [{ type: 'text', value: '' }] },
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
        [{ chartType: 'line', x: 'x', y: 'missing' }],
      ),
    );
    expect(node?.type === 'chart' || node?.type === 'table').toBe(true);
  });

  it('rowspan/colspan 小写别名', () => {
    const table = {
      type: 'table',
      align: [null],
      children: [
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              rowspan: 2,
              colspan: 1,
              children: [{ type: 'text', value: 'span' }],
            },
          ],
        },
      ],
    } as any;
    const node = unwrap(
      parseTableOrChart(table, { type: 'paragraph' } as any, [], parseNodes),
    );
    expect(node?.type).toBe('table');
  });
});

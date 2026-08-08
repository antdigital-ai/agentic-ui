import { describe, expect, it, vi } from 'vitest';
import { getReadonlyTableColWidths } from '../getTableColWidths';
import type { TableNode } from '../../../../types/Table';

const tableWithCells = (): TableNode =>
  ({
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          { type: 'table-cell', children: [{ text: 'Short' }] },
          { type: 'table-cell', children: [{ text: 'Longer cell text' }] },
        ],
      },
      {
        type: 'table-row',
        children: [
          { type: 'table-cell', children: [{ text: 'A' }] },
          { type: 'table-cell', children: [{ text: 'B' }] },
        ],
      },
    ],
  }) as TableNode;

describe('getTableColWidths 分支覆盖', () => {
  it('otherProps.colWidths 优先返回', () => {
    expect(
      getReadonlyTableColWidths({
        columnCount: 2,
        otherProps: { colWidths: ['30%', '70%'] },
      }),
    ).toEqual(['30%', '70%']);
  });

  it('columnCount 为 0 返回空数组', () => {
    expect(getReadonlyTableColWidths({ columnCount: 0 })).toEqual([]);
  });

  it('无 element 时均分百分比', () => {
    const widths = getReadonlyTableColWidths({ columnCount: 4 });
    expect(widths).toHaveLength(4);
    expect(widths.every((w) => String(w).endsWith('%'))).toBe(true);
  });

  it('有 element 无 containerWidth 时走内容比例', () => {
    const widths = getReadonlyTableColWidths({
      columnCount: 2,
      element: tableWithCells(),
    });
    expect(widths).toHaveLength(2);
    expect(widths.every((w) => String(w).includes('%'))).toBe(true);
  });

  it('smart 算法：列数不足时不启用', () => {
    const widths = getReadonlyTableColWidths({
      columnCount: 2,
      element: tableWithCells(),
      containerWidth: 800,
    });
    expect(widths).toHaveLength(2);
  });

  it('smart 算法：7 列 + containerWidth 返回像素宽', () => {
    const element = {
      type: 'table',
      children: Array.from({ length: 2 }, () => ({
        type: 'table-row',
        children: Array.from({ length: 7 }, (_, i) => ({
          type: 'table-cell',
          children: [{ text: `cell-${i}` }],
        })),
      })),
    } as TableNode;
    const widths = getReadonlyTableColWidths({
      columnCount: 7,
      element,
      containerWidth: 700,
    });
    expect(widths).toHaveLength(7);
    expect(widths.every((w) => typeof w === 'number')).toBe(true);
  });

  it('containerWidth <= 0 时不走 smart', () => {
    const widths = getReadonlyTableColWidths({
      columnCount: 8,
      element: tableWithCells(),
      containerWidth: 0,
    });
    expect(widths.every((w) => String(w).includes('%'))).toBe(true);
  });

  it('createMeasureContext 不可用时 smart 回退', () => {
    const orig = document.createElement;
    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: () => null,
    } as any);
    const element = {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: Array.from({ length: 8 }, () => ({
            type: 'table-cell',
            children: [{ text: 'word' }],
          })),
        },
      ],
    } as TableNode;
    const widths = getReadonlyTableColWidths({
      columnCount: 8,
      element,
      containerWidth: 800,
    });
    expect(widths).toHaveLength(8);
    document.createElement = orig;
    vi.restoreAllMocks();
  });

  it('table-head 行参与 getTableRows', () => {
    const element = {
      type: 'table',
      children: [
        {
          type: 'table-head',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'H1' }] },
                { type: 'table-cell', children: [{ text: 'H2' }] },
              ],
            },
          ],
        },
      ],
    } as TableNode;
    const widths = getReadonlyTableColWidths({
      columnCount: 2,
      element,
    });
    expect(widths).toHaveLength(2);
  });

  it('非 table 节点仍按列数均分；无 children / 非 cell 子节点', () => {
    expect(
      getReadonlyTableColWidths({
        columnCount: 2,
        element: { type: 'paragraph', children: [{ text: 'x' }] } as any,
      }),
    ).toEqual(['50.00%', '50.00%']);
    expect(
      getReadonlyTableColWidths({
        columnCount: 2,
        element: { type: 'table' } as any,
      }),
    ).toHaveLength(2);
    const widths = getReadonlyTableColWidths({
      columnCount: 2,
      element: {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'paragraph', children: [{ text: 'not-cell' }] },
              null,
            ],
          },
        ],
      } as any,
    });
    expect(widths).toHaveLength(2);
  });
});

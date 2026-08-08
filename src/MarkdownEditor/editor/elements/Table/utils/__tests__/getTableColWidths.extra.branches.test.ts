import { describe, expect, it } from 'vitest';
import type { TableNode } from '../../../../types/Table';
import { getReadonlyTableColWidths } from '../getTableColWidths';

describe('getTableColWidths 额外分支', () => {
  it('smart：极窄容器走 totalMin >= containerWidth', () => {
    const element = {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: Array.from({ length: 6 }, (_, i) => ({
            type: 'table-cell',
            children: [{ text: `verylongword${i}` }],
          })),
        },
      ],
    } as TableNode;
    const widths = getReadonlyTableColWidths({
      columnCount: 6,
      element,
      containerWidth: 40,
    });
    expect(widths).toHaveLength(6);
    expect(widths.every((w) => typeof w === 'number')).toBe(true);
  });

  it('空 grid / 无行时 smart 回退内容或均分', () => {
    const empty = {
      type: 'table',
      children: [{ type: 'paragraph', children: [{ text: 'x' }] }],
    } as TableNode;
    const widths = getReadonlyTableColWidths({
      columnCount: 6,
      element: empty,
      containerWidth: 600,
    });
    expect(widths).toHaveLength(6);
  });

  it('单元格缺 children 时内容宽走默认', () => {
    const element = {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell' },
            { type: 'table-cell', children: [{ text: 'ok' }] },
          ],
        },
      ],
    } as TableNode;
    const widths = getReadonlyTableColWidths({
      columnCount: 2,
      element,
    });
    expect(widths).toHaveLength(2);
    expect(widths.every((w) => String(w).includes('%'))).toBe(true);
  });

  it('非 table-row 且无 children 的节点被跳过', () => {
    const element = {
      type: 'table',
      children: [
        { type: 'weird' },
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'a' }] },
            { type: 'table-cell', children: [{ text: 'b' }] },
          ],
        },
      ],
    } as TableNode;
    expect(
      getReadonlyTableColWidths({ columnCount: 2, element }),
    ).toHaveLength(2);
  });
});

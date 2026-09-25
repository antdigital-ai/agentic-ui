/**
 * getTableColWidths deepen：null 文本度量、缺列、px 总和为 0。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TableNode } from '../../../../types/Table';
import { getReadonlyTableColWidths } from '../getTableColWidths';

describe('getTableColWidths deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('短行缺列时 row[col] 走空串；宽容器 smart 分配', () => {
    const element = {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'a b c' }] },
            { type: 'table-cell', children: [{ text: 'x' }] },
          ],
        },
        {
          type: 'table-row',
          children: [{ type: 'table-cell', children: [{ text: 'only' }] }],
        },
      ],
    } as TableNode;

    const widths = getReadonlyTableColWidths({
      columnCount: 6,
      element,
      containerWidth: 900,
    });
    expect(widths).toHaveLength(6);
  });

  it('内容宽路径百分比格式', () => {
    const element = {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'aa' }] },
            { type: 'table-cell', children: [{ text: 'bb' }] },
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

  it('document 不可用时 smart 回退内容比例', () => {
    const original = globalThis.document;
    // @ts-expect-error intentional SSR branch
    delete globalThis.document;
    try {
      const element = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: Array.from({ length: 6 }, (_, i) => ({
              type: 'table-cell',
              children: [{ text: `c${i}` }],
            })),
          },
        ],
      } as TableNode;
      const widths = getReadonlyTableColWidths({
        columnCount: 6,
        element,
        containerWidth: 800,
      });
      expect(widths).toHaveLength(6);
    } finally {
      globalThis.document = original;
    }
  });
});

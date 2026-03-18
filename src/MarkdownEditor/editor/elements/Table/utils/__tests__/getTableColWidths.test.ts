import { describe, expect, it, vi } from 'vitest';
import type { TableNode } from '../../../../types/Table';
import { getReadonlyTableColWidths } from '../getTableColWidths';

/** 构造仅一行的简单表格节点，用于按内容宽度测试 */
function tableWithOneRow(cellTexts: string[]): TableNode {
  return {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: cellTexts.map((text) => ({
          type: 'table-cell' as const,
          children: [{ text }],
        })),
      },
    ],
  };
}

describe('getReadonlyTableColWidths', () => {
  it('显式传入 colWidths 时返回该值', () => {
    const result = getReadonlyTableColWidths({
      columnCount: 3,
      otherProps: { colWidths: [100, 150, 200] },
    });
    expect(result).toEqual([100, 150, 200]);
  });

  it('colWidths 为空数组时回退到百分比平分', () => {
    const result = getReadonlyTableColWidths({
      columnCount: 6,
      otherProps: { colWidths: [] },
    });
    expect(result).toEqual(Array(6).fill('16.67%'));
  });

  it('columnCount 为 0 时返回空数组', () => {
    const result = getReadonlyTableColWidths({
      columnCount: 0,
      otherProps: {},
    });
    expect(result).toEqual([]);
  });

  it('任意列数无显式 colWidths 时返回百分比平分', () => {
    expect(
      getReadonlyTableColWidths({ columnCount: 1, otherProps: {} }),
    ).toEqual(['100.00%']);
    expect(
      getReadonlyTableColWidths({ columnCount: 2, otherProps: {} }),
    ).toEqual(['50.00%', '50.00%']);
    expect(
      getReadonlyTableColWidths({ columnCount: 3, otherProps: {} }),
    ).toEqual(['33.33%', '33.33%', '33.33%']);
    expect(
      getReadonlyTableColWidths({ columnCount: 4, otherProps: {} }),
    ).toEqual(['25.00%', '25.00%', '25.00%', '25.00%']);
    expect(
      getReadonlyTableColWidths({ columnCount: 5, otherProps: {} }),
    ).toEqual(Array(5).fill('20.00%'));
    expect(
      getReadonlyTableColWidths({ columnCount: 6, otherProps: undefined }),
    ).toEqual(Array(6).fill('16.67%'));
  });

  it('传入 element 时按 string-width 计算内容宽度并归一化为百分比', () => {
    const element = tableWithOneRow(['a', 'hello world']);
    const result = getReadonlyTableColWidths({
      columnCount: 2,
      otherProps: {},
      element,
    });
    expect(result).toHaveLength(2);
    expect(result.every((r) => typeof r === 'string' && r.endsWith('%'))).toBe(
      true,
    );
    const [p0, p1] = result.map((r) =>
      parseFloat((r as string).replace('%', '')),
    );
    expect(p0 + p1).toBeCloseTo(100, 1);
    expect(p1).toBeGreaterThan(p0);
  });

  it('列数 > 5 且传入 element 与 containerWidth 时返回 px 列宽数组', () => {
    const rows = Array.from({ length: 6 }, (_, i) =>
      Array.from({ length: 6 }, (_, j) => `c${i}-${j}`),
    );
    const element: TableNode = {
      type: 'table',
      children: rows.map((cells) => ({
        type: 'table-row',
        children: cells.map((text) => ({
          type: 'table-cell',
          children: [{ text }],
        })),
      })),
    };
    const result = getReadonlyTableColWidths({
      columnCount: 6,
      otherProps: {},
      element,
      containerWidth: 800,
    });
    expect(result).toHaveLength(6);
    expect(result.every((r) => typeof r === 'number')).toBe(true);
    const total = (result as number[]).reduce((a, b) => a + b, 0);
    expect(total).toBeLessThanOrEqual(800 + 6);
    expect(total).toBeGreaterThan(0);
  });

  it('列数 ≤ 5 时即使传入 containerWidth 仍使用百分比（智能算法不启用）', () => {
    const element = tableWithOneRow(['a', 'b', 'c', 'd']);
    const result = getReadonlyTableColWidths({
      columnCount: 4,
      otherProps: {},
      element,
      containerWidth: 600,
    });
    expect(result).toHaveLength(4);
    expect(result.every((r) => typeof r === 'string' && r.endsWith('%'))).toBe(
      true,
    );
  });
});

/** 构造 6 列表格：id, name, info, tag, date, action，用于 SmartTableScouter 行为测试 */
function tableWithSixColumns(
  rows: Array<[string, string, string, string, string, string]>,
): TableNode {
  return {
    type: 'table',
    children: rows.map((cells) => ({
      type: 'table-row',
      children: cells.map((text) => ({
        type: 'table-cell',
        children: [{ text }],
      })),
    })),
  };
}

describe('SmartTableScouter', () => {
  const mockRow: [string, string, string, string, string, string] = [
    '1',
    'Standard Name',
    'Very long content that should take up more space in the table layout',
    'Tag',
    '2023-10-01',
    'Edit/Delete',
  ];
  const mockData = Array(10).fill(mockRow) as Array<typeof mockRow>;

  it('should return percent when columns <= 5 (smart algorithm not applied)', () => {
    const smallData = tableWithOneRow(['a', 'b', 'c']);
    const result = getReadonlyTableColWidths({
      columnCount: 3,
      otherProps: {},
      element: smallData,
      containerWidth: 1000,
    });
    expect(result).toHaveLength(3);
    expect(
      result.every((r) => typeof r === 'string' && (r as string).endsWith('%')),
    ).toBe(true);
  });

  it('should give more space to "info" column than "id" column', () => {
    const createFakeCanvasContext = () => ({
      font: '14px sans-serif',
      measureText: (text: string) => ({ width: text.length * 8 }),
    });
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string) => {
        if (tagName === 'canvas') {
          return {
            getContext: () => createFakeCanvasContext(),
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tagName);
      },
    );

    const element = tableWithSixColumns(mockData);
    const result = getReadonlyTableColWidths({
      columnCount: 6,
      otherProps: {},
      element,
      containerWidth: 1200,
    });
    expect(result).toHaveLength(6);
    expect(result.every((r) => typeof r === 'number')).toBe(true);
    const widths = result as number[];
    const idWidth = widths[0];
    const infoWidth = widths[2];
    expect(infoWidth).toBeGreaterThan(idWidth * 2);
  });
});

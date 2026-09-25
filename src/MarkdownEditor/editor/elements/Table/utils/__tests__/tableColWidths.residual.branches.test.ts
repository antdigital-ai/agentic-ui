/**
 * editableTableWidth / getTableColWidths residual：% 解析、readonly、列数不足。
 */
import { describe, expect, it } from 'vitest';
import { getEditableTableColWidths } from '../editableTableWidth';
import { getReadonlyTableColWidths } from '../getTableColWidths';
import type { TableNode } from '../../../../types/Table';

const row = (n: number, text = 'c') => ({
  type: 'table-row' as const,
  children: Array.from({ length: n }, () => ({
    type: 'table-cell' as const,
    children: [{ text }],
  })),
});

describe('table col width residual branches', () => {
  it('getEditable：readonly / 无 children / 列数不足返回 []', () => {
    const element = {
      type: 'table',
      children: [row(2)],
    } as TableNode;
    expect(
      getEditableTableColWidths({
        readonly: true,
        columnCount: 2,
        availableTableWidth: 400,
        mobileBreakpointValue: 768,
        element,
      }),
    ).toEqual([]);
    expect(
      getEditableTableColWidths({
        readonly: false,
        columnCount: 2,
        availableTableWidth: 400,
        mobileBreakpointValue: 768,
        element: { type: 'table', children: [] } as any,
      }),
    ).toEqual([]);
    expect(
      getEditableTableColWidths({
        readonly: false,
        columnCount: 1,
        availableTableWidth: 400,
        mobileBreakpointValue: 768,
        element,
      }),
    ).toEqual([]);
  });

  it('显式 colWidths：数字 / % / 非法串回退', () => {
    const element = {
      type: 'table',
      otherProps: { colWidths: [120, '50%', 'bad', undefined] },
      children: [row(4)],
    } as any;
    const widths = getEditableTableColWidths({
      readonly: false,
      columnCount: 4,
      availableTableWidth: 400,
      mobileBreakpointValue: 768,
      element,
    });
    expect(widths).toHaveLength(4);
    expect(widths[0]).toBe(120);
    expect(widths[1]).toBe(200);
    expect(widths.every((w) => typeof w === 'number' && w >= 1)).toBe(true);
  });

  it('无显式宽：移动布局 vs 桌面', () => {
    const element = {
      type: 'table',
      children: [row(3, 'hello world')],
    } as TableNode;
    const mobile = getEditableTableColWidths({
      readonly: false,
      columnCount: 3,
      availableTableWidth: 320,
      mobileBreakpointValue: 768,
      element,
    });
    const desktop = getEditableTableColWidths({
      readonly: false,
      columnCount: 3,
      availableTableWidth: 1200,
      mobileBreakpointValue: 768,
      element,
    });
    expect(mobile).toHaveLength(3);
    expect(desktop).toHaveLength(3);
  });

  it('getReadonly：thead 包裹行仍可采样', () => {
    const element = {
      type: 'table',
      children: [
        {
          type: 'table-head',
          children: [row(2, 'H')],
        },
        row(2, 'B'),
      ],
    } as any;
    const widths = getReadonlyTableColWidths({
      columnCount: 2,
      element,
      containerWidth: 500,
    });
    expect(widths).toHaveLength(2);
  });
});

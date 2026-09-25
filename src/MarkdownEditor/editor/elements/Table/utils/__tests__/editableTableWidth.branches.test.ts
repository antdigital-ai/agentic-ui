import { describe, expect, it } from 'vitest';
import type { TableNode } from '../../../../types/Table';
import {
  getEditableTableColWidths,
  getEditableTableMinWidth,
} from '../editableTableWidth';

const tableElement = (colWidths?: Array<number | string>): TableNode =>
  ({
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          { type: 'table-cell', children: [{ text: 'a' }] },
          { type: 'table-cell', children: [{ text: 'b' }] },
          { type: 'table-cell', children: [{ text: 'c' }] },
        ],
      },
    ],
    ...(colWidths
      ? { otherProps: { colWidths } }
      : {}),
  }) as TableNode;

describe('editableTableWidth 分支覆盖', () => {
  describe('getEditableTableColWidths', () => {
    it('readonly 返回空数组', () => {
      expect(
        getEditableTableColWidths({
          readonly: true,
          columnCount: 3,
          availableTableWidth: 600,
          mobileBreakpointValue: 768,
          element: tableElement(),
        }),
      ).toEqual([]);
    });

    it('无 children 或列数不足返回空数组', () => {
      expect(
        getEditableTableColWidths({
          readonly: false,
          columnCount: 3,
          availableTableWidth: 600,
          mobileBreakpointValue: 768,
          element: { type: 'table', children: [] } as TableNode,
        }),
      ).toEqual([]);
      expect(
        getEditableTableColWidths({
          readonly: false,
          columnCount: 2,
          availableTableWidth: 600,
          mobileBreakpointValue: 768,
          element: tableElement(),
        }),
      ).toEqual([]);
    });

    it('显式 colWidths：数字 / 百分比 / 非法字符串', () => {
      const widths = getEditableTableColWidths({
        readonly: false,
        columnCount: 3,
        availableTableWidth: 200,
        mobileBreakpointValue: 768,
        element: tableElement([80, '50%', 'not-a-number']),
      });
      expect(widths).toHaveLength(3);
      expect(widths[0]).toBe(80);
      expect(widths[1]).toBe(100);
      expect(widths[2]).toBeGreaterThanOrEqual(1);
    });

    it('无显式宽度时桌面布局归一化', () => {
      const widths = getEditableTableColWidths({
        readonly: false,
        columnCount: 3,
        availableTableWidth: 900,
        mobileBreakpointValue: 768,
        element: tableElement(),
      });
      expect(widths).toHaveLength(3);
      expect(widths.every((w) => typeof w === 'number' && w >= 1)).toBe(true);
    });

    it('移动布局与超宽回退 fallback', () => {
      const mobile = getEditableTableColWidths({
        readonly: false,
        columnCount: 3,
        availableTableWidth: 300,
        mobileBreakpointValue: 768,
        element: tableElement([200, 200, 200]),
      });
      expect(mobile).toEqual([200, 200, 200]);

      const overflow = getEditableTableColWidths({
        readonly: false,
        columnCount: 3,
        availableTableWidth: 120,
        mobileBreakpointValue: 768,
        element: tableElement(),
      });
      expect(overflow).toHaveLength(3);
      expect(new Set(overflow).size).toBe(1);
    });
    it('显式 colWidths：空串 / 非法 % / 数字字符串', () => {
      const widths = getEditableTableColWidths({
        readonly: false,
        columnCount: 3,
        availableTableWidth: 300,
        mobileBreakpointValue: 768,
        element: tableElement(['', 'NaN%', '40px']),
      });
      expect(widths).toHaveLength(3);
      expect(widths[0]).toBeGreaterThanOrEqual(1);
      expect(widths[2]).toBe(40);
    });
  });

  describe('getEditableTableMinWidth', () => {
    it('桌面取列宽合计与容器下限的较大值', () => {
      const min = getEditableTableMinWidth({
        columnCount: 3,
        colWidths: [100, 100, 100],
        availableTableWidth: 900,
        mobileBreakpointValue: 768,
        resolvedContentWidth: 400,
        minContainerWidth: 320,
        rowIndexColWidth: 40,
      });
      expect(min).toBeGreaterThanOrEqual(340);
    });

    it('移动布局使用移动最小列宽', () => {
      const min = getEditableTableMinWidth({
        columnCount: 2,
        colWidths: [50, 50],
        availableTableWidth: 400,
        mobileBreakpointValue: 768,
        resolvedContentWidth: 100,
        minContainerWidth: 80,
        rowIndexColWidth: 20,
      });
      expect(min).toBeGreaterThanOrEqual(80);
    });
  });
});

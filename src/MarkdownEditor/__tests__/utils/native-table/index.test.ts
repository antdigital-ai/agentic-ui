import { describe, expect, it } from 'vitest';
import * as NativeTable from '../../../utils/native-table';

describe('native-table index', () => {
  describe('模块导出', () => {
    it('应该导出NativeTableEditor', () => {
      expect(NativeTable.NativeTableEditor).toBeDefined();
      expect(typeof NativeTable.NativeTableEditor).toBe('object');
    });

    it('应该导出NativeTableKeyboard', () => {
      expect(NativeTable.NativeTableKeyboard).toBeDefined();
      expect(typeof NativeTable.NativeTableKeyboard).toBe('object');
    });

    it('NativeTableEditor应该包含所有方法', () => {
      const methods = [
        'insertTable',
        'removeTable',
        'findTable',
        'findTableRow',
        'findTableCell',
        'isInTable',
        'isInTableRow',
        'isInTableCell',
        'insertTableRow',
        'removeTableRow',
        'insertTableColumn',
        'removeTableColumn',
        'moveToNextCell',
        'moveToPreviousCell',
      ];

      methods.forEach((method) => {
        expect(NativeTable.NativeTableEditor).toHaveProperty(method);
        expect(typeof (NativeTable.NativeTableEditor as any)[method]).toBe(
          'function',
        );
      });
    });

    it('NativeTableKeyboard应该包含所有方法', () => {
      const methods = ['handleKeyDown', 'shouldHandle'];

      methods.forEach((method) => {
        expect(NativeTable.NativeTableKeyboard).toHaveProperty(method);
        expect(typeof (NativeTable.NativeTableKeyboard as any)[method]).toBe(
          'function',
        );
      });
    });
  });

  describe('类型导出', () => {
    it('应该能够使用CellElement类型', () => {
      // 这个测试验证类型是否正确导出
      const cell: NativeTable.CellElement = {
        type: 'table-cell',
        rowSpan: 1,
        colSpan: 1,
        align: 'left',
      };

      expect(cell.type).toBe('table-cell');
    });

    it('应该能够使用Edge类型', () => {
      const edge: NativeTable.Edge = {
        start: 0,
        end: 10,
      };

      expect(edge.start).toBe(0);
      expect(edge.end).toBe(10);
    });

    it('应该支持所有SelectionMode值', () => {
      const modes: NativeTable.SelectionMode[] = [
        'cell',
        'row',
        'column',
        'table',
      ];

      modes.forEach((mode) => {
        expect(['cell', 'row', 'column', 'table']).toContain(mode);
      });
    });
  });
});

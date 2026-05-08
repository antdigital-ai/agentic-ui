import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NativeTableEditor } from '../../../utils/native-table/native-table-editor';
import { NativeTableKeyboard } from '../../../utils/native-table/native-table-keyboard';

// Mock NativeTableEditor
vi.mock(
  '../../../utils/native-table/native-table-editor',
  () => ({
    NativeTableEditor: {
      isInTableCell: vi.fn(),
      moveToNextCell: vi.fn(),
      moveToPreviousCell: vi.fn(),
      findTableCell: vi.fn(),
      findTable: vi.fn(),
    },
  }),
);

describe('NativeTableKeyboard', () => {
  let mockEditor: any;
  let mockEvent: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditor = {
      selection: {
        anchor: { offset: 0 },
      },
      select: vi.fn(),
    };
    mockEvent = {
      key: '',
      shiftKey: false,
      preventDefault: vi.fn(),
    };
  });

  describe('shouldHandle', () => {
    it('应该在表格单元格中返回true', () => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(true);

      const result = NativeTableKeyboard.shouldHandle(mockEditor);

      expect(result).toBe(true);
    });

    it('应该在非表格单元格中返回false', () => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(false);

      const result = NativeTableKeyboard.shouldHandle(mockEditor);

      expect(result).toBe(false);
    });
  });

  describe('handleKeyDown - Tab键', () => {
    beforeEach(() => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    });

    it('应该处理Tab键移动到下一个单元格', () => {
      mockEvent.key = 'Tab';

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(NativeTableEditor.moveToNextCell).toHaveBeenCalledWith(mockEditor);
      expect(result).toBe(true);
    });

    it('应该处理Shift+Tab键移动到上一个单元格', () => {
      mockEvent.key = 'Tab';
      mockEvent.shiftKey = true;

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(NativeTableEditor.moveToPreviousCell).toHaveBeenCalledWith(
        mockEditor,
      );
      expect(result).toBe(true);
    });
  });

  describe('handleKeyDown - Enter键', () => {
    beforeEach(() => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    });

    it('应该允许Enter键的默认行为', () => {
      mockEvent.key = 'Enter';

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('handleKeyDown - ArrowUp键', () => {
    beforeEach(() => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    });

    it('应该在光标在开头时移动到上一行', () => {
      mockEvent.key = 'ArrowUp';
      mockEditor.selection.anchor.offset = 0;

      const mockCellEntry = [{}, [0, 1, 1]]; // 第2行第2列
      const mockTableEntry = [{}, [0]];

      (NativeTableEditor.findTableCell as any).mockReturnValue(mockCellEntry);
      (NativeTableEditor.findTable as any).mockReturnValue(mockTableEntry);

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEditor.select).toHaveBeenCalledWith({
        path: [0, 0, 1],
        offset: 0,
      });
      expect(result).toBe(true);
    });

    it('应该在第一行时不移动', () => {
      mockEvent.key = 'ArrowUp';
      mockEditor.selection.anchor.offset = 0;

      const mockCellEntry = [{}, [0, 0, 1]]; // 第1行
      const mockTableEntry = [{}, [0]];

      (NativeTableEditor.findTableCell as any).mockReturnValue(mockCellEntry);
      (NativeTableEditor.findTable as any).mockReturnValue(mockTableEntry);

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('应该在光标不在开头时返回false', () => {
      mockEvent.key = 'ArrowUp';
      mockEditor.selection.anchor.offset = 5;

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(result).toBe(false);
    });

    it('应该在没有selection时返回false', () => {
      mockEvent.key = 'ArrowUp';
      mockEditor.selection = null;

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(result).toBe(false);
    });
  });

  describe('handleKeyDown - ArrowDown键', () => {
    beforeEach(() => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    });

    it('应该在光标在开头时移动到下一行', () => {
      mockEvent.key = 'ArrowDown';
      mockEditor.selection.anchor.offset = 0;

      const mockCellEntry = [{}, [0, 0, 1]]; // 第1行第2列
      const mockTableEntry = [
        {
          type: 'table',
          children: [{}, {}], // 2行
        },
        [0],
      ];

      (NativeTableEditor.findTableCell as any).mockReturnValue(mockCellEntry);
      (NativeTableEditor.findTable as any).mockReturnValue(mockTableEntry);

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEditor.select).toHaveBeenCalledWith({
        path: [0, 1, 1],
        offset: 0,
      });
      expect(result).toBe(true);
    });

    it('应该在最后一行时不移动', () => {
      mockEvent.key = 'ArrowDown';
      mockEditor.selection.anchor.offset = 0;

      const mockCellEntry = [{}, [0, 1, 0]]; // 第2行（最后一行）
      const mockTableEntry = [
        {
          type: 'table',
          children: [{}, {}], // 2行
        },
        [0],
      ];

      (NativeTableEditor.findTableCell as any).mockReturnValue(mockCellEntry);
      (NativeTableEditor.findTable as any).mockReturnValue(mockTableEntry);

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('handleKeyDown - ArrowLeft键', () => {
    beforeEach(() => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    });

    it('应该在光标在开头时移动到左侧单元格', () => {
      mockEvent.key = 'ArrowLeft';
      mockEditor.selection.anchor.offset = 0;

      const mockCellEntry = [{}, [0, 0, 1]]; // 第1行第2列
      const mockTableEntry = [{}, [0]];

      (NativeTableEditor.findTableCell as any).mockReturnValue(mockCellEntry);
      (NativeTableEditor.findTable as any).mockReturnValue(mockTableEntry);

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEditor.select).toHaveBeenCalledWith({
        path: [0, 0, 0],
        offset: 0,
      });
      expect(result).toBe(true);
    });

    it('应该在第一列时不移动', () => {
      mockEvent.key = 'ArrowLeft';
      mockEditor.selection.anchor.offset = 0;

      const mockCellEntry = [{}, [0, 0, 0]]; // 第1列
      const mockTableEntry = [{}, [0]];

      (NativeTableEditor.findTableCell as any).mockReturnValue(mockCellEntry);
      (NativeTableEditor.findTable as any).mockReturnValue(mockTableEntry);

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('handleKeyDown - ArrowRight键', () => {
    beforeEach(() => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    });

    it('应该在光标在开头时移动到右侧单元格', () => {
      mockEvent.key = 'ArrowRight';
      mockEditor.selection.anchor.offset = 0;

      const mockCellEntry = [
        {
          type: 'table-cell',
          children: [{ children: [{}, {}] }],
        },
        [0, 0, 0],
      ];
      const mockTableEntry = [{}, [0]];

      (NativeTableEditor.findTableCell as any).mockReturnValue(mockCellEntry);
      (NativeTableEditor.findTable as any).mockReturnValue(mockTableEntry);

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEditor.select).toHaveBeenCalledWith({
        path: [0, 0, 1],
        offset: 0,
      });
      expect(result).toBe(true);
    });

    it('应该在最后一列时不移动', () => {
      mockEvent.key = 'ArrowRight';
      mockEditor.selection.anchor.offset = 0;

      const mockCellEntry = [
        {
          type: 'table-cell',
          children: [{ children: [{}, {}] }],
        },
        [0, 0, 1],
      ]; // 最后一列
      const mockTableEntry = [{}, [0]];

      (NativeTableEditor.findTableCell as any).mockReturnValue(mockCellEntry);
      (NativeTableEditor.findTable as any).mockReturnValue(mockTableEntry);

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('handleKeyDown - Delete和Backspace键', () => {
    beforeEach(() => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    });

    it('应该允许Delete键的默认行为', () => {
      mockEvent.key = 'Delete';

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('应该允许Backspace键的默认行为', () => {
      mockEvent.key = 'Backspace';

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('handleKeyDown - 其他按键', () => {
    beforeEach(() => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    });

    it('应该忽略其他按键', () => {
      const keys = ['a', 'Space', 'Escape', 'Home', 'End'];

      keys.forEach((key) => {
        mockEvent.key = key;
        const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

        expect(result).toBe(false);
        expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      });
    });
  });

  describe('handleKeyDown - 非表格环境', () => {
    it('应该在非表格单元格中返回false', () => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(false);
      mockEvent.key = 'Tab';

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(result).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(NativeTableEditor.moveToNextCell).not.toHaveBeenCalled();
    });

    it('应该在非表格单元格中忽略所有按键', () => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(false);

      const keys = [
        'Tab',
        'Enter',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
      ];

      keys.forEach((key) => {
        mockEvent.key = key;
        const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

        expect(result).toBe(false);
      });
    });
  });

  describe('边缘情况', () => {
    beforeEach(() => {
      (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    });

    it('应该处理没有selection的情况', () => {
      mockEditor.selection = null;
      mockEvent.key = 'ArrowUp';

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(result).toBe(false);
    });

    it('应该处理findTableCell返回null', () => {
      mockEvent.key = 'ArrowUp';
      mockEditor.selection.anchor.offset = 0;
      (NativeTableEditor.findTableCell as any).mockReturnValue(null);

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(result).toBe(false);
    });

    it('应该处理findTable返回null', () => {
      mockEvent.key = 'ArrowUp';
      mockEditor.selection.anchor.offset = 0;

      const mockCellEntry = [{}, [0, 0, 0]];
      (NativeTableEditor.findTableCell as any).mockReturnValue(mockCellEntry);
      (NativeTableEditor.findTable as any).mockReturnValue(null);

      const result = NativeTableKeyboard.handleKeyDown(mockEditor, mockEvent);

      expect(result).toBe(false);
    });
  });
});

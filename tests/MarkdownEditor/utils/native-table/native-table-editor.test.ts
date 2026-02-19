import { Editor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NativeTableEditor } from '../../../../src/MarkdownEditor/utils/native-table/native-table-editor';

// Mock Slate APIs
vi.mock('slate', async () => {
  const actual = await vi.importActual('slate');
  return {
    ...actual,
    Transforms: {
      insertNodes: vi.fn(),
      removeNodes: vi.fn(),
      select: vi.fn(),
    },
    Editor: {
      ...(actual as any).Editor,
      above: vi.fn(),
      isBlock: vi.fn(() => true),
    },
  };
});

describe('NativeTableEditor', () => {
  let mockEditor: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditor = {
      children: [],
      selection: null,
      select: vi.fn(),
    };
  });

  describe('insertTable', () => {
    it('应该插入默认2x2表格', () => {
      NativeTableEditor.insertTable(mockEditor);

      expect(Transforms.insertNodes).toHaveBeenCalled();
      const call = (Transforms.insertNodes as any).mock.calls[0];
      const tableNode = call[1];

      expect(tableNode.type).toBe('table');
      expect(tableNode.children.length).toBe(2);
      expect(tableNode.children[0].children.length).toBe(2);
    });

    it('应该插入自定义大小的表格', () => {
      NativeTableEditor.insertTable(mockEditor, { rows: 3, cols: 4 });

      const call = (Transforms.insertNodes as any).mock.calls[0];
      const tableNode = call[1];

      expect(tableNode.children.length).toBe(3);
      expect(tableNode.children[0].children.length).toBe(4);
    });

    it('应该在指定位置插入表格', () => {
      const at = { path: [0], offset: 0 };
      NativeTableEditor.insertTable(mockEditor, { at });

      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        mockEditor,
        expect.any(Object),
        { at },
      );
    });

    it('应该确保至少1行1列', () => {
      NativeTableEditor.insertTable(mockEditor, { rows: 0, cols: 0 });

      const call = (Transforms.insertNodes as any).mock.calls[0];
      const tableNode = call[1];

      expect(tableNode.children.length).toBe(1);
      expect(tableNode.children[0].children.length).toBe(1);
    });

    it('应该确保负数转换为1', () => {
      NativeTableEditor.insertTable(mockEditor, { rows: -5, cols: -3 });

      const call = (Transforms.insertNodes as any).mock.calls[0];
      const tableNode = call[1];

      expect(tableNode.children.length).toBe(1);
      expect(tableNode.children[0].children.length).toBe(1);
    });

    it('应该创建正确的表格结构', () => {
      NativeTableEditor.insertTable(mockEditor, { rows: 1, cols: 1 });

      const call = (Transforms.insertNodes as any).mock.calls[0];
      const tableNode = call[1];

      // 验证表格结构
      expect(tableNode.type).toBe('table');
      expect(tableNode.children[0].type).toBe('table-row');
      expect(tableNode.children[0].children[0].type).toBe('table-cell');
      expect(tableNode.children[0].children[0].children[0].type).toBe(
        'paragraph',
      );
      expect(tableNode.children[0].children[0].children[0].children[0]).toEqual(
        {
          text: '',
        },
      );
    });
  });

  describe('removeTable', () => {
    it('应该删除表格', () => {
      const mockTableEntry = [{ type: 'table' }, [0]];
      (Editor.above as any).mockReturnValue(mockTableEntry);

      NativeTableEditor.removeTable(mockEditor);

      expect(Transforms.removeNodes).toHaveBeenCalledWith(mockEditor, {
        at: [0],
      });
    });

    it('应该在没有表格时不执行操作', () => {
      (Editor.above as any).mockReturnValue(null);

      NativeTableEditor.removeTable(mockEditor);

      expect(Transforms.removeNodes).not.toHaveBeenCalled();
    });

    it('应该在指定位置删除表格', () => {
      const mockTableEntry = [{ type: 'table' }, [1]];
      (Editor.above as any).mockReturnValue(mockTableEntry);
      const at = { path: [1], offset: 0 };

      NativeTableEditor.removeTable(mockEditor, at);

      expect(Transforms.removeNodes).toHaveBeenCalledWith(mockEditor, {
        at: [1],
      });
    });
  });

  describe('findTable', () => {
    it('应该查找表格节点', () => {
      const mockTableEntry = [{ type: 'table' }, [0]];
      (Editor.above as any).mockReturnValue(mockTableEntry);

      const result = NativeTableEditor.findTable(mockEditor);

      expect(result).toEqual(mockTableEntry);
      expect(Editor.above).toHaveBeenCalledWith(mockEditor, {
        match: expect.any(Function),
        at: undefined,
      });
    });

    it('应该在指定位置查找表格', () => {
      const at = { path: [0], offset: 0 };
      NativeTableEditor.findTable(mockEditor, at);

      expect(Editor.above).toHaveBeenCalledWith(mockEditor, {
        match: expect.any(Function),
        at,
      });
    });

    it('应该返回null当没有表格时', () => {
      (Editor.above as any).mockReturnValue(null);

      const result = NativeTableEditor.findTable(mockEditor);

      expect(result).toBeNull();
    });
  });

  describe('findTableRow', () => {
    it('应该查找表格行节点', () => {
      const mockRowEntry = [{ type: 'table-row' }, [0, 0]];
      (Editor.above as any).mockReturnValue(mockRowEntry);

      const result = NativeTableEditor.findTableRow(mockEditor);

      expect(result).toEqual(mockRowEntry);
    });

    it('应该在指定位置查找表格行', () => {
      const at = { path: [0, 0], offset: 0 };
      NativeTableEditor.findTableRow(mockEditor, at);

      expect(Editor.above).toHaveBeenCalledWith(mockEditor, {
        match: expect.any(Function),
        at,
      });
    });
  });

  describe('findTableCell', () => {
    it('应该查找表格单元格节点', () => {
      const mockCellEntry = [{ type: 'table-cell' }, [0, 0, 0]];
      (Editor.above as any).mockReturnValue(mockCellEntry);

      const result = NativeTableEditor.findTableCell(mockEditor);

      expect(result).toEqual(mockCellEntry);
    });

    it('应该在指定位置查找表格单元格', () => {
      const at = { path: [0, 0, 0], offset: 0 };
      NativeTableEditor.findTableCell(mockEditor, at);

      expect(Editor.above).toHaveBeenCalledWith(mockEditor, {
        match: expect.any(Function),
        at,
      });
    });
  });

  describe('isInTable', () => {
    it('应该返回true当在表格中', () => {
      (Editor.above as any).mockReturnValue([{ type: 'table' }, [0]]);

      const result = NativeTableEditor.isInTable(mockEditor);

      expect(result).toBe(true);
    });

    it('应该返回false当不在表格中', () => {
      (Editor.above as any).mockReturnValue(null);

      const result = NativeTableEditor.isInTable(mockEditor);

      expect(result).toBe(false);
    });
  });

  describe('isInTableRow', () => {
    it('应该返回true当在表格行中', () => {
      (Editor.above as any).mockReturnValue([{ type: 'table-row' }, [0, 0]]);

      const result = NativeTableEditor.isInTableRow(mockEditor);

      expect(result).toBe(true);
    });

    it('应该返回false当不在表格行中', () => {
      (Editor.above as any).mockReturnValue(null);

      const result = NativeTableEditor.isInTableRow(mockEditor);

      expect(result).toBe(false);
    });
  });

  describe('isInTableCell', () => {
    it('应该返回true当在表格单元格中', () => {
      (Editor.above as any).mockReturnValue([
        { type: 'table-cell' },
        [0, 0, 0],
      ]);

      const result = NativeTableEditor.isInTableCell(mockEditor);

      expect(result).toBe(true);
    });

    it('应该返回false当不在表格单元格中', () => {
      (Editor.above as any).mockReturnValue(null);

      const result = NativeTableEditor.isInTableCell(mockEditor);

      expect(result).toBe(false);
    });
  });

  describe('insertTableRow', () => {
    it('应该在下方插入新行', () => {
      const mockRowEntry = [{ type: 'table-row' }, [0, 1]];
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}, {}] }, // 2列
          ],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-row' })) {
          return mockRowEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.insertTableRow(mockEditor, { position: 'below' });

      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        mockEditor,
        expect.objectContaining({ type: 'table-row' }),
        expect.objectContaining({ at: [0, 2] }),
      );
    });

    it('应该在上方插入新行', () => {
      const mockRowEntry = [{ type: 'table-row' }, [0, 1]];
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}, {}, {}] }, // 3列
          ],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-row' })) {
          return mockRowEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.insertTableRow(mockEditor, { position: 'above' });

      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        mockEditor,
        expect.objectContaining({ type: 'table-row' }),
        expect.objectContaining({ at: [0, 1] }),
      );
    });

    it('应该根据现有列数创建新行', () => {
      const mockRowEntry = [{ type: 'table-row' }, [0, 0]];
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}, {}, {}, {}] }, // 4列
          ],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-row' })) {
          return mockRowEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.insertTableRow(mockEditor);

      const call = (Transforms.insertNodes as any).mock.calls[0];
      const newRow = call[1];

      expect(newRow.children.length).toBe(4);
    });

    it('应该在没有表格行时不执行操作', () => {
      (Editor.above as any).mockReturnValue(null);

      NativeTableEditor.insertTableRow(mockEditor);

      expect(Transforms.insertNodes).not.toHaveBeenCalled();
    });

    it('应该在没有表格时不执行操作', () => {
      const mockRowEntry = [{ type: 'table-row' }, [0, 0]];
      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-row' })) {
          return mockRowEntry;
        }
        return null; // 没有table
      });

      NativeTableEditor.insertTableRow(mockEditor);

      expect(Transforms.insertNodes).not.toHaveBeenCalled();
    });
  });

  describe('removeTableRow', () => {
    it('应该删除表格行', () => {
      const mockRowEntry = [{ type: 'table-row' }, [0, 1]];
      const mockTableEntry = [
        {
          type: 'table',
          children: [{}, {}, {}], // 3行
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-row' })) {
          return mockRowEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.removeTableRow(mockEditor);

      expect(Transforms.removeNodes).toHaveBeenCalledWith(mockEditor, {
        at: [0, 1],
      });
    });

    it('应该在最后一行时删除整个表格', () => {
      const mockRowEntry = [{ type: 'table-row' }, [0, 0]];
      const mockTableEntry = [
        {
          type: 'table',
          children: [{}], // 只有1行
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-row' })) {
          return mockRowEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.removeTableRow(mockEditor);

      // 应该删除整个表格而不是单行
      expect(Transforms.removeNodes).toHaveBeenCalledWith(mockEditor, {
        at: [0],
      });
    });

    it('应该在没有表格行时不执行操作', () => {
      (Editor.above as any).mockReturnValue(null);

      NativeTableEditor.removeTableRow(mockEditor);

      expect(Transforms.removeNodes).not.toHaveBeenCalled();
    });

    it('findTable 返回 null 时应提前 return', () => {
      const mockRowEntry = [{ type: 'table-row' }, [0, 1]];
      (Editor.above as any)
        .mockReturnValueOnce(mockRowEntry)
        .mockReturnValueOnce(null);

      NativeTableEditor.removeTableRow(mockEditor);

      expect(Transforms.removeNodes).not.toHaveBeenCalled();
    });
  });

  describe('insertTableColumn', () => {
    it('应该在右侧插入新列', () => {
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}, {}] }, // 第1行，2列
            { children: [{}, {}] }, // 第2行，2列
          ],
        },
        [0],
      ];

      (Editor.above as any).mockReturnValue(mockTableEntry);

      NativeTableEditor.insertTableColumn(mockEditor, { position: 'right' });

      // 应该为每一行插入新单元格
      expect(Transforms.insertNodes).toHaveBeenCalledTimes(2);
    });

    it('应该在左侧插入新列', () => {
      const mockTableEntry = [
        {
          type: 'table',
          children: [{ children: [{}, {}] }, { children: [{}, {}] }],
        },
        [0],
      ];

      (Editor.above as any).mockReturnValue(mockTableEntry);

      NativeTableEditor.insertTableColumn(mockEditor, { position: 'left' });

      // 应该在第一列插入
      const calls = (Transforms.insertNodes as any).mock.calls;
      expect(calls[0][2].at).toEqual([0, 0, 0]);
    });

    it('应该在没有表格时不执行操作', () => {
      (Editor.above as any).mockReturnValue(null);

      NativeTableEditor.insertTableColumn(mockEditor);

      expect(Transforms.insertNodes).not.toHaveBeenCalled();
    });

    it('应该为多行表格插入列', () => {
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}] },
            { children: [{}] },
            { children: [{}] },
          ],
        },
        [0],
      ];

      (Editor.above as any).mockReturnValue(mockTableEntry);

      NativeTableEditor.insertTableColumn(mockEditor);

      // 应该为3行各插入1个单元格
      expect(Transforms.insertNodes).toHaveBeenCalledTimes(3);
    });
  });

  describe('removeTableColumn', () => {
    it('应该删除表格列', () => {
      const mockCellEntry = [{}, [0, 1, 1]]; // 第2行第2列
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}, {}, {}] }, // 3列
            { children: [{}, {}, {}] },
          ],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-cell' })) {
          return mockCellEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.removeTableColumn(mockEditor);

      // 应该删除每一行的第2列
      expect(Transforms.removeNodes).toHaveBeenCalledTimes(2);
    });

    it('应该在最后一列时删除整个表格', () => {
      const mockCellEntry = [{}, [0, 0, 0]];
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}] }, // 只有1列
            { children: [{}] },
          ],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-cell' })) {
          return mockCellEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.removeTableColumn(mockEditor);

      // 应该删除整个表格（firstRow.children.length <= 1）
      expect(Transforms.removeNodes).toHaveBeenCalledWith(mockEditor, {
        at: [0],
      });
    });

    it('应该在没有单元格时不执行操作', () => {
      (Editor.above as any).mockReturnValue(null);

      NativeTableEditor.removeTableColumn(mockEditor);

      expect(Transforms.removeNodes).not.toHaveBeenCalled();
    });
  });

  describe('moveToNextCell', () => {
    it('应该移动到下一个单元格', () => {
      const mockCellEntry = [{}, [0, 0, 0]]; // 第1行第1列
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}, {}] }, // 2列
          ],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-cell' })) {
          return mockCellEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.moveToNextCell(mockEditor);

      expect(Transforms.select).toHaveBeenCalledWith(mockEditor, {
        path: [0, 0, 1],
        offset: 0,
      });
    });

    it('应执行 Transforms.select 到下一格', () => {
      const mockCellEntry = [{}, [0, 0, 0]];
      const mockTableEntry = [
        {
          type: 'table',
          children: [{ children: [{}, {}] }],
        },
        [0],
      ];
      (Editor.above as any)
        .mockReturnValueOnce(mockCellEntry)
        .mockReturnValueOnce(mockTableEntry);
      NativeTableEditor.moveToNextCell(mockEditor);
      expect(Transforms.select).toHaveBeenCalledWith(mockEditor, {
        path: [0, 0, 1],
        offset: 0,
      });
    });

    it('应该移动到下一行的第一个单元格', () => {
      const mockCellEntry = [{}, [0, 0, 1]]; // 第1行最后一列
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}, {}] }, // 2列
            { children: [{}, {}] }, // 第2行
          ],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-cell' })) {
          return mockCellEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.moveToNextCell(mockEditor);

      expect(Transforms.select).toHaveBeenCalledWith(mockEditor, {
        path: [0, 1, 0],
        offset: 0,
      });
    });

    it('应该在最后一个单元格时不移动', () => {
      const mockCellEntry = [{}, [0, 1, 1]]; // 最后一行最后一列
      const mockTableEntry = [
        {
          type: 'table',
          children: [{ children: [{}, {}] }, { children: [{}, {}] }],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-cell' })) {
          return mockCellEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.moveToNextCell(mockEditor);

      // 不应该移动
      expect(Transforms.select).not.toHaveBeenCalled();
    });

    it('应该在没有单元格时不执行操作', () => {
      (Editor.above as any).mockReturnValue(null);

      NativeTableEditor.moveToNextCell(mockEditor);

      expect(Transforms.select).not.toHaveBeenCalled();
    });
  });

  describe('moveToPreviousCell', () => {
    it('应该移动到上一个单元格', () => {
      const mockCellEntry = [{}, [0, 0, 1]]; // 第1行第2列
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}, {}] }, // 2列
          ],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-cell' })) {
          return mockCellEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.moveToPreviousCell(mockEditor);

      expect(Transforms.select).toHaveBeenCalledWith(mockEditor, {
        path: [0, 0, 0],
        offset: 0,
      });
    });

    it('应执行 Transforms.select 到上一格', () => {
      const mockCellEntry = [{}, [0, 0, 1]];
      const mockTableEntry = [
        {
          type: 'table',
          children: [{ children: [{}, {}] }],
        },
        [0],
      ];
      (Editor.above as any)
        .mockReturnValueOnce(mockCellEntry)
        .mockReturnValueOnce(mockTableEntry);
      NativeTableEditor.moveToPreviousCell(mockEditor);
      expect(Transforms.select).toHaveBeenCalledWith(mockEditor, {
        path: [0, 0, 0],
        offset: 0,
      });
    });

    it('应该移动到上一行的最后一个单元格', () => {
      const mockCellEntry = [{}, [0, 1, 0]]; // 第2行第1列
      const mockTableEntry = [
        {
          type: 'table',
          children: [
            { children: [{}, {}] }, // 2列
            { children: [{}, {}] },
          ],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-cell' })) {
          return mockCellEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.moveToPreviousCell(mockEditor);

      expect(Transforms.select).toHaveBeenCalledWith(mockEditor, {
        path: [0, 0, 1],
        offset: 0,
      });
    });

    it('应该在第一个单元格时不移动', () => {
      const mockCellEntry = [{}, [0, 0, 0]]; // 第1行第1列
      const mockTableEntry = [
        {
          type: 'table',
          children: [{ children: [{}, {}] }],
        },
        [0],
      ];

      (Editor.above as any).mockImplementation((editor: any, options: any) => {
        if (options.match({ type: 'table-cell' })) {
          return mockCellEntry;
        }
        if (options.match({ type: 'table' })) {
          return mockTableEntry;
        }
        return null;
      });

      NativeTableEditor.moveToPreviousCell(mockEditor);

      // 不应该移动
      expect(Transforms.select).not.toHaveBeenCalled();
    });

    it('应该在没有单元格时不执行操作', () => {
      (Editor.above as any).mockReturnValue(null);

      NativeTableEditor.moveToPreviousCell(mockEditor);

      expect(Transforms.select).not.toHaveBeenCalled();
    });
  });
});

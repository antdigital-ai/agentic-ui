import { Editor, Location, Node, Path, Transforms } from 'slate';

// 表格相关类型定义
export interface CellElement extends Node {
  type: 'table-cell' | 'header-cell';
  rowSpan?: number;
  colSpan?: number;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  hidden?: boolean;
}

export interface Edge {
  start: number;
  end: number;
}

export interface NodeEntryWithContext {
  node: Node;
  path: Path;
  context?: any;
}

export type SelectionMode = 'cell' | 'row' | 'column' | 'table';

export interface WithType {
  type: string;
}

/**
 * 原生表格编辑器 - 提供基础的表格操作功能
 * 替代复杂的 withTable 插件，使用 Slate 原生 API 实现表格操作
 */
export const NativeTableEditor = {
  /**
   * 插入表格
   * @param editor - Slate 编辑器实例
   * @param options - 表格选项
   */
  insertTable(
    editor: Editor,
    options: { rows?: number; cols?: number; at?: Location } = {},
  ): void {
    const { rows = 2, cols = 2, at } = options;

    // 确保行数和列数至少为1
    const clamp = (n: number) => (n < 1 ? 1 : n);
    const actualRows = clamp(rows);
    const actualCols = clamp(cols);

    // 创建表格结构
    const tableNode: Node = {
      type: 'table',
      children: Array.from({ length: actualRows }).map<Node>(() => ({
        type: 'table-row',
        children: Array.from({ length: actualCols }).map<Node>(() => ({
          type: 'table-cell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        })),
      })),
    };

    // 插入表格
    Transforms.insertNodes(editor, tableNode, { at });
  },

  /**
   * 删除表格
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  removeTable(editor: Editor, at?: Location): void {
    const tableEntry = this.findTable(editor, at);
    if (tableEntry) {
      const [, path] = tableEntry;
      Transforms.removeNodes(editor, { at: path });
    }
  },

  /**
   * 查找表格节点
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  findTable(editor: Editor, at?: Location) {
    return Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n) && n.type === 'table',
      at,
    });
  },

  /**
   * 查找表格行节点
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  findTableRow(editor: Editor, at?: Location) {
    return Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n) && n.type === 'table-row',
      at,
    });
  },

  /**
   * 查找表格单元格节点
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  findTableCell(editor: Editor, at?: Location) {
    return Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n) && n.type === 'table-cell',
      at,
    });
  },

  /**
   * 检查是否在表格中
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  isInTable(editor: Editor, at?: Location): boolean {
    return !!this.findTable(editor, at);
  },

  /**
   * 检查是否在表格行中
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  isInTableRow(editor: Editor, at?: Location): boolean {
    return !!this.findTableRow(editor, at);
  },

  /**
   * 检查是否在表格单元格中
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  isInTableCell(editor: Editor, at?: Location): boolean {
    return !!this.findTableCell(editor, at);
  },

  /**
   * 插入表格行
   * @param editor - Slate 编辑器实例
   * @param options - 选项
   */
  insertTableRow(
    editor: Editor,
    options: { at?: Location; position?: 'above' | 'below' } = {},
  ): void {
    const { at, position = 'below' } = options;

    const tableRowEntry = this.findTableRow(editor, at);
    if (!tableRowEntry) return;

    const [, rowPath] = tableRowEntry;
    const tableEntry = this.findTable(editor, at);
    if (!tableEntry) return;

    const [tableNode] = tableEntry;
    const colCount =
      ((tableNode as any).children[0] as any)?.children?.length || 1;

    // 创建新行
    const newRow: Node = {
      type: 'table-row',
      children: Array.from({ length: colCount }).map<Node>(() => ({
        type: 'table-cell',
        children: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
      })),
    };

    // 插入新行
    const insertPath =
      position === 'above' ? rowPath : [rowPath[0], rowPath[1] + 1];
    Transforms.insertNodes(editor, newRow, { at: insertPath });
  },

  /**
   * 删除表格行
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  removeTableRow(editor: Editor, at?: Location): void {
    const tableRowEntry = this.findTableRow(editor, at);
    if (!tableRowEntry) return;

    const [, rowPath] = tableRowEntry;
    const tableEntry = this.findTable(editor, at);
    if (!tableEntry) return;

    const [tableNode] = tableEntry;

    // 如果表格只有一行，删除整个表格
    if ((tableNode as any).children.length <= 1) {
      this.removeTable(editor, at);
      return;
    }

    // 删除当前行
    Transforms.removeNodes(editor, { at: rowPath });
  },

  /**
   * 插入表格列
   * @param editor - Slate 编辑器实例
   * @param options - 选项
   */
  insertTableColumn(
    editor: Editor,
    options: { at?: Location; position?: 'left' | 'right' } = {},
  ): void {
    const { at, position = 'right' } = options;

    const tableEntry = this.findTable(editor, at);
    if (!tableEntry) return;

    const [tableNode, tablePath] = tableEntry;
    const rowCount = (tableNode as any).children.length;

    // 为每一行插入新单元格
    Editor.withoutNormalizing(editor, () => {
      for (let i = 0; i < rowCount; i++) {
        const rowPath = [...tablePath, i];
        const rowNode = (tableNode as any).children[i] as any;
        const colCount = rowNode.children.length;

        const newCell: Node = {
          type: 'table-cell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        };

        const insertPath =
          position === 'left' ? [...rowPath, 0] : [...rowPath, colCount];

        Transforms.insertNodes(editor, newCell, { at: insertPath });
      }
    });
  },

  /**
   * 删除表格列
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  removeTableColumn(editor: Editor, at?: Location): void {
    const tableCellEntry = this.findTableCell(editor, at);
    if (!tableCellEntry) return;

    const [, cellPath] = tableCellEntry;
    const tableEntry = this.findTable(editor, at);
    if (!tableEntry) return;

    const [tableNode, tablePath] = tableEntry;
    const rowCount = (tableNode as any).children.length;
    const colIndex = cellPath[cellPath.length - 1];

    // 检查是否只有一列
    const firstRow = (tableNode as any).children[0] as any;
    if (firstRow.children.length <= 1) {
      this.removeTable(editor, at);
      return;
    }

    // 删除每一行的对应列
    Editor.withoutNormalizing(editor, () => {
      for (let i = 0; i < rowCount; i++) {
        const cellPath = [...tablePath, i, colIndex];
        Transforms.removeNodes(editor, { at: cellPath });
      }
    });
  },

  /**
   * 移动光标到下一个单元格
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  moveToNextCell(editor: Editor, at?: Location): void {
    const tableCellEntry = this.findTableCell(editor, at);
    if (!tableCellEntry) return;

    const [, cellPath] = tableCellEntry;
    const tableEntry = this.findTable(editor, at);
    if (!tableEntry) return;

    const [tableNode, tablePath] = tableEntry;
    const rowIndex = cellPath[cellPath.length - 2];
    const colIndex = cellPath[cellPath.length - 1];
    const rowCount = (tableNode as any).children.length;
    const colCount = ((tableNode as any).children[0] as any).children.length;

    // 计算下一个单元格位置
    let nextRowIndex = rowIndex;
    let nextColIndex = colIndex + 1;

    if (nextColIndex >= colCount) {
      nextRowIndex++;
      nextColIndex = 0;
    }

    if (nextRowIndex < rowCount) {
      const nextCellPath = [...tablePath, nextRowIndex, nextColIndex];
      Transforms.select(editor, { path: nextCellPath, offset: 0 });
    }
  },

  /**
   * 移动光标到上一个单元格
   * @param editor - Slate 编辑器实例
   * @param at - 位置
   */
  moveToPreviousCell(editor: Editor, at?: Location): void {
    const tableCellEntry = this.findTableCell(editor, at);
    if (!tableCellEntry) return;

    const [, cellPath] = tableCellEntry;
    const tableEntry = this.findTable(editor, at);
    if (!tableEntry) return;

    const [tableNode, tablePath] = tableEntry;
    const rowIndex = cellPath[cellPath.length - 2];
    const colIndex = cellPath[cellPath.length - 1];
    const colCount = ((tableNode as any).children[0] as any).children.length;

    // 计算上一个单元格位置
    let prevRowIndex = rowIndex;
    let prevColIndex = colIndex - 1;

    if (prevColIndex < 0) {
      prevRowIndex--;
      prevColIndex = colCount - 1;
    }

    if (prevRowIndex >= 0) {
      const prevCellPath = [...tablePath, prevRowIndex, prevColIndex];
      Transforms.select(editor, { path: prevCellPath, offset: 0 });
    }
  },
};

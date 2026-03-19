import { Editor, Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { NativeTableEditor } from '../../../../utils/native-table';

interface TableCellNode {
  type?: string;
  children?: TableCellNode[];
}

interface TableRowNode {
  children?: TableCellNode[];
}

interface TableNode {
  type?: string;
  children?: TableRowNode[];
}

const EMPTY_TABLE_CELL = {
  type: 'table-cell',
  children: [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ],
};

function getTableNode(editor: Editor, tablePath: number[]): TableNode | null {
  const [tableNode] = Editor.node(editor, tablePath);
  if (!tableNode || (tableNode as TableNode).type !== 'table') {
    return null;
  }
  return tableNode as TableNode;
}

function getTableRowCount(tableNode: TableNode): number {
  return tableNode.children?.length || 0;
}

function getTableColumnCount(tableNode: TableNode): number {
  return tableNode.children?.[0]?.children?.length || 0;
}

function forEachCellPath(
  editor: Editor,
  tablePath: number[],
  callback: (cellPath: number[], cellNode: TableCellNode) => void,
) {
  const tableNode = getTableNode(editor, tablePath);
  if (!tableNode) return;

  const rowCount = getTableRowCount(tableNode);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowNode = tableNode.children?.[rowIndex];
    const columnCount = rowNode?.children?.length || 0;
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const cellPath = [...tablePath, rowIndex, columnIndex];
      if (!Editor.hasPath(editor, cellPath)) {
        continue;
      }
      const [cellNode] = Editor.node(editor, cellPath);
      const tableCellNode = cellNode as TableCellNode;
      if (tableCellNode.type !== 'table-cell') {
        continue;
      }
      callback(cellPath, tableCellNode);
    }
  }
}

export function clearTableSelection(editor: Editor, tablePath: number[]) {
  forEachCellPath(editor, tablePath, (_, cellNode) => {
    const domNode = ReactEditor.toDOMNode(editor, cellNode as unknown as Node);
    domNode?.removeAttribute('data-select');
  });
}

export function selectTableRow(
  editor: Editor,
  tablePath: number[],
  rowIndex: number,
) {
  const tableNode = getTableNode(editor, tablePath);
  if (!tableNode) return;

  const rowNode = tableNode.children?.[rowIndex];
  if (!rowNode?.children?.length) return;

  for (let columnIndex = 0; columnIndex < rowNode.children.length; columnIndex += 1) {
    const cellPath = [...tablePath, rowIndex, columnIndex];
    if (!Editor.hasPath(editor, cellPath)) {
      continue;
    }
    const [cellNode] = Editor.node(editor, cellPath);
    const tableCellNode = cellNode as TableCellNode;
    if (tableCellNode.type !== 'table-cell') {
      continue;
    }
    const domNode = ReactEditor.toDOMNode(
      editor,
      tableCellNode as unknown as Node,
    );
    domNode?.setAttribute('data-select', 'true');
  }
}

export function selectTableColumn(
  editor: Editor,
  tablePath: number[],
  columnIndex: number,
) {
  const tableNode = getTableNode(editor, tablePath);
  if (!tableNode) return;

  const rowCount = getTableRowCount(tableNode);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const cellPath = [...tablePath, rowIndex, columnIndex];
    if (!Editor.hasPath(editor, cellPath)) {
      continue;
    }
    const [cellNode] = Editor.node(editor, cellPath);
    const tableCellNode = cellNode as TableCellNode;
    if (tableCellNode.type !== 'table-cell') {
      continue;
    }
    const domNode = ReactEditor.toDOMNode(
      editor,
      tableCellNode as unknown as Node,
    );
    domNode?.setAttribute('data-select', 'true');
  }
}

export function selectWholeTable(editor: Editor, tablePath: number[]) {
  forEachCellPath(editor, tablePath, (_, cellNode) => {
    const domNode = ReactEditor.toDOMNode(editor, cellNode as unknown as Node);
    domNode?.setAttribute('data-select', 'true');
  });
}

export function removeTableRow(
  editor: Editor,
  tablePath: number[],
  rowIndex: number,
) {
  const tableNode = getTableNode(editor, tablePath);
  if (!tableNode) return;

  if (getTableRowCount(tableNode) <= 1) {
    NativeTableEditor.removeTable(editor, tablePath);
    return;
  }

  const rowPath = [...tablePath, rowIndex];
  if (Editor.hasPath(editor, rowPath)) {
    Transforms.removeNodes(editor, { at: rowPath });
  }
}

export function insertTableRow(
  editor: Editor,
  tablePath: number[],
  rowIndex: number,
  position: 'before' | 'after',
) {
  const tableNode = getTableNode(editor, tablePath);
  if (!tableNode) return;

  const rowCount = getTableRowCount(tableNode);
  const columnCount = getTableColumnCount(tableNode);
  if (columnCount <= 0) return;

  const rowNode = {
    type: 'table-row',
    children: Array.from({ length: columnCount }, () => EMPTY_TABLE_CELL),
  };
  const insertIndex =
    position === 'before' ? rowIndex : Math.min(rowIndex + 1, rowCount);
  Transforms.insertNodes(editor, rowNode, { at: [...tablePath, insertIndex] });
}

export function removeTableColumn(
  editor: Editor,
  tablePath: number[],
  columnIndex: number,
) {
  const tableNode = getTableNode(editor, tablePath);
  if (!tableNode) return;

  if (getTableColumnCount(tableNode) <= 1) {
    NativeTableEditor.removeTable(editor, tablePath);
    return;
  }

  const rowCount = getTableRowCount(tableNode);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const cellPath = [...tablePath, rowIndex, columnIndex];
    if (Editor.hasPath(editor, cellPath)) {
      Transforms.removeNodes(editor, { at: cellPath });
    }
  }
}

export function insertTableColumn(
  editor: Editor,
  tablePath: number[],
  columnIndex: number,
  position: 'before' | 'after',
) {
  const tableNode = getTableNode(editor, tablePath);
  if (!tableNode) return;

  const rowCount = getTableRowCount(tableNode);
  const insertOffset = position === 'before' ? 0 : 1;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const insertPath = [...tablePath, rowIndex, columnIndex + insertOffset];
    Transforms.insertNodes(editor, EMPTY_TABLE_CELL, { at: insertPath });
  }
}

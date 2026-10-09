import { createEditor, Editor, Node, Transforms } from 'slate';
import { describe, expect, it } from 'vitest';
import {
  insertTableColumn,
  insertTableRow,
  removeTableColumn,
} from '../../../editor/elements/Table/commands/tableCommands';
import { NativeTableEditor } from '../../../utils/native-table/native-table-editor';

interface TestCell {
  type: 'table-cell';
  children: { type: 'paragraph'; children: { text: string }[] }[];
}

interface TestTable {
  type: 'table';
  children: { type: 'table-row'; children: TestCell[] }[];
}

function createTable(): TestTable {
  return {
    type: 'table',
    children: Array.from({ length: 12 }, (_, row) => ({
      type: 'table-row',
      children: Array.from({ length: 3 }, (_, column) => ({
        type: 'table-cell',
        children: [
          { type: 'paragraph', children: [{ text: `${row},${column}` }] },
        ],
      })),
    })),
  };
}

function setupEditor() {
  const editor = createEditor();
  editor.children = [createTable()];
  editor.selection = {
    anchor: { path: [0, 0, 1, 0, 0], offset: 0 },
    focus: { path: [0, 0, 1, 0, 0], offset: 0 },
  };
  const normalizedColumnCounts: number[][] = [];
  const normalizeNode = editor.normalizeNode;
  editor.normalizeNode = (entry, options) => {
    if (entry[0].type === 'table') {
      normalizedColumnCounts.push(
        (entry[0] as TestTable).children.map((row) => row.children.length),
      );
    }
    normalizeNode(entry, options);
  };
  return { editor, normalizedColumnCounts };
}

const columnCommands = [
  {
    name: 'Table chrome commands',
    insert: (editor: Editor) => insertTableColumn(editor, [0], 1, 'after'),
    remove: (editor: Editor) => removeTableColumn(editor, [0], 1),
    insertedIndex: 2,
  },
  {
    name: 'NativeTableEditor',
    insert: (editor: Editor) => NativeTableEditor.insertTableColumn(editor),
    remove: (editor: Editor) => NativeTableEditor.removeTableColumn(editor),
    insertedIndex: 3,
  },
];

describe.each(columnCommands)('$name column operations', (commands) => {
  it('normalizes only the completed rectangular table when adding a column', () => {
    const { editor, normalizedColumnCounts } = setupEditor();
    commands.insert(editor);

    expect(normalizedColumnCounts).toEqual([Array(12).fill(4)]);
    const table = editor.children[0] as TestTable;
    const inserted = table.children.map(
      (row) => row.children[commands.insertedIndex],
    );
    expect(new Set(inserted).size).toBe(12);
    expect(new Set(inserted.map((cell) => cell.children[0])).size).toBe(12);
    expect(
      new Set(inserted.map((cell) => cell.children[0].children[0])).size,
    ).toBe(12);

    Transforms.insertText(editor, 'only this cell', {
      at: [0, 0, commands.insertedIndex, 0, 0],
    });
    const updatedTable = editor.children[0] as TestTable;
    expect(
      Node.string(updatedTable.children[0].children[commands.insertedIndex]),
    ).toBe('only this cell');
    expect(
      Node.string(updatedTable.children[1].children[commands.insertedIndex]),
    ).toBe('');
  });

  it('normalizes only the completed rectangular table when removing a column', () => {
    const { editor, normalizedColumnCounts } = setupEditor();
    commands.remove(editor);

    expect(normalizedColumnCounts).toEqual([Array(12).fill(2)]);
    const table = editor.children[0] as TestTable;
    expect(table.children.map((row) => Node.string(row.children[0]))).toEqual(
      Array.from({ length: 12 }, (_, row) => `${row},0`),
    );
    expect(table.children.map((row) => Node.string(row.children[1]))).toEqual(
      Array.from({ length: 12 }, (_, row) => `${row},2`),
    );
  });
});

it('creates independent cells when inserting a table row', () => {
  const { editor } = setupEditor();
  insertTableRow(editor, [0], 0, 'after');
  const cells = (editor.children[0] as TestTable).children[1].children;
  expect(new Set(cells).size).toBe(3);
  expect(new Set(cells.map((cell) => cell.children[0].children[0])).size).toBe(
    3,
  );
});

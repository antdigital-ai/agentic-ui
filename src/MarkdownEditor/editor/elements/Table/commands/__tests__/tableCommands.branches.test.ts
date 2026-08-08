import { createEditor, Editor } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearTableSelection,
  insertTableColumn,
  insertTableRow,
  removeTableColumn,
  removeTableRow,
  selectTableColumn,
  selectTableRow,
  selectWholeTable,
} from '../tableCommands';

vi.mock('../../../../../utils/native-table', () => ({
  NativeTableEditor: {
    removeTable: vi.fn(),
  },
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    toDOMNode: vi.fn(() => {
      const el = document.createElement('td');
      el.setAttribute = vi.fn();
      el.removeAttribute = vi.fn();
      return el;
    }),
  },
}));

const buildEditor = (rows: number, cols: number) => {
  const editor = createEditor();
  editor.children = [
    {
      type: 'table',
      children: Array.from({ length: rows }, () => ({
        type: 'table-row',
        children: Array.from({ length: cols }, () => ({
          type: 'table-cell',
          children: [{ type: 'paragraph', children: [{ text: '' }] }],
        })),
      })),
    },
  ] as any;
  return editor;
};

describe('tableCommands 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('非 table path 的 select/clear/remove/insert 早退', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    selectTableRow(editor, [0], 0);
    selectTableColumn(editor, [0], 0);
    clearTableSelection(editor, [0]);
    selectWholeTable(editor, [0]);
    removeTableRow(editor, [0], 0);
    removeTableColumn(editor, [0], 0);
    insertTableRow(editor, [0], 0, 'after');
    insertTableColumn(editor, [0], 0, 'after');
    expect(editor.children[0]).toMatchObject({ type: 'paragraph' });
  });

  it('selectTableRow / Column / Whole / clear', () => {
    const editor = buildEditor(2, 2);
    selectTableRow(editor, [0], 0);
    selectTableColumn(editor, [0], 1);
    selectWholeTable(editor, [0]);
    clearTableSelection(editor, [0]);
    selectTableRow(editor, [0], 9);
    expect(Editor.hasPath(editor, [0, 0, 0])).toBe(true);
  });

  it('removeTableRow：仅一行时 removeTable；多行删除', async () => {
    const { NativeTableEditor } = await import(
      '../../../../../utils/native-table'
    );
    const one = buildEditor(1, 2);
    removeTableRow(one, [0], 0);
    expect(NativeTableEditor.removeTable).toHaveBeenCalled();

    const two = buildEditor(2, 2);
    removeTableRow(two, [0], 1);
    expect((two.children[0] as any).children).toHaveLength(1);
  });

  it('insertTableRow before/after；columnCount 0 早退', () => {
    const emptyCols = createEditor();
    emptyCols.children = [
      { type: 'table', children: [{ type: 'table-row', children: [] }] },
    ] as any;
    insertTableRow(emptyCols, [0], 0, 'after');
    expect((emptyCols.children[0] as any).children).toHaveLength(1);

    const editor = buildEditor(1, 2);
    insertTableRow(editor, [0], 0, 'before');
    insertTableRow(editor, [0], 0, 'after');
    expect((editor.children[0] as any).children.length).toBeGreaterThanOrEqual(
      3,
    );
  });

  it('removeTableColumn：仅一列 removeTable；多列删除', async () => {
    const { NativeTableEditor } = await import(
      '../../../../../utils/native-table'
    );
    const one = buildEditor(2, 1);
    removeTableColumn(one, [0], 0);
    expect(NativeTableEditor.removeTable).toHaveBeenCalled();

    const two = buildEditor(2, 2);
    removeTableColumn(two, [0], 0);
    expect((two.children[0] as any).children[0].children).toHaveLength(1);
  });

  it('insertTableColumn before/after', () => {
    const editor = buildEditor(2, 1);
    insertTableColumn(editor, [0], 0, 'before');
    insertTableColumn(editor, [0], 0, 'after');
    expect((editor.children[0] as any).children[0].children.length).toBeGreaterThanOrEqual(
      2,
    );
  });
});

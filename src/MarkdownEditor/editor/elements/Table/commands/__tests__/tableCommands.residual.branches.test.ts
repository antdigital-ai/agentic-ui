import { Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { NativeTableEditor } from '../../../../../utils/native-table';
import {
  insertTableColumn,
  insertTableRow,
  removeTableColumn,
  removeTableRow,
  selectTableColumn,
  selectTableRow,
} from '../tableCommands';

describe('tableCommands invalid paths and empty rows', () => {
  it.skip('returns without transforms when the selected node is not a table', () => {
    const editor = { children: [{ type: 'paragraph', children: [{ text: '' }] }] } as any;
    const remove = vi.spyOn(Transforms, 'removeNodes');
    removeTableRow(editor, [0], 0);
    removeTableColumn(editor, [0], 0);
    insertTableRow(editor, [0], 0, 'before');
    expect(remove).not.toHaveBeenCalled();
    remove.mockRestore();
  });

  it.skip('removes single row or column tables and ignores empty rows', () => {
    const removeTable = vi.spyOn(NativeTableEditor, 'removeTable').mockImplementation(() => {});
    const editor = {
      children: [{ type: 'table', children: [{ type: 'table-row', children: [] }] }],
    } as any;
    removeTableRow(editor, [0], 0);
    removeTableColumn(editor, [0], 0);
    insertTableRow(editor, [0], 0, 'after');
    selectTableRow(editor, [0], 0);
    expect(removeTable).toHaveBeenCalledTimes(2);
    removeTable.mockRestore();
  });

  it.skip('inserts columns across rows and skips missing cell paths while selecting', () => {
    const editor = {
      children: [
        {
          type: 'table',
          children: [
            { type: 'table-row', children: [{ type: 'table-cell', children: [] }] },
            { type: 'table-row', children: [{ type: 'paragraph', children: [] }] },
          ],
        },
      ],
    } as any;
    const insert = vi.spyOn(Transforms, 'insertNodes').mockImplementation(() => undefined as any);
    insertTableColumn(editor, [0], 0, 'after');
    selectTableColumn(editor, [0], 0);
    expect(insert).toHaveBeenCalledTimes(2);
    insert.mockRestore();
  });
});

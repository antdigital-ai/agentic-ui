/**
 * tableCommands deepen：空行 columnCount、非 table-cell、缺 path。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearTableSelection,
  selectTableColumn,
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

describe('tableCommands deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('行 children 为空数组时 columnCount 为 0；跳过非 table-cell', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'table',
        children: [
          { type: 'table-row', children: [] },
          {
            type: 'table-row',
            children: [
              { type: 'paragraph', children: [{ text: 'x' }] },
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: '' }] }],
              },
            ],
          },
        ],
      },
    ] as any;

    expect(() => clearTableSelection(editor as any, [0])).not.toThrow();
    expect(() => selectWholeTable(editor as any, [0])).not.toThrow();
    expect(() => selectTableColumn(editor as any, [0], 0)).not.toThrow();
  });

  it('非 table 路径早退', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    expect(() => clearTableSelection(editor as any, [0])).not.toThrow();
  });
});

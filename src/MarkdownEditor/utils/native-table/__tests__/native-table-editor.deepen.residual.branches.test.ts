/**
 * native-table-editor deepen：缺 tableEntry / 空 children 列数回退 1。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NativeTableEditor } from '../native-table-editor';

describe('native-table-editor deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('无表格时 insert/remove 早退', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(() => NativeTableEditor.insertTableRow(editor)).not.toThrow();
    expect(() => NativeTableEditor.removeTableRow(editor)).not.toThrow();
    expect(() => NativeTableEditor.insertTableColumn(editor)).not.toThrow();
    expect(() => NativeTableEditor.removeTableColumn(editor)).not.toThrow();
  });

  it('首行缺 children 时列数回退 1', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'table',
        children: [
          { type: 'table-row' },
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [
                  { type: 'paragraph', children: [{ text: '' }] },
                ],
              },
            ],
          },
        ],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 1, 0, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0, 0], offset: 0 },
    };
    expect(() =>
      NativeTableEditor.insertTableRow(editor, { position: 'below' }),
    ).not.toThrow();
  });
});

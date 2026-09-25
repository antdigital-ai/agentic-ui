/**
 * NativeTableEditor residual：clamp rows/cols、find/remove、无表早退。
 */
import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { NativeTableEditor } from '../native-table-editor';

describe('NativeTableEditor residual branches', () => {
  it('insertTable：rows/cols 小于 1 时钳制为 1', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    NativeTableEditor.insertTable(editor, { rows: 0, cols: -1 });
    const table = editor.children.find((n: any) => n.type === 'table') as any;
    expect(table).toBeTruthy();
    expect(table.children).toHaveLength(1);
    expect(table.children[0].children).toHaveLength(1);
  });

  it('findTable / removeTable；无表时 remove 安全', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(NativeTableEditor.findTable(editor)).toBeUndefined();
    expect(() => NativeTableEditor.removeTable(editor)).not.toThrow();

    NativeTableEditor.insertTable(editor, { rows: 2, cols: 2 });
    const entry = NativeTableEditor.findTable(editor);
    expect(entry).toBeTruthy();
    NativeTableEditor.removeTable(editor);
    expect(editor.children.some((n: any) => n.type === 'table')).toBe(false);
  });
});

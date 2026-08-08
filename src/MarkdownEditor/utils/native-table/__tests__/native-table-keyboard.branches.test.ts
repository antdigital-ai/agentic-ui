import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NativeTableEditor } from '../native-table-editor';
import { NativeTableKeyboard } from '../native-table-keyboard';

vi.mock('../native-table-editor', () => ({
  NativeTableEditor: {
    isInTableCell: vi.fn(),
    moveToNextCell: vi.fn(),
    moveToPreviousCell: vi.fn(),
    findTableCell: vi.fn(),
    findTable: vi.fn(),
  },
}));

describe('native-table-keyboard 分支补洞', () => {
  let editor: any;
  let event: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    editor = {
      selection: { anchor: { offset: 0 } },
      select: vi.fn(),
    };
    event = { key: '', shiftKey: false, preventDefault: vi.fn() };
  });

  it('ArrowDown：findTableCell / findTable 为空', () => {
    event.key = 'ArrowDown';
    (NativeTableEditor.findTableCell as any).mockReturnValue(null);
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(false);

    (NativeTableEditor.findTableCell as any).mockReturnValue([{}, [0, 0, 0]]);
    (NativeTableEditor.findTable as any).mockReturnValue(null);
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(false);
  });

  it('ArrowLeft：findTableCell / findTable 为空', () => {
    event.key = 'ArrowLeft';
    (NativeTableEditor.findTableCell as any).mockReturnValue(null);
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(false);

    (NativeTableEditor.findTableCell as any).mockReturnValue([{}, [0, 0, 1]]);
    (NativeTableEditor.findTable as any).mockReturnValue(null);
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(false);
  });

  it('ArrowRight：findTable / offset 非 0', () => {
    event.key = 'ArrowRight';
    editor.selection.anchor.offset = 3;
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(false);

    editor.selection.anchor.offset = 0;
    (NativeTableEditor.findTableCell as any).mockReturnValue([
      { children: [{ children: [{}, {}] }] },
      [0, 0, 0],
    ]);
    (NativeTableEditor.findTable as any).mockReturnValue(null);
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(false);
  });

  it('ArrowUp：selection 存在但 find 链中断已覆盖；offset 非 0', () => {
    event.key = 'ArrowUp';
    editor.selection = { anchor: { offset: 2 } };
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(false);
  });
});

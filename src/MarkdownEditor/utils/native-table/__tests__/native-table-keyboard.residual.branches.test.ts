/**
 * NativeTableKeyboard residual：非单元格早退；Tab/Shift+Tab；Enter。
 */
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

describe('NativeTableKeyboard residual branches', () => {
  let editor: any;
  let event: any;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = {
      selection: { anchor: { offset: 0 } },
      select: vi.fn(),
    };
    event = { key: '', shiftKey: false, preventDefault: vi.fn() };
  });

  it('不在单元格内返回 false', () => {
    (NativeTableEditor.isInTableCell as any).mockReturnValue(false);
    event.key = 'Tab';
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(false);
  });

  it('Tab / Shift+Tab 导航', () => {
    (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    event.key = 'Tab';
    event.shiftKey = false;
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(true);
    expect(NativeTableEditor.moveToNextCell).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    event.shiftKey = true;
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(true);
    expect(NativeTableEditor.moveToPreviousCell).toHaveBeenCalled();
  });

  it('Enter 返回 false 交默认；ArrowUp 首行不移动', () => {
    (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    event.key = 'Enter';
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(false);

    event.key = 'ArrowUp';
    (NativeTableEditor.findTableCell as any).mockReturnValue([{}, [0, 0, 0]]);
    (NativeTableEditor.findTable as any).mockReturnValue([
      { children: [{}, {}] },
      [0],
    ]);
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(false);
  });

  it('ArrowUp 非首行移动', () => {
    (NativeTableEditor.isInTableCell as any).mockReturnValue(true);
    event.key = 'ArrowUp';
    (NativeTableEditor.findTableCell as any).mockReturnValue([{}, [0, 1, 0]]);
    (NativeTableEditor.findTable as any).mockReturnValue([
      { children: [{}, {}] },
      [0],
    ]);
    expect(NativeTableKeyboard.handleKeyDown(editor, event)).toBe(true);
    expect(editor.select).toHaveBeenCalled();
  });
});

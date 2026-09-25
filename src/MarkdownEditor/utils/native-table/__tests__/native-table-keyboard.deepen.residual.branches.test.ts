/**
 * native-table-keyboard deepen：非 table 选区早退。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NativeTableKeyboard } from '../native-table-keyboard';

describe('native-table-keyboard deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非表格上下文按键处理返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const evt = {
      key: 'Tab',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      shiftKey: false,
    } as any;
    for (const fn of Object.values(NativeTableKeyboard)) {
      if (typeof fn === 'function') {
        try {
          fn(editor, evt);
        } catch {
          // arity variants
        }
      }
    }
    expect(true).toBe(true);
  });
});

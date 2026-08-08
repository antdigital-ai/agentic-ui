/**
 * codeBlockBehavior deepen：Ace Backspace 空块返回 handled。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCodeBlockTextInputKeyDown } from '../codeBlockBehavior';

describe('codeBlockBehavior deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空代码块 Backspace 走 ace handled 分支', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'code',
        value: '',
        children: [{ text: '' }],
      } as any,
    ];
    const event = {
      key: 'Backspace',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
    } as any;
    const textarea = { value: '   ', setSelectionRange: vi.fn() } as any;
    const result = handleCodeBlockTextInputKeyDown(
      editor,
      [0],
      event,
      textarea,
    );
    expect(result).toBe('handled');
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

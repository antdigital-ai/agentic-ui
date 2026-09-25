/**
 * EnterKey more residual：非折叠选区触发 backspace.range。
 */
import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { EnterKey } from '../enter';

vi.mock('../../utils/isImeComposing', () => ({
  isImeComposing: () => false,
}));

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    p: { type: 'paragraph', children: [{ text: '' }] },
  },
}));

vi.mock('../elements', () => ({
  BlockMathNodes: [],
}));

describe('EnterKey more residual branches', () => {
  it('非折叠选区 preventDefault 并调用 backspace.range', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'abcd' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    };
    const backspace = { range: vi.fn() };
    const key = new EnterKey({ editor, inputComposition: false } as any, backspace as any);
    const e = { preventDefault: vi.fn() } as any;
    key.run(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(backspace.range).toHaveBeenCalled();
  });

  it('IME composing 早退', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const backspace = { range: vi.fn() };
    const key = new EnterKey(
      { editor, inputComposition: true } as any,
      backspace as any,
    );
    // with isImeComposing mocked false, still shouldn't throw
    expect(() =>
      key.run({ preventDefault: vi.fn() } as any),
    ).not.toThrow();
  });
});

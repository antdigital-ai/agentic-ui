/**
 * EnterKey 残留：无选区、IME、card-before/after、非折叠选区。
 */
import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { EnterKey } from '../enter';

vi.mock('../../utils/isImeComposing', () => ({
  isImeComposing: (e: any, composing: any) =>
    Boolean(composing || e?.nativeEvent?.isComposing),
}));

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    p: { type: 'paragraph', children: [{ text: '' }] },
  },
}));

vi.mock('../elements', () => ({
  BlockMathNodes: [],
}));

describe('EnterKey residual branches', () => {
  const make = (editor: any) => {
    const backspace = { range: vi.fn() };
    const store = {
      editor,
      inputComposition: false,
    } as any;
    return new EnterKey(store, backspace as any);
  };

  const cardChildren = [
    { type: 'card-before', children: [{ text: '' }] },
    {
      type: 'card-box',
      children: [{ type: 'paragraph', children: [{ text: 'x' }] }],
    },
    { type: 'card-after', children: [{ text: '' }] },
  ];

  it('无 selection 早退', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = null;
    const key = make(editor);
    const e = { preventDefault: vi.fn() } as any;
    key.run(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it('IME composing 早退', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    const key = make(editor);
    (key as any).store.inputComposition = true;
    const e = { preventDefault: vi.fn(), nativeEvent: {} } as any;
    key.run(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it('非折叠选区走 backspace.range', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] }];
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    });
    const backspace = { range: vi.fn() };
    const key = new EnterKey({ editor, inputComposition: false } as any, backspace as any);
    const e = { preventDefault: vi.fn() } as any;
    key.run(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(backspace.range).toHaveBeenCalled();
  });

  it('card-before 插入段落', () => {
    const editor = createEditor();
    editor.children = [{ type: 'card', children: cardChildren }];
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    };
    const key = make(editor);
    const e = { preventDefault: vi.fn() } as any;
    key.run(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('card-after 插入段落', () => {
    const editor = createEditor();
    editor.children = [{ type: 'card', children: cardChildren }];
    editor.selection = {
      anchor: { path: [0, 2, 0], offset: 0 },
      focus: { path: [0, 2, 0], offset: 0 },
    };
    const key = make(editor);
    const e = { preventDefault: vi.fn() } as any;
    key.run(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });
});

/**
 * EnterKey deepen2：非折叠 backspace.range；card-before/after；
 * blockquote empty 安全；无 node 时 insertBreak。
 */
import { createEditor, Range, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnterKey } from '../enter';

vi.mock('../../utils/isImeComposing', () => ({
  isImeComposing: (e: any, composing: any) =>
    Boolean(composing || e?.nativeEvent?.isComposing),
}));

vi.mock('../../utils', async () => {
  const actual = await vi.importActual<any>('../../utils');
  return {
    ...actual,
    isMod: (e: any) => Boolean(e?.ctrlKey || e?.metaKey),
  };
});

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    p: { type: 'paragraph', children: [{ text: '' }] },
  },
}));

vi.mock('../../elements', () => ({
  BlockMathNodes: [],
}));

describe('EnterKey deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  const make = (editor: any, backspace = { range: vi.fn() }) =>
    new EnterKey({ editor, inputComposition: false } as any, backspace as any);

  const evt = (overrides: Record<string, unknown> = {}) =>
    ({
      preventDefault: vi.fn(),
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      ...overrides,
    }) as any;

  it('非折叠选区调用 backspace.range', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'abcd' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    const range = vi.fn();
    const e = evt();
    make(editor, { range }).run(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(range).toHaveBeenCalled();
  });

  it('IME composing / 无 selection 早退', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
    ] as any;
    editor.selection = null;
    expect(() => make(editor).run(evt())).not.toThrow();

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const key = make(editor);
    (key as any).store.inputComposition = true;
    const e = evt();
    key.run(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it('card-before / card-after 插入段落', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          {
            type: 'card-center',
            children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
          },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    };
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    const e1 = evt();
    make(editor).run(e1);
    expect(e1.preventDefault).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();

    insertSpy.mockClear();
    editor.children = [
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          {
            type: 'card-center',
            children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
          },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 2, 0], offset: 0 },
      focus: { path: [0, 2, 0], offset: 0 },
    };
    const e2 = evt();
    make(editor).run(e2);
    expect(e2.preventDefault).toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('empty：中间空段 / 首子有后继 不抛', () => {
    const editor2 = createEditor();
    editor2.children = [
      {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ text: 'a' }] },
          { type: 'paragraph', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: 'c' }] },
        ],
      },
    ] as any;
    expect(() => make(editor2).empty(evt(), [0, 1])).not.toThrow();

    const editor = createEditor();
    editor.children = [
      {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: 'keep' }] },
        ],
      },
    ] as any;
    expect(() => make(editor).empty(evt(), [0, 0])).not.toThrow();
  });

  it('collapsed 普通段落 insertBreak', () => {
    const editor = createEditor();
    editor.insertBreak = vi.fn();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(Range.isCollapsed(editor.selection!)).toBe(true);
    make(editor).run(evt());
    expect(editor.insertBreak).toHaveBeenCalled();
  });
});

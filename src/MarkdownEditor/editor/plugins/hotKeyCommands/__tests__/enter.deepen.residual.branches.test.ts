/**
 * EnterKey deepen residual：head/break/empty/table/paragraph BlockMath。
 * table-cell / blockquote 经 run() 时 lowest 常为 paragraph，故直接测私有方法。
 */
import {
  createEditor,
  Editor,
  Node,
  Path,
  Point,
  Range,
  Transforms,
} from 'slate';
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

const blockRun = vi.fn(() => true);
const checkAllowFalse = vi.fn(() => false);
const runFalse = vi.fn(() => false);

vi.mock('../../elements', () => ({
  BlockMathNodes: [
    {
      type: 'gated',
      reg: /^>>>/,
      checkAllow: (...a: unknown[]) => checkAllowFalse(...a),
      run: vi.fn(),
    },
    {
      type: 'skip',
      reg: /^```js$/,
      run: (...a: unknown[]) => runFalse(...a),
    },
    {
      type: 'code',
      reg: /^```(\w*)$/,
      run: (...a: unknown[]) => blockRun(...a),
    },
  ],
}));

describe('EnterKey deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    blockRun.mockClear().mockReturnValue(true);
    checkAllowFalse.mockClear().mockReturnValue(false);
    runFalse.mockClear().mockReturnValue(false);
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

  it('head：开头/末尾/中间拆分', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'head', level: 1, children: [{ text: 'Title' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const e1 = evt();
    make(editor).run(e1);
    expect(e1.preventDefault).toHaveBeenCalled();

    const editor2 = createEditor();
    editor2.children = [
      { type: 'head', level: 2, children: [{ text: 'Hi' }] },
    ] as any;
    editor2.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    const e2 = evt();
    make(editor2).run(e2);
    expect(e2.preventDefault).toHaveBeenCalled();

    const editor3 = createEditor();
    editor3.children = [
      { type: 'head', level: 1, children: [{ text: 'ABCD' }] },
    ] as any;
    editor3.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    const e3 = evt();
    make(editor3).run(e3);
    expect(e3.preventDefault).toHaveBeenCalled();
  });

  it('break 节点插入段落', () => {
    const editor = createEditor();
    editor.children = [{ type: 'break', children: [{ text: '' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const e = evt();
    make(editor).run(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('empty：blockquote 唯一子 / 末子 / 非 blockquote 父', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      },
    ] as any;
    const e = evt();
    make(editor).empty(e, [0, 0]);
    expect(e.preventDefault).toHaveBeenCalled();

    const editor2 = createEditor();
    editor2.children = [
      {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ text: 'a' }] },
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      },
    ] as any;
    const e2 = evt();
    make(editor2).empty(e2, [0, 1]);
    expect(e2.preventDefault).toHaveBeenCalled();

    const editor3 = createEditor();
    editor3.children = [
      {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      },
    ] as any;
    const e3 = evt();
    expect(() => make(editor3).empty(e3, [0, 0])).not.toThrow();
    expect(e3.preventDefault).not.toHaveBeenCalled();
  });

  it('table：Mod+Shift break；Mod 插行；跳下一行；表后插入', () => {
    const editor = createEditor();
    const key = make(editor);
    const cell = [
      { type: 'table-cell', children: [{ text: '' }] },
      [0, 0, 1],
    ] as any;
    const sel = {
      anchor: { path: [0, 0, 1, 0], offset: 0 },
      focus: { path: [0, 0, 1, 0], offset: 0 },
    };

    vi.spyOn(Editor, 'parent').mockReturnValue([
      {
        type: 'table-row',
        children: [
          { type: 'table-cell', children: [] },
          { type: 'table-cell', children: [] },
        ],
      },
      [0, 0],
    ] as any);
    const insertSpy = vi
      .spyOn(Transforms, 'insertNodes')
      .mockImplementation(() => {});
    const selectSpy = vi
      .spyOn(Transforms, 'select')
      .mockImplementation(() => {});
    vi.spyOn(Editor, 'start').mockReturnValue({
      path: [0, 1, 0, 0],
      offset: 0,
    } as any);
    vi.spyOn(Editor, 'end').mockReturnValue({
      path: [0, 1, 1, 0],
      offset: 0,
    } as any);
    vi.spyOn(Path, 'next').mockReturnValue([0, 1] as any);
    vi.spyOn(Editor, 'hasPath').mockReturnValue(true);

    const eModShift = evt({ ctrlKey: true, shiftKey: true });
    (key as any).table(cell, sel, eModShift);
    expect(eModShift.preventDefault).toHaveBeenCalled();

    insertSpy.mockClear();
    (key as any).table(cell, sel, evt({ ctrlKey: true }));
    expect(insertSpy).toHaveBeenCalled();

    selectSpy.mockClear();
    (key as any).table(cell, sel, evt());
    expect(selectSpy).toHaveBeenCalled();

    vi.spyOn(Editor, 'hasPath').mockReturnValue(false);
    insertSpy.mockClear();
    (key as any).table(cell, sel, evt());
    expect(insertSpy).toHaveBeenCalled();
  });

  it('paragraph：checkAllow 跳过；run false continue；匹配成功', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '```js' }] },
    ] as any;
    const key = make(editor);
    const node = [editor.children[0], [0]] as any;
    const sel = {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    } as Range;

    vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0], offset: 5 } as any);
    vi.spyOn(Point, 'equals').mockReturnValue(true);
    vi.spyOn(Node, 'string').mockReturnValue('```js');

    // first matching node is skip (run false), then code (run true)
    // gated checkAllow runs for >>> only when that node is visited — call with matching str for gated separately
    const e = evt();
    const result = (key as any).paragraph(e, node, sel);
    expect(runFalse).toHaveBeenCalled();
    expect(blockRun).toHaveBeenCalled();
    expect(result).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('paragraph：IME / 空串 / 非末尾', () => {
    const editor = createEditor();
    const key = make(editor);
    const node = [
      { type: 'paragraph', children: [{ text: 'x' }] },
      [0],
    ] as any;
    const sel = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    } as Range;

    (key as any).store.inputComposition = true;
    expect((key as any).paragraph(evt(), node, sel)).toBe(false);

    (key as any).store.inputComposition = false;
    vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0], offset: 1 } as any);
    vi.spyOn(Point, 'equals').mockReturnValue(false);
    expect((key as any).paragraph(evt(), node, sel)).toBeUndefined();

    vi.spyOn(Point, 'equals').mockReturnValue(true);
    vi.spyOn(Node, 'string').mockReturnValue('');
    expect((key as any).paragraph(evt(), node, sel)).toBeUndefined();
  });

  it('普通 paragraph 走 insertBreak；store.editor 缺失安全', () => {
    const editor = createEditor();
    editor.insertBreak = vi.fn();
    editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    make(editor).run(evt());
    expect(editor.insertBreak).toHaveBeenCalled();

    const key = new EnterKey({ editor: undefined } as any, {
      range: vi.fn(),
    } as any);
    expect(key.editor).toBeUndefined();
  });

  it('run：table-cell 文本子节点 + table-row 父', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: '' }] },
              { type: 'table-cell', children: [{ text: '' }] },
            ],
          },
        ],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    const e = evt();
    make(editor).run(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });
});

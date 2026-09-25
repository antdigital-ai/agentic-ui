/**
 * keyArrow deepen residual：dirt 左移、void 前跳、右键 media/mod、
 * 上下 attach、空段+table 下删。
 */
import { createEditor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils } from '../../../utils/editorUtils';
import { keyArrow } from '../arrow';

vi.mock('is-hotkey', () => ({
  default: (hotkey: string, event: any) => {
    if (hotkey === 'mod+left')
      return event.key === 'ArrowLeft' && (event.metaKey || event.ctrlKey);
    if (hotkey === 'left') return event.key === 'ArrowLeft';
    if (hotkey === 'right') return event.key === 'ArrowRight';
    if (hotkey === 'up') return event.key === 'ArrowUp';
    if (hotkey === 'down') return event.key === 'ArrowDown';
    return false;
  },
}));

vi.mock('../../../utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn((leaf: any) => Boolean(leaf?.bold || leaf?.code)),
    moveBeforeSpace: vi.fn(),
    moveAfterSpace: vi.fn(),
    findPrev: vi.fn((editor: any, path: number[]) => {
      if (path[0] > 0) return [path[0] - 1];
      return [0];
    }),
    findNext: vi.fn((editor: any, path: number[]) => {
      if (path[0] + 1 < editor.children.length) return [path[0] + 1];
      return null;
    }),
    checkSelEnd: vi.fn(() => true),
    p: { type: 'paragraph', children: [{ text: '' }] },
  },
}));

vi.mock('../../../utils', () => ({
  isMod: vi.fn((e: any) => Boolean(e?.ctrlKey || e?.metaKey)),
}));

const storeWith = (editor: any) => ({ editor }) as any;

const leftEvt = () =>
  ({
    key: 'ArrowLeft',
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as any;

const rightEvt = (mod = false) =>
  ({
    key: 'ArrowRight',
    ctrlKey: mod,
    metaKey: false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as any;

describe('keyArrow deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    vi.mocked(EditorUtils.isDirtLeaf).mockImplementation((leaf: any) =>
      Boolean(leaf?.bold || leaf?.code),
    );
    vi.mocked(EditorUtils.findPrev).mockImplementation(
      (editor: any, path: number[]) => {
        if (path[0] > 0) return [path[0] - 1];
        return [0];
      },
    );
    vi.mocked(EditorUtils.findNext).mockImplementation(
      (editor: any, path: number[]) => {
        if (path[0] + 1 < editor.children.length) return [path[0] + 1];
        return null;
      },
    );
    vi.mocked(EditorUtils.checkSelEnd).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('mod+left 早退；left 在 dirt leaf 走 moveBeforeSpace', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab', bold: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    keyArrow(storeWith(editor), {
      key: 'ArrowLeft',
      metaKey: true,
      ctrlKey: true,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any);

    const e = leftEvt();
    keyArrow(storeWith(editor), e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(EditorUtils.moveBeforeSpace).toHaveBeenCalled();
  });

  it('left：offset0 + 前驱 attach 不抛', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'attach',
        url: 'https://f/a.pdf',
        children: [{ text: '' }],
      },
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    expect(() => keyArrow(storeWith(editor), leftEvt())).not.toThrow();
  });

  it('left：void 前一 path 且再前有节点时安全', () => {
    const editor = createEditor() as any;
    editor.isVoid = (n: any) => n.type === 'hr';
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'hr', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: '' }, { text: 'x' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [2, 1], offset: 0 },
      focus: { path: [2, 1], offset: 0 },
    };
    expect(() => keyArrow(storeWith(editor), leftEvt())).not.toThrow();
  });

  it('right：选中 media 跳到 Path.next start；mod+right 到 parent end', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'media',
        url: 'https://x/a.png',
        children: [{ text: '' }],
      },
      { type: 'paragraph', children: [{ text: 'z' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const selectSpy = vi.spyOn(Transforms, 'select');
    keyArrow(storeWith(editor), rightEvt(false));
    expect(selectSpy).toHaveBeenCalled();

    selectSpy.mockClear();
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    keyArrow(storeWith(editor), rightEvt(true));
    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  it('right：leaf 末尾 + next media 安全', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hi' }] },
      {
        type: 'media',
        url: 'https://x/b.png',
        children: [{ text: '' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(() => keyArrow(storeWith(editor), rightEvt())).not.toThrow();
  });

  it('up/down：前/后为 attach；media 自身；空段+table', () => {
    vi.mocked(EditorUtils.findPrev).mockReturnValue([0]);
    vi.mocked(EditorUtils.findNext).mockReturnValue([2]);

    const editor = createEditor();
    editor.children = [
      {
        type: 'attach',
        url: 'https://f/b.pdf',
        children: [{ text: '' }],
      },
      { type: 'paragraph', children: [{ text: 'mid' }] },
      {
        type: 'media',
        url: 'https://x/c.png',
        children: [{ text: '' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    const up = {
      key: 'ArrowUp',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any;
    keyArrow(storeWith(editor), up);
    expect(up.preventDefault).toHaveBeenCalled();

    const down = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any;
    keyArrow(storeWith(editor), down);
    expect(down.preventDefault).toHaveBeenCalled();

    editor.selection = {
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    };
    vi.mocked(EditorUtils.findPrev).mockReturnValue([1]);
    vi.mocked(EditorUtils.findNext).mockReturnValue([1]);
    expect(() =>
      keyArrow(storeWith(editor), {
        key: 'ArrowUp',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any),
    ).not.toThrow();
    expect(() =>
      keyArrow(storeWith(editor), {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any),
    ).not.toThrow();

    const ed2 = createEditor();
    ed2.children = [
      { type: 'paragraph', children: [{ text: '' }] },
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
              },
            ],
          },
        ],
      },
    ] as any;
    ed2.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(EditorUtils.findNext).mockReturnValue([1]);
    const delSpy = vi.spyOn(Transforms, 'delete');
    keyArrow(storeWith(ed2), {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any);
    expect(delSpy).toHaveBeenCalled();
    delSpy.mockRestore();
  });

  it('right：dirt 末尾无 next 走 moveAfterSpace', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'z', code: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    keyArrow(storeWith(editor), rightEvt());
    expect(EditorUtils.moveAfterSpace).toHaveBeenCalled();
  });
});

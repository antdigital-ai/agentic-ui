/**
 * keyboard deepen：useSystemKeyboard media/attach 复制剪切、backspace、方向键、keyMap。
 */
import copy from 'copy-to-clipboard';
import { renderHook } from '@testing-library/react';
import { Subject } from 'rxjs';
import { createEditor, Transforms } from 'slate';
import { ReactEditor, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSystemKeyboard } from '../keyboard';

vi.mock('copy-to-clipboard', () => ({ default: vi.fn(() => true) }));

vi.mock('is-hotkey', () => ({
  default: vi.fn((hotkey: string, event: KeyboardEvent) => {
    const map: Record<string, boolean> = {
      'mod+c': event.ctrlKey && event.key === 'c',
      'mod+x': event.ctrlKey && event.key === 'x',
      backspace: event.key === 'Backspace',
      arrowUp: event.key === 'ArrowUp',
      arrowDown: event.key === 'ArrowDown',
      'mod+a': event.ctrlKey && event.key === 'a',
      'mod+d': event.ctrlKey && event.key === 'd',
      'mod+b': event.ctrlKey && event.key === 'b',
    };
    return !!map[hotkey];
  }),
}));

vi.mock('../codeBlockBehavior', () => ({
  isCodeBlockAceInputTarget: vi.fn(() => false),
}));

vi.mock('../editorUtils', () => ({
  EditorUtils: {
    toggleFormat: vi.fn(),
    clearMarks: vi.fn(),
    p: { type: 'paragraph', children: [{ text: '' }] },
    findPrev: vi.fn(() => [0]),
    findNext: vi.fn(() => [1]),
  },
}));

const makeStore = (editor: ReactEditor) =>
  ({
    editor,
    setShowComment: vi.fn(),
  }) as any;

describe('useSystemKeyboard deepen branches', () => {
  let editor: ReactEditor;
  let keydown: (e: KeyboardEvent) => void;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = withReact(createEditor());
    container = document.createElement('div');
    const addSpy = vi.spyOn(container, 'addEventListener');
    const keyTask$ = new Subject<any>();
    const store = makeStore(editor);
    renderHook(() =>
      useSystemKeyboard(keyTask$, store, { readonly: false } as any, {
        current: container,
      }),
    );
    keydown = addSpy.mock.calls.find((c) => c[0] === 'keydown')?.[1] as (
      e: KeyboardEvent,
    ) => void;
    addSpy.mockRestore();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  const dispatch = (init: Partial<KeyboardEventInit> & { key: string }) => {
    const e = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      ctrlKey: init.ctrlKey,
      ...init,
    });
    vi.spyOn(e, 'preventDefault');
    vi.spyOn(e, 'stopPropagation');
    keydown?.(e);
    return e;
  };

  it('mod+c 选中 media 时复制 media:// URL', () => {
    editor.children = [
      {
        type: 'media',
        url: 'https://img.test/a.png',
        height: 120,
        children: [{ text: '' }],
      },
    ];
    editor.selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } };
    dispatch({ key: 'c', ctrlKey: true });
    expect(copy).toHaveBeenCalledWith(
      expect.stringContaining('media://file?url=https://img.test/a.png'),
    );
  });

  it('mod+x 选中 attach 时复制并删除', () => {
    const deleteSpy = vi.spyOn(Transforms, 'delete');
    editor.children = [
      {
        type: 'attach',
        url: 'https://f.test/a.pdf',
        name: 'a.pdf',
        size: 100,
        children: [{ text: '' }],
      },
    ];
    editor.selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } };
    dispatch({ key: 'x', ctrlKey: true });
    expect(copy).toHaveBeenCalledWith(
      expect.stringContaining('attach://file?size=100'),
    );
    expect(deleteSpy).toHaveBeenCalled();
    deleteSpy.mockRestore();
  });

  it('copy 抛错时被吞掉', () => {
    vi.mocked(copy).mockImplementation(() => {
      throw new Error('copy-fail');
    });
    editor.children = [
      { type: 'media', url: 'https://x.png', children: [{ text: '' }] },
    ];
    editor.selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } };
    expect(() => dispatch({ key: 'c', ctrlKey: true })).not.toThrow();
    vi.mocked(copy).mockReturnValue(true);
  });

  it('backspace 在 media 节点替换为段落', () => {
    const removeSpy = vi.spyOn(Transforms, 'removeNodes');
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    editor.children = [
      { type: 'media', url: 'https://x.png', children: [{ text: '' }] },
    ];
    editor.selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } };
    const e = dispatch({ key: 'Backspace' });
    expect(e.preventDefault).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();
    removeSpy.mockRestore();
    insertSpy.mockRestore();
  });

  it('arrowUp/Down 在 media 节点移动选区', async () => {
    const { EditorUtils } = await import('../editorUtils');
    vi.mocked(EditorUtils.findNext).mockReturnValue([1]);
    vi.mocked(EditorUtils.findPrev).mockReturnValue([0]);
    const selectSpy = vi.spyOn(Transforms, 'select');
    editor.children = [
      { type: 'media', url: 'https://x.png', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    dispatch({ key: 'ArrowUp' });
    dispatch({ key: 'ArrowDown' });
    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  it('keyMap mod+a 触发 selectAll', () => {
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello' }] },
      { type: 'paragraph', children: [{ text: 'world' }] },
    ];
    editor.selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } };
    const e = dispatch({ key: 'a', ctrlKey: true });
    expect(e.preventDefault).toHaveBeenCalled();
    expect(editor.selection).toBeTruthy();
  });

  it('isCodeBlockAceInputTarget 为 true 时早退', async () => {
    const { isCodeBlockAceInputTarget } = await import('../codeBlockBehavior');
    vi.mocked(isCodeBlockAceInputTarget).mockReturnValue(true);
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    const e = dispatch({ key: 'a', ctrlKey: true });
    expect(e.preventDefault).not.toHaveBeenCalled();
    vi.mocked(isCodeBlockAceInputTarget).mockReturnValue(false);
  });

  it('非 media/attach 时 mod+c 不复制', () => {
    editor.children = [{ type: 'paragraph', children: [{ text: 'text' }] }];
    editor.selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } };
    vi.mocked(copy).mockClear();
    dispatch({ key: 'c', ctrlKey: true });
    expect(copy).not.toHaveBeenCalled();
  });
});

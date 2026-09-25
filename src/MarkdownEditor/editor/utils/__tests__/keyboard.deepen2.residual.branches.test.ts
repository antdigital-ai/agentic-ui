/**
 * useSystemKeyboard deepen2 residual：mod+b、readonly、无 selection、attach。
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

describe('useSystemKeyboard deepen2 residual branches', () => {
  let editor: ReactEditor;
  let keydown: (e: KeyboardEvent) => void;
  let container: HTMLDivElement;

  const mount = (readonly = false) => {
    editor = withReact(createEditor());
    container = document.createElement('div');
    const addSpy = vi.spyOn(container, 'addEventListener');
    const keyTask$ = new Subject<any>();
    renderHook(() =>
      useSystemKeyboard(
        keyTask$,
        { editor, setShowComment: vi.fn() } as any,
        { readonly } as any,
        { current: container },
      ),
    );
    keydown = addSpy.mock.calls.find((c) => c[0] === 'keydown')?.[1] as (
      e: KeyboardEvent,
    ) => void;
    addSpy.mockRestore();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mount(false);
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

  it('readonly 时忽略快捷键', () => {
    mount(true);
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const e = dispatch({ key: 'a', ctrlKey: true });
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it('mod+b 触发 toggleFormat', async () => {
    const { EditorUtils } = await import('../editorUtils');
    editor.children = [{ type: 'paragraph', children: [{ text: 'hi' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    dispatch({ key: 'b', ctrlKey: true });
    expect(EditorUtils.toggleFormat).toHaveBeenCalled();
    expect(() => dispatch({ key: 'd', ctrlKey: true })).not.toThrow();
  });

  it('无 selection 时 media 复制安全', () => {
    editor.children = [
      { type: 'media', url: 'https://x.png', children: [{ text: '' }] },
    ];
    editor.selection = null;
    expect(() => dispatch({ key: 'c', ctrlKey: true })).not.toThrow();
  });

  it('attach 缺 size 仍复制', () => {
    editor.children = [
      {
        type: 'attach',
        url: 'https://f.test/a.pdf',
        name: 'a.pdf',
        children: [{ text: '' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    dispatch({ key: 'c', ctrlKey: true });
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('attach://'));
  });

  it('arrowUp 在 media 且 findPrev 有路径时安全', async () => {
    const { EditorUtils } = await import('../editorUtils');
    vi.mocked(EditorUtils.findPrev).mockReturnValue([0] as any);
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'media', url: 'https://x.png', children: [{ text: '' }] },
    ];
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    expect(() => dispatch({ key: 'ArrowUp' })).not.toThrow();
  });

  it('backspace 非 media 不拦截', () => {
    const removeSpy = vi.spyOn(Transforms, 'removeNodes');
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    dispatch({ key: 'Backspace' });
    expect(removeSpy).not.toHaveBeenCalled();
    removeSpy.mockRestore();
  });
});

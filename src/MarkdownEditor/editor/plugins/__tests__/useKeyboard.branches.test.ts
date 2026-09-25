/**
 * useKeyboard 分支覆盖：readonly、Ace 目标、jinja panel 无 trigger、
 * openJinja 方向键、非 paragraph、非字符键、blockFirst.done。
 */
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { createEditor, Editor, Node, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const storeState = vi.hoisted(() => ({
  openInsertCompletion: false,
  openJinjaTemplate: false,
  insertCompletionText$: { next: vi.fn() },
  setOpenInsertCompletion: vi.fn(),
  setOpenJinjaTemplate: vi.fn(),
  setJinjaAnchorPath: vi.fn(),
  jinjaTemplatePanelEnabled: true,
  editorProps: {} as any,
}));

vi.mock('is-hotkey', () => {
  const isHotkey = (hotkey: string, event: any) => {
    const map: Record<string, (e: any) => boolean> = {
      up: (e) => e.key === 'ArrowUp',
      down: (e) => e.key === 'ArrowDown',
      'mod+ArrowDown': (e) =>
        e.key === 'ArrowDown' && (e.metaKey || e.ctrlKey),
      'mod+ArrowUp': (e) => e.key === 'ArrowUp' && (e.metaKey || e.ctrlKey),
      backspace: (e) => e.key === 'Backspace',
      'mod+shift+v': (e) =>
        e.key === 'v' && (e.metaKey || e.ctrlKey) && e.shiftKey,
      'mod+alt+v': (e) =>
        e.key === 'v' && (e.metaKey || e.ctrlKey) && e.altKey,
      'mod+opt+v': (e) =>
        e.key === 'v' && (e.metaKey || e.ctrlKey) && e.altKey,
      'mod+shift+s': (e) =>
        e.key === 's' && (e.metaKey || e.ctrlKey) && e.shiftKey,
    };
    return map[hotkey]?.(event) || false;
  };
  return { default: isHotkey, isHotkey };
});

vi.mock('../../store', () => ({
  useEditorStore: () => storeState,
  EditorStore: class {},
}));

vi.mock('../../../utils/native-table', () => ({
  NativeTableKeyboard: {
    shouldHandle: () => false,
    handleKeyDown: () => false,
  },
}));

vi.mock('../../utils/codeBlockBehavior', () => ({
  isCodeBlockAceInputTarget: (target: any) => Boolean(target?.dataset?.ace),
}));

vi.mock('../../utils/isImeComposing', () => ({
  isImeComposing: () => false,
}));

vi.mock('../hotKeyCommands/match', () => ({
  MatchKey: class {
    run = () => false;
  },
}));

vi.mock('../hotKeyCommands/backspace', () => ({
  BackspaceKey: class {
    run = () => false;
    range = () => false;
  },
}));

vi.mock('../hotKeyCommands/enter', () => ({
  EnterKey: class {
    run = () => {};
  },
}));

vi.mock('../hotKeyCommands/tab', () => ({
  TabKey: class {
    run = () => {};
  },
}));

const listHandlers = vi.hoisted(() => ({
  handleListsOnBackspace: vi.fn(() => false),
  handleListsOnEnter: vi.fn(() => false),
  handleTabWithLists: vi.fn(() => false),
}));

vi.mock('../lists', () => ({
  handleListsOnBackspace: (...args: any[]) =>
    listHandlers.handleListsOnBackspace(...args),
  handleListsOnEnter: (...args: any[]) =>
    listHandlers.handleListsOnEnter(...args),
  handleTabWithLists: (...args: any[]) =>
    listHandlers.handleTabWithLists(...args),
}));

import { useKeyboard } from '../useKeyboard';

const makeEditor = (children: any[]) => {
  const editor = withReact(withHistory(createEditor())) as any;
  editor.children = children;
  Transforms.select(editor, Editor.start(editor, []));
  return editor;
};

const keyEvent = (partial: Partial<KeyboardEvent> & { key: string }) =>
  ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    nativeEvent: {},
    target: document.createElement('div'),
    ...partial,
  }) as any;

describe('useKeyboard 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeState.openInsertCompletion = false;
    storeState.openJinjaTemplate = false;
    storeState.editorProps = {};
    listHandlers.handleListsOnBackspace.mockReturnValue(false);
    listHandlers.handleListsOnEnter.mockReturnValue(false);
    listHandlers.handleTabWithLists.mockReturnValue(false);
  });

  it('readonly 时直接返回', () => {
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: 'a' }] }]),
    };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, { readonly: true } as any),
    );
    const e = keyEvent({ key: 'a' });
    result.current(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it('Ace 输入目标时跳过处理', () => {
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: 'a' }] }]),
    };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {} as any),
    );
    const target = document.createElement('textarea');
    target.dataset.ace = '1';
    const e = keyEvent({ key: 'a', target });
    result.current(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it('templatePanel 为对象但无 trigger 时使用默认 {}', () => {
    storeState.editorProps = { jinja: { templatePanel: {} } };
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: 'x' }] }]),
    };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {
        markdown: { enableInsertCompletion: true },
      } as any),
    );
    const e = keyEvent({ key: '{' });
    expect(() => result.current(e)).not.toThrow();
  });

  it('openJinjaTemplate 时 ArrowUp/Down preventDefault', () => {
    storeState.openJinjaTemplate = true;
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: 'x' }] }]),
    };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {} as any),
    );
    const up = keyEvent({ key: 'ArrowUp' });
    result.current(up);
    expect(up.preventDefault).toHaveBeenCalled();
    const down = keyEvent({ key: 'ArrowDown' });
    result.current(down);
    expect(down.preventDefault).toHaveBeenCalled();
  });

  it('openInsertCompletion 时 ArrowUp preventDefault', () => {
    storeState.openInsertCompletion = true;
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: 'x' }] }]),
    };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {} as any),
    );
    const e = keyEvent({ key: 'ArrowUp' });
    result.current(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('非 paragraph 节点时不进入 insertCompletion 构建', () => {
    const editorRef = {
      current: makeEditor([
        {
          type: 'code',
          language: 'js',
          children: [{ text: 'code' }],
        },
      ]),
    };
    Transforms.select(editorRef.current, Editor.start(editorRef.current, []));
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {
        markdown: { enableInsertCompletion: true },
      } as any),
    );
    const e = keyEvent({ key: '/' });
    result.current(e);
    expect(storeState.setOpenInsertCompletion).not.toHaveBeenCalled();
  });

  it('非单字符键不触发 trigger 构建', () => {
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: '' }] }]),
    };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {
        markdown: { enableInsertCompletion: true },
      } as any),
    );
    const e = keyEvent({ key: 'Enter' });
    result.current(e);
    expect(storeState.insertCompletionText$.next).not.toHaveBeenCalled();
  });

  it('空编辑器 blockFirst.done 时安全返回', () => {
    const editor = withReact(withHistory(createEditor())) as any;
    editor.children = [];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const spy = vi.spyOn(Editor, 'nodes').mockImplementation((() => ({
      next: () => ({ done: true, value: undefined }),
      [Symbol.iterator]() {
        return this;
      },
    })) as any);
    const editorRef = { current: editor };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {
        markdown: { enableInsertCompletion: true },
      } as any),
    );
    const e = keyEvent({ key: 'a' });
    expect(() => result.current(e)).not.toThrow();
    spy.mockRestore();
  });

  it('mod+ArrowDown / mod+ArrowUp preventDefault', () => {
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: 'x' }] }]),
    };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {} as any),
    );
    const down = keyEvent({ key: 'ArrowDown', metaKey: true });
    result.current(down);
    expect(down.preventDefault).toHaveBeenCalled();
    const up = keyEvent({ key: 'ArrowUp', ctrlKey: true });
    result.current(up);
    expect(up.preventDefault).toHaveBeenCalled();
  });

  it('istanbul after：lists 真值短路 Backspace/Tab/Enter', () => {
    listHandlers.handleListsOnBackspace.mockReturnValue(true);
    listHandlers.handleTabWithLists.mockReturnValue(true);
    listHandlers.handleListsOnEnter.mockReturnValue(true);
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: 'x' }] }]),
    };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {} as any),
    );

    const bs = keyEvent({ key: 'Backspace' });
    result.current(bs);
    expect(listHandlers.handleListsOnBackspace).toHaveBeenCalled();

    const tab = keyEvent({ key: 'Tab' });
    result.current(tab);
    expect(listHandlers.handleTabWithLists).toHaveBeenCalled();
    expect(tab.preventDefault).not.toHaveBeenCalled();

    const enter = keyEvent({ key: 'Enter' });
    result.current(enter);
    expect(listHandlers.handleListsOnEnter).toHaveBeenCalled();
    expect(enter.preventDefault).toHaveBeenCalled();
    expect(enter.stopPropagation).toHaveBeenCalled();
  });

  it('istanbul after：ArrowLeft 在 tag 起点插入 ZWSP', () => {
    const editor = makeEditor([
      {
        type: 'paragraph',
        children: [
          { text: 'before' },
          { text: 'tag', tag: true },
        ],
      },
    ]);
    // 光标落在 tag 文本起点
    Transforms.select(editor, { path: [0, 1], offset: 0 });
    const editorRef = { current: editor };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {} as any),
    );
    const e = keyEvent({ key: 'ArrowLeft' });
    result.current(e);
    // tag 起点插入 ZWSP：preventDefault 或文本含 FEFF 任一即可
    expect(
      e.preventDefault.mock.calls.length > 0 ||
        Node.string(editor).includes('\uFEFF'),
    ).toBe(true);
  });

  it('istanbul after：ArrowLeft 非折叠选区 / 无 tag 安全返回', () => {
    const editor = makeEditor([
      { type: 'paragraph', children: [{ text: 'plain' }] },
    ]);
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    const editorRef = { current: editor };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {} as any),
    );
    const e = keyEvent({ key: 'ArrowLeft' });
    expect(() => result.current(e)).not.toThrow();
    expect(e.preventDefault).not.toHaveBeenCalled();

    Transforms.select(editor, { path: [0, 0], offset: 1 });
    const e2 = keyEvent({ key: 'ArrowLeft' });
    expect(() => result.current(e2)).not.toThrow();
  });

  it('istanbul after：ArrowRight 早退；Tab lists 假值走 tab.run', () => {
    listHandlers.handleTabWithLists.mockReturnValue(false);
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: 'x' }] }]),
    };
    const store = { inputComposition: false } as any;
    const { result } = renderHook(() =>
      useKeyboard(store, editorRef, {} as any),
    );
    const right = keyEvent({ key: 'ArrowRight' });
    expect(() => result.current(right)).not.toThrow();

    const tab = keyEvent({ key: 'Tab' });
    expect(() => result.current(tab)).not.toThrow();
    expect(listHandlers.handleTabWithLists).toHaveBeenCalled();
  });
});

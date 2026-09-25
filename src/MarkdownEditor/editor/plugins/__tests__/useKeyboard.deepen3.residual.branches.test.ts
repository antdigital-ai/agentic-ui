/**
 * useKeyboard deepen3：table handle 未消费、tag 无 previous、
 * ArrowRight 展开选区/无 next、insertCompletion。
 */
import { renderHook } from '@testing-library/react';
import { createEditor, Editor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const storeState = vi.hoisted(() => ({
  openInsertCompletion: false,
  openJinjaTemplate: false,
  insertCompletionText$: { next: vi.fn() },
  setOpenInsertCompletion: vi.fn(),
  setOpenJinjaTemplate: vi.fn(),
  setJinjaAnchorPath: vi.fn(),
  jinjaTemplatePanelEnabled: true,
  editorProps: {} as any,
  inputComposition: false,
}));

const tableKb = vi.hoisted(() => ({
  shouldHandle: vi.fn(() => false),
  handleKeyDown: vi.fn(() => false),
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
      'mod+shift+v': () => false,
      'mod+alt+v': () => false,
      'mod+opt+v': () => false,
      'mod+shift+s': () => false,
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
    shouldHandle: (...a: any[]) => tableKb.shouldHandle(...a),
    handleKeyDown: (...a: any[]) => tableKb.handleKeyDown(...a),
  },
}));

vi.mock('../../utils/codeBlockBehavior', () => ({
  isCodeBlockAceInputTarget: () => false,
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

vi.mock('../lists', () => ({
  handleListsOnBackspace: () => false,
  handleListsOnEnter: () => false,
  handleTabWithLists: () => false,
}));

import { useKeyboard } from '../useKeyboard';

const makeEditor = (children: any[], selection?: any) => {
  const editor = withReact(withHistory(createEditor())) as any;
  editor.children = children;
  if (selection) {
    editor.selection = selection;
  } else {
    Transforms.select(editor, Editor.start(editor, []));
  }
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

describe('useKeyboard deepen3 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    storeState.openInsertCompletion = false;
    storeState.openJinjaTemplate = false;
    storeState.editorProps = {};
    storeState.jinjaTemplatePanelEnabled = true;
    tableKb.shouldHandle.mockReturnValue(false);
    tableKb.handleKeyDown.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('NativeTable shouldHandle 但 handleKeyDown false：继续后续逻辑', () => {
    tableKb.shouldHandle.mockReturnValue(true);
    tableKb.handleKeyDown.mockReturnValue(false);
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: 'a' }] }]),
    };
    const { result } = renderHook(() =>
      useKeyboard({ inputComposition: false } as any, editorRef, {} as any),
    );
    const e = keyEvent({ key: 'a' });
    result.current(e);
    expect(tableKb.handleKeyDown).toHaveBeenCalled();
  });

  it('ArrowLeft：仅 tag 节点 offset>0 无 previous 不选中', () => {
    const editor = makeEditor(
      [{ type: 'paragraph', children: [{ text: 'chip', tag: true }] }],
      {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
    );
    const editorRef = { current: editor };
    const { result } = renderHook(() =>
      useKeyboard({ inputComposition: false } as any, editorRef, {} as any),
    );
    const e = keyEvent({ key: 'ArrowLeft' });
    result.current(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('ArrowLeft：chip 为首子节点时跳过后无 prev-prev', () => {
    const editor = makeEditor(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'chip', tag: true },
            { text: 'after' },
          ],
        },
      ],
      {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      },
    );
    const editorRef = { current: editor };
    const { result } = renderHook(() =>
      useKeyboard({ inputComposition: false } as any, editorRef, {} as any),
    );
    const e = keyEvent({ key: 'ArrowLeft' });
    result.current(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('ArrowLeft：前兄弟非 tag 不跳过', () => {
    const editor = makeEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: 'plain' }, { text: 'next' }],
        },
      ],
      {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      },
    );
    const editorRef = { current: editor };
    const { result } = renderHook(() =>
      useKeyboard({ inputComposition: false } as any, editorRef, {} as any),
    );
    const e = keyEvent({ key: 'ArrowLeft' });
    result.current(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it('ArrowRight：展开选区早退；末叶子无 next；无 text 属性', () => {
    const editor = makeEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: 'ab' }, { text: 'chip', tag: true }],
        },
      ],
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      },
    );
    const editorRef = { current: editor };
    const { result } = renderHook(() =>
      useKeyboard({ inputComposition: false } as any, editorRef, {} as any),
    );
    result.current(keyEvent({ key: 'ArrowRight' }));

    // 末叶子无 next sibling
    editor.children = [
      { type: 'paragraph', children: [{ text: 'solo' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };
    result.current(keyEvent({ key: 'ArrowRight' }));

    // leaf.text 缺失走 ?? ''
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: undefined as any }, { text: 't', tag: true }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(() => result.current(keyEvent({ key: 'ArrowRight' }))).not.toThrow();
  });

  it('ArrowRight：tag 后无节点时插入空格', () => {
    const editor = makeEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: 'pre' }, { text: 'chip', tag: true }],
        },
      ],
      {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    );
    const editorRef = { current: editor };
    const { result } = renderHook(() =>
      useKeyboard({ inputComposition: false } as any, editorRef, {} as any),
    );
    const e = keyEvent({ key: 'ArrowRight' });
    result.current(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('段落多子节点时按键不触发 insertCompletion；单节点 /x 触发', () => {
    const multi = makeEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: '/a' }, { text: 'b' }],
        },
      ],
      {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
    );
    const { result: r1 } = renderHook(() =>
      useKeyboard(
        { inputComposition: false } as any,
        { current: multi },
        {} as any,
      ),
    );
    r1.current(keyEvent({ key: 'c' }));
    expect(storeState.setOpenInsertCompletion).not.toHaveBeenCalled();

    const single = makeEditor(
      [{ type: 'paragraph', children: [{ text: '/fo' }] }],
      {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    );
    const { result: r2 } = renderHook(() =>
      useKeyboard(
        { inputComposition: false } as any,
        { current: single },
        {} as any,
      ),
    );
    r2.current(keyEvent({ key: 'o' }));
    expect(storeState.setOpenInsertCompletion).toHaveBeenCalledWith(true);
    vi.advanceTimersByTime(1);
    expect(storeState.insertCompletionText$.next).toHaveBeenCalled();
  });
});

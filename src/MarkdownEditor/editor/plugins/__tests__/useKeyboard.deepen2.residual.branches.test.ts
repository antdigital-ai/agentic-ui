/**
 * useKeyboard deepen2：NativeTable 短路、tag ArrowLeft/Right、jinja trigger。
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

describe('useKeyboard deepen2 residual branches', () => {
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

  it('NativeTableKeyboard.shouldHandle + handleKeyDown true 早退', () => {
    tableKb.shouldHandle.mockReturnValue(true);
    tableKb.handleKeyDown.mockReturnValue(true);
    const editorRef = {
      current: makeEditor([{ type: 'paragraph', children: [{ text: 'a' }] }]),
    };
    const { result } = renderHook(() =>
      useKeyboard({ inputComposition: false } as any, editorRef, {} as any),
    );
    const e = keyEvent({ key: 'Tab' });
    result.current(e);
    expect(tableKb.handleKeyDown).toHaveBeenCalled();
  });

  it('ArrowLeft：tag offset=0 插入 BOM；BOM 已存在选中；offset>0 跳前', () => {
    const editor = makeEditor(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'pre' },
            { text: 'chip', tag: true },
            { text: 'post' },
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

    // BOM already present
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: 'pre\uFEFF' },
          { text: 'chip', tag: true },
          { text: 'post' },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    };
    const e2 = keyEvent({ key: 'ArrowLeft' });
    result.current(e2);
    expect(e2.preventDefault).toHaveBeenCalled();

    editor.selection = {
      anchor: { path: [0, 1], offset: 2 },
      focus: { path: [0, 1], offset: 2 },
    };
    const e3 = keyEvent({ key: 'ArrowLeft' });
    result.current(e3);
    expect(e3.preventDefault).toHaveBeenCalled();
  });

  it('ArrowLeft：光标在 tag 后文本起始跳过 chip', () => {
    const editor = makeEditor(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'a' },
            { text: 'chip', tag: true },
            { text: 'b' },
          ],
        },
      ],
      {
        anchor: { path: [0, 2], offset: 0 },
        focus: { path: [0, 2], offset: 0 },
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

  it('ArrowRight：文本末尾遇 tag 跳过后', () => {
    const editor = makeEditor(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'pre' },
            { text: 'chip', tag: true },
            { text: 'post' },
          ],
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

  it('jinja trigger 默认 {} 打开面板', () => {
    storeState.editorProps = {
      jinja: { templatePanel: { trigger: '{' + '{' } },
    };
    const editor = makeEditor(
      [{ type: 'paragraph', children: [{ text: '{' }] }],
      {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    );
    const editorRef = { current: editor };
    const { result } = renderHook(() =>
      useKeyboard({ inputComposition: false } as any, editorRef, {} as any),
    );
    const e = keyEvent({ key: '{' });
    result.current(e);
    expect(storeState.setJinjaAnchorPath).toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(storeState.setOpenJinjaTemplate).toHaveBeenCalledWith(true);
  });
});

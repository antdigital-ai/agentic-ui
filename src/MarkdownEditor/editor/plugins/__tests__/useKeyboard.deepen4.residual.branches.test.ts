/**
 * useKeyboard deepen4：Ace 目标早退、lists backspace/enter/tab、
 * ArrowLeft tag、jinja 配置安全。
 */
import { renderHook } from '@testing-library/react';
import { createEditor } from 'slate';
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

const lists = vi.hoisted(() => ({
  handleListsOnBackspace: vi.fn(() => false),
  handleListsOnEnter: vi.fn(() => false),
  handleTabWithLists: vi.fn(() => false),
}));

const aceTarget = vi.hoisted(() => ({
  isCodeBlockAceInputTarget: vi.fn(() => false),
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
  isCodeBlockAceInputTarget: (...a: any[]) =>
    aceTarget.isCodeBlockAceInputTarget(...a),
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
  handleListsOnBackspace: (...a: any[]) => lists.handleListsOnBackspace(...a),
  handleListsOnEnter: (...a: any[]) => lists.handleListsOnEnter(...a),
  handleTabWithLists: (...a: any[]) => lists.handleTabWithLists(...a),
}));

import { useKeyboard } from '../useKeyboard';

const makeEditor = (children: any[], selection?: any) => {
  const editor = withReact(withHistory(createEditor())) as any;
  editor.children = children;
  editor.selection = selection ?? {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  };
  return editor;
};

const keyEvent = (init: Partial<KeyboardEvent> & { key: string }) =>
  ({
    key: init.key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    metaKey: init.metaKey ?? false,
    ctrlKey: init.ctrlKey ?? false,
    shiftKey: init.shiftKey ?? false,
    target: init.target ?? document.createElement('div'),
    ...init,
  }) as any;

describe('useKeyboard deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    storeState.openJinjaTemplate = false;
    storeState.openInsertCompletion = false;
    storeState.jinjaTemplatePanelEnabled = true;
    storeState.editorProps = {};
    aceTarget.isCodeBlockAceInputTarget.mockReturnValue(false);
    lists.handleListsOnBackspace.mockReturnValue(false);
    lists.handleListsOnEnter.mockReturnValue(false);
    lists.handleTabWithLists.mockReturnValue(false);
    tableKb.shouldHandle.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('Ace 输入目标早退', () => {
    aceTarget.isCodeBlockAceInputTarget.mockReturnValue(true);
    const editor = makeEditor([
      { type: 'paragraph', children: [{ text: 'x' }] },
    ]);
    const { result } = renderHook(() =>
      useKeyboard(
        { inputComposition: false } as any,
        { current: editor },
        {} as any,
      ),
    );
    const e = keyEvent({ key: 'a' });
    result.current(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it('lists backspace / enter / tab 消费后 return', () => {
    lists.handleListsOnBackspace.mockReturnValue(true);
    const editor = makeEditor([
      { type: 'paragraph', children: [{ text: 'x' }] },
    ]);
    const { result } = renderHook(() =>
      useKeyboard(
        { inputComposition: false } as any,
        { current: editor },
        {} as any,
      ),
    );
    result.current(keyEvent({ key: 'Backspace' }));
    expect(lists.handleListsOnBackspace).toHaveBeenCalled();

    lists.handleListsOnEnter.mockReturnValue(true);
    result.current(keyEvent({ key: 'Enter' }));
    expect(lists.handleListsOnEnter).toHaveBeenCalled();

    lists.handleTabWithLists.mockReturnValue(true);
    result.current(keyEvent({ key: 'Tab' }));
    expect(lists.handleTabWithLists).toHaveBeenCalled();
  });

  it('openJinjaTemplate 时 ArrowUp 安全', () => {
    storeState.openJinjaTemplate = true;
    const editor = makeEditor([
      { type: 'paragraph', children: [{ text: 'x' }] },
    ]);
    const { result } = renderHook(() =>
      useKeyboard(
        { inputComposition: false } as any,
        { current: editor },
        {} as any,
      ),
    );
    expect(() => result.current(keyEvent({ key: 'ArrowUp' }))).not.toThrow();
  });

  it('ArrowLeft：折叠选区 + tag 节点 offset0', () => {
    const editor = makeEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: 'chip', tag: true }, { text: ' after' }],
        },
      ],
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    );
    const { result } = renderHook(() =>
      useKeyboard(
        { inputComposition: false } as any,
        { current: editor },
        {} as any,
      ),
    );
    expect(() => result.current(keyEvent({ key: 'ArrowLeft' }))).not.toThrow();
  });

  it('jinja templatePanel 配置下按键安全', () => {
    storeState.editorProps = {
      jinja: {
        templatePanel: { trigger: '{{', enabled: true },
      },
    };
    const editor = makeEditor(
      [{ type: 'paragraph', children: [{ text: '{{' }] }],
      {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
    );
    const { result } = renderHook(() =>
      useKeyboard(
        { inputComposition: false } as any,
        { current: editor },
        {} as any,
      ),
    );
    expect(() => result.current(keyEvent({ key: '{' }))).not.toThrow();
  });
});

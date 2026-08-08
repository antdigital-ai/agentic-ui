/**
 * useKeyboard deepen12 safe：Ace 目标早退、lists backspace 消费。
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
  jinjaTemplatePanelEnabled: false,
  editorProps: {} as any,
}));

const aceTarget = vi.hoisted(() => ({
  isCodeBlockAceInputTarget: vi.fn(() => false),
}));

const lists = vi.hoisted(() => ({
  handleListsOnBackspace: vi.fn(() => false),
  handleListsOnEnter: vi.fn(() => false),
  handleTabWithLists: vi.fn(() => false),
}));

const tableKb = vi.hoisted(() => ({
  shouldHandle: vi.fn(() => false),
  handleKeyDown: vi.fn(() => false),
}));

vi.mock('is-hotkey', () => {
  const isHotkey = (hotkey: string, event: any) => {
    const map: Record<string, (e: any) => boolean> = {
      backspace: (e) => e.key === 'Backspace',
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

describe('useKeyboard deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    aceTarget.isCodeBlockAceInputTarget.mockReturnValue(false);
    lists.handleListsOnBackspace.mockReturnValue(false);
    tableKb.shouldHandle.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('Ace 输入目标早退', () => {
    aceTarget.isCodeBlockAceInputTarget.mockReturnValue(true);
    const editor = makeEditor([{ type: 'paragraph', children: [{ text: 'x' }] }]);
    const { result } = renderHook(() =>
      useKeyboard({ inputComposition: false } as any, { current: editor }, {} as any),
    );
    const e = keyEvent({ key: 'a' });
    result.current(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it('lists backspace 消费后 return', () => {
    lists.handleListsOnBackspace.mockReturnValue(true);
    const editor = makeEditor([
      { type: 'list', children: [{ type: 'list-item', children: [{ text: 'x' }] }] },
    ]);
    const { result } = renderHook(() =>
      useKeyboard({ inputComposition: false } as any, { current: editor }, {} as any),
    );
    const e = keyEvent({ key: 'Backspace' });
    result.current(e);
    expect(lists.handleListsOnBackspace).toHaveBeenCalled();
  });
});

/**
 * AceEditor deepen5 light：NODE_ENV=development + mock loadAceEditor；
 * 非 readonly 注册 change；modeMap 经 setTimeout(16) setAceMode。
 * L213 `if (readonly) return`：setupEditorEvents 仅在 !readonly 调用 → 死臂。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockEditorStore = vi.hoisted(() => ({
  store: { editor: { focus: vi.fn() } },
  readonly: false,
  editorProps: {} as Record<string, any>,
}));

const loadAceTheme = vi.hoisted(() => vi.fn(async () => undefined));
const getAceLangs = vi.hoisted(() =>
  vi.fn(() => Promise.resolve(new Set(['javascript', 'text', 'python']))),
);

let mockEditor: any;
let mockAceModule: any;
let changeHandler: (() => void) | null = null;

function resetMockAce() {
  changeHandler = null;
  const session = {
    setMode: vi.fn(),
    insert: vi.fn(),
    getDocument: vi.fn(() => ({
      getLength: () => 1,
      getLine: () => 'x',
    })),
    selection: {
      on: vi.fn(),
      clearSelection: vi.fn(),
    },
  };
  mockEditor = {
    setTheme: vi.fn(),
    setValue: vi.fn(),
    getValue: vi.fn(() => 'code'),
    clearSelection: vi.fn(),
    focus: vi.fn(),
    destroy: vi.fn(),
    getSession: vi.fn(() => session),
    session,
    selection: session.selection,
    commands: { addCommand: vi.fn() },
    on: vi.fn((evt: string, cb: () => void) => {
      if (evt === 'change') changeHandler = cb;
    }),
    getCursorPosition: vi.fn(() => ({ row: 0, column: 0 })),
  };
  mockAceModule = { edit: vi.fn(() => mockEditor) };
}

vi.mock('../../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => mockEditorStore,
}));

vi.mock('../../../../MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: { focus: vi.fn() },
}));

vi.mock('../../../../MarkdownEditor/editor/utils/ace', () => ({
  modeMap: new Map([
    ['js', 'javascript'],
    ['py', 'python'],
  ]),
  getAceLangs,
}));

vi.mock('../../../../MarkdownEditor/editor/utils/codeBlockBehavior', () => ({
  handleCodeBlockAceKeyDown: vi.fn(() => 'passthrough'),
}));

vi.mock('../../../../MarkdownEditor/editor/parser/json-parse', () => ({
  default: vi.fn((s: string) => JSON.parse(s)),
}));

vi.mock('../../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

vi.mock('../../loadAceEditor', () => ({
  loadAceEditor: vi.fn(async () => mockAceModule),
  loadAceTheme,
}));

import { AceEditor } from '../../components/AceEditor';

describe('AceEditor deepen5 light residual branches', () => {
  const prevEnv = process.env.NODE_ENV;

  beforeEach(() => {
    resetMockAce();
    mockEditorStore.editorProps = {};
    mockEditorStore.readonly = false;
    loadAceTheme.mockClear();
    getAceLangs.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    cleanup();
    process.env.NODE_ENV = prevEnv;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非 readonly：change → onUpdate；setAceMode(js)', async () => {
    const onUpdate = vi.fn();

    function Host() {
      const result = AceEditor({
        element: {
          type: 'code',
          value: 'const a=1',
          language: 'js',
          children: [{ text: '' }],
        } as any,
        onUpdate,
        onShowBorderChange: vi.fn(),
        onHideChange: vi.fn(),
        path: [0],
        theme: 'github' as any,
      });
      useEffect(() => {}, []);
      return <div ref={result.dom} data-testid="ace-d5" />;
    }

    render(<Host />);
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(120);
    });
    expect(mockAceModule.edit).toHaveBeenCalled();
    expect(changeHandler).toBeTruthy();
    act(() => {
      changeHandler?.();
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(onUpdate).toHaveBeenCalled();
    expect(mockEditor.session.setMode).toHaveBeenCalled();
  });

  it('readonly=true：不注册 change（L213 死臂旁证）', async () => {
    mockEditorStore.readonly = true;
    const onUpdate = vi.fn();

    function Host() {
      const result = AceEditor({
        element: {
          type: 'code',
          value: 'x',
          language: 'javascript',
          children: [{ text: '' }],
        } as any,
        onUpdate,
        onShowBorderChange: vi.fn(),
        onHideChange: vi.fn(),
        path: [0],
        theme: 'github' as any,
      });
      useEffect(() => {}, []);
      return <div ref={result.dom} data-testid="ace-d5r" />;
    }

    render(<Host />);
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(120);
    });
    expect(mockAceModule.edit).toHaveBeenCalled();
    expect(changeHandler).toBeNull();
  });
});

/**
 * AceEditor deepen4 light：NODE_ENV=development + mock ace，
 * 覆盖 theme→github、init/destroy。勿加载真实 ace。
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
  vi.fn(() => Promise.resolve(new Set(['javascript', 'text']))),
);

let mockEditor: any;
let mockAceModule: any;

function resetMockAce() {
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
    on: vi.fn(),
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
  modeMap: new Map([['js', 'javascript']]),
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

describe('AceEditor deepen4 light residual branches', () => {
  const prevEnv = process.env.NODE_ENV;

  beforeEach(() => {
    resetMockAce();
    mockEditorStore.editorProps = {};
    mockEditorStore.readonly = false;
    loadAceTheme.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    cleanup();
    process.env.NODE_ENV = prevEnv;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('development：无 theme → github；unmount destroy', async () => {
    function Host() {
      const result = AceEditor({
        element: {
          type: 'code',
          value: 'const a=1',
          language: 'javascript',
          children: [{ text: '' }],
        } as any,
        onUpdate: vi.fn(),
        onShowBorderChange: vi.fn(),
        onHideChange: vi.fn(),
        path: [0],
        theme: undefined as any,
      });
      useEffect(() => {}, []);
      return <div ref={result.dom} data-testid="ace-d4" />;
    }

    const { unmount } = render(<Host />);
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(80);
    });
    expect(mockAceModule.edit).toHaveBeenCalled();
    expect(loadAceTheme).toHaveBeenCalled();
    expect(mockEditor.setTheme).toHaveBeenCalledWith('ace/theme/github');
    unmount();
    expect(mockEditor.destroy).toHaveBeenCalled();
  });
});

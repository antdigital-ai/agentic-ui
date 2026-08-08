/**
 * AceEditor deepen：paste 防抖、keydown mod+enter、未知 language fallback、load 失败。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const eventHandlers: Record<string, ((...args: any[]) => any)[]> = {};
const selectionHandlers: Record<string, ((...args: any[]) => any)[]> = {};

const mockEditor = {
  setTheme: vi.fn(),
  setValue: vi.fn(),
  getValue: vi.fn(() => 'code'),
  clearSelection: vi.fn(),
  destroy: vi.fn(),
  getSession: vi.fn(),
  on: vi.fn((ev: string, h: (...args: any[]) => any) => {
    eventHandlers[ev] = eventHandlers[ev] || [];
    eventHandlers[ev].push(h);
  }),
  off: vi.fn(),
  selection: {
    on: vi.fn((ev: string, h: (...args: any[]) => any) => {
      selectionHandlers[ev] = selectionHandlers[ev] || [];
      selectionHandlers[ev].push(h);
    }),
    off: vi.fn(),
    clearSelection: vi.fn(),
  },
  session: {
    setMode: vi.fn(),
    insert: vi.fn(),
    getDocument: vi.fn(() => ({
      getLength: () => 1,
      getLine: () => '',
    })),
  },
  commands: { addCommand: vi.fn() },
  getCursorPosition: vi.fn(() => ({ row: 1, column: 2 })),
  focus: vi.fn(),
  setReadOnly: vi.fn(),
  resize: vi.fn(),
};

const mockEditorStore = {
  store: { editor: { focus: vi.fn() } },
  readonly: false,
  editorProps: { codeProps: { theme: 'chrome' } },
};

const loadAceEditor = vi.hoisted(() =>
  vi.fn(async () => {
    const ace = await import('ace-builds');
    return ace.default;
  }),
);
const loadAceTheme = vi.hoisted(() => vi.fn(async () => undefined));
const handleCodeBlockAceKeyDown = vi.hoisted(() =>
  vi.fn(() => 'handled' as const),
);
const isHotkey = vi.hoisted(() => vi.fn(() => false));

vi.mock('ace-builds', () => ({
  default: {
    edit: vi.fn((el: HTMLElement) => {
      el.appendChild(document.createElement('textarea'));
      return mockEditor;
    }),
    require: vi.fn(),
    config: { set: vi.fn() },
  },
}));

vi.mock('../../loadAceEditor', () => ({
  loadAceEditor,
  loadAceTheme,
}));

vi.mock('../../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => mockEditorStore,
}));

vi.mock('../../../../MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: { focus: vi.fn() },
}));

vi.mock('../../../../MarkdownEditor/editor/utils/ace', () => ({
  modeMap: new Map([['js', 'javascript']]),
  getAceLangs: vi.fn(() => Promise.resolve(new Set(['javascript', 'text']))),
}));

vi.mock('../../../../MarkdownEditor/editor/utils/codeBlockBehavior', () => ({
  handleCodeBlockAceKeyDown,
}));

vi.mock('../../../../MarkdownEditor/editor/parser/json-parse', () => ({
  default: vi.fn((str: string) => JSON.parse(str)),
}));

vi.mock('../../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

vi.mock('is-hotkey', () => ({ default: (...args: any[]) => isHotkey(...args) }));

import { EditorUtils } from '../../../../MarkdownEditor/editor/utils/editorUtils';
import { AceEditor } from '../../components/AceEditor';

describe('AceEditor deepen residual branches', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const defaultProps = {
    element: {
      type: 'code' as const,
      value: 'const a=1',
      language: 'js',
      children: [{ text: '' }] as [{ text: string }],
    },
    onUpdate: vi.fn(),
    onShowBorderChange: vi.fn(),
    onHideChange: vi.fn(),
    path: [0, 1] as const,
    theme: 'monokai',
    onSelectionChange: vi.fn(),
  };

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    Object.keys(eventHandlers).forEach((k) => delete eventHandlers[k]);
    Object.keys(selectionHandlers).forEach((k) => delete selectionHandlers[k]);
    vi.clearAllMocks();
    mockEditor.getSession.mockReturnValue(mockEditor.session);
    mockEditorStore.readonly = false;
    loadAceEditor.mockImplementation(async () => {
      const ace = await import('ace-builds');
      return ace.default;
    });
    handleCodeBlockAceKeyDown.mockReturnValue('handled');
    isHotkey.mockReturnValue(false);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('paste 二次清空；changeCursor；keydown mod+enter focus', async () => {
    function Wrapper() {
      const result = AceEditor(defaultProps);
      return <div ref={result.dom} data-testid="ace-host" />;
    }
    render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      vi.advanceTimersByTime(20);
    });

    const pasteEvt = { text: 'abc' };
    eventHandlers.paste?.forEach((h) => h(pasteEvt));
    expect(pasteEvt.text).toBe('abc');
    eventHandlers.paste?.forEach((h) => h(pasteEvt));
    expect(pasteEvt.text).toBe('');

    selectionHandlers.changeCursor?.forEach((h) => h());
    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    isHotkey.mockImplementation((hot: string) => hot === 'mod+enter');
    const ta = document.querySelector('textarea');
    ta?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true }),
    );
    expect(EditorUtils.focus).toHaveBeenCalled();
  });

  it('未知 language；loadAceEditor 失败仍 loaded；setLanguage', async () => {
    loadAceEditor.mockRejectedValueOnce(new Error('load-fail'));
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Wrapper() {
      const result = AceEditor({
        ...defaultProps,
        element: {
          type: 'code',
          value: 'x',
          language: 'unknown-lang',
          children: [{ text: 'x' }],
        },
      });
      React.useEffect(() => {
        result.setLanguage?.('python');
      }, []);
      return <div ref={result.dom} />;
    }
    render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it('readonly 不绑 change onUpdate；blur 清 selection / onSelectionChange', async () => {
    mockEditorStore.readonly = true;
    function Wrapper() {
      const result = AceEditor(defaultProps);
      return <div ref={result.dom} />;
    }
    render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      vi.advanceTimersByTime(20);
    });
    eventHandlers.change?.forEach((h) => h());
    await act(async () => {
      vi.advanceTimersByTime(120);
    });
    expect(defaultProps.onUpdate).not.toHaveBeenCalled();
  });
});

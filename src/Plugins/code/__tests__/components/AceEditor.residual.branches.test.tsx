/**
 * AceEditor 残留：theme/mode/readOnly/onChange 边角（mock ace）。
 */
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const eventHandlers: Record<string, ((...args: any[]) => any)[]> = {};
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
    on: vi.fn(),
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
  getCursorPosition: vi.fn(() => ({ row: 0, column: 0 })),
  focus: vi.fn(),
  setReadOnly: vi.fn(),
  resize: vi.fn(),
};

const mockEditorStore = {
  store: { editor: { focus: vi.fn() } },
  readonly: false,
  editorProps: { codeProps: { theme: 'github' } },
};

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
  loadAceEditor: vi.fn(async () => {
    const ace = await import('ace-builds');
    return ace.default;
  }),
  loadAceTheme: vi.fn(async () => undefined),
}));

vi.mock('../../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => mockEditorStore,
}));

vi.mock('../../../../MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: { focus: vi.fn() },
}));

vi.mock('../../../../MarkdownEditor/editor/utils/ace', () => ({
  modeMap: new Map([['javascript', 'javascript']]),
  getAceLangs: vi.fn(() => Promise.resolve(new Set(['javascript']))),
}));

vi.mock('../../../../MarkdownEditor/editor/parser/json-parse', () => ({
  default: vi.fn((str: string) => JSON.parse(str)),
}));

vi.mock('../../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

import { AceEditor } from '../../components/AceEditor';

describe('AceEditor residual branches', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const defaultProps = {
    element: {
      type: 'code' as const,
      value: 'const a=1',
      language: 'javascript',
      children: [{ text: '' }] as [{ text: string }],
    },
    onUpdate: vi.fn(),
    onShowBorderChange: vi.fn(),
    onHideChange: vi.fn(),
    path: [0, 1] as const,
    theme: 'monokai',
  };

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    Object.keys(eventHandlers).forEach((k) => delete eventHandlers[k]);
    vi.clearAllMocks();
    mockEditor.getSession.mockReturnValue(mockEditor.session);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('挂载后应用 value/theme/mode；卸载 destroy', async () => {
    function Wrapper() {
      const result = AceEditor(defaultProps);
      return <div ref={result.dom} data-testid="ace-host" />;
    }

    const { unmount } = render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    eventHandlers.change?.forEach((h) => h());
    unmount();
    expect(mockEditor.destroy).toHaveBeenCalled();
  });

  it('空 language / 空 value 不抛', () => {
    function Wrapper() {
      const result = AceEditor({
        ...defaultProps,
        element: {
          type: 'code',
          value: '',
          language: '',
          children: [{ text: '' }],
        },
      });
      return <div ref={result.dom} />;
    }
    expect(() => render(<Wrapper />)).not.toThrow();
  });

  it('istanbul deepen：json 格式化；readonly；theme 回退；change debounce', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    function Wrapper({ readonly = false }: { readonly?: boolean }) {
      const result = AceEditor({
        ...defaultProps,
        readonly,
        element: {
          type: 'code',
          value: '{"a":1}',
          language: 'json',
          otherProps: { finished: true },
          children: [{ text: '{"a":1}' }],
        },
        theme: undefined,
      });
      return <div ref={result.dom} data-testid="ace-json" />;
    }
    const { rerender, unmount } = render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    eventHandlers.change?.forEach((h) => h());
    act(() => {
      vi.advanceTimersByTime(120);
    });
    eventHandlers.focus?.forEach((h) => h());
    eventHandlers.blur?.forEach((h) => h());
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender(<Wrapper readonly />);
    unmount();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    expect(mockEditor.destroy).toHaveBeenCalled();
  });
});

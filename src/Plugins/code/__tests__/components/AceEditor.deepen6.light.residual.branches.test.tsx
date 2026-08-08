/**
 * AceEditor deepen6 light：注入 editorRef 覆盖 setLanguage modeMap miss；
 * 非 readonly change → onUpdate。保持 mock loadAceEditor。
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

const getAceLangs = vi.hoisted(() =>
  vi.fn(() => Promise.resolve(new Set(['javascript', 'text']))),
);
const loadAceTheme = vi.hoisted(() => vi.fn(async () => undefined));

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
  loadAceEditor: vi.fn(async () => {
    throw new Error('should not load ace in deepen6 light');
  }),
  loadAceTheme,
}));

import { AceEditor } from '../../components/AceEditor';

function makeMockEditor() {
  const session = {
    setMode: vi.fn(),
    insert: vi.fn(),
    getDocument: vi.fn(() => ({
      getLength: () => 1,
      getLine: () => 'x',
    })),
  };
  return {
    setTheme: vi.fn(),
    setValue: vi.fn(),
    getValue: vi.fn(() => 'v'),
    clearSelection: vi.fn(),
    focus: vi.fn(),
    getSession: vi.fn(() => session),
    session,
  };
}

describe('AceEditor deepen6 light residual branches', () => {
  beforeEach(() => {
    mockEditorStore.editorProps = {};
    mockEditorStore.readonly = false;
    loadAceTheme.mockClear();
    getAceLangs.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('setLanguage：modeMap miss → getAceLangs + text', async () => {
    const onUpdate = vi.fn();
    let api: ReturnType<typeof AceEditor> | null = null;
    const mockEd = makeMockEditor();

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
        theme: 'monokai' as any,
      });
      useEffect(() => {
        api = result;
      });
      return <div ref={result.dom} data-testid="ace-d6" />;
    }

    render(<Host />);
    act(() => {
      if (api?.editorRef) api.editorRef.current = mockEd as any;
    });
    await act(async () => {
      await api?.setLanguage('nope-lang');
    });
    expect(onUpdate).toHaveBeenCalledWith({ language: 'nope-lang' });
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(20);
    });
    expect(getAceLangs).toHaveBeenCalled();
    expect(mockEd.session.setMode).toHaveBeenCalledWith('ace/mode/text');
  });

  it('setLanguage：modeMap hit js → javascript', async () => {
    const onUpdate = vi.fn();
    let api: ReturnType<typeof AceEditor> | null = null;
    const mockEd = makeMockEditor();

    function Host() {
      const result = AceEditor({
        element: {
          type: 'code',
          value: 'x',
          language: 'text',
          children: [{ text: '' }],
        } as any,
        onUpdate,
        onShowBorderChange: vi.fn(),
        onHideChange: vi.fn(),
        path: [0],
      });
      useEffect(() => {
        api = result;
      });
      return <div ref={result.dom} data-testid="ace-d6b" />;
    }

    render(<Host />);
    act(() => {
      if (api?.editorRef) api.editorRef.current = mockEd as any;
    });
    await act(async () => {
      await api?.setLanguage('js');
    });
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(20);
    });
    expect(mockEd.session.setMode).toHaveBeenCalledWith(
      'ace/mode/javascript',
    );
  });
});

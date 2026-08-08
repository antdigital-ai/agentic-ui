/**
 * AceEditor deepen3 light：保持 NODE_ENV=test，不挂载真实 ace。
 * 通过注入 editorRef mock 覆盖 setLanguage modeMap、setAceMode、主题 effect。
 * 跳过 init 路径（L129/L213/L264/L298）：test 早退不可达。
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
  vi.fn(() => Promise.resolve(new Set(['javascript', 'text', 'python']))),
);
const loadAceTheme = vi.hoisted(() => vi.fn(async () => undefined));

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
  loadAceEditor: vi.fn(async () => {
    throw new Error('should not load ace in deepen3 light');
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
    clearSelection: vi.fn(),
    focus: vi.fn(),
    getSession: vi.fn(() => session),
    session,
  };
}

describe('AceEditor deepen3 light residual branches', () => {
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

  it('注入 editor：setLanguage modeMap + setAceMode；主题缺省 → github', async () => {
    const onUpdate = vi.fn();
    let api: ReturnType<typeof AceEditor> | null = null;
    const mockEd = makeMockEditor();

    function Host({
      lang,
      value,
      theme,
    }: {
      lang?: string;
      value: string;
      theme?: string;
    }) {
      const result = AceEditor({
        element: {
          type: 'code',
          value,
          language: lang,
          children: [{ text: '' }],
        } as any,
        onUpdate,
        onShowBorderChange: vi.fn(),
        onHideChange: vi.fn(),
        path: [0],
        theme: theme as any,
      });
      useEffect(() => {
        api = result;
      });
      return <div ref={result.dom} data-testid="ace-d3" />;
    }

    const { rerender } = render(
      <Host value="const a=1" lang="javascript" theme={undefined as any} />,
    );
    expect(document.querySelector('[data-testid="ace-d3"]')).toBeTruthy();

    act(() => {
      if (api?.editorRef) {
        api.editorRef.current = mockEd as any;
      }
    });

    await act(async () => {
      await api?.setLanguage('js');
    });
    expect(onUpdate).toHaveBeenCalledWith({ language: 'js' });
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(20);
    });
    expect(getAceLangs).toHaveBeenCalled();
    expect(mockEd.getSession).toHaveBeenCalled();
    expect(mockEd.session.setMode).toHaveBeenCalled();

    act(() => {
      rerender(<Host value="const a=12" lang="python" theme="" />);
    });
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(30);
    });
    expect(loadAceTheme).toHaveBeenCalled();
    expect(mockEd.setTheme).toHaveBeenCalled();

    act(() => {
      api?.focusEditor();
    });
    expect(mockEd.focus).toHaveBeenCalled();
  });

  it('值追加 / 非追加：session.insert vs setValue', async () => {
    const onUpdate = vi.fn();
    let api: ReturnType<typeof AceEditor> | null = null;
    const mockEd = makeMockEditor();

    function Host({ value }: { value: string }) {
      const result = AceEditor({
        element: {
          type: 'code',
          value,
          language: 'text',
          children: [{ text: '' }],
        } as any,
        onUpdate,
        onShowBorderChange: vi.fn(),
        onHideChange: vi.fn(),
        path: [0],
        theme: 'monokai',
      });
      useEffect(() => {
        api = result;
        if (api.editorRef) {
          api.editorRef.current = mockEd as any;
        }
      });
      return <div ref={result.dom} />;
    }

    const { rerender } = render(<Host value="ab" />);
    act(() => {
      if (api?.editorRef) api.editorRef.current = mockEd as any;
    });

    act(() => {
      rerender(<Host value="abcd" />);
    });
    expect(mockEd.session.insert).toHaveBeenCalled();

    act(() => {
      rerender(<Host value="zz" />);
    });
    expect(mockEd.setValue).toHaveBeenCalledWith('zz');
  });
});

/**
 * AceEditor deepen2 light：保持 NODE_ENV=test，不挂载真实 ace / 不切 development。
 * 只覆盖默认 props、无 editor 时的 setLanguage/focusEditor 早退。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: { editor: { focus: vi.fn() } },
    readonly: false,
    editorProps: {},
  }),
}));

vi.mock('../../../../MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: { focus: vi.fn() },
}));

vi.mock('../../../../MarkdownEditor/editor/utils/ace', () => ({
  modeMap: new Map([['js', 'javascript']]),
  getAceLangs: vi.fn(() => Promise.resolve(new Set(['javascript', 'text']))),
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
    throw new Error('should not load ace in light residual');
  }),
  loadAceTheme: vi.fn(async () => undefined),
}));

import { AceEditor } from '../../components/AceEditor';

describe('AceEditor deepen2 light residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('test 环境：默认 isSelected；无 editor 时 setLanguage/focusEditor 安全', async () => {
    const onUpdate = vi.fn();
    let api: ReturnType<typeof AceEditor> | null = null;

    function Host({ lang, value }: { lang?: string; value: string }) {
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
        theme: 'github',
      });
      useEffect(() => {
        api = result;
      });
      return <div ref={result.dom} data-testid="ace-light" />;
    }

    const { rerender } = render(<Host value="const a=1" lang="javascript" />);
    expect(document.querySelector('[data-testid="ace-light"]')).toBeTruthy();
    expect(api?.isSelected).toBe(false);

    await act(async () => {
      await api?.setLanguage('javascript');
    });
    expect(onUpdate).not.toHaveBeenCalled();

    await act(async () => {
      await api?.setLanguage('python');
    });
    expect(onUpdate).toHaveBeenCalledWith({ language: 'python' });

    act(() => {
      api?.focusEditor();
    });

    act(() => {
      rerender(<Host value="const a=12" lang="python" />);
    });
  });
});

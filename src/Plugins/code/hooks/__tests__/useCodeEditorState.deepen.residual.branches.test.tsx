/**
 * useCodeEditorState deepen：language 缺省为空串。
 */
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { setCodeBlockNodes } = vi.hoisted(() => ({
  setCodeBlockNodes: vi.fn(),
}));

vi.mock('../../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: { editor: {} },
    markdownEditorRef: { current: { focus: vi.fn() } },
  }),
}));

vi.mock('../../../../MarkdownEditor/hooks/editor', () => ({
  useSelStatus: () => [false, [0]],
}));

vi.mock('../../../../MarkdownEditor/editor/utils/codeBlockBehavior', () => ({
  setCodeBlockNodes,
}));

vi.mock('../../../../MarkdownEditor/editor/utils/codeBlockPlainText', () => ({
  getSlateElementPlainText: () => 'plain',
}));

vi.mock('../../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

import { useCodeEditorState } from '../useCodeEditorState';

describe('useCodeEditorState deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('element.language 缺省时 lang 为空串', () => {
    const { result } = renderHook(() =>
      useCodeEditorState({
        type: 'code',
        value: 'x',
        children: [{ text: '' }],
      } as any),
    );
    expect(result.current.state.lang).toBe('');
  });
});

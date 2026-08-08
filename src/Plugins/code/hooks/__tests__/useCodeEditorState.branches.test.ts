/**
 * useCodeEditorState：language || '' 默认。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCodeEditorState } from '../useCodeEditorState';

vi.mock('slate-react', () => ({
  ReactEditor: { isFocused: vi.fn(() => false) },
}));

vi.mock('../../../MarkdownEditor/hooks/editor', () => ({
  useSelStatus: vi.fn(() => [false, [0]]),
}));

vi.mock('../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({
    store: { editor: {} },
    markdownEditorRef: { current: null },
  })),
}));

vi.mock('../../../MarkdownEditor/editor/utils/codeBlockBehavior', () => ({
  setCodeBlockNodes: vi.fn(),
}));

vi.mock('react-use', () => ({
  useGetSetState: (initial: unknown) => {
    let state = initial;
    return [
      () => state,
      (patch: Record<string, unknown>) => {
        state = { ...(state as object), ...patch };
      },
    ];
  },
}));

describe('useCodeEditorState branches', () => {
  it.skip('element.language 缺省时 lang 为空串', () => {
    const { result } = renderHook(() =>
      useCodeEditorState({
        type: 'code',
        children: [{ text: '' }],
      } as any),
    );
    expect(result.current.state.lang).toBe('');
  });
});

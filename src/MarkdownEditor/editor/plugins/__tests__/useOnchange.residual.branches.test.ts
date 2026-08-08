/**
 * useOnchange 残留：readonly 纯选区早退、关闭 selectionTracking、无 editor、无 onChange。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { storeState } = vi.hoisted(() => ({
  storeState: {
    setRefreshFloatBar: vi.fn(),
    bumpFloatBarRevision: vi.fn(),
    setDomRect: vi.fn(),
    readonly: false,
    markdownEditorRef: { current: null as any },
    selChange$: { next: vi.fn() },
  },
}));

vi.mock('../../store', () => ({
  useEditorStore: () => storeState,
}));

vi.mock('../../../../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: any) => ({ run: fn, cancel: vi.fn() }),
}));

vi.mock('../../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

vi.mock('../../utils', () => ({
  parserSlateNodeToMarkdown: () => 'md',
}));

import { useOnchange } from '../useOnchange';

describe('useOnchange residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeState.readonly = false;
    storeState.markdownEditorRef.current = {
      children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      operations: [],
    };
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('无 editor 早退', () => {
    storeState.markdownEditorRef.current = null;
    const { result } = renderHook(() => useOnchange(vi.fn()));
    expect(() => result.current([], [])).not.toThrow();
  });

  it('readonly 且仅 set_selection 早退', () => {
    storeState.readonly = true;
    const onChange = vi.fn();
    const { result } = renderHook(() => useOnchange(onChange));
    result.current([], [{ type: 'set_selection' } as any]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('关闭 selectionTracking 时纯选区早退', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useOnchange(onChange, { selectionTrackingEnabled: false }),
    );
    result.current([], [{ type: 'set_selection' } as any]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('无 onChange 回调时内容变化不抛', () => {
    const { result } = renderHook(() => useOnchange(undefined, { wait: 10 }));
    expect(() =>
      result.current([], [{ type: 'insert_text', text: 'x' } as any]),
    ).not.toThrow();
  });
});

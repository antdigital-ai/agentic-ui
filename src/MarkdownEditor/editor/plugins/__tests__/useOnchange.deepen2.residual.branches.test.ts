/**
 * useOnchange deepen2：readonly 无内容变更、无 onChange、
 * bumpFloatBarRevision、selectionTracking。
 */
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOnchange } from '../useOnchange';

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
  parserSlateNodeToMarkdown: () => 'md-out',
}));

describe('useOnchange deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    storeState.readonly = false;
    storeState.markdownEditorRef.current = {
      children: [{ type: 'paragraph', children: [{ text: 'A' }] }],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      },
    };
    Object.defineProperty(window, 'getSelection', {
      configurable: true,
      value: vi.fn(() => ({
        rangeCount: 1,
        getRangeAt: () => ({
          toString: () => 'A',
          getBoundingClientRect: () => ({
            x: 1,
            y: 2,
            width: 10,
            height: 10,
            top: 2,
            left: 1,
            bottom: 12,
            right: 11,
            toJSON: () => ({}),
          }),
        }),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 onChange 早退', () => {
    const { result } = renderHook(() => useOnchange(undefined as any));
    expect(() =>
      result.current([], [{ type: 'set_selection' } as any]),
    ).not.toThrow();
  });

  it('readonly + 无内容变更跳过 onChange', () => {
    storeState.readonly = true;
    const onChange = vi.fn();
    const { result } = renderHook(() => useOnchange(onChange));
    result.current([], [{ type: 'set_selection' } as any]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('内容变更触发 onChange', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useOnchange(onChange, { wait: 0, selectionTrackingEnabled: false }),
    );
    result.current(
      [{ type: 'paragraph', children: [{ text: 'AB' }] }] as any,
      [{ type: 'insert_text', text: 'B' } as any],
    );
    expect(onChange).toHaveBeenCalled();
  });

  it('无 editor 早退', () => {
    storeState.markdownEditorRef.current = null;
    const onChange = vi.fn();
    const { result } = renderHook(() => useOnchange(onChange));
    result.current([], [{ type: 'insert_text' } as any]);
    expect(onChange).not.toHaveBeenCalled();
  });
});

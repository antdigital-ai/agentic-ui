/**
 * useEditableTableContentWidth deepen：readonly 早退；无 ResizeObserver。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEditableTableContentWidth } from '../useEditableTableContentWidth';

describe('useEditableTableContentWidth deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('readonly 不测宽', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useEditableTableContentWidth(ref as any, true),
    );
    expect(result.current).toBeDefined();
  });

  it('无 ResizeObserver 安全', () => {
    const ro = (globalThis as any).ResizeObserver;
    // @ts-ignore
    delete (globalThis as any).ResizeObserver;
    const ref = { current: document.createElement('div') };
    expect(() =>
      renderHook(() => useEditableTableContentWidth(ref as any, false)),
    ).not.toThrow();
    (globalThis as any).ResizeObserver = ro;
  });
});

/**
 * useDetectTheme deepen2：默认 options 与 observeChanges=false。
 */
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDetectTheme } from '../useDetectTheme';

describe('useDetectTheme deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('默认调用与 observeChanges=false', () => {
    const a = renderHook(() => useDetectTheme());
    expect(a.result.current === 'light' || a.result.current === 'dark').toBe(
      true,
    );
    const b = renderHook(() => useDetectTheme({ observeChanges: false }));
    expect(b.result.current === 'light' || b.result.current === 'dark').toBe(
      true,
    );
  });
});

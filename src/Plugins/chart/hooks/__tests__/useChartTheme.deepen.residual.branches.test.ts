/**
 * useChartTheme deepen：theme 为 undefined/null 走 `?? 'light'`。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChartTheme } from '../useChartTheme';

describe('useChartTheme deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('theme undefined / null 视为 light', () => {
    const a = renderHook(() => useChartTheme(undefined));
    expect(a.result.current.isLight).toBe(true);
    const b = renderHook(() => useChartTheme(null as any));
    expect(b.result.current.isLight).toBe(true);
  });
});

/**
 * useThrottleFn deepen2：连续调用节流。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useThrottleFn } from '../useThrottleFn';

describe('useThrottleFn deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('throttle 调用', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(fn, 50));
    result.current();
    result.current();
    expect(fn).toHaveBeenCalled();
  });
});

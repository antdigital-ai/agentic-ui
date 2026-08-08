/**
 * useThrottleFn deepen：窗口期内二次调用挂起 timeout。
 */
import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useThrottleFn } from '../useThrottleFn';

describe('useThrottleFn deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('窗口内再次调用只调度一次延迟执行', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(fn, 100));
    act(() => {
      result.current('a');
      result.current('b');
      result.current('c');
    });
    expect(fn).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
  });
});

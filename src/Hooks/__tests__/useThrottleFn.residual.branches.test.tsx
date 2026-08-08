import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useThrottleFn } from '../useThrottleFn';

describe('useThrottleFn residual branches', () => {
  it('coalesces calls in a window using the latest arguments', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottleFn(callback, 100));
    result.current('first');
    result.current('last');
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenLastCalledWith('last');
    vi.useRealTimers();
  });

  it('clears a pending callback when unmounted', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useThrottleFn(callback, 100));
    result.current('now');
    result.current('pending');
    unmount();
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

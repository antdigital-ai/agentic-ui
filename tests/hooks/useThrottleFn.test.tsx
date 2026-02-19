import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useThrottleFn } from '../../src/Hooks/useThrottleFn';

describe('useThrottleFn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should return a throttled function', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(mockFn, 100));

    expect(typeof result.current).toBe('function');
  });

  it('should execute function immediately on first call', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(mockFn, 100));

    act(() => {
      result.current('arg1', 'arg2');
    });

    // 第一次调用应该立即执行
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should throttle function calls within interval', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(mockFn, 100));

    // 第一次调用
    act(() => {
      result.current('first');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('first');

    // 立即再次调用，应该被节流
    act(() => {
      result.current('second');
    });

    expect(mockFn).toHaveBeenCalledTimes(1); // 仍然只调用了一次

    // 推进时间到间隔的一半
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(mockFn).toHaveBeenCalledTimes(1); // 仍然只调用了一次

    // 推进时间到间隔结束
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('second');
  });

  it('should execute function after interval when called during throttle period', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(mockFn, 100));

    // 第一次调用
    act(() => {
      result.current('first');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    // 在节流期间调用
    act(() => {
      result.current('second');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    // 推进时间到间隔结束
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('second');
  });

  it('should handle multiple rapid calls correctly', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(mockFn, 100));

    // 多次快速调用
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current(`call${i}`);
      }
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('call0');

    // 推进时间到间隔结束
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('call4');
  });

  it('should allow execution after interval has passed', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(mockFn, 100));

    // 第一次调用
    act(() => {
      result.current('first');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    // 推进时间超过间隔
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // 再次调用，应该立即执行
    act(() => {
      result.current('second');
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('second');
  });

  it('should use default interval of 100ms when not specified', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(mockFn));

    act(() => {
      result.current('first');
    });

    act(() => {
      result.current('second');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should handle zero interval correctly', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(mockFn, 0));

    act(() => {
      result.current('first');
    });

    act(() => {
      result.current('second');
    });

    // 零间隔时，每次调用都应该立即执行
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('first');
    expect(mockFn).toHaveBeenCalledWith('second');
  });

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const mockFn = vi.fn();
    const { result, unmount } = renderHook(() => useThrottleFn(mockFn, 100));

    // 调用函数来创建一个超时
    act(() => {
      result.current('first');
      result.current('second'); // 这会创建一个超时
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('remainingTime<=0 且存在 pending timeout 时应 clearTimeout 并立即执行', () => {
    const mockFn = vi.fn();
    let now = 100;
    vi.spyOn(Date, 'now').mockImplementation(() => now);

    const { result } = renderHook(() => useThrottleFn(mockFn, 100));

    act(() => {
      result.current('first');
    });
    expect(mockFn).toHaveBeenCalledWith('first');

    act(() => {
      result.current('second');
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    now = 200;
    act(() => {
      result.current('third');
    });
    expect(mockFn).toHaveBeenCalledWith('third');
    expect(mockFn).toHaveBeenCalledTimes(2);

    vi.mocked(Date.now).mockRestore();
  });

  it('should handle function with different contexts', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(mockFn, 100));

    const context = { value: 'test' };

    act(() => {
      result.current.call(context, 'arg1');
    });

    expect(mockFn).toHaveBeenCalledWith('arg1');
  });

  it('should handle async functions', async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue('async result');
    const { result } = renderHook(() => useThrottleFn(mockAsyncFn, 100));

    act(() => {
      result.current('test');
    });

    expect(mockAsyncFn).toHaveBeenCalledWith('test');
  });
});

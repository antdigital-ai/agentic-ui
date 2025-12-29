import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounceFn } from '../@ant-design/agentic-ui/Hooks/useDebounceFn';

describe('useDebounceFn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should return run and cancel functions', () => {
    const mockFn = vi.fn().mockImplementation(async () => 'test');
    const { result } = renderHook(() => useDebounceFn(mockFn, 100));

    expect(typeof result.current.run).toBe('function');
    expect(typeof result.current.cancel).toBe('function');
  });

  it('should execute function immediately when wait is 0', async () => {
    const mockFn = vi.fn().mockImplementation(async () => 'test');
    const { result } = renderHook(() => useDebounceFn(mockFn, 0));

    let promise: Promise<any>;
    act(() => {
      promise = result.current.run('arg1', 'arg2');
    });

    const resultValue = await promise!;

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(resultValue).toBe('test');
  });

  it('should execute function immediately when wait is undefined', async () => {
    const mockFn = vi.fn().mockImplementation(async () => 'test');
    const { result } = renderHook(() => useDebounceFn(mockFn));

    let promise: Promise<any>;
    act(() => {
      promise = result.current.run('arg1', 'arg2');
    });

    const resultValue = await promise!;

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(resultValue).toBe('test');
  });

  it('should handle basic debouncing', async () => {
    const mockFn = vi.fn().mockImplementation(async () => 'test');
    const { result } = renderHook(() => useDebounceFn(mockFn, 100));

    let promise: Promise<any>;
    act(() => {
      promise = result.current.run('test');
    });

    // 函数不应该立即执行
    expect(mockFn).not.toHaveBeenCalled();

    // 推进时间到等待时间
    act(() => {
      vi.advanceTimersByTime(100);
    });

    await act(async () => {
      await promise!;
    });

    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should handle cancel function', () => {
    const mockFn = vi.fn().mockImplementation(async () => 'test');
    const { result } = renderHook(() => useDebounceFn(mockFn, 100));

    expect(typeof result.current.cancel).toBe('function');

    act(() => {
      result.current.cancel();
    });

    // cancel函数应该正常执行而不抛出错误
    expect(result.current.cancel).toBeDefined();
  });
});

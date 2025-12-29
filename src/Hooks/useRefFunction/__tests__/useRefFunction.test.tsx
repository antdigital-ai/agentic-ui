import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRefFunction } from '../@ant-design/agentic-ui/Hooks/useRefFunction';

describe('useRefFunction', () => {
  it('should return a function that calls the latest function', () => {
    const mockFn = vi.fn().mockReturnValue('test result');

    const { result } = renderHook(() => useRefFunction(mockFn));

    const returnedFn = result.current;
    const resultValue = returnedFn('arg1', 'arg2');

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(resultValue).toBe('test result');
  });

  it('should always call the latest function even when function reference changes', () => {
    const mockFn1 = vi.fn().mockReturnValue('result1');
    const mockFn2 = vi.fn().mockReturnValue('result2');

    const { result, rerender } = renderHook(({ fn }) => useRefFunction(fn), {
      initialProps: { fn: mockFn1 },
    });

    const returnedFn = result.current;

    // 第一次调用
    const result1 = returnedFn('arg1');
    expect(mockFn1).toHaveBeenCalledWith('arg1');
    expect(result1).toBe('result1');

    // 重新渲染，传入新的函数
    rerender({ fn: mockFn2 });

    // 第二次调用，应该调用新的函数
    const result2 = returnedFn('arg2');
    expect(mockFn2).toHaveBeenCalledWith('arg2');
    expect(result2).toBe('result2');
  });

  it('should handle functions with different parameter types', () => {
    const mockFn = vi.fn().mockReturnValue(42);

    const { result } = renderHook(() => useRefFunction(mockFn));

    const returnedFn = result.current;
    const resultValue = returnedFn('string', 123, { key: 'value' });

    expect(mockFn).toHaveBeenCalledWith('string', 123, { key: 'value' });
    expect(resultValue).toBe(42);
  });

  it('should handle async functions', async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue('async result');

    const { result } = renderHook(() => useRefFunction(mockAsyncFn));

    const returnedFn = result.current;
    const promise = returnedFn('arg1');

    expect(mockAsyncFn).toHaveBeenCalledWith('arg1');
    expect(promise).toBeInstanceOf(Promise);

    const resultValue = await promise;
    expect(resultValue).toBe('async result');
  });

  it('should handle functions that return undefined', () => {
    const mockFn = vi.fn().mockReturnValue(undefined);

    const { result } = renderHook(() => useRefFunction(mockFn));

    const returnedFn = result.current;
    const resultValue = returnedFn();

    expect(mockFn).toHaveBeenCalled();
    expect(resultValue).toBeUndefined();
  });

  it('should handle functions that throw errors', () => {
    const mockFn = vi.fn().mockImplementation(() => {
      throw new Error('test error');
    });

    const { result } = renderHook(() => useRefFunction(mockFn));

    const returnedFn = result.current;

    expect(() => returnedFn()).toThrow('test error');
    expect(mockFn).toHaveBeenCalled();
  });

  it('should maintain function reference stability', () => {
    const mockFn = vi.fn();

    const { result, rerender } = renderHook(() => useRefFunction(mockFn));

    const firstReturnedFn = result.current;

    // 重新渲染
    rerender();

    const secondReturnedFn = result.current;

    // 返回的函数引用应该保持稳定
    expect(firstReturnedFn).toBe(secondReturnedFn);
  });
});

/**
 * editor/utils index deepen：useDebounce / useGetSetState 默认参数与校验。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce, useGetSetState } from '../index';

describe('editor/utils index deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('useDebounce 默认 ms=0 立即就绪', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounce(fn));
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current[0]()).toBe(true);
    expect(fn).toHaveBeenCalled();
  });

  it('useGetSetState 默认空对象；patch 假值早退', () => {
    const { result } = renderHook(() => useGetSetState<{ a?: number }>());
    expect(result.current[0]()).toEqual({});
    act(() => {
      result.current[1](null as any);
    });
    expect(result.current[0]()).toEqual({});
    act(() => {
      result.current[1]({ a: 1 });
    });
    expect(result.current[0]().a).toBe(1);
  });

  it('production 外非对象 patch 打 console.error', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useGetSetState({ a: 1 }));
    act(() => {
      result.current[1]('bad' as any);
    });
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });
});

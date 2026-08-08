/**
 * useAsyncLottieData deepen：加载成功/失败与 default 导出。
 */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAsyncLottieData } from '../useAsyncLottieData';

describe('useAsyncLottieData deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('解析 default 导出；失败时保持 null', async () => {
    const ok = vi.fn(async () => ({ default: { v: 'ok' } }));
    const { result, rerender } = renderHook(
      ({ load }) => useAsyncLottieData(load),
      { initialProps: { load: ok } },
    );
    await waitFor(() => {
      expect(result.current).toEqual({ v: 'ok' });
    });

    const bad = vi.fn(async () => {
      throw new Error('fail');
    });
    await act(async () => {
      rerender({ load: bad });
    });
    await waitFor(() => {
      expect(bad).toHaveBeenCalled();
    });
  });

  it('无 default 字段时返回模块本身', async () => {
    const load = vi.fn(async () => ({ frames: 1 }));
    const { result } = renderHook(() => useAsyncLottieData(load));
    await waitFor(() => {
      expect(result.current).toEqual({ frames: 1 });
    });
  });
});

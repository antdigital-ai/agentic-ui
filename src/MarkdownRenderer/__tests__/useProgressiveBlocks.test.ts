import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveBlocks } from '../streaming/useProgressiveBlocks';
import { installRafStub } from './installRafStub';

describe('useProgressiveBlocks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    vi.stubGlobal(
      'requestIdleCallback',
      (callback: IdleRequestCallback): number =>
        window.setTimeout(
          () =>
            callback({
              didTimeout: false,
              timeRemaining: () => 50,
            }),
          1,
        ),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
  });

  it('流式或低于阈值时应直接返回全部块', () => {
    const streaming = renderHook(() => useProgressiveBlocks(20, true, 0));
    const smallDocument = renderHook(() => useProgressiveBlocks(12, false, 0));

    expect(streaming.result.current).toBe(20);
    expect(smallDocument.result.current).toBe(12);
  });

  it('非流式大文档应先渲染首批块再分帧追加', async () => {
    const { result } = renderHook(() => useProgressiveBlocks(20, false, 0));

    expect(result.current).toBe(8);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(result.current).toBe(14);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(result.current).toBe(20);
  });

  it('页面隐藏时应立即渲染全部块', async () => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });

    const { result } = renderHook(() => useProgressiveBlocks(20, false, 0));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current).toBe(20);
  });

  it('generation 变化时即使块数不变也应重置进度', async () => {
    const { result, rerender } = renderHook(
      ({ generation }) => useProgressiveBlocks(20, false, generation),
      {
        initialProps: { generation: 0 },
      },
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(result.current).toBe(14);

    rerender({ generation: 1 });

    expect(result.current).toBe(8);
  });
});

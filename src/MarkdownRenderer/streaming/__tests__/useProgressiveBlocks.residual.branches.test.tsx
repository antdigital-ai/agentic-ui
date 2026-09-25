import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveBlocks } from '../useProgressiveBlocks';

describe('useProgressiveBlocks residual branches', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.skip('returns full content for streaming and small documents', () => {
    const { result, rerender } = renderHook(
      ({ total, streaming }) => useProgressiveBlocks(total, streaming),
      { initialProps: { total: 12, streaming: false } },
    );
    expect(result.current).toBe(12);
    rerender({ total: 30, streaming: true });
    expect(result.current).toBe(30);
  });

  it.skip('resets equal-sized replacements by generation and advances via animation frames', () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const { result, rerender } = renderHook(
      ({ generation }) => useProgressiveBlocks(20, false, generation),
      { initialProps: { generation: 1 } },
    );
    expect(result.current).toBeGreaterThanOrEqual(8);
    act(() => rerender({ generation: 2 }));
    expect(result.current).toBe(8);
  });

  it.skip('document.hidden 时一次性拉满；切回可见继续分帧', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const rafCbs: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCbs.push(cb);
      return rafCbs.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });

    const { result, rerender, unmount } = renderHook(
      ({ total, streaming, gen }) =>
        useProgressiveBlocks(total, streaming, gen),
      { initialProps: { total: 40, streaming: false, gen: 1 } },
    );
    expect(result.current).toBe(40);

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    act(() => {
      rerender({ total: 40, streaming: false, gen: 2 });
    });
    expect(result.current).toBe(8);

    act(() => {
      const cb = rafCbs[rafCbs.length - 1];
      cb?.(performance.now());
    });
    expect(result.current).toBeGreaterThanOrEqual(8);

    unmount();
    vi.clearAllTimers();
  });

  it.skip('total 缩小 / streaming 翻转会重置 visibleCount', () => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    const { result, rerender } = renderHook(
      ({ total, streaming }) => useProgressiveBlocks(total, streaming, 1),
      { initialProps: { total: 30, streaming: false } },
    );
    expect(result.current).toBe(8);
    act(() => rerender({ total: 5, streaming: false }));
    expect(result.current).toBe(5);
    act(() => rerender({ total: 25, streaming: true }));
    expect(result.current).toBe(25);
    act(() => rerender({ total: 25, streaming: false }));
    expect(result.current).toBe(8);
  });
});

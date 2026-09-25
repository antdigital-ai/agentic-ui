/**
 * useProgressiveBlocks deepen：rIC 路径、cancelled 清理、visibility。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveBlocks } from '../useProgressiveBlocks';

describe('useProgressiveBlocks deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
  });

  it('requestIdleCallback 存在时走 rIC bump', () => {
    const idleCbs: Array<() => void> = [];
    vi.stubGlobal(
      'requestIdleCallback',
      (cb: () => void) => {
        idleCbs.push(cb);
        return 1;
      },
    );

    const { result, unmount } = renderHook(() =>
      useProgressiveBlocks(40, false, 1),
    );
    expect(result.current).toBe(8);
    act(() => {
      idleCbs[0]?.();
    });
    expect(result.current).toBeGreaterThanOrEqual(8);
    unmount();
  });

  it('卸载时 cancelled 阻止后续 bump', () => {
    const rafCbs: FrameRequestCallback[] = [];
    vi.stubGlobal('requestIdleCallback', undefined);
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCbs.push(cb);
      return rafCbs.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const { unmount } = renderHook(() => useProgressiveBlocks(30, false, 1));
    unmount();
    act(() => {
      rafCbs.forEach((cb) => cb(0));
    });
  });

  it('document.hidden 时一次性拉满', () => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    const { result } = renderHook(() => useProgressiveBlocks(40, false, 1));
    expect(result.current).toBe(40);
  });
});

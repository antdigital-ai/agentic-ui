/**
 * useSmartScrollShadow mid-tail：无 element、ResizeObserver 缺失、滚动态边界。
 */
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useSmartScrollShadow from '../useScrollShadow';

describe('useSmartScrollShadow midtail branches', () => {
  const OriginalRO = global.ResizeObserver;

  afterEach(() => {
    global.ResizeObserver = OriginalRO;
    vi.restoreAllMocks();
  });

  it('无 ResizeObserver 时 effect 早退', () => {
    // @ts-expect-error test SSR-like
    delete global.ResizeObserver;
    const { result } = renderHook(() => useSmartScrollShadow(1));
    expect(result.current[1].vertical.hasScroll).toBe(false);
  });

  it('挂载后根据尺寸计算 hasScroll / isAtStart / isAtEnd', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    global.ResizeObserver = class {
      observe = observe;
      unobserve = vi.fn();
      disconnect = disconnect;
    } as any;

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 1;
    });

    const el = document.createElement('div');
    Object.defineProperties(el, {
      scrollHeight: { configurable: true, get: () => 200 },
      clientHeight: { configurable: true, get: () => 100 },
      scrollTop: { configurable: true, get: () => 0, set: () => {} },
      scrollWidth: { configurable: true, get: () => 300 },
      clientWidth: { configurable: true, get: () => 100 },
      scrollLeft: { configurable: true, get: () => 0, set: () => {} },
    });

    const { result: r2, unmount } = renderHook(() => {
      const pair = useSmartScrollShadow(1);
      React.useLayoutEffect(() => {
        (pair[0] as React.MutableRefObject<HTMLDivElement | null>).current = el;
      });
      return pair;
    });

    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });

    expect(r2.current[1].vertical.hasScroll).toBe(true);
    expect(r2.current[1].vertical.isAtStart).toBe(true);
    expect(r2.current[1].horizontal.hasScroll).toBe(true);

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it('默认 sensitivity 参数可挂载', () => {
    const { result } = renderHook(() => useSmartScrollShadow());
    expect(result.current[1].vertical.isAtStart).toBe(true);
    expect(result.current[1].horizontal.isAtEnd).toBe(true);
  });
});

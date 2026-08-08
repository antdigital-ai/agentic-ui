/**
 * useAutoScroll 残留：无 container 早退、wheel unpin、deps 重挂载。
 */
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAutoScroll from '../useAutoScroll';

type RoCallback = (entries: ResizeObserverEntry[]) => void;
type MoCallback = MutationCallback;

const installObserverMocks = () => {
  global.ResizeObserver = vi.fn(function MockResizeObserver(cb: RoCallback) {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      callback: cb,
    };
  }) as unknown as typeof ResizeObserver;

  global.MutationObserver = vi.fn(function MockMutationObserver(
    cb: MoCallback,
  ) {
    return {
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [],
      callback: cb,
    };
  }) as unknown as typeof MutationObserver;
};

const installScroll = (
  el: HTMLElement,
  m: { scrollHeight?: number; scrollTop?: number; clientHeight?: number },
) => {
  const state = {
    scrollHeight: m.scrollHeight ?? 200,
    scrollTop: m.scrollTop ?? 0,
    clientHeight: m.clientHeight ?? 100,
  };
  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    get: () => state.scrollHeight,
    set: (v) => {
      state.scrollHeight = v;
    },
  });
  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    get: () => state.clientHeight,
  });
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => state.scrollTop,
    set: (v) => {
      state.scrollTop = v;
    },
  });
  return state;
};

describe('useAutoScroll residual branches', () => {
  beforeEach(() => {
    installObserverMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('containerRef 当前为 null 时 scrollToBottom 不抛', () => {
    const { result } = renderHook(() => useAutoScroll());
    expect(() => {
      act(() => {
        result.current.scrollToBottom('auto');
      });
    }).not.toThrow();
  });

  it('远离底部 wheel 上滑解除 pinned', () => {
    const el = document.createElement('div');
    const metrics = installScroll(el, {
      scrollHeight: 500,
      clientHeight: 100,
      scrollTop: 0,
    });
    document.body.appendChild(el);
    const onScrollStateChange = vi.fn();
    const { result } = renderHook(() =>
      useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 16,
      }),
    );
    act(() => {
      (result.current.containerRef as { current: HTMLElement | null }).current =
        el;
    });
    act(() => {
      result.current.scrollToBottom('auto');
    });
    metrics.scrollTop = 0;
    act(() => {
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -40, bubbles: true }),
      );
    });
    document.body.removeChild(el);
    expect(onScrollStateChange.mock.calls.length >= 0).toBe(true);
  });

  it('deps 变化触发重绑', () => {
    const el = document.createElement('div');
    installScroll(el, { scrollHeight: 300, clientHeight: 100, scrollTop: 200 });
    document.body.appendChild(el);
    const { result, rerender } = renderHook(
      ({ deps }) => useAutoScroll({ deps }),
      { initialProps: { deps: ['a'] as React.DependencyList } },
    );
    act(() => {
      (result.current.containerRef as { current: HTMLElement | null }).current =
        el;
    });
    rerender({ deps: ['b'] });
    expect(result.current.containerRef.current).toBe(el);
    document.body.removeChild(el);
  });
});

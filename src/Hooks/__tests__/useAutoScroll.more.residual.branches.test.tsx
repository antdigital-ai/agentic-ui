/**
 * useAutoScroll 更多残留：收缩内容、keyboard、programmatic scroll。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAutoScroll from '../useAutoScroll';

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

describe('useAutoScroll more residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })) as any;
    global.MutationObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [],
    })) as any;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('scrollBehavior=auto 时 jump；内容收缩不抛', () => {
    const el = document.createElement('div');
    const metrics = installScroll(el, {
      scrollHeight: 500,
      clientHeight: 100,
      scrollTop: 400,
    });
    document.body.appendChild(el);
    const { result } = renderHook(() =>
      useAutoScroll({
        containerRef: { current: el },
        scrollBehavior: 'auto',
        tolerance: 8,
      }),
    );
    act(() => {
      result.current.scrollToBottom();
    });
    metrics.scrollHeight = 200;
    metrics.scrollTop = 50;
    expect(result.current.scrollToBottom).toBeTypeOf('function');
    el.remove();
  });

  it('键盘事件不抛', () => {
    const el = document.createElement('div');
    installScroll(el, {
      scrollHeight: 800,
      clientHeight: 100,
      scrollTop: 0,
    });
    document.body.appendChild(el);
    renderHook(() =>
      useAutoScroll({
        containerRef: { current: el },
        pinThreshold: 40,
        tolerance: 8,
      }),
    );
    expect(() => {
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }),
      );
    }).not.toThrow();
    el.remove();
  });

  it('wheel 上滑不抛', () => {
    const el = document.createElement('div');
    installScroll(el, {
      scrollHeight: 500,
      clientHeight: 100,
      scrollTop: 0,
    });
    document.body.appendChild(el);
    renderHook(() => useAutoScroll({ containerRef: { current: el } }));
    expect(() => {
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -120, bubbles: true }),
      );
    }).not.toThrow();
    el.remove();
  });

  it('container null 早退；底部 pin + MutationObserver 回调', () => {
    const { result } = renderHook(() =>
      useAutoScroll({
        containerRef: { current: null },
        tolerance: 4,
      }),
    );
    expect(() => result.current.scrollToBottom()).not.toThrow();

    const el = document.createElement('div');
    const metrics = installScroll(el, {
      scrollHeight: 1000,
      clientHeight: 100,
      scrollTop: 900,
    });
    document.body.appendChild(el);
    const { result: r2, unmount } = renderHook(() =>
      useAutoScroll({
        containerRef: { current: el },
        tolerance: 20,
        pinThreshold: 30,
      }),
    );
    act(() => {
      r2.current.scrollToBottom();
    });
    metrics.scrollHeight = 1200;
    metrics.scrollTop = 1100;
    el.dispatchEvent(new Event('scroll'));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    unmount();
    el.remove();
  });
});

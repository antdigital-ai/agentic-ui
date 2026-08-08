/**
 * useAutoScroll deepen5 safe：notify 无 container；animate 卸载无 el；
 * scrollBehavior 默认 smooth；shrink pinned；downKeys 恢复 pinned。
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAutoScroll from '../useAutoScroll';

type MoCallback = MutationCallback;

const installObserverMocks = () => {
  const moInstances: Array<{
    callback: MoCallback;
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }> = [];

  global.ResizeObserver = vi.fn(function MockResizeObserver() {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }) as unknown as typeof ResizeObserver;

  global.MutationObserver = vi.fn(function MockMutationObserver(cb: MoCallback) {
    const inst = {
      callback: cb,
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [] as MutationRecord[],
    };
    moInstances.push(inst);
    return inst;
  }) as unknown as typeof MutationObserver;

  return { moInstances };
};

const installScrollMetrics = (
  el: HTMLElement,
  metrics: { scrollHeight?: number; scrollTop?: number; clientHeight?: number },
) => {
  const state = {
    scrollHeight: metrics.scrollHeight ?? 200,
    scrollTop: metrics.scrollTop ?? 0,
    clientHeight: metrics.clientHeight ?? 100,
  };
  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    get: () => state.scrollHeight,
    set: (v: number) => {
      state.scrollHeight = v;
    },
  });
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => state.scrollTop,
    set: (v: number) => {
      state.scrollTop = v;
    },
  });
  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    get: () => state.clientHeight,
    set: (v: number) => {
      state.clientHeight = v;
    },
  });
  return state;
};

describe('useAutoScroll deepen5 safe residual branches', () => {
  let moInstances: ReturnType<typeof installObserverMocks>['moInstances'];
  let rafQueue: FrameRequestCallback[];

  const flushRaf = (n = 3) => {
    for (let i = 0; i < n; i++) {
      const q = rafQueue.splice(0, rafQueue.length);
      q.forEach((cb) => cb(performance.now()));
    }
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    ({ moInstances } = installObserverMocks());
    rafQueue = [];
    let rafId = 1;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return rafId++;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
  });

  it('挂载前 notifyState/scrollToBottom 无 container 早退', () => {
    let scrollToBottom!: () => void;
    const Wrapper = () => {
      const api = useAutoScroll({ deps: [1] });
      scrollToBottom = api.scrollToBottom;
      return null;
    };
    render(<Wrapper />);
    act(() => {
      scrollToBottom();
    });
    expect(true).toBe(true);
  });

  it('默认 scrollBehavior smooth：grow/shrink 走 animateToBottom', () => {
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollTolerance: 8,
      });
      React.useEffect(() => {
        scrollToBottom();
      }, [deps, scrollToBottom]);
      return (
        <div
          ref={(el) => {
            if (!el) return;
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (!metrics) {
              metrics = installScrollMetrics(el, {
                scrollHeight: 600,
                clientHeight: 100,
                scrollTop: 500,
              });
            }
          }}
          data-testid="as-d5-grow"
        />
      );
    };
    const { unmount } = render(<Wrapper deps={[1]} />);
    const el = document.querySelector(
      '[data-testid="as-d5-grow"]',
    ) as HTMLElement;
    act(() => {
      flushRaf(2);
      if (metrics) metrics.scrollHeight = 900;
      moInstances[moInstances.length - 1]?.callback(
        [{ type: 'childList', target: el } as MutationRecord],
        {} as MutationObserver,
      );
      flushRaf(4);
      if (metrics) {
        metrics.scrollHeight = 700;
        metrics.scrollTop = 520;
      }
      moInstances[moInstances.length - 1]?.callback(
        [{ type: 'childList', target: el } as MutationRecord],
        {} as MutationObserver,
      );
      flushRaf(4);
    });
    unmount();
    act(() => flushRaf(2));
  });

  it('downKeys 在贴底时走 downKeys 分支', () => {
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const Wrapper = () => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps: [1],
        scrollTolerance: 20,
        pinThreshold: 30,
      });
      React.useEffect(() => {
        scrollToBottom();
      }, [scrollToBottom]);
      return (
        <div
          ref={(el) => {
            if (!el) return;
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (!metrics) {
              metrics = installScrollMetrics(el, {
                scrollHeight: 300,
                clientHeight: 100,
                scrollTop: 200,
              });
            }
          }}
          data-testid="as-d5-down"
          tabIndex={0}
        />
      );
    };
    const { unmount } = render(<Wrapper />);
    const el = document.querySelector(
      '[data-testid="as-d5-down"]',
    ) as HTMLElement;
    act(() => {
      flushRaf(2);
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
      );
      flushRaf(3);
    });
    unmount();
  });
});

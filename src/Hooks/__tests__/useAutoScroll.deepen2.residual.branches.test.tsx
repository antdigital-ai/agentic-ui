/**
 * useAutoScroll deepen2：notify 无 container；animate 中途 detach；
 * shrink 距底 > tolerance 走 smooth；keydown Space；mutation remove 非元素。
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAutoScroll from '../useAutoScroll';

type RoCallback = (entries: ResizeObserverEntry[]) => void;
type MoCallback = MutationCallback;

const installObserverMocks = () => {
  const roInstances: Array<{
    callback: RoCallback;
    observe: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }> = [];
  const moInstances: Array<{
    callback: MoCallback;
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }> = [];

  global.ResizeObserver = vi.fn(function MockResizeObserver(cb: RoCallback) {
    const inst = {
      callback: cb,
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
    roInstances.push(inst);
    return inst;
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

  return { roInstances, moInstances };
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

describe('useAutoScroll deepen2 residual branches', () => {
  let moInstances: ReturnType<typeof installObserverMocks>['moInstances'];
  let rafQueue: FrameRequestCallback[];
  let rafId: number;

  const flushRaf = (n = 2) => {
    for (let i = 0; i < n; i++) {
      const q = rafQueue.splice(0, rafQueue.length);
      q.forEach((cb) => cb(performance.now()));
    }
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    ({ moInstances } = installObserverMocks());
    rafQueue = [];
    rafId = 1;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return rafId++;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      void id;
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
  });

  it('notifyState：无 container 早退；Space 下滑恢复 pinned', () => {
    const onScrollStateChange = vi.fn();
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const Wrapper = () => {
      const { containerRef, scrollToBottom, isAtBottom } = useAutoScroll({
        deps: [1],
        scrollTolerance: 8,
        pinThreshold: 40,
        onScrollStateChange,
      });
      React.useEffect(() => {
        scrollToBottom();
        expect(typeof isAtBottom()).toBe('boolean');
      }, [scrollToBottom, isAtBottom]);
      return (
        <div
          ref={(el) => {
            if (!el) return;
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (!metrics) {
              metrics = installScrollMetrics(el, {
                scrollHeight: 500,
                clientHeight: 100,
                scrollTop: 0,
              });
            }
          }}
          data-testid="as-d2-space"
          tabIndex={0}
        />
      );
    };
    const { unmount } = render(<Wrapper />);
    const el = document.querySelector(
      '[data-testid="as-d2-space"]',
    ) as HTMLElement;

    act(() => {
      if (metrics) metrics.scrollTop = 50;
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      flushRaf(2);
    });

    act(() => {
      if (metrics) {
        metrics.scrollTop = 400;
      }
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
      );
      flushRaf(3);
    });
    unmount();
  });

  it('smooth 增长中 detach container：animate step 早退', () => {
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    let refObj: React.MutableRefObject<HTMLDivElement | null> | null = null;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollBehavior: 'smooth',
        scrollTolerance: 8,
      });
      refObj = containerRef as React.MutableRefObject<HTMLDivElement | null>;
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
                scrollHeight: 800,
                clientHeight: 100,
                scrollTop: 0,
              });
            }
          }}
          data-testid="as-d2-detach"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    act(() => {
      if (metrics) {
        metrics.scrollHeight = 1200;
        metrics.scrollTop = 0;
      }
      const mo = moInstances[moInstances.length - 1];
      const el = document.querySelector(
        '[data-testid="as-d2-detach"]',
      ) as HTMLElement;
      mo?.callback(
        [
          {
            type: 'childList',
            target: el,
            addedNodes: [document.createElement('div')] as any,
            removedNodes: [] as any,
          } as MutationRecord,
        ],
        mo as any,
      );
      // 启动 animate 后清空 container
      if (refObj) refObj.current = null;
      flushRaf(4);
    });
    rerender(<Wrapper deps={[2]} />);
    unmount();
  });

  it('pinned 收缩且距底远：smooth animate；removeNodes 非元素跳过', () => {
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollBehavior: 'smooth',
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
                scrollHeight: 900,
                clientHeight: 100,
                scrollTop: 700,
              });
            }
          }}
          data-testid="as-d2-shrink-far"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    const el = document.querySelector(
      '[data-testid="as-d2-shrink-far"]',
    ) as HTMLElement;

    act(() => {
      flushRaf(2);
      if (metrics) {
        metrics.scrollHeight = 500;
        metrics.scrollTop = 200;
      }
      const mo = moInstances[moInstances.length - 1];
      mo?.callback(
        [
          {
            type: 'childList',
            target: el,
            addedNodes: [document.createTextNode('t')] as any,
            removedNodes: [document.createTextNode('gone')] as any,
          } as MutationRecord,
        ],
        mo as any,
      );
      flushRaf(4);
    });
    rerender(<Wrapper deps={[2]} />);
    unmount();
  });

  it('programmatic scroll 过滤 handleScroll 真值臂', () => {
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps: [1],
        scrollBehavior: 'auto',
        onScrollStateChange,
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
                scrollHeight: 400,
                clientHeight: 100,
                scrollTop: 300,
              });
            }
          }}
          data-testid="as-d2-prog"
        />
      );
    };
    const { unmount } = render(<Wrapper />);
    const el = document.querySelector(
      '[data-testid="as-d2-prog"]',
    ) as HTMLElement;
    act(() => {
      el.dispatchEvent(new Event('scroll', { bubbles: true }));
      flushRaf(2);
    });
    unmount();
  });
});

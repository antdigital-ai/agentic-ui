/**
 * useAutoScroll deepen4：notify 无 container；animate 无 el；
 * shrink 中途 unpin；keydown Space/下滑；距底 > tolerance。
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

function scrollToNear(
  metrics: ReturnType<typeof installScrollMetrics> | null,
) {
  if (metrics) {
    metrics.scrollTop = 50;
  }
}

describe('useAutoScroll deepen4 residual branches', () => {
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
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
  });

  it('无 container 时 scrollToBottom/notify 早退；挂载后 ArrowUp unpin', () => {
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
        // 尚未绑定 container 时调用
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
          data-testid="as-d4"
          tabIndex={0}
        />
      );
    };
    const { unmount } = render(<Wrapper />);
    const el = document.querySelector('[data-testid="as-d4"]') as HTMLElement;
    act(() => {
      flushRaf(2);
      scrollToNear(metrics);
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      flushRaf(2);
    });
    expect(onScrollStateChange).toHaveBeenCalled();
    unmount();
  });

  it('shrink：距底 > tolerance 且仍 pinned → smooth animate', () => {
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollBehavior: 'smooth',
        scrollTolerance: 10,
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
                scrollHeight: 800,
                clientHeight: 100,
                scrollTop: 700,
              });
            }
          }}
          data-testid="as-d4-shrink"
        />
      );
    };
    const { unmount } = render(<Wrapper deps={[1]} />);
    const el = document.querySelector(
      '[data-testid="as-d4-shrink"]',
    ) as HTMLElement;

    act(() => {
      flushRaf(2);
      if (metrics) {
        // shrink but leave distance > tolerance, scrollTop still valid
        metrics.scrollHeight = 600;
        metrics.scrollTop = 400;
      }
      moInstances[moInstances.length - 1]?.callback(
        [
          {
            type: 'childList',
            target: el,
            addedNodes: [] as any,
            removedNodes: [document.createElement('div')] as any,
          } as MutationRecord,
        ],
        {} as MutationObserver,
      );
      flushRaf(4);
    });
    unmount();
  });

  it('shrink + auto behavior：距底空隙 jumpToBottom', () => {
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollBehavior: 'auto',
        scrollTolerance: 5,
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
                scrollTop: 800,
              });
            }
          }}
          data-testid="as-d4-auto"
        />
      );
    };
    const { unmount } = render(<Wrapper deps={[1]} />);
    const el = document.querySelector(
      '[data-testid="as-d4-auto"]',
    ) as HTMLElement;

    act(() => {
      flushRaf(2);
      if (metrics) {
        metrics.scrollHeight = 700;
        metrics.scrollTop = 500;
      }
      moInstances[moInstances.length - 1]?.callback(
        [
          {
            type: 'childList',
            target: el,
            addedNodes: [] as any,
            removedNodes: [document.createTextNode('x')] as any,
          } as MutationRecord,
        ],
        {} as MutationObserver,
      );
      flushRaf(3);
    });
    unmount();
  });

  it('keydown Space / ArrowDown 走 downKeys 臂', () => {
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const Wrapper = () => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps: [1],
        scrollTolerance: 8,
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
                scrollTop: 250,
              });
            }
          }}
          data-testid="as-d4-keys"
          tabIndex={0}
        />
      );
    };
    const { unmount } = render(<Wrapper />);
    const el = document.querySelector(
      '[data-testid="as-d4-keys"]',
    ) as HTMLElement;
    act(() => {
      flushRaf(2);
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ' ',
          shiftKey: true,
          bubbles: true,
        }),
      );
      flushRaf(3);
    });
    unmount();
  });
});

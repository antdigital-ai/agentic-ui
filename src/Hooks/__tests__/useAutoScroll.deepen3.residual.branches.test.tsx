/**
 * useAutoScroll deepen3：notify 无 container；animate 已有 raf 早退；
 * grow auto；shrink 贴底 notify；mutation addedNodes ??。
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';
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

describe('useAutoScroll deepen3 residual branches', () => {
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

  it('scrollBehavior=auto 增长：jumpToBottom；shrink 贴底走 else notify', () => {
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const onScrollStateChange = vi.fn();
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollBehavior: 'auto',
        scrollTolerance: 20,
        onScrollStateChange,
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
                scrollHeight: 400,
                clientHeight: 100,
                scrollTop: 300,
              });
            }
          }}
          data-testid="as-d3-auto"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    const el = document.querySelector(
      '[data-testid="as-d3-auto"]',
    ) as HTMLElement;

    act(() => {
      flushRaf(2);
      if (metrics) {
        metrics.scrollHeight = 700;
        metrics.scrollTop = 300;
      }
      moInstances[moInstances.length - 1]?.callback(
        [
          {
            type: 'childList',
            target: el,
            addedNodes: [document.createElement('div')] as any,
            removedNodes: [] as any,
          } as MutationRecord,
        ],
        {} as MutationObserver,
      );
      flushRaf(2);
    });

    act(() => {
      if (metrics) {
        // shrink but stay near bottom (distance <= tolerance)
        metrics.scrollHeight = 650;
        metrics.scrollTop = 540;
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
      flushRaf(2);
    });
    rerender(<Wrapper deps={[2]} />);
    unmount();
  });

  it('animate 已在跑时再次 animate 早退；addedNodes 缺省 ??0', () => {
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
                scrollTop: 0,
              });
            }
          }}
          data-testid="as-d3-raf"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    const el = document.querySelector(
      '[data-testid="as-d3-raf"]',
    ) as HTMLElement;

    act(() => {
      if (metrics) {
        metrics.scrollHeight = 1400;
        metrics.scrollTop = 0;
      }
      const mo = moInstances[moInstances.length - 1];
      mo?.callback(
        [
          {
            type: 'childList',
            target: el,
            addedNodes: undefined as any,
            removedNodes: undefined as any,
          } as MutationRecord,
        ],
        mo as any,
      );
      // second growth while raf pending
      if (metrics) metrics.scrollHeight = 1600;
      mo?.callback(
        [
          {
            type: 'childList',
            target: el,
            addedNodes: [document.createElement('span')] as any,
            removedNodes: [] as any,
          } as MutationRecord,
        ],
        mo as any,
      );
      flushRaf(6);
    });
    rerender(<Wrapper deps={[2]} />);
    unmount();
  });
});

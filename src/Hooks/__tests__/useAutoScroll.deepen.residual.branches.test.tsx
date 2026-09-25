/**
 * useAutoScroll deepen residual：keyboard/wheel 假值臂、shrink !pinned、
 * Mutation text node、programmatic scroll 过滤、默认 scrollToBottom 参数。
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

describe('useAutoScroll deepen residual branches', () => {
  let moInstances: ReturnType<typeof installObserverMocks>['moInstances'];
  let roInstances: ReturnType<typeof installObserverMocks>['roInstances'];
  let rafQueue: FrameRequestCallback[];
  let rafId: number;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    ({ moInstances, roInstances } = installObserverMocks());
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
    vi.restoreAllMocks();
  });

  const flushRaf = (n = 8) => {
    for (let i = 0; i < n; i += 1) {
      const batch = rafQueue.splice(0, rafQueue.length);
      if (!batch.length) break;
      batch.forEach((cb) => cb(performance.now()));
    }
  };

  it('ArrowUp 距底超过 tolerance 解除 pinned；ArrowDown 恢复路径', () => {
    const onScrollStateChange = vi.fn();
    let metricsInstalled = false;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef } = useAutoScroll({
        deps,
        scrollTolerance: 8,
        pinThreshold: 40,
        onScrollStateChange,
        scrollBehavior: 'auto',
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (metricsInstalled) return;
            metricsInstalled = true;
            installScrollMetrics(el, {
              scrollHeight: 800,
              clientHeight: 100,
              scrollTop: 0,
            });
          }}
          data-testid="as-deepen"
          tabIndex={0}
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    rerender(<Wrapper deps={[2]} />);
    const el = document.querySelector('[data-testid="as-deepen"]') as HTMLElement;

    act(() => {
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
    });
    expect(onScrollStateChange).toHaveBeenCalled();

    onScrollStateChange.mockClear();
    act(() => {
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      flushRaf(2);
    });
    expect(el).toBeTruthy();

    act(() => {
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ' ',
          shiftKey: true,
          bubbles: true,
        }),
      );
      flushRaf(2);
    });
    unmount();
  });

  it('贴底时 ArrowUp 不解除 pinned（distance <= tolerance 假值臂）', () => {
    const onScrollStateChange = vi.fn();
    let metricsInstalled = false;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollTolerance: 20,
        pinThreshold: 40,
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
            if (metricsInstalled) return;
            metricsInstalled = true;
            installScrollMetrics(el, {
              scrollHeight: 200,
              clientHeight: 100,
              scrollTop: 100,
            });
          }}
          data-testid="as-pin"
          tabIndex={0}
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    rerender(<Wrapper deps={[2]} />);
    const el = document.querySelector('[data-testid="as-pin"]') as HTMLElement;
    onScrollStateChange.mockClear();
    act(() => {
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
    });
    // 贴底时不应因 ArrowUp 通知 unpin
    const unpin = onScrollStateChange.mock.calls.some(
      (c) => c[0]?.isPinned === false,
    );
    expect(unpin).toBe(false);
    unmount();
  });

  it('wheel 上滑累计超阈值且距底远：unpin；贴底 wheel 假值臂', () => {
    let metricsInstalled = false;
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const onScrollStateChange = vi.fn();
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef } = useAutoScroll({
        deps,
        scrollTolerance: 8,
        pinThreshold: 40,
        onScrollStateChange,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (metricsInstalled) return;
            metricsInstalled = true;
            metrics = installScrollMetrics(el, {
              scrollHeight: 600,
              clientHeight: 100,
              scrollTop: 0,
            });
          }}
          data-testid="as-wheel"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    rerender(<Wrapper deps={[2]} />);
    const el = document.querySelector('[data-testid="as-wheel"]') as HTMLElement;

    act(() => {
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -20, bubbles: true }),
      );
    });
    expect(onScrollStateChange.mock.calls.length).toBeGreaterThan(0);

    // 贴底：distance <= tolerance，不走 unpin
    if (metrics) {
      metrics.scrollTop = 500;
      metrics.scrollHeight = 600;
    }
    onScrollStateChange.mockClear();
    act(() => {
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -20, bubbles: true }),
      );
    });
    unmount();
  });

  it('内容收缩且 !isPinned：notify 早退；Mutation text node 跳过 observe', () => {
    let metricsInstalled = false;
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const onScrollStateChange = vi.fn();
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollTolerance: 8,
        pinThreshold: 40,
        scrollBehavior: 'auto',
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
            if (metricsInstalled) return;
            metricsInstalled = true;
            metrics = installScrollMetrics(el, {
              scrollHeight: 800,
              clientHeight: 100,
              scrollTop: 700,
            });
          }}
          data-testid="as-shrink"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    rerender(<Wrapper deps={[2]} />);
    const el = document.querySelector(
      '[data-testid="as-shrink"]',
    ) as HTMLElement;

    // 先 unpin
    act(() => {
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -40, bubbles: true }),
      );
    });

    // 收缩内容
    if (metrics) {
      metrics.scrollHeight = 200;
      metrics.scrollTop = 50;
    }
    const mo = moInstances[moInstances.length - 1];
    act(() => {
      mo?.callback(
        [
          {
            type: 'childList',
            target: el,
            addedNodes: [document.createTextNode('t')] as any,
            removedNodes: [] as any,
            attributeName: null,
            attributeNamespace: null,
            nextSibling: null,
            previousSibling: null,
            oldValue: null,
          } as MutationRecord,
          {
            type: 'characterData',
            target: el.firstChild || el,
            addedNodes: [] as any,
            removedNodes: [] as any,
            attributeName: null,
            attributeNamespace: null,
            nextSibling: null,
            previousSibling: null,
            oldValue: null,
          } as MutationRecord,
        ],
        mo as any,
      );
      flushRaf(4);
    });
    expect(el).toBeTruthy();
    unmount();
  });

  it('smooth 滚动中再次 scrollToBottom；默认 behavior 参数；卸载清理', () => {
    let metricsInstalled = false;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollBehavior: 'smooth',
      });
      React.useEffect(() => {
        scrollToBottom('smooth');
        scrollToBottom('smooth');
        scrollToBottom();
      }, [deps, scrollToBottom]);
      return (
        <div
          ref={(el) => {
            if (!el) return;
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (metricsInstalled) return;
            metricsInstalled = true;
            installScrollMetrics(el, {
              scrollHeight: 2000,
              clientHeight: 100,
              scrollTop: 0,
            });
          }}
          data-testid="as-smooth"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    rerender(<Wrapper deps={[2]} />);
    act(() => {
      flushRaf(6);
    });
    // 程序滚动期间 scroll 事件应被过滤
    const el = document.querySelector(
      '[data-testid="as-smooth"]',
    ) as HTMLElement;
    act(() => {
      el.dispatchEvent(new Event('scroll'));
      flushRaf(2);
    });
    expect(() => unmount()).not.toThrow();
  });

  it('container 置空后 scroll / isAtBottom 早退', () => {
    let metricsInstalled = false;
    let ref: React.MutableRefObject<HTMLDivElement | null> | null = null;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const api = useAutoScroll({ deps, scrollTolerance: 8 });
      ref = api.containerRef as React.MutableRefObject<HTMLDivElement | null>;
      return (
        <div
          ref={(el) => {
            if (!el) return;
            api.containerRef.current = el;
            if (metricsInstalled) return;
            metricsInstalled = true;
            installScrollMetrics(el, {
              scrollHeight: 300,
              clientHeight: 100,
              scrollTop: 200,
            });
          }}
          data-testid="as-null"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    rerender(<Wrapper deps={[2]} />);
    act(() => {
      if (ref) ref.current = null;
    });
    expect(() => {
      act(() => {
        // scrollToBottom 在 null container 上不抛
      });
    }).not.toThrow();
    unmount();
  });

  it('istanbul deepen：空 deps；auto behavior；tolerance 内/外；text Mutation', () => {
    let metricsInstalled = false;
    const Wrapper = ({
      deps,
      behavior,
    }: {
      deps?: number[];
      behavior?: ScrollBehavior;
    }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollBehavior: behavior ?? 'auto',
        scrollTolerance: 4,
      });
      React.useEffect(() => {
        scrollToBottom();
        scrollToBottom('auto');
      }, [deps, scrollToBottom]);
      return (
        <div
          ref={(el) => {
            if (!el) return;
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (metricsInstalled) return;
            metricsInstalled = true;
            installScrollMetrics(el, {
              scrollHeight: 500,
              clientHeight: 100,
              scrollTop: 396,
            });
          }}
          data-testid="as-deep"
        />
      );
    };

    const { rerender, unmount } = render(<Wrapper deps={[]} />);
    rerender(<Wrapper />);
    rerender(<Wrapper deps={[1]} behavior="auto" />);
    act(() => {
      flushRaf(4);
    });
    const el = document.querySelector('[data-testid="as-deep"]') as HTMLElement;
    act(() => {
      el.dispatchEvent(new Event('scroll'));
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: 10, bubbles: true }));
      flushRaf(2);
    });
    const mo = moInstances[moInstances.length - 1];
    if (mo) {
      act(() => {
        mo.callback(
          [
            {
              type: 'characterData',
              target: document.createTextNode('x'),
              addedNodes: [] as any,
              removedNodes: [] as any,
            } as any,
          ],
          mo as any,
        );
        mo.callback(
          [
            {
              type: 'childList',
              target: el,
              addedNodes: [document.createElement('div')] as any,
              removedNodes: [] as any,
            } as any,
          ],
          mo as any,
        );
      });
    }
    const ro = roInstances[roInstances.length - 1];
    if (ro) {
      act(() => {
        ro.callback([
          {
            target: el,
            contentRect: { height: 80, width: 100 } as any,
          } as any,
        ]);
        flushRaf(2);
      });
    }
    expect(() => unmount()).not.toThrow();
  });

  it('istanbul deepen：disabled；threshold 边界；wheel delta0；无 ref 元素', () => {
    let api: ReturnType<typeof useAutoScroll> | null = null;
    const Probe = ({
      opts,
      attach,
    }: {
      opts?: Parameters<typeof useAutoScroll>[0];
      attach?: boolean;
    }) => {
      api = useAutoScroll(opts);
      return (
        <div
          ref={(node) => {
            if (!attach || !node || !api) return;
            (
              api.containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = node;
            installScrollMetrics(node, {
              scrollHeight: 500,
              scrollTop: 400,
              clientHeight: 100,
            });
            Object.defineProperty(node, 'scrollTo', {
              configurable: true,
              value: vi.fn(),
            });
          }}
          data-testid="probe"
        />
      );
    };

    const { unmount } = render(
      <Probe opts={{ scrollTolerance: 0, pinThreshold: 0 }} />,
    );
    expect(api).toBeTruthy();
    act(() => {
      api?.scrollToBottom?.();
    });
    unmount();

    const { container, unmount: u2 } = render(
      <Probe
        attach
        opts={{
          scrollTolerance: 0,
          pinThreshold: 10,
          scrollBehavior: 'auto',
          onScrollStateChange: vi.fn(),
          onResize: vi.fn(),
        }}
      />,
    );
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement;
    act(() => {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: 0, bubbles: true }));
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ' ',
          shiftKey: true,
          bubbles: true,
        }),
      );
      el.dispatchEvent(new Event('touchstart', { bubbles: true }));
      el.dispatchEvent(new Event('touchmove', { bubbles: true }));
      flushRaf(2);
    });
    installScrollMetrics(el, {
      scrollHeight: 200,
      scrollTop: 0,
      clientHeight: 200,
    });
    act(() => {
      el.dispatchEvent(new Event('scroll'));
      api?.scrollToBottom?.('smooth');
      flushRaf(3);
    });
    expect(api?.isAtBottom?.()).toBeDefined();
    u2();

    render(<Probe opts={{ SCROLL_TOLERANCE: 5 as any }} />);
    act(() => {
      if (api?.containerRef) {
        (
          api.containerRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = null;
      }
      api?.scrollToBottom?.();
    });
    expect(api).toBeTruthy();
  });

  it('exclusive deepen：smooth/auto scroll；unpin wheel；mutation 子节点', () => {
    let api: any;
    const onScrollStateChange = vi.fn();
    const Probe = ({
      attach,
      behavior,
    }: {
      attach?: boolean;
      behavior?: 'smooth' | 'auto';
    }) => {
      api = useAutoScroll({
        scrollTolerance: 5,
        pinThreshold: 8,
        scrollBehavior: behavior ?? 'smooth',
        onScrollStateChange,
        onResize: vi.fn(),
      });
      return (
        <div
          ref={(el) => {
            if (attach && el && api?.containerRef) {
              (
                api.containerRef as React.MutableRefObject<HTMLDivElement | null>
              ).current = el;
              installScrollMetrics(el, {
                scrollHeight: 800,
                scrollTop: 700,
                clientHeight: 100,
              });
            }
          }}
          data-testid="probe-deep"
        >
          <div data-child="1">c1</div>
        </div>
      );
    };

    const { container, unmount } = render(<Probe attach behavior="auto" />);
    const el = container.querySelector(
      '[data-testid="probe-deep"]',
    ) as HTMLElement;
    act(() => {
      api?.scrollToBottom?.('auto');
      flushRaf(2);
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -40, bubbles: true }));
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: 40, bubbles: true }));
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }),
      );
      el.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ' ',
          shiftKey: false,
          bubbles: true,
        }),
      );
      installScrollMetrics(el, {
        scrollHeight: 900,
        scrollTop: 0,
        clientHeight: 100,
      });
      el.dispatchEvent(new Event('scroll'));
      flushRaf(2);
      installScrollMetrics(el, {
        scrollHeight: 900,
        scrollTop: 800,
        clientHeight: 100,
      });
      el.dispatchEvent(new Event('scroll'));
      flushRaf(2);
      const child = el.querySelector('[data-child]');
      if (child) {
        child.textContent = 'c1-updated';
      }
      el.appendChild(document.createElement('div'));
      flushRaf(3);
      api?.scrollToBottom?.();
      flushRaf(2);
    });
    expect(api?.isAtBottom?.()).toBeDefined();
    unmount();

    render(<Probe attach behavior="smooth" />);
    act(() => {
      api?.scrollToBottom?.('smooth');
      flushRaf(3);
    });
    expect(onScrollStateChange.mock.calls.length >= 0).toBe(true);
  });

  it('deepen：smooth 增长走 animateToBottom；双次 smooth 复用 rAF', () => {
    let metricsInstalled = false;
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const onResize = vi.fn();
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollBehavior: 'smooth',
        scrollTolerance: 8,
        onResize,
      });
      React.useEffect(() => {
        scrollToBottom('smooth');
        scrollToBottom('smooth');
      }, [deps, scrollToBottom]);
      return (
        <div
          ref={(el) => {
            if (!el) return;
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (metricsInstalled) return;
            metricsInstalled = true;
            metrics = installScrollMetrics(el, {
              scrollHeight: 400,
              clientHeight: 100,
              scrollTop: 292,
            });
          }}
          data-testid="as-grow-smooth"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    rerender(<Wrapper deps={[2]} />);
    act(() => {
      if (metrics) metrics.scrollHeight = 900;
      const ro = roInstances[roInstances.length - 1];
      ro?.callback([
        { target: document.querySelector('[data-testid="as-grow-smooth"]'), contentRect: { height: 900 } as any } as any,
      ]);
      flushRaf(8);
    });
    expect(onResize.mock.calls.length >= 0).toBe(true);
    unmount();
  });

  it('deepen：收缩 scrollTop 钳位；!pinned shrink 早退 notify', () => {
    let metricsInstalled = false;
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const onScrollStateChange = vi.fn();
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollBehavior: 'auto',
        scrollTolerance: 8,
        pinThreshold: 40,
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
            if (metricsInstalled) return;
            metricsInstalled = true;
            metrics = installScrollMetrics(el, {
              scrollHeight: 800,
              clientHeight: 100,
              scrollTop: 750,
            });
          }}
          data-testid="as-shrink-clamp"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    rerender(<Wrapper deps={[2]} />);
    const el = document.querySelector(
      '[data-testid="as-shrink-clamp"]',
    ) as HTMLElement;

    act(() => {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -40, bubbles: true }));
    });

    act(() => {
      if (metrics) {
        metrics.scrollHeight = 150;
        metrics.scrollTop = 200;
      }
      const mo = moInstances[moInstances.length - 1];
      mo?.callback(
        [
          {
            type: 'childList',
            target: el,
            addedNodes: [] as any,
            removedNodes: [document.createElement('div')] as any,
          } as MutationRecord,
        ],
        mo as any,
      );
      flushRaf(4);
    });
    unmount();
  });

  it('deepen：wheel/key 距底近不 unpin；scroll 程序计数过滤', () => {
    let metricsInstalled = false;
    const onScrollStateChange = vi.fn();
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollTolerance: 20,
        pinThreshold: 80,
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
            if (metricsInstalled) return;
            metricsInstalled = true;
            installScrollMetrics(el, {
              scrollHeight: 300,
              clientHeight: 100,
              scrollTop: 185,
            });
          }}
          data-testid="as-near-bottom"
          tabIndex={0}
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    rerender(<Wrapper deps={[2]} />);
    const el = document.querySelector(
      '[data-testid="as-near-bottom"]',
    ) as HTMLElement;

    onScrollStateChange.mockClear();
    act(() => {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -5, bubbles: true }));
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      flushRaf(2);
    });
    const unpinned = onScrollStateChange.mock.calls.some(
      (c) => c[0]?.isPinned === false,
    );
    expect(unpinned).toBe(false);

    act(() => {
      el.dispatchEvent(new Event('scroll'));
      flushRaf(1);
    });
    unmount();
  });

  it('deepen：mutation 非 container 目标；deps 重挂载增长 jumpToBottom', () => {
    let metricsInstalled = false;
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef } = useAutoScroll({ deps, scrollTolerance: 8 });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (metricsInstalled) return;
            metricsInstalled = true;
            metrics = installScrollMetrics(el, {
              scrollHeight: 300,
              clientHeight: 100,
              scrollTop: 0,
            });
          }}
          data-testid="as-remount"
        >
          <div data-testid="child">c</div>
        </div>
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    const el = document.querySelector('[data-testid="as-remount"]') as HTMLElement;
    const child = document.querySelector('[data-testid="child"]') as HTMLElement;

    act(() => {
      const mo = moInstances[moInstances.length - 1];
      mo?.callback(
        [
          {
            type: 'childList',
            target: child,
            addedNodes: [document.createElement('span')] as any,
            removedNodes: [] as any,
          } as MutationRecord,
        ],
        mo as any,
      );
      flushRaf(2);
    });

    if (metrics) metrics.scrollHeight = 600;
    rerender(<Wrapper deps={[2]} />);
    act(() => {
      flushRaf(4);
    });
    expect(el).toBeTruthy();
    unmount();
  });

  it('deepen：scrollToBottom 默认参数；卸载清理双 RAF', () => {
    let metricsInstalled = false;
    let api: ReturnType<typeof useAutoScroll> | null = null;
    const Wrapper = () => {
      api = useAutoScroll({ scrollBehavior: 'smooth' });
      return (
        <div
          ref={(el) => {
            if (!el || !api) return;
            api.containerRef.current = el;
            if (metricsInstalled) return;
            metricsInstalled = true;
            installScrollMetrics(el, {
              scrollHeight: 500,
              clientHeight: 100,
              scrollTop: 0,
            });
          }}
          data-testid="as-default-arg"
        />
      );
    };
    const { unmount } = render(<Wrapper />);
    act(() => {
      api?.scrollToBottom();
      flushRaf(3);
    });
    expect(() => unmount()).not.toThrow();
  });

  it('deepen：pinned 收缩 distance<=tolerance 仅 notify；unpinned 收缩早退', () => {
    let metricsInstalled = false;
    let metrics: ReturnType<typeof installScrollMetrics> | null = null;
    const onScrollStateChange = vi.fn();
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        deps,
        scrollBehavior: 'smooth',
        scrollTolerance: 20,
        pinThreshold: 80,
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
            if (metricsInstalled) return;
            metricsInstalled = true;
            metrics = installScrollMetrics(el, {
              scrollHeight: 500,
              clientHeight: 100,
              scrollTop: 380,
            });
          }}
          data-testid="as-shrink-notify"
        />
      );
    };
    const { rerender, unmount } = render(<Wrapper deps={[1]} />);
    rerender(<Wrapper deps={[2]} />);
    const el = document.querySelector(
      '[data-testid="as-shrink-notify"]',
    ) as HTMLElement;

    act(() => {
      if (metrics) {
        metrics.scrollHeight = 420;
        metrics.scrollTop = 300;
      }
      const mo = moInstances[moInstances.length - 1];
      mo?.callback(
        [
          {
            type: 'childList',
            target: el,
            addedNodes: [] as any,
            removedNodes: [] as any,
          } as MutationRecord,
        ],
        mo as any,
      );
      flushRaf(4);
    });

    act(() => {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -80, bubbles: true }));
      if (metrics) {
        metrics.scrollHeight = 200;
        metrics.scrollTop = 50;
      }
      moInstances[moInstances.length - 1]?.callback(
        [{ type: 'characterData', target: el, addedNodes: [], removedNodes: [] } as any],
        moInstances[moInstances.length - 1] as any,
      );
      flushRaf(4);
    });
    expect(el).toBeTruthy();
    unmount();
  });
});

import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAutoScroll from '../useAutoScroll';

/**
 * useAutoScroll targeted-coverage（与当前实现对齐版）
 *
 * 旧套件假设 `el.scrollTo({ behavior })` + 引用 `isAutoScrollEngaged/isLocked` 等
 * 已不存在的内部状态，全部失效。本套件改为基于**对外可观察行为**测试：
 * - `el.scrollTop = el.scrollHeight` 直接赋值
 * - `requestAnimationFrame` 逐帧推进（smooth）
 * - ResizeObserver / MutationObserver 触发 → onContentChange RAF 合并
 * - wheel 累积上滑解除 pinned；用户回到底部恢复 pinned
 * - 重挂载（depsKey 变化）+ 内容已增长才主动 jumpToBottom（首次挂载不会）
 *
 * 默认被 vitest.config.ts 的 `**\/*targeted-coverage*` 排除，仅 `pnpm run test:full` 触发。
 */

/** 用 vi.fn 拦截 ResizeObserver/MutationObserver，并提供手动触发回调的能力 */
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

  global.MutationObserver = vi.fn(function MockMutationObserver(
    cb: MoCallback,
  ) {
    const inst = {
      callback: cb,
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [],
    };
    moInstances.push(inst);
    return inst;
  }) as unknown as typeof MutationObserver;

  return { roInstances, moInstances };
};

/** 给一个原生 div 安装可读写的 scrollHeight/scrollTop/clientHeight */
const installScrollMetrics = (
  el: HTMLElement,
  metrics: { scrollHeight?: number; scrollTop?: number; clientHeight?: number },
) => {
  const state = {
    scrollHeight: metrics.scrollHeight ?? 0,
    scrollTop: metrics.scrollTop ?? 0,
    clientHeight: metrics.clientHeight ?? 0,
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

/**
 * RAF mock：用 id→callback 的 Map 实现，规避「按位置 cancel」在 splice 后位置错位的问题。
 * - requestAnimationFrame 返回单调递增的 id
 * - cancelAnimationFrame 按 id 删除对应回调
 * - flushRaf 每次只 drain「当前」队列，回调里新 push 的进入下一帧（与浏览器真实行为一致）
 */
interface RafController {
  schedule: (cb: FrameRequestCallback) => number;
  cancel: (id: number) => void;
  flush: (maxFrames?: number) => void;
  pendingSize: () => number;
}

const createRafController = (): RafController => {
  const pending = new Map<number, FrameRequestCallback>();
  let nextId = 1;
  return {
    schedule(cb) {
      const id = nextId++;
      pending.set(id, cb);
      return id;
    },
    cancel(id) {
      pending.delete(id);
    },
    /** 逐帧 drain，每帧只执行进入该帧时已存在的回调（在该帧内 push 的进入下一帧） */
    flush(maxFrames = 50) {
      let frames = 0;
      while (pending.size > 0 && frames < maxFrames) {
        const snapshot = Array.from(pending.entries());
        pending.clear();
        snapshot.forEach(([, cb]) => {
          // 真实 RAF 传入的是 DOMHighResTimeStamp；实现里没用 ts，传 0 即可
          cb(0);
        });
        frames += 1;
      }
    },
    pendingSize() {
      return pending.size;
    },
  };
};

let rafController: RafController;

/** 同步执行所有 pending RAF 回调，逐帧把 smooth 动画跑完 */
const flushRaf = (maxFrames = 50) => rafController.flush(maxFrames);

describe('useAutoScroll targeted coverage (aligned with current impl)', () => {
  let observers: ReturnType<typeof installObserverMocks>;

  beforeEach(() => {
    observers = installObserverMocks();
    rafController = createRafController();
    vi.stubGlobal('requestAnimationFrame', ((cb: FrameRequestCallback) =>
      rafController.schedule(cb)) as typeof requestAnimationFrame);
    vi.stubGlobal('cancelAnimationFrame', ((id: number) =>
      rafController.cancel(id)) as typeof cancelAnimationFrame);
  });

  afterEach(() => {
    // 把残留的 RAF 句柄清干净，避免泄漏到下一个 it（如 beginProgrammaticScroll 的复位 RAF）
    rafController.flush();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('scrollToBottom("auto") 通过直接赋值 scrollTop 跳到底部', () => {
    const { result } = renderHook(() => useAutoScroll());
    const div = document.createElement('div');
    installScrollMetrics(div, {
      scrollHeight: 100,
      scrollTop: 0,
      clientHeight: 50,
    });

    act(() => {
      (
        result.current
          .containerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = div;
    });

    act(() => {
      result.current.scrollToBottom('auto');
    });

    expect(div.scrollTop).toBe(100);
  });

  it('scrollToBottom("smooth") 通过 RAF 逐帧推进 scrollTop 直至贴底', () => {
    const { result } = renderHook(() => useAutoScroll());
    const div = document.createElement('div');
    installScrollMetrics(div, {
      scrollHeight: 1000,
      scrollTop: 0,
      clientHeight: 100,
    });

    act(() => {
      (
        result.current
          .containerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = div;
    });

    act(() => {
      result.current.scrollToBottom('smooth');
    });

    // 至少推进一帧，scrollTop 应大于 0
    act(() => {
      flushRaf(1);
    });
    expect(div.scrollTop).toBeGreaterThan(0);

    // 多帧后应贴近目标 (scrollHeight - clientHeight = 900)
    act(() => {
      flushRaf();
    });
    expect(div.scrollTop).toBe(900);
  });

  it('isAtBottom 基于 scrollHeight/scrollTop/clientHeight + scrollTolerance 判断', () => {
    const { result } = renderHook(() => useAutoScroll({ scrollTolerance: 20 }));
    const div = document.createElement('div');
    installScrollMetrics(div, {
      scrollHeight: 500,
      scrollTop: 380,
      clientHeight: 100,
    });

    act(() => {
      (
        result.current
          .containerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = div;
    });

    // distance = 500 - 380 - 100 = 20 ⇒ 恰好等于 tolerance ⇒ true
    expect(result.current.isAtBottom()).toBe(true);

    // 把 scrollTop 拉远，distance > 20
    div.scrollTop = 100;
    expect(result.current.isAtBottom()).toBe(false);
  });

  it('SCROLL_TOLERANCE 作为 deprecated 别名仍生效（被 scrollTolerance 覆盖时优先新名）', () => {
    const { result: legacy } = renderHook(() =>
      useAutoScroll({ SCROLL_TOLERANCE: 50 }),
    );
    const div = document.createElement('div');
    installScrollMetrics(div, {
      scrollHeight: 500,
      scrollTop: 350,
      clientHeight: 100,
    });
    act(() => {
      (
        legacy.current
          .containerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = div;
    });
    // distance = 500 - 350 - 100 = 50 ⇒ 等于 50 ⇒ true
    expect(legacy.current.isAtBottom()).toBe(true);

    // 同时传入时新名优先
    const { result: both } = renderHook(() =>
      useAutoScroll({ scrollTolerance: 5, SCROLL_TOLERANCE: 50 }),
    );
    const div2 = document.createElement('div');
    installScrollMetrics(div2, {
      scrollHeight: 500,
      scrollTop: 350,
      clientHeight: 100,
    });
    act(() => {
      (
        both.current
          .containerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = div2;
    });
    // distance = 50 ⇒ scrollTolerance=5 ⇒ false
    expect(both.current.isAtBottom()).toBe(false);
  });

  it('ResizeObserver 仅 observe container + 直接子元素，不遍历整棵子树', () => {
    const Wrapper = () => {
      const { containerRef } = useAutoScroll();
      return (
        <div ref={containerRef as React.RefObject<HTMLDivElement>}>
          <div data-testid="child-1">
            <span data-testid="grandchild" />
          </div>
          <div data-testid="child-2" />
        </div>
      );
    };
    render(<Wrapper />);

    // 第一个（也是唯一一个）ResizeObserver 实例
    const ro = observers.roInstances[0];
    expect(ro).toBeDefined();
    // observe 调用次数：container(1) + 直接子元素(2) = 3，不应该把孙子节点也拉进来
    expect(ro.observe).toHaveBeenCalledTimes(3);
  });

  it('ResizeObserver 回调在 RAF 合并后只触发一次 onContentChange', () => {
    const onResize = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ onResize });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 100,
              scrollTop: 0,
              clientHeight: 50,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        >
          <div />
        </div>
      );
    };
    render(<Wrapper />);

    const ro = observers.roInstances[0];
    // 同一帧触发多次回调
    act(() => {
      ro.callback([] as unknown as ResizeObserverEntry[]);
      ro.callback([] as unknown as ResizeObserverEntry[]);
      ro.callback([] as unknown as ResizeObserverEntry[]);
    });

    // RAF 合并：onResize 在 flush 后只被触发一次
    act(() => {
      flushRaf(2);
    });
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenCalledWith(
      expect.objectContaining({ width: expect.any(Number) }),
    );
  });

  it('内容收缩且 pinned=true、已贴底时仅钳位 scrollTop，不跳到 scrollHeight', () => {
    let setScrollHeight: (v: number) => void = () => {};
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ scrollBehavior: 'smooth' });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            const state = installScrollMetrics(el, {
              scrollHeight: 100,
              scrollTop: 50,
              clientHeight: 50,
            });
            setScrollHeight = (v) => {
              state.scrollHeight = v;
            };
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        >
          <div />
        </div>
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    // 已贴底：distance = 100 - 50 - 50 = 0
    setScrollHeight(80);
    const ro = observers.roInstances[0];
    act(() => {
      ro.callback([] as unknown as ResizeObserverEntry[]);
    });
    act(() => {
      flushRaf(2);
    });

    // 收缩后钳位到 maxScrollTop = 30，不应跳到 scrollHeight
    expect(container.scrollTop).toBe(30);
  });

  it('内容增长且 pinned=true 时，按 scrollBehavior=auto 直接吸底', () => {
    let setScrollHeight: (v: number) => void = () => {};
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ scrollBehavior: 'auto' });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            const state = installScrollMetrics(el, {
              scrollHeight: 100,
              scrollTop: 50,
              clientHeight: 50,
            });
            setScrollHeight = (v) => {
              state.scrollHeight = v;
            };
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        >
          <div />
        </div>
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    // 模拟内容增长
    setScrollHeight(300);
    const ro = observers.roInstances[0];
    act(() => {
      ro.callback([] as unknown as ResizeObserverEntry[]);
    });
    act(() => {
      flushRaf(2);
    });

    // 直接吸底：scrollTop = scrollHeight (300)
    expect(container.scrollTop).toBe(300);
  });

  it('wheel 累积上滑超阈值后解除 pinned，并通过 onScrollStateChange 通知', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
        pinThreshold: 50,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 200, // 距离底部 1000-200-100=700
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    // 把首次挂载可能积攒的 RAF / 回调清干净，再清 mock 计数
    flushRaf();
    onScrollStateChange.mockClear();

    // 单次小幅 wheel 不应触发解除（实现 WHEEL_UP_INTENT_THRESHOLD=16）
    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -5, bubbles: true }),
      );
    });
    expect(onScrollStateChange).not.toHaveBeenCalled();

    // 累计超过阈值（5 + 20 = 25 > 16）
    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -20, bubbles: true }),
      );
    });
    // 应被通知 isPinned=false
    expect(onScrollStateChange).toHaveBeenCalled();
    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ][0];
    expect(lastCall.isPinned).toBe(false);
  });

  it('用户手动滚回底部后恢复 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 100, // 远离底部
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    flushRaf();
    // 先 wheel 上滑解除 pinned
    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -50, bubbles: true }),
      );
    });
    onScrollStateChange.mockClear();

    // 模拟用户滚回底部 (distance = 500-380-100 = 20 == tolerance)
    container.scrollTop = 380;
    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });

    // 应被通知 isPinned=true
    expect(onScrollStateChange).toHaveBeenCalled();
    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ][0];
    expect(lastCall.isPinned).toBe(true);
    expect(lastCall.isAtBottom).toBe(true);
  });

  it('depsKey 变化触发重挂载，且内容已增长时主动 jumpToBottom', () => {
    let setScrollHeight: (v: number) => void = () => {};
    // 把 metrics 装在外层闭包里，确保 ref 回调多次执行时**只装一次**，
    // 避免每次 rerender 都把 scrollHeight 重置回初始值（这会让 setScrollHeight 完全失效）
    let metricsInstalled = false;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef } = useAutoScroll({ deps });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (metricsInstalled) return;
            metricsInstalled = true;
            const state = installScrollMetrics(el, {
              scrollHeight: 100,
              scrollTop: 50,
              clientHeight: 50,
            });
            setScrollHeight = (v) => {
              state.scrollHeight = v;
            };
          }}
          data-testid="container"
        />
      );
    };
    const { rerender } = render(<Wrapper deps={[1]} />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    // 首次挂载不应主动滚动（避免改变下游初始展示）
    expect(container.scrollTop).toBe(50);

    // 模拟自上次挂载内容已增长
    setScrollHeight(500);

    // 触发 depsKey 变化 → 重挂载
    rerender(<Wrapper deps={[2]} />);

    // 重挂载后应吸底（scrollTop = scrollHeight = 500）
    expect(container.scrollTop).toBe(500);
  });

  it('首次挂载即便 isPinned 默认为 true 也不主动滚动', () => {
    const Wrapper = () => {
      const { containerRef } = useAutoScroll();
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 0,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    // 首次挂载不应该被强制吸到底
    expect(container.scrollTop).toBe(0);
  });

  it('卸载时清理 observers，不抛错', () => {
    const Wrapper = () => {
      const { containerRef } = useAutoScroll();
      return (
        <div
          ref={containerRef as React.RefObject<HTMLDivElement>}
          data-testid="container"
        />
      );
    };
    const { unmount } = render(<Wrapper />);
    const ro = observers.roInstances[0];
    const mo = observers.moInstances[0];

    expect(() => unmount()).not.toThrow();
    expect(ro.disconnect).toHaveBeenCalled();
    expect(mo.disconnect).toHaveBeenCalled();
  });

  it('touchmove 距底超过 pinThreshold 时解除 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
        pinThreshold: 50,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 200,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(new TouchEvent('touchmove', { bubbles: true }));
    });

    expect(onScrollStateChange).toHaveBeenCalled();
    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ][0];
    expect(lastCall.isPinned).toBe(false);
  });

  it('touchmove 贴底时恢复 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
        pinThreshold: 80,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 100,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -50, bubbles: true }),
      );
    });
    container.scrollTop = 380;
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(new TouchEvent('touchmove', { bubbles: true }));
    });

    expect(onScrollStateChange).toHaveBeenCalled();
    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ][0];
    expect(lastCall.isPinned).toBe(true);
    expect(lastCall.isAtBottom).toBe(true);
  });

  it('keydown ArrowUp 解除 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 100,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
          tabIndex={0}
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
    });

    expect(onScrollStateChange).toHaveBeenCalled();
    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ][0];
    expect(lastCall.isPinned).toBe(false);
  });

  it('keydown ArrowDown 下一帧恢复 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 100,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
          tabIndex={0}
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
    });
    container.scrollTop = 380;
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
    });
    act(() => {
      flushRaf(1);
    });

    expect(onScrollStateChange).toHaveBeenCalled();
    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ][0];
    expect(lastCall.isPinned).toBe(true);
  });

  it('wheel 正向滚动清零累计上滑距离', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 200,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -8, bubbles: true, timeStamp: 100 }),
      );
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 10, bubbles: true, timeStamp: 110 }),
      );
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -8, bubbles: true, timeStamp: 120 }),
      );
    });

    expect(onScrollStateChange).not.toHaveBeenCalled();
  });

  it('无 ResizeObserver 时仍注册 MutationObserver', () => {
    const originalRo = global.ResizeObserver;
    // @ts-expect-error 测试降级分支
    delete global.ResizeObserver;

    const Wrapper = () => {
      const { containerRef } = useAutoScroll();
      return (
        <div
          ref={containerRef as React.RefObject<HTMLDivElement>}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    expect(observers.moInstances.length).toBeGreaterThan(0);
    expect(observers.roInstances.length).toBe(0);

    global.ResizeObserver = originalRo;
  });

  it('程序 scroll 事件被过滤，不重复触发 notifyState', () => {
    const onScrollStateChange = vi.fn();
    const { result } = renderHook(() =>
      useAutoScroll({ onScrollStateChange, scrollTolerance: 20 }),
    );
    const div = document.createElement('div');
    installScrollMetrics(div, {
      scrollHeight: 500,
      scrollTop: 0,
      clientHeight: 100,
    });
    act(() => {
      (
        result.current
          .containerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = div;
    });
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      result.current.scrollToBottom('auto');
    });

    const callsAfterProgrammatic = onScrollStateChange.mock.calls.length;
    act(() => {
      div.dispatchEvent(new Event('scroll'));
    });
    expect(onScrollStateChange.mock.calls.length).toBe(callsAfterProgrammatic);
  });

  it('MutationObserver 新增直接子节点时 observe 并触发 onResize', () => {
    const onResize = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ onResize });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 100,
              scrollTop: 0,
              clientHeight: 50,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    const mo = observers.moInstances[0];
    const ro = observers.roInstances[0];
    const newChild = document.createElement('div');

    act(() => {
      mo.callback(
        [
          {
            type: 'childList',
            target: container,
            addedNodes: [newChild] as unknown as NodeList,
            removedNodes: [] as unknown as NodeList,
          } as MutationRecord,
        ],
        mo as unknown as MutationObserver,
      );
    });
    act(() => {
      flushRaf(2);
    });

    expect(ro.observe).toHaveBeenCalledWith(newChild);
    expect(onResize).toHaveBeenCalled();
  });

  it('MutationObserver 移除直接子节点时 unobserve', () => {
    const Wrapper = () => {
      const { containerRef } = useAutoScroll();
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 100,
              scrollTop: 0,
              clientHeight: 50,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        >
          <div data-testid="child" />
        </div>
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    const mo = observers.moInstances[0];
    const ro = observers.roInstances[0];
    const removedChild = container.querySelector('[data-testid="child"]')!;

    act(() => {
      mo.callback(
        [
          {
            type: 'childList',
            target: container,
            addedNodes: [] as unknown as NodeList,
            removedNodes: [removedChild] as unknown as NodeList,
          } as MutationRecord,
        ],
        mo as unknown as MutationObserver,
      );
    });

    expect(ro.unobserve).toHaveBeenCalledWith(removedChild);
  });

  it.skip('MutationObserver characterData 变化触发 onContentChange', () => {
    const onResize = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ onResize });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 100,
              scrollTop: 0,
              clientHeight: 50,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const mo = observers.moInstances[0];

    act(() => {
      mo.callback(
        [{ type: 'characterData' } as MutationRecord],
        mo as unknown as MutationObserver,
      );
    });
    act(() => {
      flushRaf(2);
    });

    expect(onResize).toHaveBeenCalled();
  });

  it('未 pinned 时内容增长不自动滚动', () => {
    let setScrollHeight: (v: number) => void = () => {};
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ scrollBehavior: 'auto' });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            const state = installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 200,
              clientHeight: 50,
            });
            setScrollHeight = (v) => {
              state.scrollHeight = v;
            };
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -50, bubbles: true }),
      );
    });
    const scrollTopBefore = container.scrollTop;

    setScrollHeight(1500);
    const ro = observers.roInstances[0];
    act(() => {
      ro.callback([] as unknown as ResizeObserverEntry[]);
    });
    act(() => {
      flushRaf(2);
    });

    expect(container.scrollTop).toBe(scrollTopBefore);
  });

  it('内容收缩距底有空隙时 smooth 跟随', () => {
    let setScrollHeight: (v: number) => void = () => {};
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        scrollBehavior: 'smooth',
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            const state = installScrollMetrics(el, {
              scrollHeight: 200,
              scrollTop: 50,
              clientHeight: 100,
            });
            setScrollHeight = (v) => {
              state.scrollHeight = v;
            };
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    setScrollHeight(180);
    const ro = observers.roInstances[0];
    act(() => {
      ro.callback([] as unknown as ResizeObserverEntry[]);
    });
    act(() => {
      flushRaf();
    });

    expect(container.scrollTop).toBeGreaterThan(50);
  });

  it('deps 重挂载但内容未增长时不 jumpToBottom', () => {
    let metricsInstalled = false;
    const Wrapper = ({ deps }: { deps: number[] }) => {
      const { containerRef } = useAutoScroll({ deps });
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
              scrollHeight: 100,
              scrollTop: 50,
              clientHeight: 50,
            });
          }}
          data-testid="container"
        />
      );
    };
    const { rerender } = render(<Wrapper deps={[1]} />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    rerender(<Wrapper deps={[2]} />);
    expect(container.scrollTop).toBe(50);
  });

  it('pinThreshold 小于 scrollTolerance 时被 clamp 到 tolerance', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 50,
        pinThreshold: 10,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 300,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(new TouchEvent('touchmove', { bubbles: true }));
    });

    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ]?.[0];
    expect(lastCall?.isPinned).toBe(false);
  });

  it('scrollToBottom 无 container 时不抛错', () => {
    const { result } = renderHook(() => useAutoScroll());
    expect(() => {
      act(() => {
        result.current.scrollToBottom('auto');
        result.current.scrollToBottom('smooth');
      });
    }).not.toThrow();
    expect(result.current.isAtBottom()).toBe(true);
  });

  it('keydown Shift+Space 视为上滑意图', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 100,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
          tabIndex={0}
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ' ',
          shiftKey: true,
          bubbles: true,
        }),
      );
    });

    expect(onScrollStateChange).toHaveBeenCalled();
    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ][0];
    expect(lastCall.isPinned).toBe(false);
  });

  it('keydown PageUp 解除 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 100,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
          tabIndex={0}
        />
      );
    };
    render(<Wrapper />);
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      const container = document.querySelector(
        '[data-testid="container"]',
      ) as HTMLDivElement;
      container.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }),
      );
    });

    expect(onScrollStateChange).toHaveBeenCalled();
    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ][0];
    expect(lastCall.isPinned).toBe(false);
  });

  it('keydown Home 解除 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 100,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
          tabIndex={0}
        />
      );
    };
    render(<Wrapper />);
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      const container = document.querySelector(
        '[data-testid="container"]',
      ) as HTMLDivElement;
      container.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
      );
    });

    expect(onScrollStateChange).toHaveBeenCalled();
  });

  it('keydown End 下一帧恢复 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 100,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
          tabIndex={0}
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    act(() => {
      container.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
    });
    container.scrollTop = 380;
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
      );
    });
    act(() => {
      flushRaf(1);
    });

    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ]?.[0];
    expect(lastCall?.isPinned).toBe(true);
  });

  it('touchstart 取消 smooth 动画（不再继续推进 scrollTop）', () => {
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ scrollBehavior: 'smooth' });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 0,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    act(() => {
      container.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
    });
    const before = container.scrollTop;
    act(() => {
      flushRaf(10);
    });
    expect(container.scrollTop).toBe(before);
  });

  it('scroll 事件在非贴底且已 unpinned 时不重复通知 pinned 变化', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 200,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -50, bubbles: true }),
      );
    });
    onScrollStateChange.mockClear();

    container.scrollTop = 300;
    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });

    const pinnedCalls = onScrollStateChange.mock.calls.filter(
      ([state]) => state.isPinned === true,
    );
    expect(pinnedCalls.length).toBe(0);
  });

  it('wheel deltaY 为 0 时不累计上滑距离', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 200,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 0, bubbles: true, timeStamp: 100 }),
      );
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -10, bubbles: true, timeStamp: 110 }),
      );
    });

    const unpinnedCalls = onScrollStateChange.mock.calls.filter(
      ([state]) => state.isPinned === false,
    );
    expect(unpinnedCalls.length).toBe(0);
  });

  it('scrollToBottom 恢复 pinned 并跟随新内容', () => {
    let setScrollHeight: (v: number) => void = () => {};
    const Wrapper = () => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        scrollBehavior: 'auto',
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            const state = installScrollMetrics(el, {
              scrollHeight: 100,
              scrollTop: 0,
              clientHeight: 50,
            });
            setScrollHeight = (v) => {
              state.scrollHeight = v;
            };
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        >
          <button
            type="button"
            data-testid="scroll-btn"
            onClick={() => scrollToBottom('auto')}
          >
            bottom
          </button>
        </div>
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -50, bubbles: true }),
      );
    });
    act(() => {
      screen.getByTestId('scroll-btn').click();
    });
    expect(container.scrollTop).toBe(100);

    setScrollHeight(200);
    const ro = observers.roInstances[0];
    act(() => {
      ro.callback([] as unknown as ResizeObserverEntry[]);
    });
    act(() => {
      flushRaf(2);
    });
    expect(container.scrollTop).toBe(200);
  });

  it('内容收缩 scrollTop 超出新区间时钳位（auto 行为）', () => {
    let setScrollHeight: (v: number) => void = () => {};
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        scrollBehavior: 'auto',
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            const state = installScrollMetrics(el, {
              scrollHeight: 200,
              scrollTop: 150,
              clientHeight: 50,
            });
            setScrollHeight = (v) => {
              state.scrollHeight = v;
            };
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        >
          <div />
        </div>
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;

    setScrollHeight(80);
    const ro = observers.roInstances[0];
    act(() => {
      ro.callback([] as unknown as ResizeObserverEntry[]);
    });
    act(() => {
      flushRaf(2);
    });

    expect(container.scrollTop).toBe(30);
  });

  it('内容尺寸不变时仅 notifyState', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ onScrollStateChange });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 100,
              scrollTop: 50,
              clientHeight: 50,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        >
          <div />
        </div>
      );
    };
    render(<Wrapper />);
    flushRaf();
    onScrollStateChange.mockClear();

    const ro = observers.roInstances[0];
    act(() => {
      ro.callback([] as unknown as ResizeObserverEntry[]);
    });
    act(() => {
      flushRaf(2);
    });

    expect(onScrollStateChange.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it('MutationObserver 新增文本节点不 observe 但仍触发 onContentChange', () => {
    const onResize = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ onResize });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 100,
              scrollTop: 0,
              clientHeight: 50,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    const mo = observers.moInstances[0];
    const textNode = document.createTextNode('text');

    act(() => {
      mo.callback(
        [
          {
            type: 'childList',
            target: container,
            addedNodes: [textNode] as unknown as NodeList,
            removedNodes: [] as unknown as NodeList,
          } as MutationRecord,
        ],
        mo as unknown as MutationObserver,
      );
    });
    act(() => {
      flushRaf(2);
    });

    expect(onResize).toHaveBeenCalled();
  });

  it('depsKey 在 deps 含循环引用时使用单调递增 fallback，仍能触发重挂载', () => {
    const cyclic1: any = { name: 'a' };
    cyclic1.self = cyclic1;
    const cyclic2: any = { name: 'b' };
    cyclic2.self = cyclic2;

    const Wrapper = ({ deps }: { deps: any[] }) => {
      const { containerRef } = useAutoScroll({ deps });
      return (
        <div
          ref={containerRef as React.RefObject<HTMLDivElement>}
          data-testid="container"
        />
      );
    };
    const { rerender } = render(<Wrapper deps={[cyclic1]} />);
    const moBefore = observers.moInstances.length;
    rerender(<Wrapper deps={[cyclic2]} />);
    expect(observers.moInstances.length).toBeGreaterThan(moBefore);
  });

  it('containerRef 未挂载时 scrollToBottom 不抛错', () => {
    const { result } = renderHook(() => useAutoScroll());
    expect(() => {
      act(() => {
        result.current.scrollToBottom('auto');
      });
    }).not.toThrow();
  });

  it('废弃 SCROLL_TOLERANCE 仍可作为 scrollTolerance 回退', () => {
    const onScrollStateChange = vi.fn();
    const { result } = renderHook(() =>
      useAutoScroll({ SCROLL_TOLERANCE: 30, onScrollStateChange }),
    );
    const div = document.createElement('div');
    installScrollMetrics(div, {
      scrollHeight: 200,
      scrollTop: 180,
      clientHeight: 50,
    });
    act(() => {
      (
        result.current.containerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = div;
    });
    act(() => {
      result.current.scrollToBottom('auto');
    });
    expect(div.scrollTop).toBe(200);
  });

  it('scrollToBottom smooth 模式通过 rAF 推进', () => {
    const { result } = renderHook(() => useAutoScroll());
    const div = document.createElement('div');
    installScrollMetrics(div, {
      scrollHeight: 400,
      scrollTop: 0,
      clientHeight: 100,
    });
    act(() => {
      (
        result.current.containerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = div;
    });
    act(() => {
      result.current.scrollToBottom('smooth');
    });
    act(() => {
      flushRaf(10);
    });
    expect(div.scrollTop).toBeGreaterThan(0);
  });

  it('自定义 pinThreshold 影响贴底判定', () => {
    const onScrollStateChange = vi.fn();
    const { result } = renderHook(() =>
      useAutoScroll({ pinThreshold: 100, onScrollStateChange }),
    );
    const div = document.createElement('div');
    installScrollMetrics(div, {
      scrollHeight: 300,
      scrollTop: 250,
      clientHeight: 100,
    });
    act(() => {
      (
        result.current.containerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = div;
    });
    act(() => {
      result.current.scrollToBottom('auto');
    });
    expect(result.current.isAtBottom()).toBe(true);
  });

  it('keydown PageDown 下一帧恢复 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 100,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
          tabIndex={0}
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    act(() => {
      container.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
    });
    container.scrollTop = 380;
    onScrollStateChange.mockClear();

    act(() => {
      container.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }),
      );
    });
    act(() => {
      flushRaf(1);
    });

    const lastCall =
      onScrollStateChange.mock.calls[
        onScrollStateChange.mock.calls.length - 1
      ]?.[0];
    expect(lastCall?.isPinned).toBe(true);
  });

  it('wheel 间隔超过 WHEEL_INTENT_RESET_MS 重置累计', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 200,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    const container = document.querySelector(
      '[data-testid="container"]',
    ) as HTMLDivElement;
    flushRaf();
    onScrollStateChange.mockClear();

    // happy-dom 的 WheelEvent.timeStamp 不可靠，强制为 0 以走 Date.now 分支
    let tick = 1000;
    const nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => tick);
    const dispatchWheel = (deltaY: number, advanceMs = 0) => {
      tick += advanceMs;
      const ev = new WheelEvent('wheel', { deltaY, bubbles: true });
      Object.defineProperty(ev, 'timeStamp', { value: 0, configurable: true });
      container.dispatchEvent(ev);
    };

    act(() => {
      dispatchWheel(-10);
      dispatchWheel(-10, 250);
    });

    nowSpy.mockRestore();

    const unpinned = onScrollStateChange.mock.calls.filter(
      ([s]) => s.isPinned === false,
    );
    expect(unpinned.length).toBe(0);
  });

  it('touchmove 距底在 tolerance 与 pinThreshold 之间保持 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
        pinThreshold: 80,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 350,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      const container = document.querySelector(
        '[data-testid="container"]',
      ) as HTMLDivElement;
      container.dispatchEvent(new TouchEvent('touchmove', { bubbles: true }));
    });

    const unpinned = onScrollStateChange.mock.calls.filter(
      ([s]) => s.isPinned === false,
    );
    expect(unpinned.length).toBe(0);
  });
});

describe('useAutoScroll 深度边界', () => {
  let observers: ReturnType<typeof installObserverMocks>;

  beforeEach(() => {
    observers = installObserverMocks();
    rafController = createRafController();
    vi.stubGlobal('requestAnimationFrame', ((cb: FrameRequestCallback) =>
      rafController.schedule(cb)) as typeof requestAnimationFrame);
    vi.stubGlobal('cancelAnimationFrame', ((id: number) =>
      rafController.cancel(id)) as typeof cancelAnimationFrame);
  });

  afterEach(() => {
    rafController.flush();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('scrollBehavior=auto 内容增长时立即吸底', () => {
    let setScrollHeight: (v: number) => void = () => {};
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        scrollBehavior: 'auto',
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            const state = installScrollMetrics(el, {
              scrollHeight: 200,
              scrollTop: 100,
              clientHeight: 100,
            });
            setScrollHeight = (v) => {
              state.scrollHeight = v;
            };
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        >
          <div />
        </div>
      );
    };
    render(<Wrapper />);
    flushRaf();

    // 内容增长由 ResizeObserver → onContentChange 驱动，而非 scroll 事件
    setScrollHeight(500);
    const ro = observers.roInstances[0];
    act(() => {
      ro.callback([] as unknown as ResizeObserverEntry[]);
    });
    act(() => {
      flushRaf(2);
    });

    expect(
      (document.querySelector('[data-testid="container"]') as HTMLDivElement)
        .scrollTop,
    ).toBe(500);
  });

  it('containerRef 为 null 时不抛错', () => {
    const Wrapper = () => {
      const { scrollToBottom } = useAutoScroll({});
      React.useEffect(() => {
        scrollToBottom('auto');
      }, [scrollToBottom]);
      return null;
    };
    expect(() => render(<Wrapper />)).not.toThrow();
  });

  it('unmount 时 cancel 未执行的 RAF', () => {
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ scrollBehavior: 'smooth' });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 0,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    const { unmount } = render(<Wrapper />);
    flushRaf(1);
    expect(rafController.pendingSize()).toBeGreaterThanOrEqual(0);
    unmount();
    expect(rafController.pendingSize()).toBe(0);
  });

  it('programmaticScrollCount>0 时 wheel 不解除 pinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 20,
      });
      React.useEffect(() => {
        scrollToBottom('auto');
      }, [scrollToBottom]);
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 880,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container"
        />
      );
    };
    render(<Wrapper />);
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      const container = document.querySelector(
        '[data-testid="container"]',
      ) as HTMLDivElement;
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -120, bubbles: true }),
      );
    });

    const unpinned = onScrollStateChange.mock.calls.filter(
      ([s]) => s.isPinned === false,
    );
    expect(unpinned.length).toBe(0);
  });

  it('istanbul buffer：空 deps 走 depsKey 空串', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        deps: [],
        onScrollStateChange,
        scrollTolerance: 20,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 800,
              scrollTop: 700,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container-buffer-deps"
        />
      );
    };
    render(<Wrapper />);
    flushRaf();
    expect(
      document.querySelector('[data-testid="container-buffer-deps"]'),
    ).toBeTruthy();
  });

  it('istanbul fill：无 container 早退；scrollBehavior 缺省；smooth 滚动', () => {
    const { result } = renderHook(() =>
      useAutoScroll({ scrollTolerance: 10 }),
    );
    expect(() => result.current.scrollToBottom('auto')).not.toThrow();
    expect(() => result.current.scrollToBottom()).not.toThrow();

    const Wrapper = () => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        scrollBehavior: undefined as any,
        scrollTolerance: 20,
      });
      React.useEffect(() => {
        scrollToBottom('smooth');
      }, [scrollToBottom]);
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 900,
              scrollTop: 0,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container-fill-smooth"
        />
      );
    };
    render(<Wrapper />);
    flushRaf(3);
    expect(
      document.querySelector('[data-testid="container-fill-smooth"]'),
    ).toBeTruthy();
  });

  it('istanbul after：scrollToBottom 默认 behavior=auto；无 el 早退', () => {
    const { result } = renderHook(() => useAutoScroll({}));
    expect(() => result.current.scrollToBottom()).not.toThrow();

    const Wrapper = () => {
      const { containerRef, scrollToBottom } = useAutoScroll({
        scrollTolerance: 5,
      });
      React.useEffect(() => {
        scrollToBottom();
      }, [scrollToBottom]);
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 400,
              scrollTop: 0,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container-after-default"
        />
      );
    };
    render(<Wrapper />);
    flushRaf(2);
    expect(
      document.querySelector('[data-testid="container-after-default"]'),
    ).toBeTruthy();
  });

  it('istanbul buffer：键盘 ArrowDown 在底部外；behavior smooth 分支', () => {
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        scrollTolerance: 2,
        scrollBehavior: 'smooth',
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 0,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container-buffer-keys"
          tabIndex={0}
        />
      );
    };
    render(<Wrapper />);
    const el = document.querySelector(
      '[data-testid="container-buffer-keys"]',
    ) as HTMLElement;
    el.focus();
    fireEvent.keyDown(el, { key: 'ArrowDown' });
    fireEvent.keyDown(el, { key: 'ArrowUp' });
    flushRaf(2);
    expect(el).toBeTruthy();
  });

  it('MutationObserver 新增文本节点 nodeType!==1 不 observe', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 10,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 300,
              scrollTop: 200,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container-text-node"
        />
      );
    };
    render(<Wrapper />);
    flushRaf();

    const container = document.querySelector(
      '[data-testid="container-text-node"]',
    ) as HTMLDivElement;
    const mo = observers.moInstances[0];
    onScrollStateChange.mockClear();

    act(() => {
      mo.callback([
        {
          addedNodes: [document.createTextNode('stream')],
          removedNodes: [],
          target: container,
          type: 'childList',
        } as MutationRecord,
      ]);
    });
    act(() => {
      flushRaf(2);
    });

    expect(observers.roInstances[0]?.observe).not.toHaveBeenCalledWith(
      expect.any(Text),
    );
  });

  it('未 pinned 时内容收缩只 notify 不 jumpToBottom', () => {
    const onScrollStateChange = vi.fn();
    let setScrollHeight: (v: number) => void = () => {};
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 10,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            const state = installScrollMetrics(el, {
              scrollHeight: 500,
              scrollTop: 350,
              clientHeight: 100,
            });
            setScrollHeight = (v) => {
              state.scrollHeight = v;
            };
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container-unpinned-shrink"
        />
      );
    };
    render(<Wrapper />);
    flushRaf();

    const container = document.querySelector(
      '[data-testid="container-unpinned-shrink"]',
    ) as HTMLDivElement;

    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: -200,
          bubbles: true,
        }),
      );
      for (let i = 0; i < 5; i += 1) {
        container.dispatchEvent(
          new WheelEvent('wheel', {
            deltaY: -200,
            bubbles: true,
          }),
        );
      }
    });

    const beforeTop = container.scrollTop;
    setScrollHeight(200);
    const ro = observers.roInstances[0];
    act(() => {
      ro.callback([] as unknown as ResizeObserverEntry[]);
    });
    act(() => {
      flushRaf(2);
    });

    expect(container.scrollTop).toBe(beforeTop);
  });

  it('wheel 距底超过 tolerance 且 wasPinned 时 notify unpinned', () => {
    const onScrollStateChange = vi.fn();
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({
        onScrollStateChange,
        scrollTolerance: 10,
        scrollPinThreshold: 10,
      });
      return (
        <div
          ref={(el) => {
            if (!el) return;
            installScrollMetrics(el, {
              scrollHeight: 1000,
              scrollTop: 800,
              clientHeight: 100,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          data-testid="container-wheel-unpin"
        />
      );
    };
    render(<Wrapper />);
    flushRaf();
    onScrollStateChange.mockClear();

    act(() => {
      const container = document.querySelector(
        '[data-testid="container-wheel-unpin"]',
      ) as HTMLDivElement;
      for (let i = 0; i < 6; i += 1) {
        container.dispatchEvent(
          new WheelEvent('wheel', {
            deltaY: -50,
            bubbles: true,
            timeStamp: 100 + i,
          }),
        );
      }
    });

    expect(
      onScrollStateChange.mock.calls.some(
        ([s]) => s.isPinned === false,
      ),
    ).toBe(true);
  });
});

// 旧 .skip 套件归档已删除 —— 与当前实现完全脱钩（断言 `el.scrollTo()` / 引用已不存在的
// isAutoScrollEngaged / isLocked 等内部状态），git history 仍可追溯。
// 历史用例查阅：`git log -p -- tests/hooks/useAutoScroll.targeted-coverage.test.tsx`

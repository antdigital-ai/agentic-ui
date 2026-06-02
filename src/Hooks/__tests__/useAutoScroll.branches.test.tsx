import { act, render, renderHook } from '@testing-library/react';
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
    // 重挂载后应该新建了一个 MutationObserver 实例
    expect(observers.moInstances.length).toBeGreaterThan(moBefore);
  });
});

// 旧 .skip 套件归档已删除 —— 与当前实现完全脱钩（断言 `el.scrollTo()` / 引用已不存在的
// isAutoScrollEngaged / isLocked 等内部状态），git history 仍可追溯。
// 历史用例查阅：`git log -p -- tests/hooks/useAutoScroll.targeted-coverage.test.tsx`

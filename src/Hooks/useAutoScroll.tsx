import { useCallback, useEffect, useMemo, useRef } from 'react';

const SCROLL_TOLERANCE = 20;
/** 视为"已脱离底部"的阈值，区别于 SCROLL_TOLERANCE，用于跟随判定的滞回区 */
const PIN_THRESHOLD = 80;
/** rAF 渐进滚动每帧推进比例（0-1），值越大越快、越接近 1 越接近 instant */
const ANIMATION_LERP = 0.25;
/** rAF 渐进滚动单帧最小步长（px），避免接近底部时进度过慢 */
const ANIMATION_MIN_STEP = 6;
/** 接近底部不足该距离时直接吸底，避免亚像素抖动 */
const ANIMATION_SNAP_DISTANCE = 1.5;
/** wheel 累计上滑距离阈值（px），超过才认为是用户主动上滑（过滤触摸板惯性回弹） */
const WHEEL_UP_INTENT_THRESHOLD = 16;
/** 累计 wheel 重置时间（ms），距离上次 wheel 超过该时间则重置累计值 */
const WHEEL_INTENT_RESET_MS = 120;

/**
 * useAutoScroll Hook - 自动滚动 Hook
 *
 * 提供智能的"跟随底部"滚动能力，常用于聊天消息、流式输出等场景。
 *
 * @description
 * - 内容增长时若处于"跟随状态"则平滑跟随到底部
 * - 通过监听 wheel/touchmove/keydown 等用户交互事件来判断是否脱离跟随
 *   （而非依赖 scroll 事件，避免程序滚动期间被自己派发的 scroll 误判）
 * - 使用 ResizeObserver + MutationObserver 双重监听内容尺寸/结构变化，
 *   覆盖图片懒加载、代码块异步高亮等不会触发 mutation 的场景
 * - 平滑滚动基于 requestAnimationFrame 渐进推进，新内容进来时会无缝接续，
 *   不会被浏览器原生 smooth 动画打断造成抖动
 *
 * @template T - 容器元素类型
 * @param props - Hook 配置参数
 * @param props.SCROLL_TOLERANCE - 判定"已贴底"的容差阈值（px），默认 20
 * @param props.pinThreshold - 判定"已脱离底部"的阈值（px），默认 80。距离底部超过该值才认为用户已离开
 * @param props.onResize - 容器尺寸变化回调
 * @param props.onScrollStateChange - 跟随状态/贴底状态变化回调
 * @param props.deps - 依赖数组，依赖变化会重新初始化所有监听
 * @param props.scrollBehavior - 自动跟随时的滚动行为，'smooth' 使用 rAF 渐进、'auto' 立即跳转，默认 'smooth'
 *
 * @returns
 * - containerRef：滚动容器 ref
 * - scrollToBottom(behavior?)：手动滚动到底部，默认 'auto' 立即滚动
 * - isAtBottom()：当前是否处于贴底状态
 *
 * @example
 * ```tsx
 * const { containerRef, scrollToBottom, isAtBottom } = useAutoScroll({
 *   pinThreshold: 80,
 *   onScrollStateChange: ({ isAtBottom, isPinned }) => {
 *     setShowBackToBottom(!isAtBottom);
 *   },
 * });
 * ```
 */
export interface AutoScrollState {
  /** 是否贴近底部（距离 <= SCROLL_TOLERANCE） */
  isAtBottom: boolean;
  /** 是否处于"跟随底部"状态（用户未主动上滑离开） */
  isPinned: boolean;
}

export interface UseAutoScrollProps {
  SCROLL_TOLERANCE?: number;
  pinThreshold?: number;
  onResize?: (size: { width: number; height: number }) => void;
  onScrollStateChange?: (state: AutoScrollState) => void;
  deps?: React.DependencyList;
  /** @deprecated 已无作用，rAF 渐进滚动不再需要节流时间窗口 */
  timeout?: number;
  scrollBehavior?: 'smooth' | 'auto';
}

export const useAutoScroll = <T extends HTMLDivElement>(
  props: UseAutoScrollProps = {},
) => {
  const containerRef = useRef<T | null>(null);
  const lastScrollHeight = useRef(0);

  /** 跟随状态：用户未主动离开底部，则一直跟随新内容到底部 */
  const isPinned = useRef(true);
  /** 当前是否贴底（用于回调判断变更） */
  const lastIsAtBottom = useRef(true);
  /** 标记最近一次滚动是否由程序触发，过滤 scroll 事件中的程序行为 */
  const programmaticScrolling = useRef(false);

  /** rAF 渐进滚动句柄 */
  const rafId = useRef<number | null>(null);
  /** 渐进滚动的目标位置 */
  const animationTarget = useRef(0);

  const mutationObserver = useRef<MutationObserver | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const tolerance = props.SCROLL_TOLERANCE ?? SCROLL_TOLERANCE;
  // pinThreshold 必须 >= tolerance，否则会出现"既算贴底又算脱离"的逻辑空洞
  const pinThreshold = Math.max(
    props.pinThreshold ?? PIN_THRESHOLD,
    tolerance,
  );

  /**
   * 用 ref 持有最新回调与 scrollBehavior，避免引用变化导致 effect 反复重建监听。
   */
  const onResizeRef = useRef(props.onResize);
  const onScrollStateChangeRef = useRef(props.onScrollStateChange);
  const scrollBehaviorRef = useRef(props.scrollBehavior);
  onResizeRef.current = props.onResize;
  onScrollStateChangeRef.current = props.onScrollStateChange;
  scrollBehaviorRef.current = props.scrollBehavior;

  /**
   * 把 deps 序列化成稳定 key，避免在 useEffect 依赖里展开 deps 数组
   * （React 要求依赖数组长度固定）。
   */
  const depsKey = useMemo(
    () => (props.deps ? props.deps.map((d) => String(d)).join('|') : ''),
    // 调用方语义：deps 内任一变化都视为需要重挂载
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...(props.deps || [])],
  );

  const cancelAnimation = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  /**
   * 上一次通知的 pinned 状态，配合 lastIsAtBottom 共同决定是否需要通知。
   */
  const lastIsPinned = useRef(true);

  /**
   * 触发跟随状态/贴底状态回调，仅在 isAtBottom 或 isPinned 变化时通知。
   */
  const notifyState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const distance =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const atBottom = distance <= tolerance;
    const pinnedNow = isPinned.current;
    if (
      atBottom !== lastIsAtBottom.current ||
      pinnedNow !== lastIsPinned.current
    ) {
      lastIsAtBottom.current = atBottom;
      lastIsPinned.current = pinnedNow;
      onScrollStateChangeRef.current?.({
        isAtBottom: atBottom,
        isPinned: pinnedNow,
      });
    }
  }, [tolerance]);

  /**
   * 立即跳到底部（不走 rAF）。
   * scrollTop 赋值会同步派发 scroll 事件，所以同步设置/清除标志即可
   * 完整过滤掉这次程序滚动，无需异步延迟。
   */
  const jumpToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    cancelAnimation();
    programmaticScrolling.current = true;
    container.scrollTop = container.scrollHeight;
    programmaticScrolling.current = false;
    notifyState();
  }, [cancelAnimation, notifyState]);

  /**
   * 基于 rAF 的渐进滚动到底部。每帧重新读取 scrollHeight，
   * 新内容追加时目标会自动跟随增长，不会出现"动画结束才发现还没到底"。
   */
  const animateToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    animationTarget.current = container.scrollHeight - container.clientHeight;

    if (rafId.current !== null) {
      // 已有动画在跑，目标已被更新，无需新开
      return;
    }

    const step = () => {
      rafId.current = null;
      const el = containerRef.current;
      if (!el) return;

      // 实时刷新目标，跟随新内容
      animationTarget.current = el.scrollHeight - el.clientHeight;
      const current = el.scrollTop;
      const remaining = animationTarget.current - current;

      if (remaining <= ANIMATION_SNAP_DISTANCE) {
        programmaticScrolling.current = true;
        el.scrollTop = animationTarget.current;
        programmaticScrolling.current = false;
        notifyState();
        return;
      }

      const delta = Math.max(remaining * ANIMATION_LERP, ANIMATION_MIN_STEP);
      // scroll 事件在 scrollTop 赋值时同步派发，因此同步开/关标志即可过滤
      programmaticScrolling.current = true;
      el.scrollTop = current + delta;
      programmaticScrolling.current = false;

      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);
  }, [notifyState]);

  /**
   * 内容增长 / 容器尺寸变化时触发的核心检查。
   * - 未 pinned：只通知状态变化
   * - pinned + 内容增大：按 scrollBehavior 跟随
   * - pinned + 内容缩小：用 instant 立即贴底（避免折叠/输入框收起后底部留白）
   */
  const onContentChange = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    onResizeRef.current?.({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const currentScrollHeight = container.scrollHeight;
    const prevScrollHeight = lastScrollHeight.current;
    lastScrollHeight.current = currentScrollHeight;

    if (!isPinned.current) {
      notifyState();
      return;
    }

    const grew = currentScrollHeight > prevScrollHeight;
    const shrunk = currentScrollHeight < prevScrollHeight;

    if (grew) {
      const behavior = scrollBehaviorRef.current ?? 'smooth';
      if (behavior === 'auto') {
        jumpToBottom();
      } else {
        animateToBottom();
      }
      return;
    }

    if (shrunk) {
      // 内容缩小时立即贴底，无需平滑动画
      jumpToBottom();
      return;
    }

    notifyState();
  }, [animateToBottom, jumpToBottom, notifyState]);

  // 监听用户主动交互（wheel / touch / 键盘）以判断是否脱离底部
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /** 用户操作判定：取消当前动画、根据当前距底距离更新 pinned */
    const onUserInteract = () => {
      cancelAnimation();
      const distance =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      const wasPinned = isPinned.current;
      // 只有距底超过 pinThreshold 才认为脱离；贴底则保持/恢复跟随
      if (distance > pinThreshold) {
        isPinned.current = false;
      } else if (distance <= tolerance) {
        isPinned.current = true;
      }
      if (wasPinned !== isPinned.current) {
        notifyState();
      }
    };

    /**
     * wheel：累计上滑距离超过阈值才认为是真实的"上滑意图"，
     * 用于过滤触摸板惯性回弹带来的瞬时负 deltaY。
     */
    let wheelUpAccum = 0;
    let lastWheelTs = 0;
    const handleWheel = (e: WheelEvent) => {
      const now = e.timeStamp || Date.now();
      // 距上次 wheel 间隔过长则重置累计
      if (now - lastWheelTs > WHEEL_INTENT_RESET_MS) wheelUpAccum = 0;
      lastWheelTs = now;

      if (e.deltaY < 0) {
        wheelUpAccum += -e.deltaY;
      } else if (e.deltaY > 0) {
        // 正向滚动直接清零，避免负噪声累加
        wheelUpAccum = 0;
      }
      if (wheelUpAccum < WHEEL_UP_INTENT_THRESHOLD) return;

      cancelAnimation();
      const distance =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distance > tolerance) {
        const wasPinned = isPinned.current;
        isPinned.current = false;
        if (wasPinned) notifyState();
      }
    };

    /** touch：开始滑动时取消动画，结束时根据位置重新判定 */
    const handleTouchStart = () => {
      cancelAnimation();
    };

    const handleTouchMove = () => {
      onUserInteract();
    };

    /** 键盘：上、PgUp、Home、Space(Shift) 视为上滑意图 */
    const handleKeyDown = (e: KeyboardEvent) => {
      const upKeys = ['ArrowUp', 'PageUp', 'Home'];
      const downKeys = ['ArrowDown', 'PageDown', 'End', ' ', 'Spacebar'];
      if (upKeys.includes(e.key) || (e.shiftKey && e.key === ' ')) {
        cancelAnimation();
        const distance =
          container.scrollHeight -
          container.scrollTop -
          container.clientHeight;
        if (distance > tolerance) {
          const wasPinned = isPinned.current;
          isPinned.current = false;
          if (wasPinned) notifyState();
        }
      } else if (downKeys.includes(e.key)) {
        // 用户主动下滑/到底，下一帧再判断是否回到底部并恢复 pinned
        requestAnimationFrame(() => onUserInteract());
      }
    };

    /** scroll：仅做"贴底状态"通知，不参与 pinned 判定 */
    const handleScroll = () => {
      if (programmaticScrolling.current) return;
      notifyState();
      // 用户已经手动滚回底部，可恢复跟随
      const distance =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distance <= tolerance && !isPinned.current) {
        isPinned.current = true;
        notifyState();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [cancelAnimation, notifyState, pinThreshold, tolerance, depsKey]);

  // 内容尺寸变化监听：ResizeObserver + MutationObserver 双保险
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    lastScrollHeight.current = container.scrollHeight;

    /**
     * ResizeObserver 监听容器自身和**所有后代元素**的尺寸变化，
     * 覆盖图片懒加载、代码块异步高亮、深层嵌套的折叠面板展开等场景。
     * 注意：ResizeObserver 监听的是元素自身 box 尺寸，不是 scrollHeight，
     * 所以仅监听容器本身在很多嵌套结构里不会触发；必须深入到内容节点。
     */
    const hasResizeObserver = typeof ResizeObserver !== 'undefined';
    if (hasResizeObserver) {
      resizeObserver.current = new ResizeObserver(() => {
        onContentChange();
      });
      resizeObserver.current.observe(container);
      // 一次性把当前所有后代元素加入观察
      const initialDescendants = container.querySelectorAll('*');
      initialDescendants.forEach((el) => {
        resizeObserver.current?.observe(el);
      });
    }

    // MutationObserver 监听 DOM 结构变化，把新增节点（含其后代）加入 ResizeObserver
    mutationObserver.current = new MutationObserver((mutations) => {
      let structureChanged = false;
      mutations.forEach((m) => {
        if ((m.addedNodes?.length ?? 0) > 0) {
          structureChanged = true;
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            const el = node as Element;
            resizeObserver.current?.observe(el);
            // 同时观察新节点的所有后代
            el.querySelectorAll?.('*').forEach((descendant) => {
              resizeObserver.current?.observe(descendant);
            });
          });
        }
        if ((m.removedNodes?.length ?? 0) > 0) {
          structureChanged = true;
          m.removedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            const el = node as Element;
            resizeObserver.current?.unobserve(el);
            el.querySelectorAll?.('*').forEach((descendant) => {
              resizeObserver.current?.unobserve(descendant);
            });
          });
        }
        if (m.type === 'characterData') {
          structureChanged = true;
        }
      });
      if (structureChanged) onContentChange();
    });

    mutationObserver.current.observe(container, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: true,
    });

    return () => {
      mutationObserver.current?.disconnect();
      resizeObserver.current?.disconnect();
      mutationObserver.current = null;
      resizeObserver.current = null;
    };
  }, [onContentChange, depsKey]);

  // 卸载时清理动画
  useEffect(() => {
    return () => cancelAnimation();
  }, [cancelAnimation]);

  /**
   * 手动滚动到底部。
   * - 默认 'auto' 立即滚动（无动画）
   * - 传 'smooth' 使用 rAF 渐进滚动
   * 调用后会自动恢复 pinned 状态。
   */
  const scrollToBottom = useCallback(
    (behavior: 'smooth' | 'auto' = 'auto') => {
      isPinned.current = true;
      if (behavior === 'smooth') {
        animateToBottom();
      } else {
        jumpToBottom();
      }
    },
    [animateToBottom, jumpToBottom],
  );

  /** 当前是否贴底 */
  const isAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    const distance =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distance <= tolerance;
  }, [tolerance]);

  return {
    containerRef,
    scrollToBottom,
    isAtBottom,
  } as const;
};

export default useAutoScroll;

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

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
 * @param props.scrollTolerance - 判定"已贴底"的容差阈值（px），默认 20
 * @param props.SCROLL_TOLERANCE - **已废弃**，请使用 `scrollTolerance`，仅作向后兼容保留
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
  /** 判定"已贴底"的容差阈值（px），默认 20 */
  scrollTolerance?: number;
  /**
   * @deprecated 已废弃，请使用 `scrollTolerance`，下个大版本将移除。
   * 同时传入时优先使用 `scrollTolerance`。
   */
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
  /**
   * 标记最近若干次滚动是否由程序触发，用于过滤 scroll 事件中的程序行为。
   * Safari/iOS Safari 在某些场景下 scroll 事件相对 scrollTop 赋值为异步派发，
   * 同步置位/复位会让 handleScroll 把程序滚动当成用户滚动。改为「计数 + RAF 复位」：
   * - 写 scrollTop 前 ++
   * - 下一帧（异步 scroll 事件已派发完）再 --
   * handleScroll 内只要计数 > 0 即视为程序行为。
   */
  const programmaticScrollCount = useRef(0);
  /** RAF 句柄，用于程序滚动计数的延迟复位 */
  const programmaticResetRaf = useRef<number | null>(null);

  /** rAF 渐进滚动句柄 */
  const rafId = useRef<number | null>(null);
  /** 渐进滚动的目标位置 */
  const animationTarget = useRef(0);

  /** onContentChange 的 RAF 合并句柄，把同一帧内多次回调合并为一次实际处理 */
  const contentChangeRaf = useRef<number | null>(null);

  const mutationObserver = useRef<MutationObserver | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  // 优先使用新名 scrollTolerance，回退到 deprecated 的 SCROLL_TOLERANCE，最后才是默认值
  const tolerance =
    props.scrollTolerance ?? props.SCROLL_TOLERANCE ?? SCROLL_TOLERANCE;
  // pinThreshold 必须 >= tolerance，否则会出现"既算贴底又算脱离"的逻辑空洞
  const pinThreshold = Math.max(props.pinThreshold ?? PIN_THRESHOLD, tolerance);

  /**
   * 用 ref 持有最新回调与 scrollBehavior，避免引用变化导致 effect 反复重建监听。
   * 必须在 effect 中赋值，渲染期写 ref 在 React 18 并发渲染 / StrictMode 下不安全
   * （被丢弃的渲染版本会污染 ref）。
   */
  const onResizeRef = useRef(props.onResize);
  const onScrollStateChangeRef = useRef(props.onScrollStateChange);
  const scrollBehaviorRef = useRef(props.scrollBehavior);
  useLayoutEffect(() => {
    onResizeRef.current = props.onResize;
    onScrollStateChangeRef.current = props.onScrollStateChange;
    scrollBehaviorRef.current = props.scrollBehavior;
  });

  /**
   * 循环引用 / 不可序列化 deps 的回退签名递增计数器：
   * 不能仅用 `__cyclic_${length}__` 作为回退 key —— 两次不同的循环引用对象只要 length
   * 相同，回退 key 就完全相同，导致重挂载逻辑失效。每次回退时单调递增，确保每次都能触发重挂载。
   */
  const cyclicDepsCounter = useRef(0);

  /**
   * 把 deps 序列化成稳定长度的字符串 key，作为下游 effect 的依赖：
   * - 直接展开 `...props.deps` 会让 effect 依赖数组长度可变，触发 React 运行时报错
   * - 用 JSON.stringify 替代 String()+join，避免对象 deps 全部退化为 [object Object]
   *   导致引用变化无法触发重挂载
   * - 序列化失败（循环引用等）时使用单调递增的回退 key，保证每次都能触发重挂载
   */
  const depsKey = useMemo(() => {
    if (!props.deps || props.deps.length === 0) return '';
    try {
      return JSON.stringify(props.deps);
    } catch {
      cyclicDepsCounter.current += 1;
      return `__cyclic_${props.deps.length}_${cyclicDepsCounter.current}__`;
    }
  }, [props.deps]);

  const cancelAnimation = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  /**
   * 把 scrollTop 写入操作包装为「程序滚动」：
   * - 写入前计数 +1，使 handleScroll 识别后立即 return
   * - 在下一个 RAF 中 -1，确保即便 Safari/iOS Safari 异步派发 scroll 事件也能被过滤
   */
  const beginProgrammaticScroll = useCallback(() => {
    programmaticScrollCount.current += 1;
    // 上一次复位还没跑就让它跑完，避免 RAF 句柄丢失
    if (programmaticResetRaf.current !== null) {
      cancelAnimationFrame(programmaticResetRaf.current);
    }
    programmaticResetRaf.current = requestAnimationFrame(() => {
      programmaticResetRaf.current = null;
      // 一帧内可能多次写 scrollTop（jumpToBottom + 后续动画首帧），所以这里清零而不是 -1
      programmaticScrollCount.current = 0;
    });
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
    beginProgrammaticScroll();
    container.scrollTop = container.scrollHeight;
    notifyState();
  }, [cancelAnimation, beginProgrammaticScroll, notifyState]);

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
        beginProgrammaticScroll();
        el.scrollTop = animationTarget.current;
        notifyState();
        return;
      }

      const delta = Math.max(remaining * ANIMATION_LERP, ANIMATION_MIN_STEP);
      beginProgrammaticScroll();
      el.scrollTop = current + delta;

      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);
  }, [beginProgrammaticScroll, notifyState]);

  /**
   * 内容增长 / 容器尺寸变化时触发的核心检查（实际执行体）。
   * - 未 pinned：只通知状态变化
   * - pinned + 内容增大：按 scrollBehavior 跟随
   * - pinned + 内容缩小：用 instant 立即贴底（避免折叠/输入框收起后底部留白）
   */
  const performContentChange = useCallback(() => {
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
      const maxScrollTop = Math.max(
        0,
        currentScrollHeight - container.clientHeight,
      );
      const distance =
        currentScrollHeight - container.scrollTop - container.clientHeight;

      // scrollTop 超出新区间时必须钳位，否则底部留白
      if (container.scrollTop > maxScrollTop + ANIMATION_SNAP_DISTANCE) {
        cancelAnimation();
        beginProgrammaticScroll();
        container.scrollTop = maxScrollTop;
        notifyState();
        return;
      }

      if (!isPinned.current) {
        notifyState();
        return;
      }

      // 仍跟随底部：仅在有明显距底空隙时再滚动。loading→finish 时思维链折叠等
      // 会触发收缩，若一律 jumpToBottom 会打断 smooth 跟随造成消息跳动
      if (distance > tolerance) {
        const behavior = scrollBehaviorRef.current ?? 'smooth';
        if (behavior === 'auto') {
          jumpToBottom();
        } else {
          animateToBottom();
        }
      } else {
        notifyState();
      }
      return;
    }

    notifyState();
  }, [
    animateToBottom,
    beginProgrammaticScroll,
    cancelAnimation,
    jumpToBottom,
    notifyState,
    tolerance,
  ]);

  /**
   * onContentChange 的对外入口：用 RAF 合并同一帧内多次回调。
   * - ResizeObserver / MutationObserver 在内容剧烈变化时一帧内可能触发数十次
   * - 每次都同步读 scrollHeight/scrollTop/clientHeight 会强制 reflow，叠加形成性能放大
   * - RAF 合并后保证一帧内最多执行一次实际处理，且仍能跟上 60fps 内容变化
   */
  const onContentChange = useCallback(() => {
    if (contentChangeRaf.current !== null) return;
    contentChangeRaf.current = requestAnimationFrame(() => {
      contentChangeRaf.current = null;
      performContentChange();
    });
  }, [performContentChange]);

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
          container.scrollHeight - container.scrollTop - container.clientHeight;
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
      // 计数 > 0 即视为程序滚动；Safari 等浏览器异步派发 scroll 事件时也能被正确过滤
      if (programmaticScrollCount.current > 0) return;
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

  /**
   * 区分「首次挂载」与「depsKey 变化导致的重挂载」：
   * - 首次挂载：仅初始化基线 lastScrollHeight，**不主动触发 jumpToBottom**，
   *   避免改变下游组件（ChatLayout/ThoughtChainList 等）的初始展示行为
   * - 重挂载：基线被重置后，若 isPinned 为 true 且内容自上次挂载后已增长，
   *   主动 jumpToBottom 一次以避免漏跟随
   */
  const hasMountedRef = useRef(false);

  // 内容尺寸变化监听：ResizeObserver + MutationObserver 双保险
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 进入 effect 前的旧基线（用于判断重挂载期间内容是否已增长）
    const previousBaseline = lastScrollHeight.current;
    const currentScrollHeight = container.scrollHeight;
    lastScrollHeight.current = currentScrollHeight;

    /**
     * ResizeObserver 仅监听 container 本身 + 直接子元素：
     * - 老实现 querySelectorAll('*') 把所有后代节点（聊天列表常 1k+ 个）一次性塞进同一个
     *   observer，初次挂载即 O(n) 注册、任意子元素 1px 变动都触发回调，形成性能放大风暴
     * - container 自身 box 高度由直接子元素堆叠而成；只 observe 直接子元素就能感知 90% 的内容尺寸变化
     * - 深层后代的尺寸变化（图片懒加载、代码块异步高亮等）由下面的 MutationObserver
     *   `characterData/childList` + onContentChange 统一兜底
     */
    const hasResizeObserver = typeof ResizeObserver !== 'undefined';
    if (hasResizeObserver) {
      resizeObserver.current = new ResizeObserver(() => {
        onContentChange();
      });
      resizeObserver.current.observe(container);
      // 仅 observe 直接子元素，避免遍历整棵子树
      Array.from(container.children).forEach((el) => {
        resizeObserver.current?.observe(el);
      });
    }

    // MutationObserver 监听 DOM 结构变化，仅把新增的直接子节点加入 ResizeObserver
    mutationObserver.current = new MutationObserver((mutations) => {
      let structureChanged = false;
      mutations.forEach((m) => {
        if ((m.addedNodes?.length ?? 0) > 0) {
          structureChanged = true;
          // 仅当新增的是 container 直接子节点时才 observe；深层 add 由 characterData/childList 触发 onContentChange 即可
          if (m.target === container) {
            m.addedNodes.forEach((node) => {
              if (node.nodeType !== 1) return;
              resizeObserver.current?.observe(node as Element);
            });
          }
        }
        if ((m.removedNodes?.length ?? 0) > 0) {
          structureChanged = true;
          if (m.target === container) {
            m.removedNodes.forEach((node) => {
              if (node.nodeType !== 1) return;
              resizeObserver.current?.unobserve(node as Element);
            });
          }
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

    // 仅在「重挂载且内容自上次挂载已增长」时主动补一次跟随；首次挂载不主动滚动，
    // 避免 isPinned 默认为 true 导致首屏被强制吸到底，破坏下游组件的初始展示
    if (hasMountedRef.current) {
      const grewDuringRemount = currentScrollHeight > previousBaseline;
      if (isPinned.current && grewDuringRemount) {
        jumpToBottom();
      } else {
        // 通知状态变化（脱离 / 贴底切换），但不强制滚动
        notifyState();
      }
    }
    hasMountedRef.current = true;

    return () => {
      mutationObserver.current?.disconnect();
      resizeObserver.current?.disconnect();
      mutationObserver.current = null;
      resizeObserver.current = null;
    };
  }, [onContentChange, jumpToBottom, notifyState, depsKey]);

  // 卸载时清理动画 + RAF 合并句柄 + 程序滚动复位句柄
  useEffect(() => {
    return () => {
      cancelAnimation();
      if (contentChangeRaf.current !== null) {
        cancelAnimationFrame(contentChangeRaf.current);
        contentChangeRaf.current = null;
      }
      if (programmaticResetRaf.current !== null) {
        cancelAnimationFrame(programmaticResetRaf.current);
        programmaticResetRaf.current = null;
      }
    };
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

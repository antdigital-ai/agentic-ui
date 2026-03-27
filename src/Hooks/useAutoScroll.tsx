import { useEffect, useRef } from 'react';
import { useThrottleFn } from './useThrottleFn';

const SCROLL_TOLERANCE = 20;

/**
 * useAutoScroll Hook - 自动滚动 Hook
 *
 * 该 Hook 提供自动滚动功能，当容器内容增加时自动滚动到底部。
 * 支持用户滚动锁定检测、DOM 变化监听、手动滚动等功能。
 *
 * @description 自动滚动 Hook，提供智能滚动到底部功能
 * @template T - HTMLDivElement 类型
 * @param {Object} props - Hook 配置参数
 * @param {number} [props.SCROLL_TOLERANCE=20] - 滚动到底部的容差阈值
 * @param {(size: {width: number, height: number}) => void} [props.onResize] - 容器尺寸变化回调
 * @param {any[]} [props.deps] - 依赖数组，用于重新初始化 MutationObserver
 * @param {number} [props.timeout=160] - 节流时间间隔（毫秒）
 * @param {'smooth' | 'auto'} [props.scrollBehavior='smooth'] - 自动滚动行为，'smooth' 为平滑滚动，'auto' 为立即滚动（仅影响自动滚动，手动滚动默认为立即滚动）
 *
 * @example
 * ```tsx
 * // 基本用法（默认平滑滚动）
 * const { containerRef, scrollToBottom } = useAutoScroll({
 *   SCROLL_TOLERANCE: 30,
 *   onResize: () => {},
 *   timeout: 200
 * });
 *
 * // 立即滚动
 * const { containerRef, scrollToBottom } = useAutoScroll({
 *   scrollBehavior: 'auto',
 * });
 *
 * // 手动滚动默认为立即滚动，无需平滑滚动
 * scrollToBottom(); // 立即滚动
 * ```
 *
 * @returns {Object} Hook 返回值
 * @returns {React.RefObject<T>} returns.containerRef - 容器引用
 * @returns {() => void} returns.scrollToBottom - 手动滚动到底部方法（立即滚动，无动画）
 *
 * @remarks
 * - 自动检测内容变化并滚动到底部
 * - 支持用户滚动锁定检测
 * - 使用 MutationObserver 监听 DOM 变化
 * - 提供节流功能避免频繁滚动
 * - 支持手动触发滚动
 * - 智能判断是否应该自动滚动
 * - 提供容器尺寸变化回调
 */
export const useAutoScroll = <T extends HTMLDivElement>(
  props: {
    SCROLL_TOLERANCE?: number;
    onResize?: (size: { width: number; height: number }) => void;
    deps?: any[];
    timeout?: number;
    scrollBehavior?: 'smooth' | 'auto';
  } = {
    SCROLL_TOLERANCE,
  },
) => {
  const containerRef = useRef<T | null>(null);
  const lastScrollHeight = useRef(0);
  /**
   * 记录自动滚动是否处于激活状态（即用户没有主动向上滚动）。
   * 在 smooth scroll 动画过程中 scrollTop 尚未到达目标值，如果此时有新内容
   * 进来，isNearBottom 可能因 scrollTop 还在动画中途而误判为 false，导致
   * 漏掉最后一次滚动。用此标志可以安全地跨帧维持"应该跟底"的意图。
   */
  const isAutoScrollEngaged = useRef(true);
  const observer = useRef<MutationObserver | null>(null);

  const tolerance = props?.SCROLL_TOLERANCE ?? SCROLL_TOLERANCE;

  // 主滚动逻辑
  const _checkScroll = async (force = false, behavior?: 'smooth' | 'auto') => {
    const container = containerRef.current;
    if (!container) return;

    props.onResize?.({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const currentScrollHeight = container.scrollHeight;
    const prevScrollHeight = lastScrollHeight.current;

    // 使用当前 scrollHeight 判断是否靠近底部，避免 smooth 动画中 scrollTop
    // 尚未到达目标时的误判。
    const isNearBottom =
      container.scrollTop + container.clientHeight >=
      currentScrollHeight - tolerance;

    const shouldScroll =
      force ||
      (currentScrollHeight > prevScrollHeight &&
        (isNearBottom || isAutoScrollEngaged.current));

    if (shouldScroll && container.scrollTo) {
      const scrollBehavior =
        behavior !== undefined ? behavior : props.scrollBehavior || 'smooth';
      container.scrollTo({
        top: currentScrollHeight,
        behavior: scrollBehavior,
      });
      isAutoScrollEngaged.current = true;
    } else if (!isNearBottom) {
      // 用户已经向上滚动远离底部，关闭自动跟随
      isAutoScrollEngaged.current = false;
    }

    lastScrollHeight.current = currentScrollHeight;
  };

  const checkScroll = useThrottleFn(_checkScroll, props.timeout || 160);

  // 监听用户手动滚动，判断其是否离开了底部
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - tolerance;
      if (atBottom) {
        isAutoScrollEngaged.current = true;
      } else {
        isAutoScrollEngaged.current = false;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [...(props.deps || [])]);

  // DOM 变化监听（MutationObserver）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observer.current = new MutationObserver((mutations) => {
      const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
      if (hasAddedNodes) checkScroll?.();
    });

    observer.current.observe(container, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });

    return () => observer.current?.disconnect();
  }, [...(props.deps || [])]);

  // 暴露手动滚动方法（默认为立即滚动，无需平滑滚动）
  const scrollToBottom = () => {
    checkScroll?.(true, 'auto');
  };

  return {
    containerRef,
    scrollToBottom,
  } as const;
};

export default useAutoScroll;

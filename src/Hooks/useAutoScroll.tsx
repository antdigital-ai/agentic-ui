import { useEffect, useRef } from 'react';
import { useThrottleFn } from './useThrottleFn';

const SCROLL_TOLERANCE = 20; // 滚动到底部的容差阈值

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
  const isLocked = useRef(false); // 用户滚动锁定状态
  const observer = useRef<MutationObserver | null>(null);

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

    // 计算用户是否在底部区域
    const isNearBottom =
      container.scrollTop + container.clientHeight >=
      prevScrollHeight - (props?.SCROLL_TOLERANCE || SCROLL_TOLERANCE);

    // 触发滚动的情况：
    // 1. 强制滚动（手动触发）
    // 2. 内容高度增加且用户原本在底部
    const shouldScroll =
      force ||
      (currentScrollHeight > prevScrollHeight &&
        (isNearBottom || isLocked.current));

    if (shouldScroll && container.scrollTo) {
      // 如果传入了 behavior，使用传入的值；否则使用配置的 scrollBehavior；最后默认为 'smooth'
      const scrollBehavior =
        behavior !== undefined ? behavior : props.scrollBehavior || 'smooth';
      container.scrollTo?.({
        top: currentScrollHeight,
        behavior: scrollBehavior,
      });
      isLocked.current = false; // 滚动后解除锁定
    }

    lastScrollHeight.current = currentScrollHeight;
  };
  const checkScroll = useThrottleFn(_checkScroll, props.timeout || 160);
  // DOM 变化监听（MutationObserver）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observer.current = new MutationObserver((mutations) => {
      // 过滤出添加节点的变化
      const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
      if (hasAddedNodes) checkScroll?.();
    });

    observer.current.observe(container, {
      childList: true, // 监听子元素变化
      subtree: true, // 监听所有后代
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

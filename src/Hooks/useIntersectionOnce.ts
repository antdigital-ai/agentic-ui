import {
  RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface UseIntersectionOnceOptions extends Omit<
  IntersectionObserverInit,
  'root'
> {
  root?: RefObject<Element | null> | Element | null;
}

/**
 * SSR 安全的 useLayoutEffect：服务端渲染时退化为 useEffect，
 * 避免 React 的 "useLayoutEffect does nothing on the server" 警告
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * useIntersectionOnce Hook - 元素进入视口"一次性"检测
 *
 * 检测 targetRef 引用的元素是否进入了 root（默认 viewport）的可视区域，
 * 一旦进入则永久返回 true，并断开 observer，常用于懒加载 / 首屏曝光埋点。
 *
 * @remarks
 * - SSR 安全：服务端 useLayoutEffect 退化为 useEffect，避免 hydration 警告
 * - 不支持 IntersectionObserver 的环境（旧浏览器 / SSR）下直接置 true，
 *   保证业务能拿到内容（如懒加载组件不至于永远不渲染）
 * - threshold 数组与 rootMargin 字符串通过 JSON.stringify 序列化为稳定 deps key，
 *   避免父组件每次渲染传新对象时 effect 反复重建
 */
export const useIntersectionOnce = <T extends Element>(
  targetRef: RefObject<T>,
  options: UseIntersectionOnceOptions = {},
) => {
  const { root, rootMargin, threshold } = options;
  const [isIntersecting, setIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * 把 threshold 序列化为稳定 key：threshold 既可能是 number 也可能是 number[]，
   * 父组件每次渲染传 `[0, 0.5, 1]` 这种新数组会触发 effect 反复重建。
   * 序列化后只要值相同就能拿到相同 deps key。
   */
  const thresholdKey = useMemo(() => {
    if (threshold === undefined) return '';
    return JSON.stringify(threshold);
  }, [threshold]);

  // 初始检查：在 DOM 更新后立即检查元素是否已经在视口内（SSR 安全版本）
  useIsomorphicLayoutEffect(() => {
    if (isIntersecting) return;
    // SSR 短路：服务端没有 window/getBoundingClientRect，直接置 true
    if (typeof window === 'undefined') {
      setIntersecting(true);
      return;
    }

    const element = targetRef.current;
    if (!element) return;

    // 检查元素是否已经在视口内
    const rect = element.getBoundingClientRect();
    const resolvedRoot =
      root && 'current' in root ? root.current : (root as Element | null);
    const rootElement =
      resolvedRoot ||
      (typeof document !== 'undefined' ? document.documentElement : null);

    let shouldSetIntersecting = false;

    if (!rootElement) {
      // 如果没有 root，使用 viewport 检查
      shouldSetIntersecting =
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0;
    } else {
      // 如果有 root，检查是否在 root 内
      const rootRect = rootElement.getBoundingClientRect();
      shouldSetIntersecting =
        rect.top < rootRect.bottom &&
        rect.bottom > rootRect.top &&
        rect.left < rootRect.right &&
        rect.right > rootRect.left;
    }

    if (shouldSetIntersecting) {
      setIntersecting(true);
    }
  }, [targetRef, root, isIntersecting]);

  // 设置 IntersectionObserver 监听元素进入视口
  useEffect(() => {
    if (isIntersecting) return;

    const element = targetRef.current;
    if (!element) return;

    // 浏览器不支持 IntersectionObserver（旧浏览器 / 测试环境）：直接置 true，
    // 避免懒加载内容永远不渲染
    if (typeof IntersectionObserver === 'undefined') {
      setIntersecting(true);
      return;
    }

    const resolvedRoot =
      root && 'current' in root ? root.current : (root as Element | null);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIntersecting(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { rootMargin, threshold, root: resolvedRoot ?? null },
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
    // 用 thresholdKey 替代 threshold（数组引用每次新建会导致 effect 反复重建）；
    // rootMargin 是字符串原始值，引用稳定，可直接进 deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, rootMargin, thresholdKey, root, isIntersecting]);

  return isIntersecting;
};

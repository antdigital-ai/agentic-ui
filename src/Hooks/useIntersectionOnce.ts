import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface UseIntersectionOnceOptions
  extends Omit<IntersectionObserverInit, 'root'> {
  root?: RefObject<Element | null> | Element | null;
}

export const useIntersectionOnce = <T extends Element>(
  targetRef: RefObject<T>,
  options: UseIntersectionOnceOptions = {},
) => {
  const { root, ...restOptions } = options;
  const [isIntersecting, setIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 初始检查：在 DOM 更新后立即检查元素是否已经在视口内
  useLayoutEffect(() => {
    if (isIntersecting) return;

    const element = targetRef.current;
    if (!element) return;

    if (typeof window === 'undefined') {
      setIntersecting(true);
      return;
    }

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
      { ...restOptions, root: resolvedRoot ?? null },
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [
    targetRef,
    restOptions.rootMargin,
    restOptions.threshold,
    root,
    isIntersecting,
  ]);

  return isIntersecting;
};

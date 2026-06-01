import { useCallback, useEffect, useRef, useState } from 'react';

type ScrollState = {
  vertical: {
    hasScroll: boolean;
    isAtStart: boolean;
    isAtEnd: boolean;
  };
  horizontal: {
    hasScroll: boolean;
    isAtStart: boolean;
    isAtEnd: boolean;
  };
};

const useSmartScrollShadow = (sensitivity = 1) => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    vertical: { hasScroll: false, isAtStart: true, isAtEnd: true },
    horizontal: { hasScroll: false, isAtStart: true, isAtEnd: true },
  });

  const elementRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>();

  const checkScroll = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    // 垂直方向检测
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const scrollTop = element.scrollTop;

    // 水平方向检测
    const scrollWidth = element.scrollWidth;
    const clientWidth = element.clientWidth;
    const scrollLeft = element.scrollLeft;

    setScrollState({
      vertical: {
        hasScroll: scrollHeight > clientHeight + sensitivity,
        isAtStart: scrollTop <= sensitivity,
        isAtEnd: scrollTop + clientHeight >= scrollHeight - sensitivity,
      },
      horizontal: {
        hasScroll: scrollWidth > clientWidth + sensitivity,
        isAtStart: scrollLeft <= sensitivity,
        isAtEnd: scrollLeft + clientWidth >= scrollWidth - sensitivity,
      },
    });
  }, [sensitivity]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof ResizeObserver === 'undefined') return;

    const element = elementRef.current;
    if (!element) return;

    const throttledCheck = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        checkScroll();
        rafId.current = undefined;
      });
    };

    const observer = new ResizeObserver(throttledCheck);
    observer.observe(element);
    element.addEventListener('scroll', throttledCheck, { passive: true });

    // 初始检测
    checkScroll();

    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', throttledCheck);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [checkScroll]);

  return [elementRef, scrollState] as const;
};

export default useSmartScrollShadow;

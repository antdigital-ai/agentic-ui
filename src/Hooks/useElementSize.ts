import { useCallback, useEffect, useRef, useState } from 'react';

interface ElementSize {
  width: number;
  height: number;
}

const EMPTY_SIZE: ElementSize = { width: 0, height: 0 };

const readElementSize = (target: Element): ElementSize => {
  const rect = target.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
};

const readResizeObserverEntrySize = (entry: ResizeObserverEntry): ElementSize => {
  const borderBox = entry.borderBoxSize?.[0];
  return {
    width: borderBox?.inlineSize ?? entry.contentRect.width,
    height: borderBox?.blockSize ?? entry.contentRect.height,
  };
};

const isSameSize = (prev: ElementSize, next: ElementSize) =>
  prev.width === next.width && prev.height === next.height;

/**
 * useElementSize Hook - 监听元素的实时宽高
 *
 * @description
 * - 返回 callback ref，在节点挂载/卸载时自动绑定，无需 layout effect 同步 ref
 * - SSR / 旧浏览器（无 ResizeObserver）下安全降级：回退到 getBoundingClientRect
 * - 兼容 Safari 13 / 旧 jsdom：当 `entry.borderBoxSize` 不存在时回退到 `contentRect`
 * - observe 后立即做一次同步测量，避免 ResizeObserver 首帧不回调导致高度为 0
 * - ResizeObserver 回调经 RAF 合并，同一帧内多次 resize 只触发一次 setState
 *
 * @returns callback ref 与元素当前的 `{ width, height }`
 */
export const useElementSize = <T extends Element = Element>() => {
  const [observedElement, setObservedElement] = useState<T | null>(null);
  const [size, setSize] = useState(EMPTY_SIZE);
  const resizeRafRef = useRef<number | null>(null);

  const ref = useCallback((node: T | null) => {
    setObservedElement((prev) => (prev === node ? prev : node));
  }, []);

  useEffect(() => {
    if (!observedElement) {
      setSize(EMPTY_SIZE);
      return;
    }

    const commitSize = (nextSize: ElementSize) => {
      setSize((prev) => (isSameSize(prev, nextSize) ? prev : nextSize));
    };

    const scheduleSizeUpdate = (nextSize: ElementSize) => {
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
      }
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;
        commitSize(nextSize);
      });
    };

    if (typeof ResizeObserver === 'undefined') {
      commitSize(readElementSize(observedElement));
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      scheduleSizeUpdate(readResizeObserverEntrySize(entry));
    });
    resizeObserver.observe(observedElement);
    // 首帧同步测量；后续 resize 走 RAF 合并
    commitSize(readElementSize(observedElement));

    return () => {
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
      resizeObserver.disconnect();
    };
  }, [observedElement]);

  return { ref, width: size.width, height: size.height };
};

import { RefObject, useEffect, useState } from 'react';

/**
 * useElementSize Hook - 监听元素的实时宽高
 *
 * @description
 * - SSR / 旧浏览器（无 ResizeObserver）下安全降级：直接返回初始 `{0, 0}` 不抛错
 * - 兼容 Safari 13 / 旧 jsdom：当 `entry.borderBoxSize` 不存在时回退到 `contentRect`
 *
 * @param element - 目标元素的 ref
 * @returns 元素当前的 `{ width, height }`
 */
export const useElementSize = (element: RefObject<Element | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!element.current) return;
    // SSR 或旧浏览器无 ResizeObserver：安全跳过，不抛 ReferenceError
    if (typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      // Safari 13 / 旧 jsdom 不支持 borderBoxSize，回退到 contentRect
      const borderBox = entry.borderBoxSize?.[0];
      const width = borderBox?.inlineSize ?? entry.contentRect.width;
      const height = borderBox?.blockSize ?? entry.contentRect.height;
      setSize({ width, height });
    });
    resizeObserver.observe(element.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [element]);

  return size;
};

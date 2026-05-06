import { RefObject, useEffect, useState } from 'react';

/**
 * useElementSize Hook - 监听元素的实时宽高
 *
 * @description
 * - SSR / 旧浏览器（无 ResizeObserver）下安全降级：直接返回初始 `{0, 0}` 不抛错
 * - 兼容 Safari 13 / 旧 jsdom：当 `entry.borderBoxSize` 不存在时回退到 `contentRect`
 * - 在每次渲染时把 `element.current` 同步到本地 state，effect 依赖该 state，
 *   从而能感知到 ref.current 被替换（如父组件根据条件渲染不同 DOM 节点的场景）。
 *   单纯依赖 `element`（ref 对象本身引用稳定）会导致 effect 永远不重建。
 *
 * @param element - 目标元素的 ref
 * @returns 元素当前的 `{ width, height }`
 */
export const useElementSize = (element: RefObject<Element | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  // 用 state 持有当前 ref 指向的 DOM 节点 —— 当父组件把 ref 指向不同节点时，
  // 渲染期间发现差异即触发 setState，下一次 effect 就能 observe 新节点。
  // 注意：这里读 element.current 不会破坏 React 严格模式（ref 读不算副作用），
  // 但 setState 必须放进条件分支只在变化时触发，否则会无限渲染。
  const [observedElement, setObservedElement] = useState<Element | null>(
    () => element.current ?? null,
  );
  if (element.current !== observedElement) {
    setObservedElement(element.current ?? null);
  }

  useEffect(() => {
    if (!observedElement) return;
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
    resizeObserver.observe(observedElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [observedElement]);

  return size;
};

import React from 'react';
import { EXTRA_SCROLL_OFFSET } from '../constants';

/**
 * 检测文本是否溢出，并为溢出的元素写入用于 CSS 动画的 CSS 变量。
 *
 * 之前内联在 HistoryItem.tsx 顶部，作为 hook 既不利于单测、也无法被其他组件复用。
 * 提到独立文件后职责单一，HistoryItem 只需 import 使用。
 *
 * 触发重算的时机：
 * 1. `text` 内容变化（必然要重新测）
 * 2. 容器尺寸变化（窗口 resize、布局抖动等）—— 通过 ResizeObserver 监听 textRef
 *    在不支持 ResizeObserver 的环境（老浏览器、部分 jsdom 版本）下静默跳过，
 *    退化为「仅 text 变化时重算」的旧行为，不会阻断使用。
 *
 * @param text 需要监测溢出的文本内容；变化时会重新计算
 * @returns `textRef` 挂到目标 DOM；`isTextOverflow` 表示当前是否溢出
 */
export const useTextOverflow = (text: React.ReactNode) => {
  const textRef = React.useRef<HTMLDivElement>(null);
  const [isTextOverflow, setIsTextOverflow] = React.useState(false);

  // 把测量逻辑提到 useCallback，方便 layoutEffect 与 ResizeObserver 共用同一份实现
  const measure = React.useCallback(() => {
    const el = textRef.current;
    if (!el) return;

    const isOverflow = el.scrollWidth > el.clientWidth;
    // 仅在溢出状态变化时更新，避免冗余渲染
    setIsTextOverflow((prev) => (prev === isOverflow ? prev : isOverflow));
    el.setAttribute('data-overflow', String(isOverflow));

    if (isOverflow) {
      const scrollDistance = -(
        el.scrollWidth -
        el.clientWidth +
        EXTRA_SCROLL_OFFSET
      );
      el.style.setProperty('--scroll-width', `${scrollDistance}px`);
      // 根据滚动距离动态计算动画时长，保持恒定滚动速度（每 100px 约 1.5s）
      const duration = Math.max(2, (Math.abs(scrollDistance) / 100) * 1.5);
      el.style.setProperty('--scroll-duration', `${duration}s`);
    }
  }, []);

  React.useLayoutEffect(() => {
    measure();
  }, [text, measure]);

  React.useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    // 环境特性检测：ResizeObserver 在现代浏览器普遍支持，但 jsdom 旧版 / 老浏览器没有
    if (
      typeof window === 'undefined' ||
      typeof window.ResizeObserver !== 'function'
    ) {
      return;
    }
    const observer = new window.ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return { textRef, isTextOverflow };
};

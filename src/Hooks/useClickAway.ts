import { useEffect, useLayoutEffect, useRef } from 'react';

/** 触发外部点击判定的事件名（同时覆盖鼠标 + 触屏，避免移动端不响应） */
const MOUSE_EVENT = 'mousedown';
const TOUCH_EVENT = 'touchstart';

/** 外部点击事件的联合类型，兼容鼠标与触屏 */
export type ClickAwayEvent = MouseEvent | TouchEvent;
/** 外部点击回调签名 */
export type ClickAwayCallback = (event: ClickAwayEvent) => void;

/**
 * useClickAway Hook - 点击/触屏外部区域检测 Hook
 *
 * 检测用户是否点击/触摸了指定元素**外部**的区域，常用于下拉菜单、弹出层等的自动关闭。
 *
 * @description 监听 `mousedown` + `touchstart` 全局事件，命中外部时触发回调
 * @param callback - 点击外部区域时的回调函数
 * @param ref - 被监听的元素引用
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useClickAway((e) => setOpen(false), ref);
 * return <div ref={ref}>...</div>;
 * ```
 *
 * @remarks
 * - 同时监听 `mousedown` + `touchstart`，移动端 / 桌面端均可工作
 * - 通过 `ref.current.contains` 判断点击目标是否在容器内部；切勿用 `parentNode.contains`，
 *   否则点击同级兄弟节点会被误判为内部，导致"点外面关闭"的关闭逻辑失效
 * - callback 通过 ref 持有最新引用，listener 不会因 callback 引用变化而频繁重绑
 * - 组件卸载时自动清理事件监听
 */
export const useClickAway = (
  callback: ClickAwayCallback,
  ref: React.RefObject<HTMLElement | null>,
) => {
  // 用 ref 持有最新 callback，避免 listener 因 callback 引用变化频繁解绑/重绑
  // useLayoutEffect 在 commit 阶段同步写，确保事件触发时拿到的一定是最新版本
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const listener = (event: ClickAwayEvent) => {
      const target = event.target as Node | null;
      // 仅当点击目标在 ref 容器内部时跳过
      if (!ref?.current || !target || ref.current.contains(target)) {
        return;
      }
      callbackRef.current(event);
    };

    // passive: true 表明不会调用 preventDefault，让浏览器走快速滚动通道
    document.addEventListener(MOUSE_EVENT, listener);
    document.addEventListener(TOUCH_EVENT, listener, { passive: true });
    return () => {
      document.removeEventListener(MOUSE_EVENT, listener);
      document.removeEventListener(TOUCH_EVENT, listener);
    };
    // 仅依赖 ref，callback 通过 ref 持有，避免 listener 反复重绑
  }, [ref]);
};

export default useClickAway;

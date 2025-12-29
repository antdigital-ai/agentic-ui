import { useEffect } from 'react';

const EVENT = 'mousedown';

/**
 * useClickAway Hook - 点击外部区域检测 Hook
 *
 * 该 Hook 用于检测用户是否点击了指定元素外部的区域，常用于实现下拉菜单、
 * 弹出层等组件的自动关闭功能。
 *
 * @description 点击外部区域检测 Hook，用于实现组件外部点击关闭功能
 * @param {Function} callback - 点击外部区域时的回调函数
 * @param {React.RefObject<HTMLDivElement>} ref - 被监听的元素引用
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 *
 * useClickAway(() => {
 *   console.log('点击了外部区域');
 *   setOpen(false);
 * }, ref);
 *
 * return (
 *   <div ref={ref}>
 *     <button onClick={() => setOpen(true)}>打开菜单</button>
 *     {open && <div>菜单内容</div>}
 *   </div>
 * );
 * ```
 *
 * @remarks
 * - 自动监听全局 mousedown 事件
 * - 智能判断点击目标是否在指定元素内部
 * - 支持父节点包含检测
 * - 组件卸载时自动清理事件监听
 * - 适用于下拉菜单、弹出层等场景
 */
export const useClickAway = (
  callback: any,
  ref: React.RefObject<HTMLDivElement>,
) => {
  useEffect(() => {
    /**
     * 鼠标点击事件的监听函数
     *
     * @param event - 鼠标点击事件对象
     */
    const listener = (event: { target: any }) => {
      // 如果ref为null或ref.current为null，或者ref.current包含事件目标元素，则不做任何操作
      if (
        !ref ||
        !ref.current ||
        ref.current.contains(event.target) ||
        ref.current.parentNode?.contains(event.target)
      ) {
        return;
      }
      // 执行回调函数，并传递事件对象
      callback(event);
    };
    // 监听全局鼠标点击事件，并执行listener函数
    document.addEventListener(EVENT, listener);
    // 在组件卸载时，移除鼠标点击事件监听
    return () => {
      document.removeEventListener(EVENT, listener);
    };
  }, [ref, callback]);
};

export default useClickAway;

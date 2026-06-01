import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * useThrottleFn Hook - 节流函数 Hook
 *
 * 在指定的 interval 时间窗口内最多执行一次 fn。首次调用立即执行；
 * 窗口期内的后续调用会被合并为一次延迟执行（取最后一次的参数与 this）。
 *
 * @description 节流函数 hook，常用于高频事件（resize、scroll、mousemove）的频率控制
 * @template T - 被包装函数的参数类型元组
 * @param fn - 需要节流的函数，可同步可异步
 * @param interval - 节流时间窗口（ms），默认 100
 * @returns 节流后的函数，引用恒定，不会因 fn 重建而变化
 *
 * @remarks
 * - 通过 useLayoutEffect 同步保存最新 fn 引用，避免 R18 并发渲染下被丢弃的渲染版本污染 ref
 * - 返回函数在 unmount 时会自动清理 pending timeout
 */
export function useThrottleFn<T extends any[]>(
  fn: (...args: T) => any,
  interval = 100,
) {
  // 用 useLayoutEffect 同步在 commit 阶段写入最新 fn，避免渲染期写 ref 反模式
  const fnRef = useRef(fn);
  useLayoutEffect(() => {
    fnRef.current = fn;
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<T | null>(null);
  const lastThisRef = useRef<unknown>(null);
  const lastCallRef = useRef(0);

  const throttledFn = useCallback(
    function (this: unknown, ...args: T) {
      const now = Date.now();
      const remainingTime = interval - (now - lastCallRef.current);

      lastArgsRef.current = args;
      lastThisRef.current = this;

      if (remainingTime <= 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        lastCallRef.current = now;
        fnRef.current.apply(lastThisRef.current, lastArgsRef.current);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          timeoutRef.current = null;
          if (lastArgsRef.current) {
            fnRef.current.apply(lastThisRef.current, lastArgsRef.current);
          }
        }, remainingTime);
      }
    },
    [interval],
  );

  // 卸载时清理 pending timeout，避免 unmount 后还触发回调导致内存泄漏 / setState on unmounted
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return throttledFn;
}

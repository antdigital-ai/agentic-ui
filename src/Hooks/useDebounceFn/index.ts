import { useCallback, useEffect, useRef } from 'react';
import { useRefFunction } from '../useRefFunction';

/**
 * useDebounceFn Hook - 去抖函数 Hook
 *
 * 创建一个去抖的函数，连续触发期间仅在最后一次触发后等待 `wait` 毫秒才真正执行 fn。
 *
 * @description 去抖函数 hook，常用于搜索框输入、表单校验等高频输入场景
 * @template T - 被包装函数的参数类型元组
 * @template U - 被包装函数的返回值（resolved value）类型
 * @param fn - 需要去抖的异步或同步函数
 * @param wait - 去抖等待时间（ms）；为 0 或 undefined 时立即执行（仍会先 cancel 上次 pending）
 * @returns `{ run, cancel }`，`run` 返回 Promise，`cancel` 主动取消未触发的调用
 *
 * @remarks
 * - `cancel()` 会 resolve 上一次的 Promise 为 undefined，避免调用方 `await` 永久挂起
 * - 仅在 unmount 时自动 cancel；`cancel` 引用变化不会触发清理（避免误取消）
 */
export function useDebounceFn<T extends any[], U = any>(
  fn: (...args: T) => U | Promise<U>,
  wait?: number,
) {
  const callback = useRefFunction(fn);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 持有上一次 pending Promise 的 resolver，cancel 时调用它结束 Promise，避免泄漏
  const pendingResolveRef = useRef<((value: U | undefined) => void) | null>(
    null,
  );

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    // 主动 settle 上一次 pending 的 Promise，否则 await run() 会永远挂起 + 闭包持有 args 无法 GC
    if (pendingResolveRef.current) {
      pendingResolveRef.current(undefined);
      pendingResolveRef.current = null;
    }
  }, []);

  const run = useCallback(
    (...args: T): Promise<U | undefined> => {
      // wait 为 0 或 undefined：立即执行，但仍需先 cancel 上一次 pending 的 timer，
      // 否则旧 timer 会在 wait 变化后继续触发，造成"幽灵执行"
      if (wait === 0 || wait === undefined) {
        cancel();
        return Promise.resolve(callback(...args)) as Promise<U | undefined>;
      }
      cancel();
      return new Promise<U | undefined>((resolve) => {
        pendingResolveRef.current = resolve;
        timer.current = setTimeout(async () => {
          const localResolve = pendingResolveRef.current;
          pendingResolveRef.current = null;
          timer.current = null;
          const value = await callback(...args);
          localResolve?.(value);
        }, wait);
      });
    },
    [callback, cancel, wait],
  );

  // 仅在 unmount 时清理；不可依赖 cancel — cancel 引用变化（wait 变化时）会误取消上一次未执行的请求
  useEffect(() => {
    return () => {
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    run,
    cancel,
  };
}

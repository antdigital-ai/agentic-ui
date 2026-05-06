import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * useRefFunction Hook - 稳定函数引用 Hook
 *
 * 创建一个引用恒定的函数包装器，包装器内部始终调用最新一次渲染传入的函数实现，
 * 从而避免父组件重渲染时把"新函数引用"透传给子组件，造成子组件不必要的重新渲染。
 *
 * @description 稳定的函数引用包装器，等价于 React 团队推荐的 latestRef 模式
 * @template T - 被包装函数的类型
 * @param {T} reFunction - 当前渲染要保存的最新函数实现
 * @returns {T} 引用恒定的函数包装器，可安全作为子组件 prop 或 effect deps
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const [count, setCount] = useState(0);
 *   const handleClick = useRefFunction((value: number) => {
 *     setCount(count + value);
 *   });
 *   return <ChildComponent onClick={handleClick} />;
 * };
 * ```
 *
 * @remarks
 * - 不可在渲染期间同步调用返回的包装器，effect/事件回调中使用是安全的
 * - 用 useLayoutEffect 而非渲染期写 ref，避免 R18 并发渲染下被丢弃的渲染版本污染 ref
 */
const useRefFunction = <T extends (...args: any[]) => any>(reFunction: T) => {
  // 用 null 初始化但通过 useLayoutEffect 在 commit 阶段同步写入，避免渲染期写 ref。
  // useLayoutEffect 在 DOM 更新后、浏览器 paint 前同步执行，能保证 effect/事件
  // 回调里读取的 ref 永远是最新版本。
  const ref = useRef<T | null>(null);
  useLayoutEffect(() => {
    ref.current = reFunction;
  });
  return useCallback((...rest: Parameters<T>): ReturnType<T> => {
    // 包装器在 mount 之前被同步调用是反模式（渲染期），此时 ref.current 为 null，
    // 用类型断言抛出更明确的错误，避免静默返回 undefined 与签名声明的 ReturnType<T> 不符。
    if (ref.current === null) {
      throw new Error(
        '[useRefFunction] called before mount — do not call the wrapper during render',
      );
    }
    return ref.current(...rest);
  }, []);
};

export { useRefFunction };

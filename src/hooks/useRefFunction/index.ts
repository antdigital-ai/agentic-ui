import { useCallback, useRef } from 'react';

/**
 * useRefFunction Hook - 函数引用 Hook
 *
 * 该 Hook 用于创建一个稳定的函数引用，避免因为函数重新创建导致的子组件不必要的重新渲染。
 * 通过 useRef 保存最新的函数引用，同时使用 useCallback 返回稳定的函数。
 *
 * @description 函数引用 Hook，用于创建稳定的函数引用避免子组件重新渲染
 * @template T - 函数类型
 * @param {T} reFunction - 需要创建引用的函数
 * @returns {T} 稳定的函数引用
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const [count, setCount] = useState(0);
 *
 *   // 使用 useRefFunction 创建稳定的函数引用
 *   const handleClick = useRefFunction((value: number) => {
 *     console.log('点击了:', value);
 *     setCount(count + value);
 *   });
 *
 *   return (
 *     <div>
 *       <p>计数: {count}</p>
 *       <ChildComponent onClick={handleClick} />
 *     </div>
 *   );
 * };
 * ```
 *
 * @remarks
 * - 避免函数重新创建导致的子组件重新渲染
 * - 保持函数引用的稳定性
 * - 适用于需要传递给子组件的回调函数
 * - 使用 useRef 保存最新函数引用
 * - 使用 useCallback 返回稳定函数
 */
const useRefFunction = <T extends (...args: any) => any>(reFunction: T) => {
  const ref = useRef<any>(null);
  ref.current = reFunction;
  return useCallback((...rest: Parameters<T>): ReturnType<T> => {
    return ref.current?.(...(rest as any));
  }, []);
};

export { useRefFunction };

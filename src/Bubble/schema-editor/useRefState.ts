import { useState, useRef, useCallback, MutableRefObject } from 'react';

/**
 * useRefState - 同时维护 state 和 ref 的 hook
 * @description 解决 setState 后立即读取 ref 得到旧值的问题
 *
 * @param initialValue - 初始值
 * @returns [state, setState, ref] - state 用于渲染，setState 同步更新 ref，ref 用于回调
 *
 * @example
 * ```tsx
 * const [content, setContent, contentRef] = useRefState('');
 *
 * const handler = {
 *   getContent: () => contentRef.current,  // 始终是最新值
 *   setContent: (val) => {
 *     setContent(val);  // 立即更新 ref
 *     // 此时 contentRef.current 已经是新值了
 *   }
 * };
 * ```
 */
export function useRefState<T>(
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, MutableRefObject<T>] {
  const [state, setState] = useState(initialValue);
  const ref = useRef(initialValue);

  // 每次渲染也同步（处理外部直接读取 state 后变化的情况）
  ref.current = state;

  const setRefState = useCallback((value: T | ((prev: T) => T)) => {
    const newValue =
      typeof value === 'function'
        ? (value as (prev: T) => T)(ref.current)
        : value;

    ref.current = newValue; // 立即更新 ref
    setState(newValue); // 触发重渲染
  }, []);

  return [state, setRefState, ref];
}

export default useRefState;


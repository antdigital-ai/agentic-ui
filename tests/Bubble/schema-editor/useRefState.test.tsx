import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRefState } from '../../../src/Bubble/schema-editor/useRefState';

describe('useRefState', () => {
  describe('初始化', () => {
    it('应该正确初始化 state 和 ref', () => {
      const { result } = renderHook(() => useRefState('initial'));

      const [state, , ref] = result.current;

      expect(state).toBe('initial');
      expect(ref.current).toBe('initial');
    });

    it('应该支持不同类型的初始值', () => {
      const { result: stringResult } = renderHook(() => useRefState('string'));
      const { result: numberResult } = renderHook(() => useRefState(42));
      const { result: objectResult } = renderHook(() =>
        useRefState({ key: 'value' }),
      );
      const { result: arrayResult } = renderHook(() => useRefState([1, 2, 3]));

      expect(stringResult.current[0]).toBe('string');
      expect(numberResult.current[0]).toBe(42);
      expect(objectResult.current[0]).toEqual({ key: 'value' });
      expect(arrayResult.current[0]).toEqual([1, 2, 3]);
    });
  });

  describe('setState 更新', () => {
    it('应该同时更新 state 和 ref', () => {
      const { result } = renderHook(() => useRefState('initial'));

      act(() => {
        result.current[1]('updated');
      });

      const [state, , ref] = result.current;

      expect(state).toBe('updated');
      expect(ref.current).toBe('updated');
    });

    it('ref 应该在 setState 后立即更新（同步）', () => {
      const { result } = renderHook(() => useRefState('initial'));

      /** 在 act 内部验证 ref 是否立即更新 */
      act(() => {
        const [, setState, ref] = result.current;
        setState('updated');
        /** 关键：set 后立即读取 ref 应该是新值 */
        expect(ref.current).toBe('updated');
      });
    });

    it('应该支持函数式更新', () => {
      const { result } = renderHook(() => useRefState(0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);
      expect(result.current[2].current).toBe(1);

      act(() => {
        result.current[1]((prev) => prev * 2);
      });

      expect(result.current[0]).toBe(2);
      expect(result.current[2].current).toBe(2);
    });

    it('函数式更新中 prev 应该始终是最新值', () => {
      const { result } = renderHook(() => useRefState(0));

      act(() => {
        const [, setState] = result.current;
        /** 连续调用多次 */
        setState((prev) => prev + 1);
        setState((prev) => prev + 1);
        setState((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(3);
      expect(result.current[2].current).toBe(3);
    });
  });

  describe('ref 同步', () => {
    it('每次渲染后 ref.current 应该与 state 同步', () => {
      const { result, rerender } = renderHook(() => useRefState('initial'));

      rerender();

      const [state, , ref] = result.current;
      expect(ref.current).toBe(state);
    });

    it('外部修改 ref.current 不应该影响 state（但会在下次渲染时被覆盖）', () => {
      const { result, rerender } = renderHook(() => useRefState('initial'));

      /** 直接修改 ref（不推荐，但需要验证行为） */
      result.current[2].current = 'modified';

      /** state 不变 */
      expect(result.current[0]).toBe('initial');
      /** ref 被修改 */
      expect(result.current[2].current).toBe('modified');

      /** 重新渲染后 ref 会被同步回 state */
      rerender();
      expect(result.current[2].current).toBe('initial');
    });
  });

  describe('复杂对象', () => {
    it('应该正确处理对象更新', () => {
      const { result } = renderHook(() =>
        useRefState({ name: 'John', age: 30 }),
      );

      act(() => {
        result.current[1]({ name: 'Jane', age: 25 });
      });

      expect(result.current[0]).toEqual({ name: 'Jane', age: 25 });
      expect(result.current[2].current).toEqual({ name: 'Jane', age: 25 });
    });

    it('应该支持部分更新（通过函数式更新）', () => {
      const { result } = renderHook(() =>
        useRefState({ name: 'John', age: 30 }),
      );

      act(() => {
        result.current[1]((prev) => ({ ...prev, age: 31 }));
      });

      expect(result.current[0]).toEqual({ name: 'John', age: 31 });
      expect(result.current[2].current).toEqual({ name: 'John', age: 31 });
    });
  });

  describe('边界情况', () => {
    it('应该正确处理 undefined 值', () => {
      const { result } = renderHook(() =>
        useRefState<string | undefined>('initial'),
      );

      act(() => {
        result.current[1](undefined);
      });

      expect(result.current[0]).toBeUndefined();
      expect(result.current[2].current).toBeUndefined();
    });

    it('应该正确处理 null 值', () => {
      const { result } = renderHook(() =>
        useRefState<string | null>('initial'),
      );

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
      expect(result.current[2].current).toBeNull();
    });

    it('应该正确处理空字符串', () => {
      const { result } = renderHook(() => useRefState('initial'));

      act(() => {
        result.current[1]('');
      });

      expect(result.current[0]).toBe('');
      expect(result.current[2].current).toBe('');
    });
  });
});


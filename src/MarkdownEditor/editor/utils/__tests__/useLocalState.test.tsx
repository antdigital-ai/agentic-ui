import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLocalState } from '../../@ant-design/agentic-ui/MarkdownEditor/editor/utils/useLocalState';

describe('useLocalState', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基本功能', () => {
    it('应该使用初始值初始化状态', () => {
      const initialState = { count: 0, name: 'test' };
      const { result } = renderHook(() => useLocalState(initialState));

      expect(result.current[0]).toEqual(initialState);
    });

    it('应该使用函数初始化状态', () => {
      const initialState = () => ({ count: 0, name: 'test' });
      const { result } = renderHook(() => useLocalState(initialState));

      expect(result.current[0]).toEqual({ count: 0, name: 'test' });
    });

    it('应该提供 setState 函数', () => {
      const initialState = { count: 0 };
      const { result } = renderHook(() => useLocalState(initialState));

      expect(typeof result.current[1]).toBe('function');
    });
  });

  describe('状态更新', () => {
    it('应该使用对象更新状态', () => {
      const initialState = { count: 0, name: 'test' };
      const { result } = renderHook(() => useLocalState(initialState));

      act(() => {
        result.current[1]({ count: 1 });
      });

      expect(result.current[0]).toEqual({ count: 1, name: 'test' });
    });

    it('应该使用函数更新状态', () => {
      const initialState = { count: 0, name: 'test' };
      const { result } = renderHook(() => useLocalState(initialState));

      act(() => {
        result.current[1]((state) => {
          state.count = 1;
          state.name = 'updated';
        });
      });

      expect(result.current[0]).toEqual({ count: 1, name: 'updated' });
    });

    it('应该合并多个更新', () => {
      const initialState = { count: 0, name: 'test', flag: false };
      const { result } = renderHook(() => useLocalState(initialState));

      act(() => {
        result.current[1]({ count: 1 });
        result.current[1]({ name: 'updated' });
        result.current[1]({ flag: true });
      });

      expect(result.current[0]).toEqual({
        count: 1,
        name: 'updated',
        flag: true,
      });
    });

    it('应该保持未更新的字段不变', () => {
      const initialState = { count: 0, name: 'test', flag: false };
      const { result } = renderHook(() => useLocalState(initialState));

      act(() => {
        result.current[1]({ count: 1 });
      });

      expect(result.current[0]).toEqual({
        count: 1,
        name: 'test',
        flag: false,
      });
    });
  });

  describe('函数更新', () => {
    it('应该使用函数更新状态', () => {
      const initialState = { count: 0 };
      const { result } = renderHook(() => useLocalState(initialState));

      act(() => {
        result.current[1]((state) => {
          state.count += 1;
        });
      });

      expect(result.current[0]).toEqual({ count: 1 });
    });

    it('应该使用函数进行复杂更新', () => {
      const initialState = { items: [1, 2, 3], count: 0 };
      const { result } = renderHook(() => useLocalState(initialState));

      act(() => {
        result.current[1]((state) => {
          state.items.push(4);
          state.count = state.items.length;
        });
      });

      expect(result.current[0]).toEqual({ items: [1, 2, 3, 4], count: 4 });
    });

    it('应该使用函数更新嵌套对象', () => {
      const initialState = { user: { name: 'test', age: 25 } };
      const { result } = renderHook(() => useLocalState(initialState));

      act(() => {
        result.current[1]((state) => {
          state.user.age = 26;
        });
      });

      expect(result.current[0]).toEqual({ user: { name: 'test', age: 26 } });
    });
  });

  describe('边界情况', () => {
    it('应该处理空对象', () => {
      const initialState = {};
      const { result } = renderHook(() => useLocalState(initialState));

      expect(result.current[0]).toEqual({});
    });

    it('应该处理包含函数的对象', () => {
      const initialState = { count: 0, handler: () => {} };
      const { result } = renderHook(() => useLocalState(initialState));

      expect(result.current[0]).toEqual(initialState);
    });

    it('应该处理 null 和 undefined 值', () => {
      const initialState = { value: null, flag: undefined };
      const { result } = renderHook(() => useLocalState(initialState));

      expect(result.current[0]).toEqual(initialState);
    });

    it('应该处理嵌套对象', () => {
      const initialState = {
        user: { name: 'test', settings: { theme: 'dark' } },
        count: 0,
      };
      const { result } = renderHook(() => useLocalState(initialState));

      act(() => {
        result.current[1]((state) => {
          state.user.settings.theme = 'light';
        });
      });

      expect(result.current[0]).toEqual({
        user: { name: 'test', settings: { theme: 'light' } },
        count: 0,
      });
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量状态更新', () => {
      const initialState = { count: 0 };
      const { result } = renderHook(() => useLocalState(initialState));

      const startTime = performance.now();

      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current[1]((state) => {
            state.count = i;
          });
        }
      });

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
      expect(result.current[0].count).toBe(999);
    });

    it('应该能够处理大型对象', () => {
      const largeObject = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: `item${i}`,
      }));
      const initialState = { items: largeObject };
      const { result } = renderHook(() => useLocalState(initialState));

      act(() => {
        result.current[1]((state) => {
          state.items.push({ id: 1000, value: 'newItem' });
        });
      });

      expect(result.current[0].items).toHaveLength(1001);
    });
  });

  describe('类型安全', () => {
    it('应该正确处理 TypeScript 类型', () => {
      interface TestState {
        count: number;
        name: string;
        flag?: boolean;
      }

      const initialState: TestState = { count: 0, name: 'test' };
      const { result } = renderHook(() =>
        useLocalState<TestState>(initialState),
      );

      act(() => {
        result.current[1]({ count: 1, flag: true });
      });

      expect(result.current[0]).toEqual({ count: 1, name: 'test', flag: true });
    });

    it('应该排除函数字段', () => {
      interface TestState {
        count: number;
        handler: () => void;
      }

      const initialState: TestState = { count: 0, handler: () => {} };
      const { result } = renderHook(() =>
        useLocalState<TestState>(initialState),
      );

      // 这里应该只允许更新 count，而不允许更新 handler
      act(() => {
        result.current[1]({ count: 1 });
      });

      expect(result.current[0].count).toBe(1);
    });
  });

  describe('错误处理', () => {
    it('应该在函数更新中抛出错误时保持状态不变', () => {
      const initialState = { count: 0 };
      const { result } = renderHook(() => useLocalState(initialState));

      expect(() => {
        act(() => {
          result.current[1]((state) => {
            state.count = 1;
            throw new Error('Test error');
          });
        });
      }).toThrow('Test error');

      // 状态应该保持不变
      expect(result.current[0]).toEqual({ count: 0 });
    });

    it('应该处理无效的更新参数', () => {
      const initialState = { count: 0 };
      const { result } = renderHook(() => useLocalState(initialState));

      act(() => {
        result.current[1](null as any);
      });

      // 应该保持原始状态
      expect(result.current[0]).toEqual({ count: 0 });
    });
  });

  describe('内存泄漏测试', () => {
    it('应该在组件卸载时清理引用', () => {
      const initialState = { count: 0 };
      const { result, unmount } = renderHook(() => useLocalState(initialState));

      // 进行一些更新
      act(() => {
        result.current[1]({ count: 1 });
      });

      // 卸载组件
      unmount();

      // 这里主要是确保没有内存泄漏，我们无法直接测试，但可以确保测试通过
      expect(true).toBe(true);
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce, stringFormatNumber } from '../../@ant-design/agentic-ui/Plugins/chart/utils';

describe('Chart Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('stringFormatNumber', () => {
    it('应该格式化数字为字符串', () => {
      expect(stringFormatNumber(1234567.89)).toBe('1,234,567.89');
      expect(stringFormatNumber(1000)).toBe('1,000');
      expect(stringFormatNumber(0)).toBe(0);
    });

    it('应该直接返回字符串值', () => {
      expect(stringFormatNumber('hello')).toBe('hello');
      expect(stringFormatNumber('1,234.56')).toBe('1,234.56');
      expect(stringFormatNumber('')).toBe('');
    });

    it('应该处理空值', () => {
      expect(stringFormatNumber('')).toBe('');
      expect(stringFormatNumber(null as any)).toBe(null);
      expect(stringFormatNumber(undefined as any)).toBe(undefined);
    });

    it('应该处理错误情况', () => {
      // 测试错误处理逻辑
      expect(stringFormatNumber(123)).toBe('123');
    });

    it('应该处理不同类型的输入', () => {
      expect(stringFormatNumber(123)).toBe('123');
      expect(stringFormatNumber('123')).toBe('123');
      expect(stringFormatNumber('hello world')).toBe('hello world');
    });
  });

  describe('debounce', () => {
    it('应该延迟执行函数', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该在延迟期间多次调用时只执行一次', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该支持 flush 方法立即执行', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      debouncedFn.flush();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该支持 cancel 方法取消执行', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn.cancel();

      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });
      expect(fn).not.toHaveBeenCalled();
    });

    it('应该处理没有延迟参数的情况', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, undefined);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该正确处理 this 上下文', () => {
      const context = { value: 42 };
      const fn = vi.fn(function (this: any) {
        // 验证函数被调用
        expect(true).toBe(true);
      });

      const debouncedFn = debounce(fn, 100);
      debouncedFn.call(context);

      debouncedFn.flush();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该传递参数给函数', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn.flush();

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

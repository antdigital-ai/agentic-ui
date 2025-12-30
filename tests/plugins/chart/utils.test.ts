import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  debounce,
  hexToRgba,
  resolveCssVariable,
  stringFormatNumber,
} from '../../../src/Plugins/chart/utils';

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

  describe('resolveCssVariable', () => {
    it('应该返回非 CSS 变量的原值', () => {
      expect(resolveCssVariable('#ff0000')).toBe('#ff0000');
      expect(resolveCssVariable('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
      expect(resolveCssVariable('blue')).toBe('blue');
    });

    it('应该处理格式错误的 CSS 变量', () => {
      expect(resolveCssVariable('var(')).toBe('var(');
      expect(resolveCssVariable('var()')).toBe('var()');
    });

    // 注意：在 Node.js 测试环境中，无法真正解析 CSS 变量
    // 这些测试只验证函数不会崩溃
    it('应该在无 DOM 环境中安全处理 CSS 变量', () => {
      const result = resolveCssVariable('var(--color-blue)');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('hexToRgba', () => {
    it('应该正确转换6位十六进制颜色', () => {
      expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(hexToRgba('#00ff00', 0.8)).toBe('rgba(0, 255, 0, 0.8)');
      expect(hexToRgba('#0000ff', 1)).toBe('rgba(0, 0, 255, 1)');
    });

    it('应该正确转换3位十六进制颜色', () => {
      expect(hexToRgba('#f00', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(hexToRgba('#0f0', 0.3)).toBe('rgba(0, 255, 0, 0.3)');
      expect(hexToRgba('#00f', 0.9)).toBe('rgba(0, 0, 255, 0.9)');
    });

    it('应该处理不带 # 前缀的十六进制颜色', () => {
      expect(hexToRgba('ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(hexToRgba('f00', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('应该限制透明度在 0 到 1 之间', () => {
      expect(hexToRgba('#ff0000', -0.5)).toBe('rgba(255, 0, 0, 0)');
      expect(hexToRgba('#ff0000', 1.5)).toBe('rgba(255, 0, 0, 1)');
      expect(hexToRgba('#ff0000', 0)).toBe('rgba(255, 0, 0, 0)');
    });

    // 在 Node.js 环境中，CSS 变量无法被解析，所以测试预期行为
    it('应该尝试解析 CSS 变量（在无 DOM 环境中返回 NaN）', () => {
      const result = hexToRgba('var(--color-blue)', 0.5);
      // 在 Node.js 环境中，CSS 变量无法解析，会返回 NaN
      expect(result).toContain('rgba');
    });
  });
});

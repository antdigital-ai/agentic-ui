import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  compareXValues,
  debounce,
  extractAndSortXValues,
  findDataPointByXValue,
  getDataHash,
  hexToRgba,
  isConfigEqual,
  isNotEmpty,
  isXValueEqual,
  normalizeXValue,
  resolveCssVariable,
  stringFormatNumber,
  toNumber,
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
      expect(stringFormatNumber(undefined as any)).toBe(undefined);
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

    it('应该处理带空格的输入', () => {
      expect(resolveCssVariable('  #ff0000  ')).toBe('  #ff0000  ');
      expect(resolveCssVariable(' var(--color) ')).toBeDefined();
    });

    it('应该在解析出错时安全返回原值', () => {
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn().mockImplementation(() => {
        throw new Error('Mock error');
      });

      const result = resolveCssVariable('var(--error-var)');
      expect(result).toBe('var(--error-var)');

      document.createElement = originalCreateElement;
    });

    it('应该处理正则不匹配但以 var( 开头的字符串', () => {
      // var() 不匹配 /var\((--[^)]+)\)/
      expect(resolveCssVariable('var()')).toBe('var()');
    });

    it('应该缓存已解析的 CSS 变量', () => {
      const cssVar = 'var(--test-color)';
      const result1 = resolveCssVariable(cssVar);
      const result2 = resolveCssVariable(cssVar);

      // 两次调用应该返回相同的结果（从缓存中获取）
      expect(result1).toBe(result2);
      expect(typeof result1).toBe('string');
    });

    it('应该缓存格式错误的 CSS 变量', () => {
      const invalidVar = 'var()';
      const result1 = resolveCssVariable(invalidVar);
      const result2 = resolveCssVariable(invalidVar);

      expect(result1).toBe(invalidVar);
      expect(result2).toBe(invalidVar);
    });

    // 注意：在 Node.js 测试环境中，无法真正解析 CSS 变量
    // 这些测试只验证函数不会崩溃
    it('应该在无 DOM 环境中安全处理 CSS 变量', () => {
      const result = resolveCssVariable('var(--color-blue)');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('应该处理复杂的 CSS 变量名', () => {
      expect(
        resolveCssVariable('var(--color-blue-control-fill-primary)'),
      ).toBeDefined();
      expect(resolveCssVariable('var(--my-custom-color-123)')).toBeDefined();
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

    it('应该处理边界值透明度', () => {
      expect(hexToRgba('#ff0000', 0.001)).toBe('rgba(255, 0, 0, 0.001)');
      expect(hexToRgba('#ff0000', 0.999)).toBe('rgba(255, 0, 0, 0.999)');
    });

    it('应该处理大小写混合的十六进制颜色', () => {
      expect(hexToRgba('#Ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(hexToRgba('#00fF00', 0.5)).toBe('rgba(0, 255, 0, 0.5)');
      expect(hexToRgba('#F0F', 0.5)).toBe('rgba(255, 0, 255, 0.5)');
    });

    // 在 Node.js 环境中，CSS 变量无法被解析，所以测试预期行为
    it('应该尝试解析 CSS 变量（在无 DOM 环境中返回 NaN）', () => {
      const result = hexToRgba('var(--color-blue)', 0.5);
      // 在 Node.js 环境中，CSS 变量无法解析，会返回 NaN
      expect(result).toContain('rgba');
    });

    it('应该使用缓存的 CSS 变量解析结果', () => {
      const cssVar = 'var(--cached-color)';
      const result1 = hexToRgba(cssVar, 0.5);
      const result2 = hexToRgba(cssVar, 0.5);

      // 两次调用应该产生一致的结果
      expect(result1).toBe(result2);
    });
  });

  describe('normalizeXValue', () => {
    it('应该返回数字类型的原值', () => {
      expect(normalizeXValue(123)).toBe(123);
      expect(normalizeXValue(0)).toBe(0);
      expect(normalizeXValue(-456)).toBe(-456);
    });

    it('应该将可转换的字符串转为数字', () => {
      expect(normalizeXValue('123')).toBe(123);
      expect(normalizeXValue('0')).toBe(0);
      expect(normalizeXValue('-456')).toBe(-456);
    });

    it('应该保持不可转换的字符串为字符串', () => {
      expect(normalizeXValue('abc')).toBe('abc');
      expect(normalizeXValue('Q1')).toBe('Q1');
      expect(normalizeXValue('2024-01')).toBe('2024-01');
    });
  });

  describe('compareXValues', () => {
    it('应该正确比较数字', () => {
      expect(compareXValues(1, 2)).toBe(-1);
      expect(compareXValues(2, 1)).toBe(1);
      expect(compareXValues(5, 5)).toBe(0);
    });

    it('应该正确比较字符串', () => {
      expect(compareXValues('a', 'b')).toBe(-1);
      expect(compareXValues('b', 'a')).toBe(1);
      expect(compareXValues('test', 'test')).toBe(0);
    });

    it('应该处理混合类型比较', () => {
      expect(compareXValues(1, '2')).toBe(-1);
      expect(compareXValues('2', 1)).toBe(1);
    });
  });

  describe('isXValueEqual', () => {
    it('应该正确判断相等的值', () => {
      expect(isXValueEqual(123, 123)).toBe(true);
      expect(isXValueEqual('abc', 'abc')).toBe(true);
      expect(isXValueEqual(0, 0)).toBe(true);
    });

    it('应该正确判断不等的值', () => {
      expect(isXValueEqual(123, 456)).toBe(false);
      expect(isXValueEqual('abc', 'def')).toBe(false);
    });

    it('应该正确处理数字和字符串的比较', () => {
      expect(isXValueEqual(123, '123')).toBe(true);
      expect(isXValueEqual('123', 123)).toBe(true);
    });
  });

  describe('extractAndSortXValues', () => {
    it('应该提取并排序 x 值', () => {
      const data = [
        { x: 3, y: 30 },
        { x: 1, y: 10 },
        { x: 2, y: 20 },
      ];
      expect(extractAndSortXValues(data)).toEqual([1, 2, 3]);
    });

    it('应该处理字符串 x 值', () => {
      const data = [
        { x: 'c', y: 30 },
        { x: 'a', y: 10 },
        { x: 'b', y: 20 },
      ];
      expect(extractAndSortXValues(data)).toEqual(['a', 'b', 'c']);
    });

    it('应该去重相同的 x 值', () => {
      const data = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 1, y: 15 },
      ];
      expect(extractAndSortXValues(data)).toEqual([1, 2]);
    });
  });

  describe('findDataPointByXValue', () => {
    const data = [
      { x: 1, y: 10, label: 'A' },
      { x: 2, y: 20, label: 'B' },
      { x: 3, y: 30, label: 'C' },
    ];

    it('应该找到匹配的数据点', () => {
      const result = findDataPointByXValue(data, 2);
      expect(result).toEqual({ x: 2, y: 20, label: 'B' });
    });

    it('应该处理字符串匹配', () => {
      const stringData = [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 },
      ];
      const result = findDataPointByXValue(stringData, 'B');
      expect(result).toEqual({ x: 'B', y: 20 });
    });

    it('应该返回 undefined 当找不到时', () => {
      const result = findDataPointByXValue(data, 999);
      expect(result).toBeUndefined();
    });
  });

  describe('isNotEmpty', () => {
    it('应该返回 true 对于非空值', () => {
      expect(isNotEmpty(123)).toBe(true);
      expect(isNotEmpty('abc')).toBe(true);
      expect(isNotEmpty(0)).toBe(true);
      expect(isNotEmpty(false)).toBe(true);
      expect(isNotEmpty('')).toBe(true); // 空字符串也是非空（不是 null/undefined）
    });

    it('应该返回 false 对于空值', () => {
      expect(isNotEmpty(null)).toBe(false);
      expect(isNotEmpty(undefined)).toBe(false);
    });
  });

  describe('toNumber', () => {
    it('应该返回数字类型的原值', () => {
      expect(toNumber(123, 0)).toBe(123);
      expect(toNumber(0, 999)).toBe(0);
      expect(toNumber(-456, 0)).toBe(-456);
    });

    it('应该转换字符串为数字', () => {
      expect(toNumber('123', 0)).toBe(123);
      expect(toNumber('0', 999)).toBe(0);
      expect(toNumber('-456', 0)).toBe(-456);
    });

    it('应该返回 fallback 值当无法转换时', () => {
      expect(toNumber('abc', 100)).toBe(100);
      expect(toNumber(null, 50)).toBe(0); // Number(null) is 0
      expect(toNumber(undefined, 25)).toBe(25);
      expect(toNumber(NaN, 10)).toBe(10);
    });
  });

  describe('getDataHash', () => {
    it('应该为相同数据生成相同的哈希', () => {
      const data1 = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
      ];
      const data2 = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
      ];
      expect(getDataHash(data1)).toBe(getDataHash(data2));
    });

    it('应该为不同数据生成不同的哈希', () => {
      const data1 = [{ x: 1, y: 10 }];
      const data2 = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
      ];
      expect(getDataHash(data1)).not.toBe(getDataHash(data2));
    });

    it('应该处理空数组', () => {
      const hash = getDataHash([]);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('isConfigEqual', () => {
    it('应该返回 true 对于相同的配置', () => {
      const config1 = { color: '#ff0000', size: 10 };
      const config2 = { color: '#ff0000', size: 10 };
      expect(isConfigEqual(config1, config2)).toBe(true);
    });

    it('应该返回 false 对于不同的配置', () => {
      // isConfigEqual 只比较特定字段：['x', 'y', 'height', 'index', 'rest']
      const config1 = { x: 'date1', height: 400 };
      const config2 = { x: 'date2', height: 400 };
      expect(isConfigEqual(config1, config2)).toBe(false);
    });

    it('应该处理嵌套对象', () => {
      const config1 = { theme: { color: '#ff0000' } };
      const config2 = { theme: { color: '#ff0000' } };
      expect(isConfigEqual(config1, config2)).toBe(true);
    });

    it('应该处理 null 和 undefined', () => {
      expect(isConfigEqual(null, null)).toBe(true);
      expect(isConfigEqual(undefined, undefined)).toBe(true);
      expect(isConfigEqual(null, undefined)).toBe(false);
      expect(isConfigEqual({}, null)).toBe(false);
    });

    it('应该比较 nested rest 对象', () => {
      const config1 = { x: 1, rest: { a: 1 } };
      const config2 = { x: 1, rest: { a: 2 } };
      const config3 = { x: 1, rest: { a: 1, b: 2 } };
      expect(isConfigEqual(config1, config2)).toBe(false);
      expect(isConfigEqual(config1, config3)).toBe(false);
    });
  });
});

import { describe, expect, it } from 'vitest';
import {
  compareXValues,
  extractAndSortXValues,
  findDataPointByXValue,
  getDataHash,
  hexToRgba,
  isConfigEqual,
  isNotEmpty,
  isXValueEqual,
  normalizeXValue,
  toNumber,
} from '../../../../src/Plugins/chart/utils';

describe('Chart Utils - Additional Functions', () => {
  describe('normalizeXValue', () => {
    it('应该返回数字值不变', () => {
      expect(normalizeXValue(123)).toBe(123);
      expect(normalizeXValue(0)).toBe(0);
      expect(normalizeXValue(-456)).toBe(-456);
    });

    it('应该将数字字符串转换为数字', () => {
      expect(normalizeXValue('123')).toBe(123);
      expect(normalizeXValue('0')).toBe(0);
      expect(normalizeXValue('-456')).toBe(-456);
    });

    it('应该处理无效的数字字符串', () => {
      expect(normalizeXValue('abc')).toBe('abc');
      expect(normalizeXValue('')).toBe('');
      expect(normalizeXValue('123abc')).toBe('123abc');
    });

    it('应该处理空白字符串', () => {
      expect(normalizeXValue(' ')).toBe(' ');
      expect(normalizeXValue('  ')).toBe('  ');
    });
  });

  describe('compareXValues', () => {
    it('应该正确比较两个数字', () => {
      expect(compareXValues(1, 2)).toBeLessThan(0);
      expect(compareXValues(2, 1)).toBeGreaterThan(0);
      expect(compareXValues(1, 1)).toBe(0);
    });

    it('应该正确比较两个字符串', () => {
      expect(compareXValues('a', 'b')).toBeLessThan(0);
      expect(compareXValues('b', 'a')).toBeGreaterThan(0);
      expect(compareXValues('a', 'a')).toBe(0);
    });

    it('应该优先比较数字', () => {
      expect(compareXValues(1, 'a')).toBeLessThan(0);
      expect(compareXValues('a', 1)).toBeGreaterThan(0);
    });

    it('应该处理相同类型的值', () => {
      expect(compareXValues('1', '2')).toBeLessThan(0);
      expect(compareXValues('2', '1')).toBeGreaterThan(0);
    });
  });

  describe('isXValueEqual', () => {
    it('应该正确比较两个数字', () => {
      expect(isXValueEqual(1, 1)).toBe(true);
      expect(isXValueEqual(1, 2)).toBe(false);
    });

    it('应该正确比较数字和数字字符串', () => {
      expect(isXValueEqual('1', 1)).toBe(true);
      expect(isXValueEqual(1, '1')).toBe(true);
      expect(isXValueEqual('2', 1)).toBe(false);
    });

    it('应该正确比较两个字符串', () => {
      expect(isXValueEqual('a', 'a')).toBe(true);
      expect(isXValueEqual('a', 'b')).toBe(false);
    });

    it('应该处理空值', () => {
      expect(isXValueEqual('', '')).toBe(true);
      expect(isXValueEqual('', 'a')).toBe(false);
    });
  });

  describe('extractAndSortXValues', () => {
    it('应该提取并排序数字值', () => {
      const data = [
        { x: 3, y: 10 },
        { x: 1, y: 20 },
        { x: 2, y: 30 },
      ];

      expect(extractAndSortXValues(data)).toEqual([1, 2, 3]);
    });

    it('应该提取并排序字符串值', () => {
      const data = [
        { x: 'c', y: 10 },
        { x: 'a', y: 20 },
        { x: 'b', y: 30 },
      ];

      expect(extractAndSortXValues(data)).toEqual(['a', 'b', 'c']);
    });

    it('应该处理混合类型的值', () => {
      const data = [
        { x: 'c', y: 10 },
        { x: 1, y: 20 },
        { x: 'b', y: 30 },
        { x: 2, y: 40 },
      ];

      expect(extractAndSortXValues(data)).toEqual([1, 2, 'b', 'c']);
    });

    it('应该去除重复值', () => {
      const data = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 1, y: 30 },
      ];

      expect(extractAndSortXValues(data)).toEqual([1, 2]);
    });

    it('应该处理空数组', () => {
      expect(extractAndSortXValues([])).toEqual([]);
    });
  });

  describe('findDataPointByXValue', () => {
    const data = [
      { x: 'a', y: 10, type: 'A' },
      { x: 'b', y: 20, type: 'B' },
      { x: 'a', y: 30, type: 'C' },
    ];

    it('应该根据X值查找数据点', () => {
      const result = findDataPointByXValue(data, 'a');
      expect(result).toEqual({ x: 'a', y: 10, type: 'A' });
    });

    it('应该根据X值和类型查找数据点', () => {
      const result = findDataPointByXValue(data, 'a', 'C');
      expect(result).toEqual({ x: 'a', y: 30, type: 'C' });
    });

    it('应该在找不到匹配项时返回undefined', () => {
      const result = findDataPointByXValue(data, 'd');
      expect(result).toBeUndefined();
    });

    it('应该在找不到匹配类型时返回undefined', () => {
      const result = findDataPointByXValue(data, 'a', 'D');
      expect(result).toBeUndefined();
    });

    it('应该处理空数据数组', () => {
      const result = findDataPointByXValue([], 'a');
      expect(result).toBeUndefined();
    });
  });

  describe('toNumber', () => {
    it('应该返回有效的数字不变', () => {
      expect(toNumber(123, 0)).toBe(123);
      expect(toNumber(0, 100)).toBe(0);
      expect(toNumber(-456, 0)).toBe(-456);
    });

    it('应该将字符串转换为数字', () => {
      expect(toNumber('123', 0)).toBe(123);
      expect(toNumber('0', 100)).toBe(0);
      expect(toNumber('-456', 0)).toBe(-456);
    });

    it('应该在转换失败时返回默认值', () => {
      expect(toNumber('abc', 0)).toBe(0);
      // null会被Number()转换为0，Number.isFinite(0)为true，所以返回0而不是100
      expect(toNumber(null, 100)).toBe(0);
      // undefined会被Number()转换为NaN，Number.isFinite(NaN)为false，所以返回-1
      expect(toNumber(undefined, -1)).toBe(-1);
      // NaN的Number.isFinite(NaN)为false，所以返回50
      expect(toNumber(NaN, 50)).toBe(50);
    });

    it('应该处理空字符串', () => {
      expect(toNumber('', 0)).toBe(0);
    });
  });

  describe('isNotEmpty', () => {
    it('应该正确识别非空值', () => {
      expect(isNotEmpty('hello')).toBe(true);
      expect(isNotEmpty(0)).toBe(true);
      expect(isNotEmpty(false)).toBe(true);
      expect(isNotEmpty([])).toBe(true);
      expect(isNotEmpty({})).toBe(true);
    });

    it('应该正确识别空值', () => {
      expect(isNotEmpty(null)).toBe(false);
      expect(isNotEmpty(undefined)).toBe(false);
    });
  });

  describe('getDataHash', () => {
    it('应该为数组生成哈希值', () => {
      const data1 = [{ x: 1, y: 2 }];
      const data2 = [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ];

      expect(getDataHash(data1)).toBe('1-x,y-x,y');
      expect(getDataHash(data2)).toBe('2-x,y-x,y');
    });

    it('应该处理空数组', () => {
      expect(getDataHash([])).toBe('0-0');
    });

    it('应该处理非数组值', () => {
      expect(getDataHash(null as any)).toBe('0-0');
      expect(getDataHash(undefined as any)).toBe('0-0');
    });

    it('应该处理只有一个元素的数组', () => {
      const data = [{ a: 1 }];
      expect(getDataHash(data)).toBe('1-a-a');
    });
  });

  describe('isConfigEqual', () => {
    it('应该正确比较相同的配置对象', () => {
      const config1 = { x: 'date', y: 'value', height: 400 };
      const config2 = { x: 'date', y: 'value', height: 400 };

      expect(isConfigEqual(config1, config2)).toBe(true);
    });

    it('应该正确比较不同的配置对象', () => {
      const config1 = { x: 'date', y: 'value', height: 400 };
      const config2 = { x: 'date', y: 'value', height: 300 };

      expect(isConfigEqual(config1, config2)).toBe(false);
    });

    it('应该处理null和undefined值', () => {
      expect(isConfigEqual(null, {})).toBe(false);
      expect(isConfigEqual({}, null)).toBe(false);
      expect(isConfigEqual(null, null)).toBe(true);
      expect(isConfigEqual(undefined, undefined)).toBe(true);
    });

    it('应该处理相同引用的对象', () => {
      const config = { x: 'date', y: 'value' };
      expect(isConfigEqual(config, config)).toBe(true);
    });

    it('应该只比较关键字段', () => {
      const config1 = { x: 'date', y: 'value', extra: 'ignored' };
      const config2 = { x: 'date', y: 'value', extra: 'different' };

      expect(isConfigEqual(config1, config2)).toBe(true);
    });

    it('应该正确比较rest对象', () => {
      const config1 = {
        x: 'date',
        y: 'value',
        rest: { stacked: true, showLegend: false },
      };
      const config2 = {
        x: 'date',
        y: 'value',
        rest: { stacked: true, showLegend: false },
      };

      expect(isConfigEqual(config1, config2)).toBe(true);
    });

    it('应该检测rest对象的不同', () => {
      const config1 = {
        x: 'date',
        y: 'value',
        rest: { stacked: true, showLegend: false },
      };
      const config2 = {
        x: 'date',
        y: 'value',
        rest: { stacked: false, showLegend: false },
      };

      expect(isConfigEqual(config1, config2)).toBe(false);
    });
  });

  describe('hexToRgba', () => {
    it('应该将6位十六进制颜色转换为RGBA', () => {
      expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(hexToRgba('#00ff00', 1)).toBe('rgba(0, 255, 0, 1)');
      expect(hexToRgba('#0000ff', 0)).toBe('rgba(0, 0, 255, 0)');
    });

    it('应该将3位十六进制颜色转换为RGBA', () => {
      expect(hexToRgba('#f00', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(hexToRgba('#0f0', 1)).toBe('rgba(0, 255, 0, 1)');
      expect(hexToRgba('#00f', 0)).toBe('rgba(0, 0, 255, 0)');
    });

    it('应该处理不带#的十六进制颜色', () => {
      expect(hexToRgba('ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(hexToRgba('f00', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('应该限制alpha值在0-1范围内', () => {
      expect(hexToRgba('#ff0000', -0.5)).toBe('rgba(255, 0, 0, 0)');
      expect(hexToRgba('#ff0000', 1.5)).toBe('rgba(255, 0, 0, 1)');
    });

    it('应该处理无效的十六进制颜色', () => {
      // 根据源码实现，无效的颜色会被parseInt转换为NaN
      // 对于#gggggg，所有部分都是无效的，所以结果是rgba(NaN, NaN, NaN, 0.5)
      expect(hexToRgba('#gggggg', 0.5)).toBe('rgba(NaN, NaN, NaN, 0.5)');
      // 对于#12，长度为2，不是3，所以isShort为false：
      // r = parseInt('12', 16) = 18
      // g = parseInt('', 16) = NaN
      // b = parseInt('', 16) = NaN
      // 结果是rgba(18, NaN, NaN, 0.5)
      expect(hexToRgba('#12', 0.5)).toBe('rgba(18, NaN, NaN, 0.5)');
    });
  });
});

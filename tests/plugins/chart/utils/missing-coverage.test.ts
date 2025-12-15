import { describe, expect, it } from 'vitest';
import {
  stringFormatNumber,
  normalizeXValue,
  compareXValues,
  isXValueEqual,
  isConfigEqual,
  hexToRgba,
} from '../../../../src/Plugins/chart/utils';

describe('Chart Utils - Missing Coverage', () => {
  describe('stringFormatNumber', () => {
    it('应该处理空值', () => {
      expect(stringFormatNumber('')).toBe('');
      expect(stringFormatNumber(0)).toBe(0);
    });
    
    // 添加测试用例以覆盖第45行和第47行
    it('应该处理非字符串非数字值并返回原值', () => {
      expect(stringFormatNumber(true as any)).toBe(true);
      expect(stringFormatNumber(false as any)).toBe(false);
    });
  });

  describe('normalizeXValue', () => {
    it('应该处理空字符串', () => {
      expect(normalizeXValue('')).toBe('');
    });
    
    it('应该处理空白字符串', () => {
      expect(normalizeXValue(' ')).toBe(' ');
      expect(normalizeXValue('  ')).toBe('  ');
    });
    
    it('应该处理无效数字字符串', () => {
      expect(normalizeXValue('abc')).toBe('abc');
      expect(normalizeXValue('123abc')).toBe('123abc');
    });
    
    // 添加测试用例以覆盖第166行和第168行
    it('应该直接返回数字值', () => {
      expect(normalizeXValue(123)).toBe(123);
      expect(normalizeXValue(0)).toBe(0);
      expect(normalizeXValue(-456)).toBe(-456);
    });
    
    it('应该将有效的数字字符串转换为数字', () => {
      expect(normalizeXValue('123')).toBe(123);
      expect(normalizeXValue('0')).toBe(0);
      expect(normalizeXValue('-456')).toBe(-456);
      expect(normalizeXValue('123.45')).toBe(123.45);
    });
  });

  describe('compareXValues', () => {
    it('应该正确比较数字和字符串', () => {
      expect(compareXValues(1, 'a')).toBe(-1);
      expect(compareXValues('a', 1)).toBe(1);
    });
    
    it('应该正确比较相同类型的字符串', () => {
      expect(compareXValues('a', 'b')).toBeLessThan(0);
      expect(compareXValues('b', 'a')).toBeGreaterThan(0);
      expect(compareXValues('a', 'a')).toBe(0);
    });
    
    // 添加测试用例以覆盖第205行、210行和213行
    it('应该正确比较两个数字', () => {
      expect(compareXValues(1, 2)).toBeLessThan(0); // 覆盖第205行
      expect(compareXValues(2, 1)).toBeGreaterThan(0);
      expect(compareXValues(1, 1)).toBe(0);
    });
    
    it('应该在第一个值是数字、第二个值是字符串时返回-1', () => {
      expect(compareXValues(1, 'a')).toBe(-1); // 覆盖第210行
    });
    
    it('应该在第一个值是字符串、第二个值是数字时返回1', () => {
      expect(compareXValues('a', 1)).toBe(1); // 覆盖第213行
    });
  });

  describe('isXValueEqual', () => {
    it('应该处理空值比较', () => {
      expect(isXValueEqual('', '')).toBe(true);
      expect(isXValueEqual('', 'a')).toBe(false);
    });
    
    // 添加测试用例以覆盖第249行
    it('应该正确比较两个数字', () => {
      expect(isXValueEqual(1, 1)).toBe(true); // 覆盖第249行
      expect(isXValueEqual(1, 2)).toBe(false);
    });
    
    it('应该正确比较数字和数字字符串', () => {
      expect(isXValueEqual('1', 1)).toBe(true);
      expect(isXValueEqual(1, '1')).toBe(true);
    });
  });

  describe('isConfigEqual', () => {
    it('应该处理相同引用的对象', () => {
      const config = { x: 'date', y: 'value' };
      expect(isConfigEqual(config, config)).toBe(true);
    });
    
    it('应该处理null和undefined值', () => {
      expect(isConfigEqual(null, {})).toBe(false);
      expect(isConfigEqual({}, null)).toBe(false);
      expect(isConfigEqual(null, null)).toBe(true);
      expect(isConfigEqual(undefined, undefined)).toBe(true);
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
    
    it('应该处理rest对象长度不同', () => {
      const config1 = {
        x: 'date',
        y: 'value',
        rest: { a: 1, b: 2 },
      };
      const config2 = {
        x: 'date',
        y: 'value',
        rest: { a: 1 },
      };
      expect(isConfigEqual(config1, config2)).toBe(false);
    });
    
    it('应该处理rest对象属性不同', () => {
      const config1 = {
        x: 'date',
        y: 'value',
        rest: { a: 1, b: 2 },
      };
      const config2 = {
        x: 'date',
        y: 'value',
        rest: { a: 1, b: 3 },
      };
      expect(isConfigEqual(config1, config2)).toBe(false);
    });
    
    it('应该处理非关键字段的不同', () => {
      const config1 = { x: 'date', y: 'value', height: 400, index: 1 };
      const config2 = { x: 'date', y: 'value', height: 300, index: 1 };
      expect(isConfigEqual(config1, config2)).toBe(false);
    });
    
    // 添加测试用例以覆盖更多未覆盖的行
    it('应该在配置对象完全相同时返回true', () => {
      const config1 = { x: 'date', y: 'value', height: 400 };
      const config2 = { x: 'date', y: 'value', height: 400 };
      expect(isConfigEqual(config1, config2)).toBe(true); // 覆盖第433行
    });
    
    it('应该在配置对象引用相同时返回true', () => {
      const config = { x: 'date', y: 'value' };
      expect(isConfigEqual(config, config)).toBe(true); // 覆盖第433行
    });
    
    it('应该在其中一个配置对象为null时返回false', () => {
      expect(isConfigEqual(null, {})).toBe(false); // 覆盖第434行
      expect(isConfigEqual({}, null)).toBe(false); // 覆盖第434行
    });
    
    it('应该在配置对象的键数量不同时返回false', () => {
      const config1 = { x: 'date' };
      const config2 = { x: 'date', y: 'value' };
      expect(isConfigEqual(config1, config2)).toBe(false); // 覆盖第439行
    });
  });

  describe('hexToRgba', () => {
    it('应该处理无效的十六进制颜色', () => {
      // 根据源码实现，无效的颜色会被parseInt转换为NaN
      expect(hexToRgba('#gggggg', 0.5)).toBe('rgba(NaN, NaN, NaN, 0.5)');
      // 对于#12，长度为2，不是3，所以isShort为false
      expect(hexToRgba('#12', 0.5)).toBe('rgba(18, NaN, NaN, 0.5)');
    });
    
    it('应该处理边界alpha值', () => {
      expect(hexToRgba('#ff0000', -0.5)).toBe('rgba(255, 0, 0, 0)');
      expect(hexToRgba('#ff0000', 1.5)).toBe('rgba(255, 0, 0, 1)');
    });
    
    // 添加测试用例以覆盖更多未覆盖的行
    it('应该正确处理6位十六进制颜色', () => {
      expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)'); // 覆盖第482,484,488,492,496行
      expect(hexToRgba('#00ff00', 1)).toBe('rgba(0, 255, 0, 1)');
      expect(hexToRgba('#0000ff', 0)).toBe('rgba(0, 0, 255, 0)');
    });
    
    it('应该正确处理3位十六进制颜色', () => {
      expect(hexToRgba('#f00', 0.5)).toBe('rgba(255, 0, 0, 0.5)'); // 覆盖第483行
      expect(hexToRgba('#0f0', 1)).toBe('rgba(0, 255, 0, 1)');
      expect(hexToRgba('#00f', 0)).toBe('rgba(0, 0, 255, 0)');
    });
    
    it('应该正确处理不带#的十六进制颜色', () => {
      expect(hexToRgba('ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)'); // 覆盖第482行
      expect(hexToRgba('f00', 0.5)).toBe('rgba(255, 0, 0, 0.5)'); // 覆盖第483行
    });
    
    it('应该正确限制alpha值在0-1范围内', () => {
      expect(hexToRgba('#ff0000', -0.5)).toBe('rgba(255, 0, 0, 0)'); // 覆盖第496行
      expect(hexToRgba('#ff0000', 1.5)).toBe('rgba(255, 0, 0, 1)'); // 覆盖第496行
    });
  });
});
import { describe, expect, it } from 'vitest';
import { isValidNumber } from '../../../../src/Plugins/chart/ChartStatistic/utils';

describe('ChartStatistic utils', () => {
  describe('isValidNumber', () => {
    it('null 应返回 false', () => {
      expect(isValidNumber(null)).toBe(false);
    });

    it('undefined 应返回 false', () => {
      expect(isValidNumber(undefined)).toBe(false);
    });

    it('空字符串应返回 false', () => {
      expect(isValidNumber('')).toBe(false);
    });

    it('字符串数字应解析并返回 true', () => {
      expect(isValidNumber('42')).toBe(true);
      expect(isValidNumber('3.14')).toBe(true);
    });

    it('数字应返回 true', () => {
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(100)).toBe(true);
    });

    it('无效字符串应返回 false', () => {
      expect(isValidNumber('abc')).toBe(false);
    });
  });
});

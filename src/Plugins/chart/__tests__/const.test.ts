import { describe, expect, it } from 'vitest';
import { defaultColorList } from '../../@ant-design/agentic-ui/Plugins/chart/const';

describe('Chart Constants', () => {
  describe('defaultColorList', () => {
    it('应该包含预定义的颜色数组', () => {
      expect(defaultColorList).toBeDefined();
      expect(Array.isArray(defaultColorList)).toBe(true);
    });

    it('应该包含10个颜色值', () => {
      expect(defaultColorList).toHaveLength(10);
    });

    it('应该包含有效的十六进制颜色值', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;

      defaultColorList.forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });

    it('应该包含特定的颜色值', () => {
      const expectedColors = [
        '#1677ff',
        '#15e7e4',
        '#8954FC',
        '#F45BB5',
        '#00A6FF',
        '#33E59B',
        '#D666E4',
        '#6151FF',
        '#BF3C93',
        '#005EE0',
      ];

      expect(defaultColorList).toEqual(expectedColors);
    });

    it('应该包含不同的颜色值', () => {
      const uniqueColors = new Set(defaultColorList);
      expect(uniqueColors.size).toBe(defaultColorList.length);
    });

    it('应该包含蓝色系颜色', () => {
      const blueColors = defaultColorList.filter(
        (color) =>
          color.includes('ff') ||
          color.includes('FF') ||
          color.includes('00') ||
          color.includes('61'),
      );
      expect(blueColors.length).toBeGreaterThan(0);
    });

    it('应该包含绿色系颜色', () => {
      const greenColors = defaultColorList.filter(
        (color) =>
          color.includes('15e7') ||
          color.includes('33E5') ||
          color.includes('8954'),
      );
      expect(greenColors.length).toBeGreaterThan(0);
    });

    it('应该包含紫色系颜色', () => {
      const purpleColors = defaultColorList.filter(
        (color) =>
          color.includes('8954') ||
          color.includes('D666') ||
          color.includes('6151') ||
          color.includes('BF3C'),
      );
      expect(purpleColors.length).toBeGreaterThan(0);
    });

    it('应该包含粉色系颜色', () => {
      const pinkColors = defaultColorList.filter((color) =>
        color.includes('F45B'),
      );
      expect(pinkColors.length).toBeGreaterThan(0);
    });

    it('应该包含青色系颜色', () => {
      const cyanColors = defaultColorList.filter(
        (color) => color.includes('15e7') || color.includes('00A6'),
      );
      expect(cyanColors.length).toBeGreaterThan(0);
    });
  });
});

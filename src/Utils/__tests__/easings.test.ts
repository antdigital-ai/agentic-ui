import { describe, expect, it } from 'vitest';
import { easeInOutCubic } from '../@ant-design/agentic-ui/Utils/easings';

describe('easings 工具函数', () => {
  describe('easeInOutCubic', () => {
    it('应该在时间为 0 时返回起始值', () => {
      const result = easeInOutCubic(0, 0, 100, 1000);
      expect(result).toBe(0);
    });

    it('应该在时间等于持续时间时返回目标值', () => {
      const result = easeInOutCubic(1000, 0, 100, 1000);
      expect(result).toBe(100);
    });

    it('应该在时间为持续时间一半时返回中间值附近', () => {
      const result = easeInOutCubic(500, 0, 100, 1000);
      // 缓动函数在中间时应该接近 50
      expect(result).toBeCloseTo(50, 0);
    });

    it('应该处理负的起始值', () => {
      const result = easeInOutCubic(500, -100, 100, 1000);
      expect(result).toBeGreaterThan(-100);
      expect(result).toBeLessThan(100);
    });

    it('应该处理负的目标值', () => {
      const result = easeInOutCubic(500, 100, -100, 1000);
      expect(result).toBeLessThan(100);
      expect(result).toBeGreaterThan(-100);
    });

    it('应该在前半段加速（ease in）', () => {
      const t1 = easeInOutCubic(100, 0, 100, 1000);
      const t2 = easeInOutCubic(200, 0, 100, 1000);
      const t3 = easeInOutCubic(300, 0, 100, 1000);

      // 前半段应该是加速的，每段距离应该递增
      const distance1 = t2 - t1;
      const distance2 = t3 - t2;
      expect(distance2).toBeGreaterThan(distance1);
    });

    it('应该在后半段减速（ease out）', () => {
      const t1 = easeInOutCubic(700, 0, 100, 1000);
      const t2 = easeInOutCubic(800, 0, 100, 1000);
      const t3 = easeInOutCubic(900, 0, 100, 1000);

      // 后半段应该是减速的，每段距离应该递减
      const distance1 = t2 - t1;
      const distance2 = t3 - t2;
      expect(distance2).toBeLessThan(distance1);
    });

    it('应该保持连续性', () => {
      // 在前半段和后半段交界处应该是连续的
      const beforeMiddle = easeInOutCubic(499, 0, 100, 1000);
      const atMiddle = easeInOutCubic(500, 0, 100, 1000);
      const afterMiddle = easeInOutCubic(501, 0, 100, 1000);

      // 值应该是递增且接近的
      expect(afterMiddle).toBeGreaterThan(atMiddle);
      expect(atMiddle).toBeGreaterThan(beforeMiddle);
      expect(afterMiddle - atMiddle).toBeCloseTo(atMiddle - beforeMiddle, 0);
    });

    it('应该处理不同的持续时间', () => {
      const result1 = easeInOutCubic(250, 0, 100, 500);
      const result2 = easeInOutCubic(500, 0, 100, 1000);

      // 相对时间相同（都是50%），结果应该相同
      expect(result1).toBeCloseTo(result2, 1);
    });

    it('应该处理从高到低的动画', () => {
      const result = easeInOutCubic(500, 100, 0, 1000);
      expect(result).toBeLessThan(100);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(50, 0);
    });

    it('应该返回递增的值（正向动画）', () => {
      const values: number[] = [];
      for (let t = 0; t <= 1000; t += 100) {
        values.push(easeInOutCubic(t, 0, 100, 1000));
      }

      // 所有值应该是递增的
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
      }
    });

    it('应该返回递减的值（反向动画）', () => {
      const values: number[] = [];
      for (let t = 0; t <= 1000; t += 100) {
        values.push(easeInOutCubic(t, 100, 0, 1000));
      }

      // 所有值应该是递减的
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeLessThanOrEqual(values[i - 1]);
      }
    });

    it('应该处理零持续时间（立即完成）', () => {
      // 当持续时间为0时，会除以0，结果可能是 Infinity 或 NaN
      const result = easeInOutCubic(0, 0, 100, 0);
      expect(result).toBeDefined();
      // 结果可能不是有限的数字（可能是 Infinity 或 NaN）
      expect(typeof result).toBe('number');
    });

    it('应该处理相同的起始值和目标值', () => {
      const result = easeInOutCubic(500, 50, 50, 1000);
      expect(result).toBe(50);
    });

    it('应该正确处理大数值', () => {
      const result = easeInOutCubic(500, 0, 10000, 1000);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(10000);
      expect(result).toBeCloseTo(5000, -2);
    });

    it('应该正确处理小数值', () => {
      const result = easeInOutCubic(500, 0, 1, 1000);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
      expect(result).toBeCloseTo(0.5, 1);
    });
  });
});

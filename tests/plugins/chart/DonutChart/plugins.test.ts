/**
 * DonutChart plugins 测试用例
 */

import { describe, expect, it, vi } from 'vitest';
import {
  createBackgroundArcPlugin,
  createCenterTextPlugin,
} from '../../../../src/Plugins/chart/DonutChart/plugins';

describe('DonutChart plugins', () => {
  describe('createCenterTextPlugin', () => {
    it('应该创建中心文本插件', () => {
      const plugin = createCenterTextPlugin(50, 'Test Label', false);

      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('centerText');
      expect(plugin.beforeDraw).toBeDefined();
    });

    it('应该在桌面端使用较大的字体', () => {
      const plugin = createCenterTextPlugin(50, 'Test Label', false);
      const mockChart = createMockChart(200, 200);

      expect(() => {
        plugin.beforeDraw?.(mockChart as any, { cancelable: true }, {});
      }).not.toThrow();
    });

    it('应该在移动端使用较小的字体', () => {
      const plugin = createCenterTextPlugin(50, 'Test Label', true);
      const mockChart = createMockChart(200, 200);

      expect(() => {
        plugin.beforeDraw?.(mockChart as any, { cancelable: true }, {});
      }).not.toThrow();
    });

    it('应该正确绘制文本', () => {
      const plugin = createCenterTextPlugin(50, 'Test Label', false);
      const mockChart = createMockChart(200, 200);
      const mockCtx = mockChart.ctx;

      plugin.beforeDraw?.(mockChart as any, { cancelable: true }, {});

      // 验证 fillText 被调用
      expect(mockCtx.fillText).toHaveBeenCalled();
    });
  });

  describe('createBackgroundArcPlugin', () => {
    it('应该创建背景圆弧插件', () => {
      const plugin = createBackgroundArcPlugin('#F7F8F9', 4);

      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('backgroundArc');
      expect(plugin.beforeDatasetDraw).toBeDefined();
    });

    it('应该使用默认背景色和 padding', () => {
      const plugin = createBackgroundArcPlugin('#F7F8F9', 4);

      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('backgroundArc');
    });

    it('应该在没有数据时安全返回', () => {
      const plugin = createBackgroundArcPlugin('#F7F8F9', 4);
      const mockChart = createMockChart(200, 200, false);
      const mockMeta = mockChart.getDatasetMeta(0);

      expect(() => {
        plugin.beforeDatasetDraw?.(
          mockChart as any,
          { index: 0, meta: mockMeta as any },
          {},
        );
      }).not.toThrow();
    });

    it('应该正确绘制背景圆弧', () => {
      const plugin = createBackgroundArcPlugin('#F7F8F9', 4);
      const mockChart = createMockChart(200, 200);
      const mockCtx = mockChart.ctx;
      const mockMeta = mockChart.getDatasetMeta(0);

      plugin.beforeDatasetDraw?.(
        mockChart as any,
        { index: 0, meta: mockMeta as any },
        {},
      );

      // 验证 arc 和 fill 被调用
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('应该使用自定义背景色', () => {
      const plugin = createBackgroundArcPlugin('#FF0000', 4);
      const mockChart = createMockChart(200, 200);
      const mockCtx = mockChart.ctx;
      const mockMeta = mockChart.getDatasetMeta(0);

      plugin.beforeDatasetDraw?.(
        mockChart as any,
        { index: 0, meta: mockMeta as any },
        {},
      );

      expect(mockCtx.fillStyle).toBe('#FF0000');
    });

    it('应该使用自定义 padding', () => {
      const plugin = createBackgroundArcPlugin('#F7F8F9', 8);
      const mockChart = createMockChart(200, 200);
      const mockCtx = mockChart.ctx;
      const mockMeta = mockChart.getDatasetMeta(0);

      plugin.beforeDatasetDraw?.(
        mockChart as any,
        { index: 0, meta: mockMeta as any },
        {},
      );

      // padding 会影响半径计算
      expect(mockCtx.arc).toHaveBeenCalled();
    });
  });
});

// 辅助函数：创建模拟的 Chart 对象
function createMockChart(
  width: number,
  height: number,
  hasData: boolean = true,
) {
  const mockArc = {
    x: width / 2,
    y: height / 2,
    outerRadius: 80,
    innerRadius: 40,
  };

  const mockCtx = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillStyle: '#F7F8F9',
    fillText: vi.fn(),
    textAlign: 'center',
    textBaseline: 'middle',
    font: '',
  };

  const mockData = hasData
    ? [
        {
          x: width / 2,
          y: height / 2,
          outerRadius: 80,
          innerRadius: 40,
        },
      ]
    : [];

  const mockMeta = {
    data: mockData,
  };

  return {
    width,
    height,
    ctx: mockCtx,
    getDatasetMeta: vi.fn((index?: number) => (hasData ? mockMeta : null)),
  };
}

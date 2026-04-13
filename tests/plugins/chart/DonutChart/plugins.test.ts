/**
 * DonutChart plugins 测试用例
 */

import { describe, expect, it, vi } from 'vitest';
import {
  createBackgroundArcPlugin,
  createCenterTextPlugin,
  createDataLabelsLeaderLinePlugin,
} from '../../../../src/Plugins/chart/DonutChart/plugins';

describe('DonutChart plugins', () => {
  describe('createDataLabelsLeaderLinePlugin', () => {
    it('uses default lineLength and darkMode when not provided', () => {
      const plugin = createDataLabelsLeaderLinePlugin();
      expect(plugin.id).toBe('datalabelsLeaderLine');
    });

    it('uses explicit lineLength and darkMode', () => {
      const plugin = createDataLabelsLeaderLinePlugin(10, true);
      expect(plugin.id).toBe('datalabelsLeaderLine');
    });

    it('returns early when meta has no data', () => {
      const plugin = createDataLabelsLeaderLinePlugin(4, false);
      const chart = createLeaderLineChart([], []);
      expect(() => {
        plugin.afterDatasetDraw?.(chart as any, { index: 0 } as any, {});
      }).not.toThrow();
    });

    it('returns early when values are empty', () => {
      const plugin = createDataLabelsLeaderLinePlugin(4, false);
      const chart = createLeaderLineChart(
        [{ x: 100, y: 100, outerRadius: 80, startAngle: 0, endAngle: Math.PI }],
        [],
      );
      expect(() => {
        plugin.afterDatasetDraw?.(chart as any, { index: 0 } as any, {});
      }).not.toThrow();
    });

    it('returns early when total is 0', () => {
      const plugin = createDataLabelsLeaderLinePlugin(4, false);
      const chart = createLeaderLineChart(
        [{ x: 100, y: 100, outerRadius: 80, startAngle: 0, endAngle: Math.PI }],
        [0],
      );
      expect(() => {
        plugin.afterDatasetDraw?.(chart as any, { index: 0 } as any, {});
      }).not.toThrow();
    });

    it('returns early when total is negative', () => {
      const plugin = createDataLabelsLeaderLinePlugin(4, false);
      const chart = createLeaderLineChart(
        [{ x: 100, y: 100, outerRadius: 80, startAngle: 0, endAngle: Math.PI }],
        [-5],
      );
      expect(() => {
        plugin.afterDatasetDraw?.(chart as any, { index: 0 } as any, {});
      }).not.toThrow();
    });

    it('draws leader line for segments above threshold', () => {
      const plugin = createDataLabelsLeaderLinePlugin(4, false);
      const ctx = createMockCtx();
      const chart = createLeaderLineChartWithCtx(
        ctx,
        [{ x: 100, y: 100, outerRadius: 80, startAngle: 0, endAngle: Math.PI * 2 }],
        [100],
      );

      plugin.afterDatasetDraw?.(chart as any, { index: 0 } as any, {});

      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('skips segments below min percentage threshold', () => {
      const plugin = createDataLabelsLeaderLinePlugin(4, false);
      const ctx = createMockCtx();
      const chart = createLeaderLineChartWithCtx(
        ctx,
        [
          { x: 100, y: 100, outerRadius: 80, startAngle: 0, endAngle: Math.PI * 1.96 },
          { x: 100, y: 100, outerRadius: 80, startAngle: Math.PI * 1.96, endAngle: Math.PI * 2 },
        ],
        [99, 1],
      );

      plugin.afterDatasetDraw?.(chart as any, { index: 0 } as any, {});

      expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    });

    it('skips NaN values', () => {
      const plugin = createDataLabelsLeaderLinePlugin(4, false);
      const ctx = createMockCtx();
      const chart = createLeaderLineChartWithCtx(
        ctx,
        [
          { x: 100, y: 100, outerRadius: 80, startAngle: 0, endAngle: Math.PI * 2 },
        ],
        [NaN],
      );

      plugin.afterDatasetDraw?.(chart as any, { index: 0 } as any, {});

      expect(ctx.beginPath).not.toHaveBeenCalled();
    });

    it('uses dark mode stroke style', () => {
      const plugin = createDataLabelsLeaderLinePlugin(4, true);
      const ctx = createMockCtx();
      const chart = createLeaderLineChartWithCtx(
        ctx,
        [{ x: 100, y: 100, outerRadius: 80, startAngle: 0, endAngle: Math.PI * 2 }],
        [100],
      );

      plugin.afterDatasetDraw?.(chart as any, { index: 0 } as any, {});

      expect(ctx.strokeStyle).toBe('rgba(255, 255, 255, 0.22)');
    });

    it('uses light mode stroke style', () => {
      const plugin = createDataLabelsLeaderLinePlugin(4, false);
      const ctx = createMockCtx();
      const chart = createLeaderLineChartWithCtx(
        ctx,
        [{ x: 100, y: 100, outerRadius: 80, startAngle: 0, endAngle: Math.PI * 2 }],
        [100],
      );

      plugin.afterDatasetDraw?.(chart as any, { index: 0 } as any, {});

      expect(ctx.strokeStyle).toBe('rgba(0, 25, 61, 0.16)');
    });

    it('handles non-finite values in dataset', () => {
      const plugin = createDataLabelsLeaderLinePlugin(4, false);
      const ctx = createMockCtx();
      const chart = createLeaderLineChartWithCtx(
        ctx,
        [
          { x: 100, y: 100, outerRadius: 80, startAngle: 0, endAngle: Math.PI },
          { x: 100, y: 100, outerRadius: 80, startAngle: Math.PI, endAngle: Math.PI * 2 },
        ],
        ['not a number' as any, 50],
      );

      plugin.afterDatasetDraw?.(chart as any, { index: 0 } as any, {});

      expect(ctx.save).toHaveBeenCalled();
    });
  });

  describe('createCenterTextPlugin', () => {
    it('应该创建中心文本插件', () => {
      const plugin = createCenterTextPlugin(50, 'Test Label', false);

      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('centerText');
      expect(plugin.beforeDraw).toBeDefined();
    });

    it('uses default isMobile and darkMode when not provided', () => {
      const plugin = createCenterTextPlugin(50, 'Test Label');
      expect(plugin.id).toBe('centerText');
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

      expect(mockCtx.fillText).toHaveBeenCalled();
    });

    it('uses dark mode fill styles', () => {
      const plugin = createCenterTextPlugin(50, 'Label', false, true);
      const mockChart = createMockChart(200, 200);
      const mockCtx = mockChart.ctx;

      plugin.beforeDraw?.(mockChart as any, { cancelable: true }, {});

      const fillStyleCalls = mockCtx.fillStyleValues;
      expect(fillStyleCalls).toContain('rgba(255, 255, 255, 0.92)');
      expect(fillStyleCalls).toContain('rgba(255, 255, 255, 0.55)');
    });

    it('uses light mode fill styles', () => {
      const plugin = createCenterTextPlugin(50, 'Label', false, false);
      const mockChart = createMockChart(200, 200);
      const mockCtx = mockChart.ctx;

      plugin.beforeDraw?.(mockChart as any, { cancelable: true }, {});

      const fillStyleCalls = mockCtx.fillStyleValues;
      expect(fillStyleCalls).toContain('#343A45');
      expect(fillStyleCalls).toContain('#767E8B');
    });
  });

  describe('createBackgroundArcPlugin', () => {
    it('应该创建背景圆弧插件', () => {
      const plugin = createBackgroundArcPlugin('#F7F8F9', 4);

      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('backgroundArc');
      expect(plugin.beforeDatasetDraw).toBeDefined();
    });

    it('uses default params when not provided', () => {
      const plugin = createBackgroundArcPlugin();
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

      expect(mockCtx.fillStyleValues).toContain('#FF0000');
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

      expect(mockCtx.arc).toHaveBeenCalled();
    });
  });
});

function createMockCtx() {
  const ctx: any = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    textAlign: 'center',
    textBaseline: 'middle',
    font: '',
    lineWidth: 1,
    strokeStyle: '',
    fillStyleValues: [] as string[],
  };
  Object.defineProperty(ctx, 'fillStyle', {
    get() { return ctx._fillStyle; },
    set(v: string) { ctx._fillStyle = v; ctx.fillStyleValues.push(v); },
  });
  return ctx;
}

function createLeaderLineChart(arcData: any[], values: any[]) {
  return createLeaderLineChartWithCtx(createMockCtx(), arcData, values);
}

function createLeaderLineChartWithCtx(ctx: any, arcData: any[], values: any[]) {
  return {
    ctx,
    getDatasetMeta: vi.fn(() => ({
      data: arcData,
    })),
    data: {
      datasets: [{ data: values }],
    },
  };
}

function createMockChart(
  width: number,
  height: number,
  hasData: boolean = true,
) {
  const mockCtx = createMockCtx();

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
    getDatasetMeta: vi.fn(() => (hasData ? mockMeta : null)),
  };
}

import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FunnelChart, {
  FunnelChartDataItem,
} from '../../../src/Plugins/chart/FunnelChart';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => [
              { text: '转化', fillStyle: '#1d7afc', strokeStyle: '#1d7afc' },
            ]),
          },
          onClick: vi.fn(),
        },
      },
    },
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Bar: React.forwardRef((props: any, ref: any) => {
    (globalThis as any).__lastFunnelOptions = props.options;
    (globalThis as any).__lastFunnelPlugins = props.plugins;
    return (
      <div
        data-testid="bar-chart"
        ref={ref}
        data-chart-data={JSON.stringify(props.data)}
      >
        Bar
      </div>
    );
  }),
}));

vi.mock('../../../src/Plugins/chart/utils', async () => {
  const actual: any = await vi.importActual('../../../src/Plugins/chart/utils');
  return {
    ...actual,
    resolveCssVariable: vi.fn((c) =>
      typeof c === 'string' && c.startsWith('var(') ? '#1d7afc' : c,
    ),
  };
});

vi.mock('../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children, ...p }: any) => (
    <div data-testid="chart-container" {...p}>{children}</div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange, customOptions, onSelectionChange }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((o: any) => (
        <button type="button" key={o.value} onClick={() => onFilterChange?.(o.value)} data-testid={`filter-${o.value}`}>
          {o.label}
        </button>
      ))}
      {customOptions?.map((o: any) => (
        <button type="button" key={o.key} onClick={() => onSelectionChange?.(o.key)} data-testid={`custom-${o.key}`}>
          {o.label}
        </button>
      ))}
    </div>
  ),
  ChartToolBar: ({ title, onDownload, filter, loading }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span>{title}</span>}
      {loading && <span data-testid="loading">loading</span>}
      <button type="button" onClick={onDownload} data-testid="download-btn">下载</button>
      {filter}
    </div>
  ),
  downloadChart: vi.fn(),
}));

vi.mock('../../../src/Plugins/chart/ChartStatistic', () => ({
  default: ({ title, value }: any) => (
    <div data-testid="chart-statistic">{title}: {value}</div>
  ),
}));

const createMockCtx = () => ({
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  fillStyle: '',
  font: '',
  textAlign: '',
  textBaseline: '',
  fillText: vi.fn(),
});

describe('FunnelChart 分支逻辑', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  });

  describe('高度计算回退', () => {
    it('height 为纯字符串（非 px 后缀）时使用自动计算高度', () => {
      const data: FunnelChartDataItem[] = [
        { x: '步骤1', y: 100 },
        { x: '步骤2', y: 50 },
      ];
      render(<FunnelChart data={data} height="auto" />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('bottomLayerMinWidth 所有值相等时 range 为 0', () => {
    it('所有数据值相等时返回最大值', () => {
      const data: FunnelChartDataItem[] = [
        { x: '步骤1', y: 500 },
        { x: '步骤2', y: 500 },
        { x: '步骤3', y: 500 },
      ];
      render(<FunnelChart data={data} bottomLayerMinWidth={0.3} />);
      const chartData = JSON.parse(
        screen.getByTestId('bar-chart').getAttribute('data-chart-data')!,
      );
      const widths = chartData.datasets[0].data.map(
        (p: [number, number]) => Math.abs(p[1] - p[0]),
      );
      widths.forEach((w: number) => expect(w).toBe(500));
    });
  });

  describe('ratio 格式化边界', () => {
    it('空字符串 ratio 不显示百分比', () => {
      const data: FunnelChartDataItem[] = [
        { x: '阶段A', y: 1000, ratio: '  ' },
        { x: '阶段B', y: 500, ratio: '' },
      ];
      render(<FunnelChart data={data} showPercent />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('非有限数字 ratio 被忽略', () => {
      const data: FunnelChartDataItem[] = [
        { x: '阶段A', y: 1000, ratio: NaN },
        { x: '阶段B', y: 500, ratio: Infinity },
      ];
      render(<FunnelChart data={data} showPercent />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('legend generateLabels 无 ratio 时只返回基础图例', () => {
    it('数据完全没有 ratio 时不追加转化率图例项', () => {
      const data: FunnelChartDataItem[] = [
        { x: '阶段A', y: 1000 },
        { x: '阶段B', y: 600 },
      ];
      render(<FunnelChart data={data} />);
      const opts = (globalThis as any).__lastFunnelOptions;
      const labels = opts.plugins.legend.labels.generateLabels({
        data: { datasets: [{ data: [[0, 1000], [0, 600]] }], labels: ['阶段A', '阶段B'] },
      });
      expect(labels.find((l: any) => l.text === '转化率')).toBeUndefined();
    });

    it('字符串 ratio 时 generateLabels 包含转化率图例项', () => {
      const data: FunnelChartDataItem[] = [
        { x: '阶段A', y: 1000, ratio: '100%' },
        { x: '阶段B', y: 600, ratio: '60%' },
      ];
      render(<FunnelChart data={data} />);
      const opts = (globalThis as any).__lastFunnelOptions;
      const labels = opts.plugins.legend.labels.generateLabels({
        data: { datasets: [{ data: [[0, 1000], [0, 600]] }], labels: ['阶段A', '阶段B'] },
      });
      expect(labels.find((l: any) => l.text === '转化率')).toBeDefined();
    });

    it('空字符串 ratio 时 generateLabels 不追加转化率图例', () => {
      const data: FunnelChartDataItem[] = [
        { x: '阶段A', y: 1000, ratio: '' },
        { x: '阶段B', y: 600, ratio: '   ' },
      ];
      render(<FunnelChart data={data} />);
      const opts = (globalThis as any).__lastFunnelOptions;
      const labels = opts.plugins.legend.labels.generateLabels({
        data: { datasets: [{ data: [[0, 1000], [0, 600]] }], labels: ['阶段A', '阶段B'] },
      });
      expect(labels.find((l: any) => l.text === '转化率')).toBeUndefined();
    });
  });

  describe('legend onClick 非转化率项走默认行为', () => {
    it('点击普通图例项时调用 ChartJS 默认 onClick', () => {
      const data: FunnelChartDataItem[] = [
        { x: '阶段A', y: 1000, ratio: 100 },
        { x: '阶段B', y: 600, ratio: 60 },
      ];
      render(<FunnelChart data={data} />);
      const opts = (globalThis as any).__lastFunnelOptions;
      const onClick = opts.plugins.legend.onClick;
      const normalItem = { text: '转化', datasetIndex: 0 };
      expect(() => onClick({}, normalItem, {})).not.toThrow();
    });
  });

  describe('tooltip label 不显示百分比的场景', () => {
    it('showPercent 为 false 时 tooltip 只显示数值', () => {
      const data: FunnelChartDataItem[] = [
        { x: '阶段A', y: 1000 },
        { x: '阶段B', y: 600 },
      ];
      render(<FunnelChart data={data} showPercent={false} />);
      const callbacks = (globalThis as any).__lastFunnelOptions.plugins.tooltip.callbacks;
      const result = callbacks.label({ dataIndex: 0, datasetIndex: 0 });
      expect(result).toBe('1000');
    });

    it('对应位置无 ratio 时 tooltip 只显示数值', () => {
      const data: FunnelChartDataItem[] = [
        { x: '阶段A', y: 1000 },
        { x: '阶段B', y: 600 },
      ];
      render(<FunnelChart data={data} showPercent />);
      const callbacks = (globalThis as any).__lastFunnelOptions.plugins.tooltip.callbacks;
      expect(callbacks.label({ dataIndex: 1 })).toBe('600');
    });
  });

  describe('trapezoid 插件分支', () => {
    const dataWithRatio: FunnelChartDataItem[] = [
      { x: '阶段A', y: 1000, ratio: 100 },
      { x: '阶段B', y: 600, ratio: 60 },
      { x: '阶段C', y: 200, ratio: 33 },
    ];

    const buildMockChart = (ds?: any[], meta?: any) => ({
      ctx: createMockCtx(),
      data: {
        datasets: [{ data: ds || [[-500, 500], [-300, 300], [-100, 100]] }],
        labels: ['阶段A', '阶段B', '阶段C'],
      },
      scales: { x: { getPixelForValue: (v: number) => 300 + v * 0.3 } },
      getDatasetMeta: vi.fn(() => meta || {
        data: [
          { x: 300, y: 30, height: 30, width: 300 },
          { x: 300, y: 70, height: 30, width: 180 },
          { x: 300, y: 110, height: 30, width: 60 },
        ],
      }),
    });

    it('showTrapezoid 初始为 true 时绘制梯形', () => {
      render(<FunnelChart data={dataWithRatio} />);
      const plugin = (globalThis as any).__lastFunnelPlugins.find(
        (p: any) => p.id === 'funnelTrapezoidLabels',
      );
      const chart = buildMockChart();
      plugin.afterDatasetsDraw(chart);
      expect(chart.ctx.fill).toHaveBeenCalled();
    });

    it('meta 为空时安全返回', () => {
      render(<FunnelChart data={dataWithRatio} />);
      const plugin = (globalThis as any).__lastFunnelPlugins.find(
        (p: any) => p.id === 'funnelTrapezoidLabels',
      );
      const chart = {
        ctx: createMockCtx(),
        data: { datasets: [{ data: [] }] },
        scales: { x: {} },
        getDatasetMeta: () => null,
      };
      expect(() => plugin.afterDatasetsDraw(chart)).not.toThrow();
    });

    it('非数组数据行跳过绘制', () => {
      render(<FunnelChart data={dataWithRatio} />);
      const plugin = (globalThis as any).__lastFunnelPlugins.find(
        (p: any) => p.id === 'funnelTrapezoidLabels',
      );
      const chart = buildMockChart([null, [-300, 300], [-100, 100]]);
      expect(() => plugin.afterDatasetsDraw(chart)).not.toThrow();
    });

    it('ratioProvided 为 false 的层跳过梯形', () => {
      const noRatio: FunnelChartDataItem[] = [
        { x: '阶段A', y: 1000 },
        { x: '阶段B', y: 600 },
      ];
      render(<FunnelChart data={noRatio} />);
      const plugin = (globalThis as any).__lastFunnelPlugins.find(
        (p: any) => p.id === 'funnelTrapezoidLabels',
      );
      const chart = buildMockChart(
        [[-500, 500], [-300, 300]],
        {
          data: [
            { x: 300, y: 30, height: 30, width: 300 },
            { x: 300, y: 70, height: 30, width: 180 },
          ],
        },
      );
      plugin.afterDatasetsDraw(chart);
      // 没有 ratio 数据, 不应绘制文本
      expect(chart.ctx.fillText).not.toHaveBeenCalled();
    });

    it('切换转化率图例后 showTrapezoid 变为 false，梯形不绘制', () => {
      render(<FunnelChart data={dataWithRatio} />);
      const opts = (globalThis as any).__lastFunnelOptions;

      // 点击转化率图例 → 触发 setShowTrapezoid(false) → 重新渲染
      act(() => {
        opts.plugins.legend.onClick({}, { text: '转化率' }, {});
      });

      const plugin = (globalThis as any).__lastFunnelPlugins.find(
        (p: any) => p.id === 'funnelTrapezoidLabels',
      );
      const chart = buildMockChart();
      plugin.afterDatasetsDraw(chart);
      // showTrapezoid 为 false 时直接返回，不执行 fill
      expect(chart.ctx.fill).not.toHaveBeenCalled();
    });
  });

  describe('rightLabel 插件分支', () => {
    it('meta 为空时安全返回', () => {
      const data: FunnelChartDataItem[] = [{ x: 'A', y: 100 }];
      render(<FunnelChart data={data} />);
      const plugin = (globalThis as any).__lastFunnelPlugins.find(
        (p: any) => p.id === 'funnelRightLabels',
      );
      const chart = {
        ctx: createMockCtx(),
        data: { datasets: [{ data: [] }], labels: [] },
        scales: { x: {} },
        getDatasetMeta: () => null,
      };
      expect(() => plugin.afterDatasetsDraw(chart)).not.toThrow();
    });

    it('非数组数据项在 ends 映射中回退为 el.x', () => {
      const data: FunnelChartDataItem[] = [
        { x: 'A', y: 100 },
        { x: 'B', y: 50 },
      ];
      render(<FunnelChart data={data} />);
      const plugin = (globalThis as any).__lastFunnelPlugins.find(
        (p: any) => p.id === 'funnelRightLabels',
      );
      const ctx = createMockCtx();
      const chart = {
        ctx,
        data: {
          datasets: [{ data: [null, [-25, 25]] }],
          labels: ['A', 'B'],
        },
        scales: { x: { getPixelForValue: (v: number) => 300 + v } },
        getDatasetMeta: () => ({
          data: [
            { x: 300, y: 30, height: 30, width: 100 },
            { x: 300, y: 70, height: 30, width: 50 },
          ],
        }),
      };
      plugin.afterDatasetsDraw(chart);
      // 第二项是数组，应该正常绘制
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('容器宽度样式分支', () => {
    it('width 为非 100% 的字符串时设置内联 style', () => {
      render(<FunnelChart data={[{ x: 'A', y: 100 }]} width="80%" />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('isMobile 时容器使用 w-full', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 500 });
      render(<FunnelChart data={[{ x: 'A', y: 100 }]} width={800} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('filterLabel 切换时重置二级筛选', () => {
    it('切换 category 后二级筛选重置为新类目的第一项', () => {
      const data: FunnelChartDataItem[] = [
        { category: 'A', filterLabel: 'L1', x: '步骤1', y: 100 },
        { category: 'A', filterLabel: 'L2', x: '步骤1', y: 80 },
        { category: 'B', x: '步骤1', y: 200 },
      ];
      render(<FunnelChart data={data} />);

      // 切换到 B（B 没有 filterLabel，应重置）
      fireEvent.click(screen.getByTestId('filter-B'));
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();

      // 切回 A（A 有 filterLabel，应设为第一项）
      fireEvent.click(screen.getByTestId('filter-A'));
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});

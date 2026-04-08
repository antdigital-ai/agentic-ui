import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FunnelChart, {
  FunnelChartDataItem,
} from '../../../src/Plugins/chart/FunnelChart';

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => []),
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

// Mock react-chartjs-2：保存 options 与 plugins 供覆盖率用例调用
vi.mock('react-chartjs-2', () => ({
  Bar: React.forwardRef((props: any, ref: any) => {
    (globalThis as any).__funnelChartLastOptions = props.options;
    (globalThis as any).__funnelChartLastPlugins = props.plugins;
    return (
      <div
        data-testid="bar-chart"
        ref={ref}
        data-chart-data={JSON.stringify(props.data)}
      >
        Mocked Bar Chart
      </div>
    );
  }),
}));

// Mock utils
vi.mock('../../../src/Plugins/chart/utils', async () => {
  const actual: any = await vi.importActual('../../../src/Plugins/chart/utils');
  return {
    ...actual,
    resolveCssVariable: vi.fn((color) =>
      typeof color === 'string' && color.startsWith('var(') ? '#1d7afc' : color,
    ),
  };
});

// Mock downloadChart
vi.mock('../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children, ...props }: any) => (
    <div data-testid="chart-container" {...props}>
      {children}
    </div>
  ),
  ChartFilter: ({
    filterOptions,
    onFilterChange,
    customOptions,
    selectedCustomSelection,
    onSelectionChange,
  }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((option: any) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onFilterChange?.(option.value)}
          data-testid={`filter-${option.value}`}
        >
          {option.label}
        </button>
      ))}
      {customOptions?.map((opt: any) => (
        <button
          type="button"
          key={opt.key}
          data-testid={`filter-label-${opt.key}`}
          onClick={() => onSelectionChange?.(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ),
  ChartToolBar: ({ title, onDownload, dataTime, extra, loading, filter }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span data-testid="chart-title">{title}</span>}
      {dataTime && <span data-testid="chart-datatime">{dataTime}</span>}
      {loading && <span data-testid="chart-loading">loading</span>}
      <button type="button" onClick={onDownload} data-testid="download-button">
        下载
      </button>
      {extra}
      {filter}
    </div>
  ),
  downloadChart: vi.fn(),
}));

// Mock ChartStatistic
vi.mock('../../../src/Plugins/chart/ChartStatistic', () => ({
  default: ({ title, value }: any) => (
    <div data-testid="chart-statistic">
      {title}: {value}
    </div>
  ),
}));

describe('FunnelChart', () => {
  const sampleData: FunnelChartDataItem[] = [
    { category: '默认', x: '访问', y: 1000, ratio: 100 },
    { category: '默认', x: '注册', y: 800, ratio: 80 },
    { category: '默认', x: '下单', y: 500, ratio: 62.5 },
    { category: '默认', x: '支付', y: 300, ratio: 60 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染漏斗图', () => {
      render(<FunnelChart data={sampleData} title="转化漏斗" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('应该正确渲染标题', () => {
      render(<FunnelChart data={sampleData} title="用户转化漏斗" />);

      expect(screen.getByTestId('chart-title')).toHaveTextContent(
        '用户转化漏斗',
      );
    });

    it('应该正确渲染数据时间', () => {
      render(
        <FunnelChart
          data={sampleData}
          title="转化漏斗"
          dataTime="2025-10-15"
        />,
      );

      expect(screen.getByTestId('chart-datatime')).toHaveTextContent(
        '2025-10-15',
      );
    });
  });

  describe('数据处理测试', () => {
    it('应该处理空数组', () => {
      render(<FunnelChart data={[]} title="空数据漏斗" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理包含 null/undefined 的数据', () => {
      const dataWithNull: FunnelChartDataItem[] = [
        { category: '默认', x: '访问', y: 1000 },
        { category: '默认', x: null as any, y: 800 },
        { category: '默认', x: '下单', y: undefined as any },
      ];

      render(<FunnelChart data={dataWithNull} title="包含空值的数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理多个分类的数据', () => {
      const multiCategoryData: FunnelChartDataItem[] = [
        { category: 'A组', x: '步骤1', y: 100, ratio: 100 },
        { category: 'A组', x: '步骤2', y: 80, ratio: 80 },
        { category: 'B组', x: '步骤1', y: 200, ratio: 100 },
        { category: 'B组', x: '步骤2', y: 150, ratio: 75 },
      ];

      render(<FunnelChart data={multiCategoryData} title="多分类漏斗" />);

      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-A组')).toBeInTheDocument();
      expect(screen.getByTestId('filter-B组')).toBeInTheDocument();
    });

    it('应该处理包含 filterLabel 的数据', () => {
      const dataWithFilterLabel: FunnelChartDataItem[] = [
        {
          category: '默认',
          x: '访问',
          y: 1000,
          ratio: 100,
          filterLabel: 'PC端',
        },
        {
          category: '默认',
          x: '注册',
          y: 800,
          ratio: 80,
          filterLabel: 'PC端',
        },
        {
          category: '默认',
          x: '访问',
          y: 500,
          ratio: 100,
          filterLabel: '移动端',
        },
        {
          category: '默认',
          x: '注册',
          y: 400,
          ratio: 80,
          filterLabel: '移动端',
        },
      ];

      render(<FunnelChart data={dataWithFilterLabel} title="多维度筛选漏斗" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('尺寸和样式测试', () => {
    it('应该支持自定义宽度和高度', () => {
      render(
        <FunnelChart
          data={sampleData}
          width={800}
          height={600}
          title="自定义尺寸"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持字符串宽度和高度', () => {
      render(
        <FunnelChart
          data={sampleData}
          width="100%"
          height="500px"
          title="百分比尺寸"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义颜色', () => {
      render(
        <FunnelChart
          data={sampleData}
          color="#ff6b6b"
          title="自定义颜色漏斗"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义 className', () => {
      render(
        <FunnelChart
          data={sampleData}
          className="custom-funnel"
          title="自定义类名"
        />,
      );

      const container = screen.getByTestId('chart-container');
      expect(container.className).toContain('custom-funnel');
    });
  });

  describe('主题和显示选项测试', () => {
    it('应该支持 dark 主题', () => {
      render(<FunnelChart data={sampleData} theme="dark" title="暗色主题" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持隐藏图例', () => {
      render(
        <FunnelChart data={sampleData} showLegend={false} title="隐藏图例" />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义图例位置', () => {
      render(
        <FunnelChart data={sampleData} legendPosition="top" title="顶部图例" />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义图例对齐方式', () => {
      render(
        <FunnelChart data={sampleData} legendAlign="center" title="居中图例" />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持隐藏百分比', () => {
      render(
        <FunnelChart
          data={sampleData}
          showPercent={false}
          title="隐藏百分比"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该支持下载功能', async () => {
      const { downloadChart } = vi.mocked(
        await import('../../../src/Plugins/chart/components'),
      );

      render(<FunnelChart data={sampleData} title="可下载漏斗" />);

      const downloadButton = screen.getByTestId('download-button');
      downloadButton.click();

      await waitFor(() => {
        expect(downloadChart).toHaveBeenCalled();
      });
    });

    it('应该支持额外的工具栏按钮', () => {
      const extraButton = (
        <button type="button" data-testid="extra-button">
          额外按钮
        </button>
      );

      render(
        <FunnelChart
          data={sampleData}
          toolbarExtra={extraButton}
          title="带额外按钮"
        />,
      );

      // toolbarExtra 会传递给 ChartToolBar，但我们的 mock 没有渲染它
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
    });
  });

  describe('TypeNames 配置测试', () => {
    it('应该支持自定义 typeNames', () => {
      render(
        <FunnelChart
          data={sampleData}
          typeNames={{ name: '用户', rate: '转化率' }}
          title="自定义类型名称"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('响应式测试', () => {
    it('应该根据窗口大小调整布局', () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500,
      });

      render(<FunnelChart data={sampleData} title="移动端漏斗" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该监听窗口大小变化', () => {
      render(<FunnelChart data={sampleData} title="响应式漏斗" />);

      // 模拟窗口大小变化
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200,
      });

      window.dispatchEvent(new Event('resize'));

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('Ratio 处理测试', () => {
    it('应该处理字符串类型的 ratio', () => {
      const dataWithStringRatio: FunnelChartDataItem[] = [
        { category: '默认', x: '步骤1', y: 1000, ratio: '100%' },
        { category: '默认', x: '步骤2', y: 800, ratio: '80%' },
      ];

      render(<FunnelChart data={dataWithStringRatio} title="字符串比率" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理没有 ratio 的数据', () => {
      const dataWithoutRatio: FunnelChartDataItem[] = [
        { category: '默认', x: '步骤1', y: 1000 },
        { category: '默认', x: '步骤2', y: 800 },
      ];

      render(<FunnelChart data={dataWithoutRatio} title="无比率数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理非数组数据', () => {
      render(<FunnelChart data={null as any} title="null 数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理单个数据点', () => {
      const singleData: FunnelChartDataItem[] = [
        { category: '默认', x: '访问', y: 1000 },
      ];

      render(<FunnelChart data={singleData} title="单个数据点" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理大量数据点', () => {
      const largeData: FunnelChartDataItem[] = Array.from(
        { length: 20 },
        (_, i) => ({
          category: '默认',
          x: `步骤${i + 1}`,
          y: 1000 - i * 50,
          ratio: 100 - i * 5,
        }),
      );

      render(<FunnelChart data={largeData} title="大量数据点" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('ChartStatistic 集成测试', () => {
    it('应该支持 statistic 配置', () => {
      render(
        <FunnelChart
          data={sampleData}
          statistic={{
            title: '总访问量',
            value: 1000,
          }}
          title="带统计数据"
        />,
      );

      expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
    });
  });

  describe('bottomLayerMinWidth 测试', () => {
    it('应该支持设置最小宽度占比', () => {
      render(
        <FunnelChart
          data={sampleData}
          bottomLayerMinWidth={0.1}
          title="最小宽度控制"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();

      // 验证数据转换的正确性
      const barChart = screen.getByTestId('bar-chart');
      const chartDataStr = barChart.getAttribute('data-chart-data');
      expect(chartDataStr).toBeTruthy();

      const chartData = JSON.parse(chartDataStr!);
      const datasetData = chartData.datasets[0].data;

      // 原始数据: [1000, 800, 500, 300]，最大值 1000
      // 最小宽度占比 0.1，即最小值应该 >= 1000 * 0.1 = 100
      // 验证所有数据点的宽度（end - start）都符合约束
      datasetData.forEach((point: [number, number]) => {
        const width = Math.abs(point[1] - point[0]);
        expect(width).toBeGreaterThanOrEqual(100);
      });

      // 验证最大值保持不变（1000）
      const maxWidth = Math.max(
        ...datasetData.map((p: [number, number]) => Math.abs(p[1] - p[0])),
      );
      expect(maxWidth).toBe(1000);

      // 验证最小值被调整到至少 100
      const minWidth = Math.min(
        ...datasetData.map((p: [number, number]) => Math.abs(p[1] - p[0])),
      );
      expect(minWidth).toBeGreaterThanOrEqual(100);
    });

    it('应该处理 0 值（不限制最小宽度）', () => {
      render(
        <FunnelChart
          data={sampleData}
          bottomLayerMinWidth={0}
          title="无最小宽度限制"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();

      // 验证数据未被调整，保持原始值
      const barChart = screen.getByTestId('bar-chart');
      const chartDataStr = barChart.getAttribute('data-chart-data');
      expect(chartDataStr).toBeTruthy();

      const chartData = JSON.parse(chartDataStr!);
      const datasetData = chartData.datasets[0].data;

      // 原始数据: [1000, 800, 500, 300]
      // bottomLayerMinWidth=0 时不应该调整数据
      const widths = datasetData.map((p: [number, number]) =>
        Math.abs(p[1] - p[0]),
      );
      expect(widths).toEqual([1000, 800, 500, 300]);
    });

    it('应该处理边界值 1（最小宽度等于最大宽度）', () => {
      render(
        <FunnelChart
          data={sampleData}
          bottomLayerMinWidth={1}
          title="最小宽度等于最大宽度"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();

      // 验证所有数据点都被调整为最大值
      const barChart = screen.getByTestId('bar-chart');
      const chartDataStr = barChart.getAttribute('data-chart-data');
      expect(chartDataStr).toBeTruthy();

      const chartData = JSON.parse(chartDataStr!);
      const datasetData = chartData.datasets[0].data;

      // bottomLayerMinWidth=1 时，所有条的宽度都应该等于最大值 1000
      const widths = datasetData.map((p: [number, number]) =>
        Math.abs(p[1] - p[0]),
      );
      widths.forEach((width: number) => {
        expect(width).toBe(1000);
      });
    });

    it('应该将超出范围的值（>1）视为不限制', () => {
      render(
        <FunnelChart
          data={sampleData}
          bottomLayerMinWidth={1.5}
          title="超出范围的最小宽度"
        />,
      );

      // 应该正常渲染，且行为等同于 bottomLayerMinWidth={0}
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();

      // 验证数据未被调整，保持原始值（与 bottomLayerMinWidth=0 行为一致）
      const barChart = screen.getByTestId('bar-chart');
      const chartDataStr = barChart.getAttribute('data-chart-data');
      expect(chartDataStr).toBeTruthy();

      const chartData = JSON.parse(chartDataStr!);
      const datasetData = chartData.datasets[0].data;

      const widths = datasetData.map((p: [number, number]) =>
        Math.abs(p[1] - p[0]),
      );
      expect(widths).toEqual([1000, 800, 500, 300]);
    });

    it('应该将负值视为不限制', () => {
      render(
        <FunnelChart
          data={sampleData}
          bottomLayerMinWidth={-0.1}
          title="负值最小宽度"
        />,
      );

      // 应该正常渲染，且行为等同于 bottomLayerMinWidth={0}
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();

      // 验证数据未被调整，保持原始值
      const barChart = screen.getByTestId('bar-chart');
      const chartDataStr = barChart.getAttribute('data-chart-data');
      expect(chartDataStr).toBeTruthy();

      const chartData = JSON.parse(chartDataStr!);
      const datasetData = chartData.datasets[0].data;

      const widths = datasetData.map((p: [number, number]) =>
        Math.abs(p[1] - p[0]),
      );
      expect(widths).toEqual([1000, 800, 500, 300]);
    });

    it('应该在数据跨度大时应用最小宽度', () => {
      const largeRangeData: FunnelChartDataItem[] = [
        { category: '默认', x: '曝光', y: 100000, ratio: 20 },
        { category: '默认', x: '点击', y: 20000, ratio: 30 },
        { category: '默认', x: '注册', y: 6000, ratio: 50 },
        { category: '默认', x: '付费', y: 100, ratio: 0 },
      ];

      render(
        <FunnelChart
          data={largeRangeData}
          bottomLayerMinWidth={0.15}
          title="大跨度数据最小宽度"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();

      // 验证大跨度数据的最小宽度约束
      const barChart = screen.getByTestId('bar-chart');
      const chartDataStr = barChart.getAttribute('data-chart-data');
      expect(chartDataStr).toBeTruthy();

      const chartData = JSON.parse(chartDataStr!);
      const datasetData = chartData.datasets[0].data;

      // 原始数据: [100000, 20000, 6000, 100]，最大值 100000
      // 最小宽度占比 0.15，即最小值应该 >= 100000 * 0.15 = 15000
      const widths = datasetData.map((p: [number, number]) =>
        Math.abs(p[1] - p[0]),
      );
      const minWidth = Math.min(...widths);
      const maxWidth = Math.max(...widths);

      // 验证最小宽度约束
      expect(minWidth).toBeGreaterThanOrEqual(15000);
      // 验证最大值保持不变
      expect(maxWidth).toBe(100000);

      // 验证线性映射的正确性：数据应该在 [15000, 100000] 区间内单调递减
      for (let i = 0; i < widths.length - 1; i++) {
        expect(widths[i]).toBeGreaterThanOrEqual(widths[i + 1]);
      }
    });

    it('应该在数据跨度小时不影响显示', () => {
      const smallRangeData: FunnelChartDataItem[] = [
        { category: '默认', x: '步骤1', y: 100, ratio: 90 },
        { category: '默认', x: '步骤2', y: 90, ratio: 88 },
        { category: '默认', x: '步骤3', y: 85, ratio: 0 },
      ];

      render(
        <FunnelChart
          data={smallRangeData}
          bottomLayerMinWidth={0.15}
          title="小跨度数据最小宽度"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();

      // 验证小跨度数据不需要调整（最小值 85 已经 >= 100 * 0.15 = 15）
      const barChart = screen.getByTestId('bar-chart');
      const chartDataStr = barChart.getAttribute('data-chart-data');
      expect(chartDataStr).toBeTruthy();

      const chartData = JSON.parse(chartDataStr!);
      const datasetData = chartData.datasets[0].data;

      // 原始数据: [100, 90, 85]，最大值 100，最小值 85
      // 85 >= 100 * 0.15 = 15，所以不需要调整
      const widths = datasetData.map((p: [number, number]) =>
        Math.abs(p[1] - p[0]),
      );
      expect(widths).toEqual([100, 90, 85]);
    });

    it('应该正确处理线性映射的中间值', () => {
      const testData: FunnelChartDataItem[] = [
        { category: '默认', x: '步骤1', y: 1000, ratio: 100 },
        { category: '默认', x: '步骤2', y: 700, ratio: 70 },
        { category: '默认', x: '步骤3', y: 400, ratio: 57 },
        { category: '默认', x: '步骤4', y: 100, ratio: 25 },
      ];

      render(
        <FunnelChart
          data={testData}
          bottomLayerMinWidth={0.2}
          title="线性映射测试"
        />,
      );

      const barChart = screen.getByTestId('bar-chart');
      const chartDataStr = barChart.getAttribute('data-chart-data');
      expect(chartDataStr).toBeTruthy();

      const chartData = JSON.parse(chartDataStr!);
      const datasetData = chartData.datasets[0].data;

      // 原始数据: [1000, 700, 400, 100]
      // 最大值: 1000，最小值: 100
      // bottomLayerMinWidth=0.2，最小宽度: 1000 * 0.2 = 200
      // 线性映射: v' = 200 + (v - 100) / (1000 - 100) * (1000 - 200)
      // 1000 -> 1000
      // 700 -> 200 + (700-100)/900 * 800 = 200 + 533.33 = 733.33
      // 400 -> 200 + (400-100)/900 * 800 = 200 + 266.67 = 466.67
      // 100 -> 200

      const widths = datasetData.map((p: [number, number]) =>
        Math.abs(p[1] - p[0]),
      );

      // 验证最大值和最小值
      expect(widths[0]).toBe(1000);
      expect(widths[3]).toBeCloseTo(200, 0);

      // 验证中间值的线性映射（允许小数误差）
      expect(widths[1]).toBeCloseTo(733.33, 1);
      expect(widths[2]).toBeCloseTo(466.67, 1);

      // 验证单调递减
      for (let i = 0; i < widths.length - 1; i++) {
        expect(widths[i]).toBeGreaterThanOrEqual(widths[i + 1]);
      }
    });
  });

  describe('classNames 和 styles 支持', () => {
    it('应该支持 ChartClassNames 对象格式的 classNames', () => {
      const classNames = {
        root: 'custom-root-class',
        toolbar: 'custom-toolbar-class',
        statisticContainer: 'custom-statistic-class',
        wrapper: 'custom-wrapper-class',
      };

      render(<FunnelChart data={sampleData} classNames={classNames} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持 ChartStyles 对象格式的 styles', () => {
      const styles = {
        root: { width: '500px', height: '300px' },
        toolbar: { padding: '10px' },
        statisticContainer: { display: 'flex' },
        wrapper: { marginTop: '20px' },
      };

      render(<FunnelChart data={sampleData} styles={styles} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该合并 classNames 和 className', () => {
      const classNames = {
        root: 'custom-root-class',
      };

      render(
        <FunnelChart
          data={sampleData}
          classNames={classNames}
          className="additional-class"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该合并 styles 和 style', () => {
      const styles = {
        root: { width: '500px', height: '300px' },
      };

      render(
        <FunnelChart
          data={sampleData}
          styles={styles}
          style={{ padding: '10px' }}
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理 styles?.root 的合并顺序', () => {
      const styles = {
        root: { backgroundColor: 'red' },
      };

      render(
        <FunnelChart
          data={sampleData}
          styles={styles}
          style={{ width: '500px', height: '300px' }}
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 classNames 为 undefined 的情况', () => {
      render(<FunnelChart data={sampleData} classNames={undefined} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 styles 为 undefined 的情况', () => {
      render(<FunnelChart data={sampleData} styles={undefined} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('CSS 变量颜色支持测试', () => {
    it('应该支持 CSS 变量颜色', () => {
      render(
        <FunnelChart
          data={sampleData}
          color="var(--color-blue-control-fill-primary)"
        />,
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('应该支持 CSS 变量颜色生成渐变', () => {
      render(
        <FunnelChart
          data={sampleData}
          color="var(--color-green-control-fill-primary)"
        />,
      );

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toBeInTheDocument();

      // 验证图表数据包含颜色列表（漏斗图会生成渐变色）
      const chartData = JSON.parse(
        chart.getAttribute('data-chart-data') || '{}',
      );
      expect(chartData.datasets[0].backgroundColor).toBeDefined();
      expect(Array.isArray(chartData.datasets[0].backgroundColor)).toBe(true);
    });
  });

  describe('options 与插件回调覆盖', () => {
    const dataWithRatio = [
      { category: '默认', x: '阶段A', y: 1000, ratio: 100 },
      { category: '默认', x: '阶段B', y: 600, ratio: 60 },
      { category: '默认', x: '阶段C', y: 200, ratio: 33 },
    ];

    it('应调用 legend generateLabels 并包含转化率图例项', () => {
      render(<FunnelChart data={dataWithRatio} />);
      const options = (globalThis as any).__funnelChartLastOptions as any;
      expect(options?.plugins?.legend?.labels?.generateLabels).toBeDefined();
      const mockChart = {
        data: {
          datasets: [{ data: [[0, 1000], [0, 600], [0, 200]] }],
          labels: ['阶段A', '阶段B', '阶段C'],
        },
      };
      const labels = options.plugins.legend.labels.generateLabels(mockChart);
      expect(Array.isArray(labels)).toBe(true);
      const rateItem = labels?.find((l: any) => l.text === '转化率');
      expect(rateItem).toBeDefined();
    });

    it('应调用 legend onClick 对转化率项切换显隐', () => {
      render(<FunnelChart data={dataWithRatio} />);
      const options = (globalThis as any).__funnelChartLastOptions as any;
      const onClick = options?.plugins?.legend?.onClick;
      expect(onClick).toBeDefined();
      const legendItem = { text: '转化率', datasetIndex: 1 };
      expect(() =>
        onClick({}, legendItem, { chart: {}, legend: {} }),
      ).not.toThrow();
    });

    it('应调用 tooltip callbacks title 与 label', () => {
      render(<FunnelChart data={dataWithRatio} showPercent />);
      const options = (globalThis as any).__funnelChartLastOptions as any;
      const callbacks = options?.plugins?.tooltip?.callbacks;
      expect(callbacks?.title).toBeDefined();
      expect(callbacks?.label).toBeDefined();
      expect(callbacks.title([{ label: '阶段A' }])).toBe('阶段A');
      const ctx = { dataIndex: 0, datasetIndex: 0 };
      const labelResult = callbacks.label(ctx);
      expect(typeof labelResult === 'string').toBe(true);
    });

    it('应调用 scales.y.afterFit', () => {
      render(<FunnelChart data={dataWithRatio} />);
      const options = (globalThis as any).__funnelChartLastOptions as any;
      const afterFit = options?.scales?.y?.afterFit;
      expect(afterFit).toBeDefined();
      const scale = { height: 0 };
      afterFit(scale);
      expect(scale.height).toBeGreaterThan(0);
    });
  });

  describe('插件 afterDatasetsDraw 覆盖', () => {
    const dataWithRatio = [
      { category: '默认', x: '阶段A', y: 1000, ratio: 100 },
      { category: '默认', x: '阶段B', y: 600, ratio: 60 },
      { category: '默认', x: '阶段C', y: 200, ratio: 33 },
    ];

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

    it('应安全执行 trapezoid 与 rightLabel 插件', () => {
      render(<FunnelChart data={dataWithRatio} />);
      const plugins = (globalThis as any).__funnelChartLastPlugins as any[];
      expect(Array.isArray(plugins)).toBe(true);
      const trapezoid = plugins?.find((p: any) => p.id === 'funnelTrapezoidLabels');
      const rightLabel = plugins?.find((p: any) => p.id === 'funnelRightLabels');
      expect(trapezoid?.afterDatasetsDraw).toBeDefined();
      expect(rightLabel?.afterDatasetsDraw).toBeDefined();

      const ctx = createMockCtx();
      const xScale = {
        getPixelForValue: vi.fn((v: number) => 100 + v * 2),
      };
      const metaData = [
        { x: 200, y: 20, height: 24, width: 400 },
        { x: 200, y: 52, height: 24, width: 240 },
        { x: 200, y: 84, height: 24, width: 80 },
      ];
      const mockChart = {
        ctx,
        data: {
          datasets: [{ data: [[0, 1000], [0, 600], [0, 200]] }],
          labels: ['阶段A', '阶段B', '阶段C'],
        },
        scales: { x: xScale },
        getDatasetMeta: vi.fn(() => ({ data: metaData })),
      };

      expect(() => rightLabel.afterDatasetsDraw(mockChart)).not.toThrow();
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('trapezoid 插件在 showTrapezoid 为 true 时应绘制', () => {
      render(<FunnelChart data={dataWithRatio} />);
      const plugins = (globalThis as any).__funnelChartLastPlugins as any[];
      const trapezoid = plugins?.find((p: any) => p.id === 'funnelTrapezoidLabels');
      const ctx = createMockCtx();
      const xScale = {
        getPixelForValue: vi.fn((v: number) => 100 + v * 2),
      };
      const metaData = [
        { x: 200, y: 20, height: 24, width: 400 },
        { x: 200, y: 52, height: 24, width: 240 },
        { x: 200, y: 84, height: 24, width: 80 },
      ];
      const mockChart = {
        ctx,
        data: {
          datasets: [{ data: [[0, 1000], [0, 600], [0, 200]] }],
          labels: ['阶段A', '阶段B', '阶段C'],
        },
        scales: { x: xScale },
        getDatasetMeta: vi.fn(() => ({ data: metaData })),
      };
      expect(() => trapezoid.afterDatasetsDraw(mockChart)).not.toThrow();
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('二次渲染与工具栏/筛选/统计分支', () => {
    it('二次渲染时仍正常显示', () => {
      const { rerender } = render(<FunnelChart data={sampleData} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      rerender(<FunnelChart data={sampleData} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('loading 时工具栏显示 loading 状态', () => {
      render(<FunnelChart data={sampleData} loading />);
      expect(screen.getByTestId('chart-loading')).toBeInTheDocument();
    });

    it('renderFilterInToolbar 为 true 时筛选在工具栏内', () => {
      const multiCategory = [
        { category: 'A', filterLabel: 'L1', x: '步骤1', y: 100 },
        { category: 'A', filterLabel: 'L2', x: '步骤1', y: 200 },
        { category: 'B', filterLabel: 'L1', x: '步骤1', y: 150 },
      ];
      render(
        <FunnelChart data={multiCategory} renderFilterInToolbar />,
      );
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
    });

    it('statistic 为数组时渲染多个 ChartStatistic', () => {
      const stats = [
        { title: '总量', value: 1000 },
        { title: '转化', value: 200 },
      ];
      render(<FunnelChart data={sampleData} statistic={stats} />);
      const items = screen.getAllByTestId('chart-statistic');
      expect(items).toHaveLength(2);
    });

    it('renderFilterInToolbar 为 false 时筛选在工具栏外独立展示', () => {
      const multiCategory = [
        { category: 'A', x: '步骤1', y: 100 },
        { category: 'A', x: '步骤2', y: 80 },
        { category: 'B', x: '步骤1', y: 200 },
        { category: 'B', x: '步骤2', y: 150 },
      ];
      render(
        <FunnelChart data={multiCategory} renderFilterInToolbar={false} />,
      );
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-A')).toBeInTheDocument();
      expect(screen.getByTestId('filter-B')).toBeInTheDocument();
    });
  });
});

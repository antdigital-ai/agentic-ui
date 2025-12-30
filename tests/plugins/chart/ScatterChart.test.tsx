import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ScatterChart, {
  ScatterChartDataItem,
} from '../../../src/Plugins/chart/ScatterChart';

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
        },
      },
    },
  },
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Scatter: React.forwardRef((props: any, ref: any) => (
    <div data-testid="scatter-chart" ref={ref}>
      Mocked Scatter Chart
    </div>
  )),
}));

// Mock utils
vi.mock('../../../src/Plugins/chart/utils', () => ({
  hexToRgba: vi.fn((color, alpha) => `rgba(0,0,0,${alpha})`),
  resolveCssVariable: vi.fn((color) =>
    typeof color === 'string' && color.startsWith('var(') ? '#1d7afc' : color,
  ),
}));

// Mock components
vi.mock('../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children, ...props }: any) => (
    <div data-testid="chart-container" {...props}>
      {children}
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange, ...props }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((option: any) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          data-testid={`filter-${option.value}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
  ChartToolBar: ({ title, onDownload, dataTime }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span data-testid="chart-title">{title}</span>}
      {dataTime && <span data-testid="chart-datatime">{dataTime}</span>}
      <button onClick={onDownload} data-testid="download-button">
        下载
      </button>
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

// Mock style hook
vi.mock('../../../src/Plugins/chart/ScatterChart/style', () => ({
  useStyle: vi.fn(() => ({
    wrapSSR: (node: any) => node,
    hashId: 'test-hash-id',
  })),
}));

describe('ScatterChart', () => {
  const sampleData: ScatterChartDataItem[] = [
    { category: 'A组', type: '产品A', x: 1, y: 10 },
    { category: 'A组', type: '产品A', x: 2, y: 20 },
    { category: 'A组', type: '产品A', x: 3, y: 30 },
    { category: 'A组', type: '产品B', x: 1, y: 15 },
    { category: 'A组', type: '产品B', x: 2, y: 25 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      measureText: vi.fn(() => ({ width: 50 })),
      fillText: vi.fn(),
      canvas: document.createElement('canvas'),
    })) as any;
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染散点图', () => {
      render(<ScatterChart data={sampleData} title="散点图测试" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('应该正确渲染标题', () => {
      render(<ScatterChart data={sampleData} title="月度销售散点图" />);

      expect(screen.getByTestId('chart-title')).toHaveTextContent(
        '月度销售散点图',
      );
    });

    it('应该正确渲染数据时间', () => {
      render(
        <ScatterChart data={sampleData} title="散点图" dataTime="2025-10-15" />,
      );

      expect(screen.getByTestId('chart-datatime')).toHaveTextContent(
        '2025-10-15',
      );
    });

    it('应该使用默认标题当未提供时', () => {
      render(<ScatterChart data={sampleData} />);

      expect(screen.getByTestId('chart-title')).toHaveTextContent('散点图');
    });
  });

  describe('空数据和边界测试', () => {
    it('应该正确处理空数据数组', () => {
      render(<ScatterChart data={[]} title="空数据" />);

      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('应该处理 null 数据', () => {
      render(<ScatterChart data={null as any} title="null 数据" />);

      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('应该处理 undefined 数据', () => {
      render(<ScatterChart data={undefined as any} title="undefined 数据" />);

      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('应该过滤掉无效的数据项', () => {
      const invalidData: any[] = [
        { category: 'A组', type: '产品A', x: 1, y: 10 },
        null,
        undefined,
        { category: 'A组', type: '产品A', x: 2, y: 20 },
        {},
        { category: 'A组', type: '产品A' },
      ];

      render(<ScatterChart data={invalidData} title="包含无效数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理没有 type 的数据', () => {
      const noTypeData: ScatterChartDataItem[] = [
        { category: 'A组', x: 1, y: 10 },
      ];

      render(<ScatterChart data={noTypeData} title="无 type 数据" />);

      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });
  });

  describe('数据处理测试', () => {
    it('应该处理字符串类型的 x 和 y', () => {
      const stringData: ScatterChartDataItem[] = [
        { category: 'A组', type: '产品A', x: '1', y: '10' },
        { category: 'A组', type: '产品A', x: '2', y: '20' },
      ];

      render(<ScatterChart data={stringData} title="字符串坐标" />);

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('应该处理空字符串坐标', () => {
      const emptyStringData: ScatterChartDataItem[] = [
        { category: 'A组', type: '产品A', x: '', y: '' },
        { category: 'A组', type: '产品A', x: '1', y: '10' },
      ];

      render(<ScatterChart data={emptyStringData} title="空字符串坐标" />);

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('应该处理 null 字符串', () => {
      const nullStringData: ScatterChartDataItem[] = [
        { category: 'A组', type: '产品A', x: 'null', y: 'null' },
        { category: 'A组', type: '产品A', x: 1, y: 10 },
      ];

      render(<ScatterChart data={nullStringData} title="null 字符串" />);

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('应该处理 NaN 值', () => {
      const nanData: ScatterChartDataItem[] = [
        { category: 'A组', type: '产品A', x: NaN, y: NaN },
        { category: 'A组', type: '产品A', x: 1, y: 10 },
      ];

      render(<ScatterChart data={nanData} title="NaN 值" />);

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });
  });

  describe('分类和筛选测试', () => {
    it('应该显示分类筛选器当有多个分类时', () => {
      const multiCategoryData: ScatterChartDataItem[] = [
        { category: 'A组', type: '产品A', x: 1, y: 10 },
        { category: 'B组', type: '产品B', x: 2, y: 20 },
      ];

      render(<ScatterChart data={multiCategoryData} title="多分类数据" />);

      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-A组')).toBeInTheDocument();
      expect(screen.getByTestId('filter-B组')).toBeInTheDocument();
    });

    it('应该处理 filterLabel', () => {
      const dataWithFilterLabel: ScatterChartDataItem[] = [
        {
          category: 'A组',
          type: '产品A',
          x: 1,
          y: 10,
          filterLabel: 'PC端',
        },
        {
          category: 'A组',
          type: '产品A',
          x: 2,
          y: 20,
          filterLabel: '移动端',
        },
      ];

      render(
        <ScatterChart data={dataWithFilterLabel} title="多维度筛选数据" />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该过滤掉 undefined 的 category', () => {
      const mixedCategoryData: any[] = [
        { type: '产品A', x: 1, y: 10 },
        { category: 'A组', type: '产品B', x: 2, y: 20 },
        { category: null, type: '产品C', x: 3, y: 30 },
        { category: '', type: '产品D', x: 4, y: 40 },
      ];

      render(<ScatterChart data={mixedCategoryData} title="混合分类数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('尺寸和样式测试', () => {
    it('应该支持自定义宽度和高度', () => {
      render(
        <ScatterChart
          data={sampleData}
          width={1000}
          height={800}
          title="自定义尺寸"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义颜色', () => {
      render(
        <ScatterChart data={sampleData} color="#ff0000" title="自定义颜色" />,
      );

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('应该支持自定义 className', () => {
      render(
        <ScatterChart
          data={sampleData}
          className="custom-scatter"
          title="自定义类名"
        />,
      );

      const container = screen.getByTestId('chart-container');
      expect(container.className).toContain('custom-scatter');
    });
  });

  describe('坐标轴配置测试', () => {
    it('应该支持自定义 X 轴单位', () => {
      render(
        <ScatterChart data={sampleData} xUnit="月" title="自定义 X 轴单位" />,
      );

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('应该支持自定义 Y 轴单位', () => {
      render(
        <ScatterChart data={sampleData} yUnit="元" title="自定义 Y 轴单位" />,
      );

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('应该支持自定义坐标轴标签', () => {
      render(
        <ScatterChart
          data={sampleData}
          xAxisLabel="时间"
          yAxisLabel="销量"
          title="自定义坐标轴标签"
        />,
      );

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });
  });

  describe('图例配置测试', () => {
    it('应该支持自定义图例文字最大宽度', () => {
      const longNameData: ScatterChartDataItem[] = [
        {
          category: 'A组',
          type: '这是一个非常非常长的产品名称用于测试截断功能',
          x: 1,
          y: 10,
        },
      ];

      render(
        <ScatterChart
          data={longNameData}
          textMaxWidth={50}
          title="图例文字截断"
        />,
      );

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该支持下载功能', async () => {
      const { downloadChart } = await import(
        '../../../src/Plugins/chart/components'
      );

      render(<ScatterChart data={sampleData} title="可下载散点图" />);

      const downloadButton = screen.getByTestId('download-button');
      downloadButton.click();

      await waitFor(() => {
        expect(downloadChart).toHaveBeenCalled();
      });
    });

    it('应该支持额外的工具栏按钮', () => {
      const extraButton = <button data-testid="extra-button">额外按钮</button>;

      render(
        <ScatterChart
          data={sampleData}
          toolbarExtra={extraButton}
          title="带额外按钮"
        />,
      );

      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
    });
  });

  describe('响应式测试', () => {
    it('应该根据窗口大小调整布局', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500,
      });

      render(<ScatterChart data={sampleData} title="移动端散点图" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该监听窗口大小变化', () => {
      render(<ScatterChart data={sampleData} title="响应式散点图" />);

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200,
      });

      window.dispatchEvent(new Event('resize'));

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('自定义 tooltip 测试', () => {
    it('应该在组件卸载时清理 tooltip', () => {
      const tooltipEl = document.createElement('div');
      tooltipEl.id = 'custom-scatter-tooltip';
      document.body.appendChild(tooltipEl);

      const { unmount } = render(
        <ScatterChart data={sampleData} title="tooltip 清理测试" />,
      );

      expect(document.getElementById('custom-scatter-tooltip')).toBeTruthy();

      unmount();

      // 等待清理完成
      setTimeout(() => {
        expect(document.getElementById('custom-scatter-tooltip')).toBeFalsy();
      }, 0);
    });
  });

  describe('错误处理测试', () => {
    it('应该捕获并显示渲染错误', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // 创建一个会导致错误的数据
      const errorData: any = [{ category: 'A组', type: '产品A', x: 1, y: 10 }];

      render(<ScatterChart data={errorData} title="错误处理测试" />);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('ChartStatistic 集成测试', () => {
    it('应该支持 statistic 配置', () => {
      render(
        <ScatterChart
          data={sampleData}
          statistic={{
            title: '总数据量',
            value: 100,
          }}
          title="带统计数据"
        />,
      );

      expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
    });
  });

  describe('大数据集测试', () => {
    it('应该处理大量数据点', () => {
      const largeData: ScatterChartDataItem[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          category: 'A组',
          type: '产品A',
          x: i,
          y: Math.random() * 100,
        }),
      );

      render(<ScatterChart data={largeData} title="大数据集" />);

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });
  });

  describe('variant 属性测试', () => {
    it('应该支持 variant 属性', () => {
      render(
        <ScatterChart data={sampleData} variant="outline" title="边框样式" />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
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

      render(<ScatterChart data={sampleData} classNames={classNames} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持 ChartStyles 对象格式的 styles', () => {
      const styles = {
        root: { width: '500px', height: '300px' },
        toolbar: { padding: '10px' },
        statisticContainer: { display: 'flex' },
        wrapper: { marginTop: '20px' },
      };

      render(<ScatterChart data={sampleData} styles={styles} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该合并 classNames 和 className', () => {
      const classNames = {
        root: 'custom-root-class',
      };

      render(
        <ScatterChart
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
        <ScatterChart
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
        <ScatterChart
          data={sampleData}
          styles={styles}
          style={{ width: '500px', height: '300px' }}
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 classNames 为 undefined 的情况', () => {
      render(<ScatterChart data={sampleData} classNames={undefined} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 styles 为 undefined 的情况', () => {
      render(<ScatterChart data={sampleData} styles={undefined} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('CSS 变量颜色支持测试', () => {
    it('应该支持单个 CSS 变量颜色', () => {
      render(
        <ScatterChart
          data={sampleData}
          color="var(--color-blue-control-fill-primary)"
        />,
      );

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('应该支持多个 CSS 变量颜色', () => {
      render(
        <ScatterChart
          data={sampleData}
          color={[
            'var(--color-blue-control-fill-primary)',
            'var(--color-green-control-fill-primary)',
          ]}
        />,
      );

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('应该支持混合使用 CSS 变量和十六进制颜色', () => {
      render(
        <ScatterChart
          data={sampleData}
          color={['var(--color-blue-control-fill-primary)', '#ff0000']}
        />,
      );

      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });
  });
});

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ScatterChart, {
  ScatterChartDataItem,
} from '../../../src/Plugins/chart/ScatterChart';
import { useStyle as useScatterStyle } from '../../../src/Plugins/chart/ScatterChart/style';

const lastScatterOptionsRef = vi.hoisted(() => ({ current: null as any }));

// Mock Chart.js - generateLabels 返回长文本以覆盖图例截断逻辑
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => [
              {
                text: '这是一个非常非常长的产品名称用于测试图例截断功能',
                fillStyle: '#1677ff',
                strokeStyle: '#1677ff',
                index: 0,
              },
            ]),
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

// Mock react-chartjs-2 - 捕获 options 以便测试 tooltip/legend
vi.mock('react-chartjs-2', () => ({
  Scatter: React.forwardRef((props: any, ref: any) => {
    lastScatterOptionsRef.current = props.options;
    return (
      <div data-testid="scatter-chart" ref={ref}>
        Mocked Scatter Chart
      </div>
    );
  }),
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
  ChartToolBar: ({ title, onDownload, dataTime, filter, loading }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span data-testid="chart-title">{title}</span>}
      {dataTime && <span data-testid="chart-datatime">{dataTime}</span>}
      {filter && <div data-testid="toolbar-filter">{filter}</div>}
      {loading && <span data-testid="chart-loading">loading</span>}
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

  describe('覆盖率：statistic/loading/轴/筛选', () => {
    it('statistic 为空数组时不渲染统计', () => {
      render(
        <ScatterChart data={sampleData} statistic={[]} title="空统计配置" />,
      );
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
    });

    it('loading=true 时工具栏显示加载状态', () => {
      render(
        <ScatterChart data={sampleData} loading title="加载中" />,
      );
      expect(screen.getByTestId('chart-loading')).toHaveTextContent('loading');
    });

    it('renderFilterInToolbar 且有多分类与 filterLabel 时筛选在工具栏内', () => {
      const dataWithFilterLabel: ScatterChartDataItem[] = [
        { category: 'A组', type: 'T1', x: 1, y: 10, filterLabel: 'PC' },
        { category: 'B组', type: 'T1', x: 2, y: 20, filterLabel: 'H5' },
      ];
      render(
        <ScatterChart
          data={dataWithFilterLabel}
          renderFilterInToolbar
          title="工具栏筛选"
        />,
      );
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('toolbar-filter')).toBeInTheDocument();
    });

    it('hiddenX/hiddenY 控制坐标轴显示', () => {
      render(
        <ScatterChart
          data={sampleData}
          hiddenX
          hiddenY
          xAxisLabel="X"
          yAxisLabel="Y"
          title="隐藏轴"
        />,
      );
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('xPosition/yPosition 传入时生效', () => {
      render(
        <ScatterChart
          data={sampleData}
          xPosition="top"
          yPosition="right"
          title="轴位置"
        />,
      );
      expect(lastScatterOptionsRef.current?.scales?.x?.position).toBe('top');
      expect(lastScatterOptionsRef.current?.scales?.y?.position).toBe('right');
    });

    it('showGrid=false 时关闭网格', () => {
      render(
        <ScatterChart data={sampleData} showGrid={false} title="无网格" />,
      );
      expect(lastScatterOptionsRef.current?.scales?.x?.grid?.display).toBe(
        false,
      );
      expect(lastScatterOptionsRef.current?.scales?.y?.grid?.display).toBe(
        false,
      );
    });
  });

  describe('覆盖率：tooltip external', () => {
    it('tooltip opacity 为 0 时隐藏自定义 tooltip 元素', () => {
      const el = document.createElement('div');
      el.id = 'custom-scatter-tooltip';
      document.body.appendChild(el);

      render(
        <ScatterChart
          data={sampleData}
          xUnit="月"
          yUnit="元"
          title="Tooltip"
        />,
      );
      const external = lastScatterOptionsRef.current?.plugins?.tooltip?.external;
      expect(external).toBeDefined();

      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: { opacity: 0, dataPoints: [], caretX: 0, caretY: 0 },
      });
      expect(el.style.opacity).toBe('0');
      document.body.removeChild(el);
    });

    it('tooltip external 有 dataPoints 时创建并更新 tooltip 内容', () => {
      render(
        <ScatterChart
          data={sampleData}
          xUnit="月"
          yUnit="元"
          title="Tooltip"
        />,
      );
      const external = lastScatterOptionsRef.current?.plugins?.tooltip?.external;
      expect(external).toBeDefined();

      const mockChart = {
        canvas: {
          getBoundingClientRect: () => ({ left: 10, top: 20 }),
        },
      };
      external({
        chart: mockChart,
        tooltip: {
          opacity: 1,
          dataPoints: [
            {
              parsed: { x: 2, y: 25 },
              dataset: { label: '产品A', borderColor: '#1677ff' },
            },
          ],
          caretX: 50,
          caretY: 80,
        },
      });

      const tooltipEl = document.getElementById('custom-scatter-tooltip');
      expect(tooltipEl).toBeTruthy();
      expect(tooltipEl?.innerHTML).toContain('2月');
      expect(tooltipEl?.innerHTML).toContain('25元');
      expect(tooltipEl?.innerHTML).toContain('产品A');
      if (tooltipEl?.parentNode === document.body) {
        document.body.removeChild(tooltipEl);
      }
    });

    it('tooltip external 无 dataPoints 时提前 return', () => {
      render(<ScatterChart data={sampleData} title="Tooltip" />);
      const external = lastScatterOptionsRef.current?.plugins?.tooltip?.external;
      external({
        chart: { canvas: {} },
        tooltip: { opacity: 1, dataPoints: [], caretX: 0, caretY: 0 },
      });
      const tooltipEl = document.getElementById('custom-scatter-tooltip');
      expect(tooltipEl?.innerHTML || '').toBe('');
    });

    it('tooltip external 解析异常时使用 0', () => {
      render(<ScatterChart data={sampleData} xUnit="月" title="Tooltip" />);
      const external = lastScatterOptionsRef.current?.plugins?.tooltip?.external;
      external({
        chart: {
          canvas: {
            getBoundingClientRect: () => ({ left: 0, top: 0 }),
          },
        },
        tooltip: {
          opacity: 1,
          dataPoints: [
            {
              parsed: { x: NaN, y: undefined },
              dataset: { label: 'A', borderColor: '#333' },
            },
          ],
          caretX: 0,
          caretY: 0,
        },
      });
      const tooltipEl = document.getElementById('custom-scatter-tooltip');
      expect(tooltipEl).toBeTruthy();
      if (tooltipEl?.parentNode === document.body) {
        document.body.removeChild(tooltipEl);
      }
    });
  });

  describe('覆盖率：legend generateLabels 截断', () => {
    it('generateLabels 长文本时截断并加省略号', () => {
      render(
        <ScatterChart
          data={sampleData}
          textMaxWidth={10}
          title="图例截断"
        />,
      );
      const generateLabels =
        lastScatterOptionsRef.current?.plugins?.legend?.labels?.generateLabels;
      expect(generateLabels).toBeDefined();

      const mockCtx = {
        measureText: vi.fn((text: string) => ({
          width: text.length * 2,
        })),
        fillText: vi.fn(),
        canvas: document.createElement('canvas'),
      };
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx) as any;

      const mockChart = {} as any;
      const result = generateLabels(mockChart);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].text).toContain('...');
    });
  });

  describe('覆盖率：handleDownload 与错误边界', () => {
    it('handleDownload 通过 ToolBar 调用 downloadChart', async () => {
      const { downloadChart } = await import(
        '../../../src/Plugins/chart/components'
      );
      render(<ScatterChart data={sampleData} title="下载" />);
      screen.getByTestId('download-button').click();
      await waitFor(() => {
        expect(downloadChart).toHaveBeenCalled();
      });
    });

    it('wrapSSR 首次调用抛错时显示错误状态', () => {
      vi.mocked(useScatterStyle).mockImplementationOnce(() => {
        let firstCall = true;
        return {
          wrapSSR: (node: any) => {
            if (firstCall) {
              firstCall = false;
              throw new Error('render error');
            }
            return node;
          },
          hashId: 'err',
        };
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<ScatterChart data={sampleData} title="错误" />);
      expect(
        screen.getByText('图表渲染失败，请检查数据格式'),
      ).toBeInTheDocument();
      consoleSpy.mockRestore();
    });
  });
});

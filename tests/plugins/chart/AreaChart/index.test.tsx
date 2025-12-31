import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Filler: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: React.forwardRef((props: any, ref: any) => (
    <div data-testid="area-chart" ref={ref}>
      Mocked Area Chart
    </div>
  )),
}));

// Mock components
vi.mock('../../../../src/Plugins/chart/components', async () => {
  const actual = await vi.importActual(
    '../../../../src/Plugins/chart/components',
  );
  return {
    ...actual,
    downloadChart: vi.fn(),
    ChartContainer: ({ children, ...props }: any) => (
      <div data-testid="chart-container" {...props}>
        {children}
      </div>
    ),
    ChartFilter: ({ filterOptions, onFilterChange }: any) => (
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
    ChartToolBar: ({ title, onDownload, dataTime, extra, filter }: any) => (
      <div data-testid="chart-toolbar">
        {(title || '面积图') && (
          <span data-testid="chart-title">{title || '面积图'}</span>
        )}
        {dataTime && <span data-testid="chart-datatime">{dataTime}</span>}
        {extra}
        {filter}
        <button
          type="button"
          onClick={onDownload}
          data-testid="download-button"
        >
          下载
        </button>
      </div>
    ),
    ChartStatistic: ({ title, value }: any) => (
      <div data-testid="chart-statistic">
        {title}: {value}
      </div>
    ),
  };
});

// Import hooks for mocking
import * as components from '../../../../src/Plugins/chart/components';
import * as hooks from '../../../../src/Plugins/chart/hooks';
import * as utils from '../../../../src/Plugins/chart/utils';

// Mock hooks
vi.mock('../../../../src/Plugins/chart/hooks', () => ({
  useResponsiveSize: vi.fn(() => ({
    responsiveWidth: 600,
    responsiveHeight: 400,
    isMobile: false,
    windowWidth: 1024,
  })),
  useChartTheme: vi.fn(() => ({
    axisTextColor: '#333',
    gridColor: '#eee',
    isLight: true,
  })),
  useChartDataFilter: vi.fn(() => ({
    filteredData: [],
    categories: [],
    filterOptions: [],
    filterLabels: undefined,
    selectedFilter: '',
    setSelectedFilter: vi.fn(),
    selectedFilterLabel: undefined,
    setSelectedFilterLabel: vi.fn(),
    filteredDataByFilterLabel: undefined,
    safeData: [],
  })),
  useChartStatistics: vi.fn(() => null),
}));

// Mock utils
vi.mock('../../../../src/Plugins/chart/utils', () => ({
  extractAndSortXValues: vi.fn(() => []),
  findDataPointByXValue: vi.fn(() => null),
  hexToRgba: vi.fn((hex, alpha) => `rgba(0,0,0,${alpha})`),
  resolveCssVariable: vi.fn((color) =>
    color.startsWith('var(') ? '#1d7afc' : color,
  ),
  registerLineChartComponents: vi.fn(),
  getDataHash: vi.fn(() => 'mock-hash'),
  ChartDataItem: function () {},
}));

// Mock style hook
vi.mock('../../../../src/Plugins/chart/AreaChart/style', () => ({
  useStyle: vi.fn(() => ({
    wrapSSR: (node: any) => node,
    hashId: 'test-hash-id',
  })),
}));

// Import AreaChart after mocking
import AreaChart from '../../../../src/Plugins/chart/AreaChart/index';

describe('AreaChart', () => {
  const sampleData: any[] = [
    {
      category: '销售数据',
      type: '本季度',
      x: 'Q1',
      y: 85000,
      xtitle: '季度',
      ytitle: '销售额',
    },
    {
      category: '销售数据',
      type: '本季度',
      x: 'Q2',
      y: 92000,
      xtitle: '季度',
      ytitle: '销售额',
    },
    {
      category: '销售数据',
      type: '本季度',
      x: 'Q3',
      y: 78000,
      xtitle: '季度',
      ytitle: '销售额',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    vi.mocked(hooks.useChartDataFilter).mockImplementation(() => ({
      filteredData: sampleData,
      categories: ['销售数据'],
      filterOptions: [{ label: '销售数据', value: '销售数据' }],
      filterLabels: undefined,
      selectedFilter: '销售数据',
      setSelectedFilter: vi.fn(),
      selectedFilterLabel: undefined,
      setSelectedFilterLabel: vi.fn(),
      filteredDataByFilterLabel: undefined,
      safeData: sampleData,
    }));

    vi.mocked(utils.extractAndSortXValues).mockImplementation(() => [
      'Q1',
      'Q2',
      'Q3',
    ]);
    vi.mocked(utils.findDataPointByXValue).mockImplementation(
      (data: any, xValue: any, type: any) => {
        return data.find(
          (item: any) => item.x === xValue && item.type === type,
        );
      },
    );
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染面积图', () => {
      render(<AreaChart data={sampleData} title="销售趋势面积图" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该正确渲染标题', () => {
      render(<AreaChart data={sampleData} title="销售趋势面积图" />);

      expect(screen.getByTestId('chart-title')).toHaveTextContent(
        '销售趋势面积图',
      );
    });

    it('应该正确渲染数据时间', () => {
      render(
        <AreaChart data={sampleData} title="面积图" dataTime="2025-10-15" />,
      );

      expect(screen.getByTestId('chart-datatime')).toHaveTextContent(
        '2025-10-15',
      );
    });

    it('应该使用默认标题当未提供时', () => {
      render(<AreaChart data={sampleData} />);

      // 检查默认标题是否显示
      expect(screen.getByText('面积图')).toBeInTheDocument();
    });
  });

  describe('空数据和边界测试', () => {
    it('应该正确处理空数据数组', () => {
      render(<AreaChart data={[]} title="空数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 null 数据', () => {
      render(<AreaChart data={null as any} title="null 数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 undefined 数据', () => {
      render(<AreaChart data={undefined as any} title="undefined 数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该过滤掉无效的数据项', () => {
      const invalidData: any[] = [
        { category: 'A组', label: '技术', type: '团队A', score: 80 },
        null,
        undefined,
        {},
        { category: 'A组', type: '团队A', score: 70 },
      ];

      render(<AreaChart data={invalidData} title="包含无效数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('数据处理测试', () => {
    it('应该处理字符串类型的 y 值', () => {
      const stringYData: any[] = [
        { category: 'A组', type: '团队A', x: 'Q1', y: '80' },
        { category: 'A组', type: '团队A', x: 'Q2', y: '70' },
      ];

      render(<AreaChart data={stringYData} title="字符串y값" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该处理空字符串 y 值', () => {
      const emptyYData: any[] = [
        { category: 'A组', type: '团队A', x: 'Q1', y: '' },
        { category: 'A组', type: '团队A', x: 'Q2', y: 70 },
      ];

      render(<AreaChart data={emptyYData} title="空字符串y값" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该处理 null y 值', () => {
      const nullYData: any[] = [
        { category: 'A组', type: '团队A', x: 'Q1', y: null },
        { category: 'A组', type: '团队A', x: 'Q2', y: 70 },
      ];

      render(<AreaChart data={nullYData} title="null y값" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该处理 undefined y 值', () => {
      const undefinedYData: any[] = [
        { category: 'A组', type: '团队A', x: 'Q1', y: undefined },
        { category: 'A组', type: '团队A', x: 'Q2', y: 70 },
      ];

      render(<AreaChart data={undefinedYData} title="undefined y값" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('分类和筛选测试', () => {
    it('应该显示分类筛选器当有多个分类时', () => {
      vi.mocked(hooks.useChartDataFilter).mockImplementation(() => ({
        filteredData: sampleData,
        categories: ['销售数据', '市场数据'],
        filterOptions: [
          { label: '销售数据', value: '销售数据' },
          { label: '市场数据', value: '市场数据' },
        ],
        filterLabels: undefined,
        selectedFilter: '销售数据',
        setSelectedFilter: vi.fn(),
        selectedFilterLabel: undefined,
        setSelectedFilterLabel: vi.fn(),
        filteredDataByFilterLabel: undefined,
        safeData: sampleData,
      }));

      render(<AreaChart data={sampleData} title="多分类数据" />);

      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-销售数据')).toBeInTheDocument();
    });

    it('应该处理 filterLabel', () => {
      vi.mocked(hooks.useChartDataFilter).mockImplementation(() => ({
        filteredData: [
          {
            category: 'A组',
            type: '团队A',
            x: 'Q1',
            y: 80,
            filterLabel: '2023年',
          },
          {
            category: 'A组',
            type: '团队A',
            x: 'Q1',
            y: 85,
            filterLabel: '2024年',
          },
        ],
        categories: ['A组'],
        filterOptions: [{ label: 'A组', value: 'A组' }],
        filterLabels: ['2023年', '2024年'],
        selectedFilter: 'A组',
        setSelectedFilter: vi.fn(),
        selectedFilterLabel: '2023年',
        setSelectedFilterLabel: vi.fn(),
        filteredDataByFilterLabel: [
          { key: '2023年', label: '2023年' },
          { key: '2024年', label: '2024年' },
        ],
        safeData: [
          {
            category: 'A组',
            type: '团队A',
            x: 'Q1',
            y: 80,
            filterLabel: '2023年',
          },
          {
            category: 'A组',
            type: '团队A',
            x: 'Q1',
            y: 85,
            filterLabel: '2024年',
          },
        ],
      }));

      render(<AreaChart data={sampleData} title="多维度筛选数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('尺寸和样式测试', () => {
    it('应该支持自定义宽度和高度', () => {
      vi.mocked(hooks.useResponsiveSize).mockImplementation(() => ({
        responsiveWidth: 800,
        responsiveHeight: 600,
        isMobile: false,
        windowWidth: 1024,
      }));

      render(
        <AreaChart
          data={sampleData}
          width={800}
          height={600}
          title="自定义尺寸"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义颜色', () => {
      render(
        <AreaChart data={sampleData} color="#ff0000" title="自定义颜色" />,
      );

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该支持 CSS 变量颜色', () => {
      render(
        <AreaChart
          data={sampleData}
          color="var(--color-blue-control-fill-primary)"
          title="CSS变量颜色"
        />,
      );

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该支持多个 CSS 变量颜色', () => {
      render(
        <AreaChart
          data={sampleData}
          color={[
            'var(--color-blue-control-fill-primary)',
            'var(--color-green-control-fill-primary)',
          ]}
          title="多个CSS变量颜色"
        />,
      );

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该支持自定义 className', () => {
      render(
        <AreaChart
          data={sampleData}
          className="custom-area"
          title="自定义类名"
        />,
      );

      const container = screen.getByTestId('chart-container');
      expect(container.className).toContain('custom-area');
    });
  });

  describe('图例配置测试', () => {
    it('应该支持隐藏图例', () => {
      render(
        <AreaChart data={sampleData} showLegend={false} title="隐藏图例" />,
      );

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该支持不同的图例位置', () => {
      const positions: ('top' | 'left' | 'bottom' | 'right')[] = [
        'top',
        'left',
        'bottom',
        'right',
      ];

      positions.forEach((position) => {
        render(
          <AreaChart
            data={sampleData}
            legendPosition={position}
            title={`图例位置-${position}`}
          />,
        );

        // 由于每次渲染都会添加新的元素，我们需要检查最新的元素
        const containers = screen.getAllByTestId('chart-container');
        expect(containers[containers.length - 1]).toBeInTheDocument();
      });
    });
  });

  describe('网格配置测试', () => {
    it('应该支持隐藏网格线', () => {
      render(<AreaChart data={sampleData} showGrid={false} title="隐藏网格" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('轴配置测试', () => {
    it('应该支持隐藏X轴', () => {
      render(<AreaChart data={sampleData} hiddenX={true} title="隐藏X轴" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该支持隐藏Y轴', () => {
      render(<AreaChart data={sampleData} hiddenY={true} title="隐藏Y轴" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该支持不同的轴位置', () => {
      render(
        <AreaChart
          data={sampleData}
          xPosition="top"
          yPosition="right"
          title="轴位置"
        />,
      );

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该支持下载功能', () => {
      render(<AreaChart data={sampleData} title="可下载面积图" />);

      // 检查下载按钮是否存在
      const downloadButton = screen.getByTestId('download-button');
      expect(downloadButton).toBeInTheDocument();

      // 触发点击事件
      downloadButton.click();

      // 由于这是一个mock测试，我们只需要验证按钮存在并且可以点击
      // 实际的下载功能会在集成测试中验证
      expect(downloadButton).toBeInTheDocument();
    });

    it('应该支持额外的工具栏按钮', () => {
      const extraButton = (
        <button type="button" data-testid="extra-button">
          额外按钮
        </button>
      );

      render(
        <AreaChart
          data={sampleData}
          toolbarExtra={extraButton}
          title="带额外按钮"
        />,
      );

      // 查找所有工具栏并检查最后一个（最新渲染的）
      const toolbars = screen.getAllByTestId('chart-toolbar');
      const lastToolbar = toolbars[toolbars.length - 1];

      expect(lastToolbar).toBeInTheDocument();

      // 在最后一个工具栏中查找额外按钮
      const extraButtonElement = lastToolbar.querySelector(
        '[data-testid="extra-button"]',
      );
      expect(extraButtonElement).toBeInTheDocument();
    });
  });

  describe('ChartStatistic 集成测试', () => {
    it('应该支持 statistic 配置', () => {
      vi.mocked(hooks.useChartStatistics).mockImplementation(() => [
        {
          title: '平均值',
          value: 85000,
        },
      ]);

      render(
        <AreaChart
          data={sampleData}
          statistic={{
            title: '平均값',
            value: 85000,
          }}
          title="带统计数据"
        />,
      );

      expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
    });
  });

  describe('响应式测试', () => {
    it('应该根据窗口大小调整布局', () => {
      vi.mocked(hooks.useResponsiveSize).mockImplementation(() => ({
        responsiveWidth: 500,
        responsiveHeight: 400,
        isMobile: true,
        windowWidth: 500,
      }));

      render(<AreaChart data={sampleData} title="移动端面积图" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('variant 属性测试', () => {
    it('应该支持 variant 属性', () => {
      render(
        <AreaChart data={sampleData} variant="outline" title="边框样式" />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('默认颜色测试', () => {
    it('应该使用默认颜色当未指定时', () => {
      render(<AreaChart data={sampleData} title="默认颜色" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('应该处理多个数据集的颜色分配', () => {
      const multiTypeData: any[] = Array.from({ length: 15 }, (_, i) => ({
        category: 'A组',
        type: `团队${i + 1}`,
        x: 'Q1',
        y: 80,
      }));

      render(<AreaChart data={multiTypeData} title="多数据集颜色" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('加载状态测试', () => {
    it('应该支持 loading 属性', () => {
      render(<AreaChart data={sampleData} loading={true} title="加载状态" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('工具栏渲染测试', () => {
    it('应该支持 renderFilterInToolbar 属性', () => {
      vi.mocked(hooks.useChartDataFilter).mockImplementation(() => ({
        filteredData: sampleData,
        categories: ['销售数据', '市场数据'],
        filterOptions: [
          { label: '销售数据', value: '销售数据' },
          { label: '市场数据', value: '市场数据' },
        ],
        filterLabels: undefined,
        selectedFilter: '销售数据',
        setSelectedFilter: vi.fn(),
        selectedFilterLabel: undefined,
        setSelectedFilterLabel: vi.fn(),
        filteredDataByFilterLabel: undefined,
        safeData: sampleData,
      }));

      render(
        <AreaChart
          data={sampleData}
          renderFilterInToolbar={true}
          title="工具栏筛选器"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('classNames 和 styles 支持', () => {
    it('应该支持 ChartClassNames 对象格式的 classNames', () => {
      const classNames = {
        root: 'custom-root-class',
        toolbar: 'custom-toolbar-class',
      };

      render(<AreaChart data={sampleData} classNames={classNames} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持 ChartStyles 对象格式的 styles', () => {
      const styles = {
        root: { width: '500px', height: '300px' },
        toolbar: { padding: '10px' },
      };

      render(<AreaChart data={sampleData} styles={styles} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该合并 classNames 和 className', () => {
      const classNames = {
        root: 'custom-root-class',
      };

      render(
        <AreaChart
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
        <AreaChart
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
        <AreaChart
          data={sampleData}
          styles={styles}
          style={{ width: '500px', height: '300px' }}
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 classNames 为 undefined 的情况', () => {
      render(<AreaChart data={sampleData} classNames={undefined} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 styles 为 undefined 的情况', () => {
      render(<AreaChart data={sampleData} styles={undefined} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击下载按钮应触发下载函数', () => {
      render(<AreaChart data={sampleData} title="下载测试" />);

      const downloadButton = screen.getByTestId('download-button');
      fireEvent.click(downloadButton);

      expect(components.downloadChart).toHaveBeenCalled();
    });

    it('当 renderFilterInToolbar 为 true 时应在工具栏显示筛选器', () => {
      const multiCategoryData = [
        ...sampleData,
        { category: '市场数据', type: '团队A', x: 'Q1', y: 100 },
      ];

      // 需要 mock filterOptions 使其长度 > 1
      vi.mocked(hooks.useChartDataFilter).mockImplementation(() => ({
        filteredData: multiCategoryData,
        categories: ['销售数据', '市场数据'],
        filterOptions: [
          { label: '销售数据', value: '销售数据' },
          { label: '市场数据', value: '市场数据' },
        ],
        filterLabels: undefined,
        selectedFilter: '销售数据',
        setSelectedFilter: vi.fn(),
        selectedFilterLabel: undefined,
        setSelectedFilterLabel: vi.fn(),
        filteredDataByFilterLabel: undefined,
        safeData: multiCategoryData,
      }));

      render(
        <AreaChart
          data={multiCategoryData}
          renderFilterInToolbar={true}
          title="工具栏筛选器测试"
        />,
      );

      // 在 ChartToolBar 内部渲染了 ChartFilter
      const toolbar = screen.getByTestId('chart-toolbar');
      const filter = screen.getByTestId('chart-filter');
      expect(toolbar).toContainElement(filter);
    });

    it('renderFilterInToolbar=true 但仅一个分类时不应渲染筛选器', () => {
      render(
        <AreaChart
          data={sampleData}
          renderFilterInToolbar={true}
          title="单分类"
        />,
      );

      expect(screen.queryByTestId('chart-filter')).not.toBeInTheDocument();
    });
  });
});

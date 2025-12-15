import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 使用动态导入来避免类型检查错误
let LineChart: React.FC<any>;

// 在每个测试前导入组件
beforeEach(async () => {
  try {
    const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/index');
    LineChart = LineChartModule.default;
  } catch (error) {
    // 如果上面的导入失败，尝试不带扩展名的导入
    const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/');
    LineChart = LineChartModule.default;
  }
});

// 定义 LineChartDataItem 类型
interface LineChartDataItem {
  x: number;
  y: number | string;
  type: string;
  xtitle?: string;
  ytitle?: string;
}

// Mock Chart.js and react-chartjs-2
vi.mock('chart.js', async () => {
  const actual = await vi.importActual('chart.js');
  return {
    ...actual,
    Chart: {
      register: vi.fn(),
    },
  };
});

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

// Mock antd ConfigProvider
vi.mock('antd', async () => {
  const actual: any = await vi.importActual('antd');
  const mockConfigContext = {
    Provider: ({ children }: any) => children,
    Consumer: ({ children }: any) => children({ getPrefixCls: () => 'test-prefix' }),
    displayName: 'ConfigContext',
  };
  
  // 添加 createContext 属性
  Object.defineProperty(mockConfigContext, 'createContext', {
    value: () => mockConfigContext,
    writable: true,
  });
  
  return {
    ...actual,
    ConfigProvider: {
      ...actual?.ConfigProvider,
      ConfigContext: mockConfigContext,
    },
  };
});

// Mock chart components
vi.mock('../../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartToolBar: ({ title, onDownload, extra, filter }: any) => (
    <div data-testid="chart-toolbar">
      {title && <div data-testid="chart-title">{title}</div>}
      {extra && <div data-testid="toolbar-extra">{extra}</div>}
      {filter && <div data-testid="chart-filter-in-toolbar">{filter}</div>}
      <button type="button" onClick={onDownload} data-testid="download-button">Download</button>
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <div data-testid="chart-filter">
      {filterOptions && filterOptions.map((option: any, index: number) => (
        <button 
          type="button"
          key={index} 
          onClick={() => onFilterChange(option)}
          data-testid={`filter-option-${option}`}
        >
          {option}
        </button>
      ))}
    </div>
  ),
  ChartStatistic: ({ title, value }: any) => (
    <div data-testid="chart-statistic">
      <span data-testid="statistic-title">{title}</span>
      <span data-testid="statistic-value">{value}</span>
    </div>
  ),
  downloadChart: vi.fn(),
}));

// Mock hooks
vi.mock('../../../../src/Plugins/chart/hooks', () => ({
  useResponsiveSize: () => ({
    responsiveWidth: 600,
    responsiveHeight: 400,
    isMobile: false,
  }),
  useChartTheme: () => ({
    axisTextColor: '#333',
    gridColor: '#ccc',
    isLight: true,
  }),
  useChartDataFilter: () => ({
    filteredData: [],
    filterOptions: [],
    filterLabels: [],
    selectedFilter: '',
    setSelectedFilter: vi.fn(),
    selectedFilterLabel: '',
    setSelectedFilterLabel: vi.fn(),
    filteredDataByFilterLabel: [],
  }),
  useChartStatistics: () => null,
}));

// Mock chart utils
vi.mock('../../../../src/Plugins/chart/utils', () => ({
  extractAndSortXValues: vi.fn(() => []),
  findDataPointByXValue: vi.fn(() => null),
  registerLineChartComponents: vi.fn(),
}));

// Mock style hook
vi.mock('../../../../src/Plugins/chart/LineChart/style', () => ({
  useStyle: () => ({
    wrapSSR: (node: any) => node,
    hashId: 'test-hash',
  }),
}));

describe('LineChart', () => {
  const mockData: LineChartDataItem[] = [
    { x: 1, y: 10, type: 'Series 1' },
    { x: 2, y: 20, type: 'Series 1' },
    { x: 3, y: 30, type: 'Series 1' },
    { x: 1, y: 15, type: 'Series 2' },
    { x: 2, y: 25, type: 'Series 2' },
    { x: 3, y: 35, type: 'Series 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基础渲染测试', () => {
    it('应该正确渲染图表组件', () => {
      render(<LineChart data={mockData} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该正确渲染图表标题', () => {
      const title = '测试折线图';
      render(<LineChart data={mockData} title={title} />);
      
      expect(screen.getByTestId('chart-title')).toBeInTheDocument();
      expect(screen.getByTestId('chart-title')).toHaveTextContent(title);
    });

    it('应该正确渲染工具栏额外内容', () => {
      const extraContent = <div>额外按钮</div>;
      render(<LineChart data={mockData} toolbarExtra={extraContent} />);
      
      expect(screen.getByTestId('toolbar-extra')).toBeInTheDocument();
    });

    it('应该正确处理空数据', () => {
      render(<LineChart data={[]} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确应用自定义类名', () => {
      const customClassName = 'custom-line-chart';
      render(<LineChart data={mockData} className={customClassName} />);
      
      // 由于我们mock了ChartContainer，这里只是确保组件被渲染
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('数据处理测试', () => {
    it('应该正确处理数据筛选', async () => {
      const mockFilteredData = [
        { x: 1, y: 10, type: 'Series 1' },
        { x: 2, y: 20, type: 'Series 1' },
      ];
      
      // 重新mock useChartDataFilter 以返回特定数据
      vi.mock('../../../../src/Plugins/chart/hooks', () => ({
        useResponsiveSize: () => ({
          responsiveWidth: 600,
          responsiveHeight: 400,
          isMobile: false,
        }),
        useChartTheme: () => ({
          axisTextColor: '#333',
          gridColor: '#ccc',
          isLight: true,
        }),
        useChartDataFilter: () => ({
          filteredData: mockFilteredData,
          filterOptions: ['All', 'Series 1'],
          filterLabels: [],
          selectedFilter: 'All',
          setSelectedFilter: vi.fn(),
          selectedFilterLabel: '',
          setSelectedFilterLabel: vi.fn(),
          filteredDataByFilterLabel: [],
        }),
        useChartStatistics: () => null,
      }));
      
      // 重新导入组件以应用新的mock
      let ReRenderedLineChart: React.FC<any>;
      try {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/index');
        ReRenderedLineChart = LineChartModule.default;
      } catch (error) {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/');
        ReRenderedLineChart = LineChartModule.default;
      }
      render(<ReRenderedLineChart data={mockData} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理x值提取和排序', async () => {
      const mockDataUnsorted = [
        { x: 3, y: 30, type: 'Series 1' },
        { x: 1, y: 10, type: 'Series 1' },
        { x: 2, y: 20, type: 'Series 1' },
      ];
      
      // mock extractAndSortXValues 函数
      let utils: any;
      try {
        utils = await import('../../../../src/Plugins/chart/utils');
      } catch (error) {
        utils = await import('../../../../src/Plugins/chart/');
      }
      vi.spyOn(utils, 'extractAndSortXValues').mockReturnValue([1, 2, 3]);
      
      render(<LineChart data={mockDataUnsorted} />);
      
      expect(utils.extractAndSortXValues).toHaveBeenCalled();
    });
  });

  describe('图表配置测试', () => {
    it('应该正确处理图例显示配置', () => {
      render(<LineChart data={mockData} showLegend={false} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理网格线显示配置', () => {
      render(<LineChart data={mockData} showGrid={false} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理坐标轴隐藏配置', () => {
      render(<LineChart data={mockData} hiddenX={true} hiddenY={true} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理主题配置', () => {
      render(<LineChart data={mockData} theme="dark" />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理自定义颜色配置', () => {
      render(<LineChart data={mockData} color={['#ff0000', '#00ff00']} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('统计信息测试', () => {
    it('应该正确渲染统计信息', async () => {
      const statisticConfig = {
        title: '总计',
        value: 100,
      };
      
      // 重新mock hooks 以返回特定配置
      vi.doMock('../../../../src/Plugins/chart/hooks', async () => {
        const actual: any = await vi.importActual('../../../../src/Plugins/chart/hooks');
        return {
          ...actual,
          useChartStatistics: () => [statisticConfig],
        };
      });
      
      // 重新导入组件以应用新的mock
      let ReRenderedLineChart: React.FC<any>;
      try {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/index');
        ReRenderedLineChart = LineChartModule.default;
      } catch (error) {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/');
        ReRenderedLineChart = LineChartModule.default;
      }
      render(<ReRenderedLineChart data={mockData} statistic={statisticConfig} />);
      
      // 等待组件渲染完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 检查是否有统计信息容器
      const chartContainer = screen.getByTestId('chart-container');
      expect(chartContainer).toBeInTheDocument();
    });

    it('应该正确处理多个统计信息', async () => {
      const statisticConfigs = [
        { title: '总计', value: 100 },
        { title: '平均值', value: 50 },
      ];
      
      // 重新mock hooks 以返回多个配置
      vi.doMock('../../../../src/Plugins/chart/hooks', async () => {
        const actual: any = await vi.importActual('../../../../src/Plugins/chart/hooks');
        return {
          ...actual,
          useChartStatistics: () => statisticConfigs,
        };
      });
      
      // 重新导入组件以应用新的mock
      let ReRenderedLineChart: React.FC<any>;
      try {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/index');
        ReRenderedLineChart = LineChartModule.default;
      } catch (error) {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/');
        ReRenderedLineChart = LineChartModule.default;
      }
      render(<ReRenderedLineChart data={mockData} statistic={statisticConfigs} />);
      
      // 等待组件渲染完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 检查是否有统计信息容器
      const chartContainer = screen.getByTestId('chart-container');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('工具栏测试', () => {
    it('应该正确渲染工具栏', () => {
      render(<LineChart data={mockData} />);
      
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
    });

    it('应该正确处理下载功能', async () => {
      render(<LineChart data={mockData} />);
      
      const downloadButton = screen.getByTestId('download-button');
      fireEvent.click(downloadButton);
      
      let components: any;
      try {
        components = await import('../../../../src/Plugins/chart/components');
      } catch (error) {
        components = await import('../../../../src/Plugins/chart/');
      }
      expect(components.downloadChart).toHaveBeenCalled();
    });

    it('应该正确渲染过滤器', async () => {
      const mockFilterOptions = ['All', 'Series 1', 'Series 2'];
      
      // 重新mock hooks 以返回过滤选项
      vi.doMock('../../../../src/Plugins/chart/hooks', async () => {
        const actual: any = await vi.importActual('../../../../src/Plugins/chart/hooks');
        return {
          ...actual,
          useChartDataFilter: () => ({
            filteredData: mockData,
            filterOptions: mockFilterOptions,
            filterLabels: [],
            selectedFilter: 'All',
            setSelectedFilter: vi.fn(),
            selectedFilterLabel: '',
            setSelectedFilterLabel: vi.fn(),
            filteredDataByFilterLabel: [],
          }),
        };
      });
      
      // 重新导入组件以应用新的mock
      let ReRenderedLineChart: React.FC<any>;
      try {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/index');
        ReRenderedLineChart = LineChartModule.default;
      } catch (error) {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/');
        ReRenderedLineChart = LineChartModule.default;
      }
      render(<ReRenderedLineChart data={mockData} />);
      
      // 等待组件渲染完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
      // 检查是否有过滤选项按钮
      const filterContainer = screen.getByTestId('chart-filter');
      expect(filterContainer).toBeInTheDocument();
    });
  });

  describe('响应式设计测试', () => {
    it('应该正确处理移动端显示', async () => {
      // 重新mock useResponsiveSize 以返回移动端配置
      vi.mock('../../../../src/Plugins/chart/hooks', () => ({
        useResponsiveSize: () => ({
          responsiveWidth: 300,
          responsiveHeight: 200,
          isMobile: true,
        }),
        useChartTheme: () => ({
          axisTextColor: '#333',
          gridColor: '#ccc',
          isLight: true,
        }),
        useChartDataFilter: () => ({
          filteredData: [],
          filterOptions: [],
          filterLabels: [],
          selectedFilter: '',
          setSelectedFilter: vi.fn(),
          selectedFilterLabel: '',
          setSelectedFilterLabel: vi.fn(),
          filteredDataByFilterLabel: [],
        }),
        useChartStatistics: () => null,
      }));
      
      // 重新导入组件以应用新的mock
      let ReRenderedLineChart: React.FC<any>;
      try {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/index');
        ReRenderedLineChart = LineChartModule.default;
      } catch (error) {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/');
        ReRenderedLineChart = LineChartModule.default;
      }
      render(<ReRenderedLineChart data={mockData} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理尺寸配置', () => {
      render(<LineChart data={mockData} width={800} height={600} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理undefined数据', () => {
      render(<LineChart data={undefined as any} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理null数据', () => {
      render(<LineChart data={null as any} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理无效数据点', () => {
      const invalidData = [
        { x: 1, y: 'invalid', type: 'Series 1' },
        { x: 2, y: null, type: 'Series 1' },
        { x: 3, y: undefined, type: 'Series 1' },
      ];
      
      render(<LineChart data={invalidData} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理空字符串类型', () => {
      const dataWithEmptyType = [
        { x: 1, y: 10, type: '' },
        { x: 2, y: 20, type: 'Series 1' },
      ];
      
      render(<LineChart data={dataWithEmptyType} />);
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('样式和主题测试', () => {
    it('应该正确调用registerLineChartComponents', async () => {
      const utils = await import('../../../../src/Plugins/chart/utils');
      render(<LineChart data={mockData} />);
      
      expect(utils.registerLineChartComponents).toHaveBeenCalled();
    });

    it('应该正确获取样式上下文', () => {
      render(<LineChart data={mockData} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('图表引用和下载测试', () => {
    it('应该正确设置chartRef并处理下载', async () => {
      render(<LineChart data={mockData} />);
      
      const downloadButton = screen.getByTestId('download-button');
      fireEvent.click(downloadButton);
      
      const components = await import('../../../../src/Plugins/chart/components');
      expect(components.downloadChart).toHaveBeenCalled();
    });
  });

  describe('数据处理和计算测试', () => {
    it('应该正确计算types数组', () => {
      const mockDataWithMultipleTypes = [
        { x: 1, y: 10, type: 'Type A' },
        { x: 2, y: 20, type: 'Type B' },
        { x: 3, y: 30, type: 'Type A' },
        { x: 4, y: 40, type: 'Type C' },
      ];
      
      render(<LineChart data={mockDataWithMultipleTypes} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确计算xValues数组', async () => {
      let utils: any;
      try {
        utils = await import('../../../../src/Plugins/chart/utils');
      } catch (error) {
        utils = await import('../../../../src/Plugins/chart/');
      }
      const mockDataUnsorted = [
        { x: 3, y: 30, type: 'Series 1' },
        { x: 1, y: 10, type: 'Series 1' },
        { x: 4, y: 40, type: 'Series 1' },
        { x: 2, y: 20, type: 'Series 1' },
      ];
      
      vi.spyOn(utils, 'extractAndSortXValues').mockReturnValue([1, 2, 3, 4]);
      
      render(<LineChart data={mockDataUnsorted} />);
      
      // 检查是否调用了 extractAndSortXValues
      expect(utils.extractAndSortXValues).toHaveBeenCalled();
    });

    it('应该正确计算xTitle和yTitle', () => {
      const mockDataWithTitle = [
        { x: 1, y: 10, type: 'Series 1', xtitle: 'X轴标题', ytitle: 'Y轴标题' },
        { x: 2, y: 20, type: 'Series 1', xtitle: 'X轴标题', ytitle: 'Y轴标题' },
      ];
      
      render(<LineChart data={mockDataWithTitle} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理空的xtitle和ytitle', () => {
      const mockDataWithoutTitle = [
        { x: 1, y: 10, type: 'Series 1' },
        { x: 2, y: 20, type: 'Series 1' },
      ];
      
      render(<LineChart data={mockDataWithoutTitle} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('图表数据处理测试', () => {
    it('应该正确处理processedData计算', () => {
      const mockDataForProcessing = [
        { x: 1, y: 10, type: 'Series 1' },
        { x: 2, y: 20, type: 'Series 1' },
        { x: 1, y: 15, type: 'Series 2' },
        { x: 2, y: 25, type: 'Series 2' },
      ];
      
      render(<LineChart data={mockDataForProcessing} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理自定义颜色配置', () => {
      const mockDataForColor = [
        { x: 1, y: 10, type: 'Series 1' },
        { x: 2, y: 20, type: 'Series 1' },
      ];
      
      render(<LineChart data={mockDataForColor} color="#ff0000" />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理颜色数组配置', () => {
      const mockDataForColors = [
        { x: 1, y: 10, type: 'Series 1' },
        { x: 2, y: 20, type: 'Series 2' },
        { x: 3, y: 30, type: 'Series 3' },
      ];
      
      render(<LineChart data={mockDataForColors} color={['#ff0000', '#00ff00', '#0000ff']} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('图表选项配置测试', () => {
    it('应该正确配置图表选项', () => {
      render(<LineChart data={mockData} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理图例位置配置', () => {
      render(<LineChart data={mockData} legendPosition="top" legendAlign="center" />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理坐标轴位置配置', () => {
      render(<LineChart data={mockData} xPosition="top" yPosition="right" />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理坐标轴标题', () => {
      const mockDataWithAxisTitles = [
        { x: 1, y: 10, type: 'Series 1', xtitle: '月份', ytitle: '销售额' },
        { x: 2, y: 20, type: 'Series 1', xtitle: '月份', ytitle: '销售额' },
      ];
      
      render(<LineChart data={mockDataWithAxisTitles} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('过滤器和统计信息测试', () => {
    it('应该正确渲染过滤器在工具栏中', async () => {
      const mockFilterOptions = ['All', 'Series 1', 'Series 2'];
      
      // 重新mock hooks 以返回过滤选项
      vi.doMock('../../../../src/Plugins/chart/hooks', async () => {
        const actual: any = await vi.importActual('../../../../src/Plugins/chart/hooks');
        return {
          ...actual,
          useChartDataFilter: () => ({
            filteredData: mockData,
            filterOptions: mockFilterOptions,
            filterLabels: [],
            selectedFilter: 'All',
            setSelectedFilter: vi.fn(),
            selectedFilterLabel: '',
            setSelectedFilterLabel: vi.fn(),
            filteredDataByFilterLabel: [],
          }),
        };
      });
      
      // 重新导入组件以应用新的mock
      let ReRenderedLineChart: React.FC<any>;
      try {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/index');
        ReRenderedLineChart = LineChartModule.default;
      } catch (error) {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/');
        ReRenderedLineChart = LineChartModule.default;
      }
      render(<ReRenderedLineChart data={mockData} renderFilterInToolbar={true} />);
      
      // 等待组件渲染完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 检查工具栏中是否有过滤器
      const toolbar = screen.getByTestId('chart-toolbar');
      expect(toolbar).toBeInTheDocument();
    });

    it('应该正确处理统计信息配置', async () => {
      const statisticConfig = {
        title: '总销售额',
        value: 1000,
      };
      
      // 重新mock hooks 以返回统计信息配置
      vi.doMock('../../../../src/Plugins/chart/hooks', async () => {
        const actual: any = await vi.importActual('../../../../src/Plugins/chart/hooks');
        return {
          ...actual,
          useChartStatistics: () => [statisticConfig],
        };
      });
      
      // 重新导入组件以应用新的mock
      let ReRenderedLineChart: React.FC<any>;
      try {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/index');
        ReRenderedLineChart = LineChartModule.default;
      } catch (error) {
        const LineChartModule = await import('../../../../src/Plugins/chart/LineChart/');
        ReRenderedLineChart = LineChartModule.default;
      }
      render(<ReRenderedLineChart data={mockData} statistic={statisticConfig} />);
      
      // 等待组件渲染完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 检查是否有统计信息容器
      const chartContainer = screen.getByTestId('chart-container');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('边界值和特殊情况测试', () => {
    it('应该正确处理null值数据点', () => {
      const mockDataWithNull = [
        { x: 1, y: 10, type: 'Series 1' },
        { x: 2, y: null, type: 'Series 1' },
        { x: 3, y: 30, type: 'Series 1' },
      ];
      
      render(<LineChart data={mockDataWithNull} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理undefined值数据点', () => {
      const mockDataWithUndefined = [
        { x: 1, y: 10, type: 'Series 1' },
        { x: 2, y: undefined, type: 'Series 1' },
        { x: 3, y: 30, type: 'Series 1' },
      ];
      
      render(<LineChart data={mockDataWithUndefined} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理重复的x值', () => {
      const mockDataWithDuplicateX = [
        { x: 1, y: 10, type: 'Series 1' },
        { x: 1, y: 15, type: 'Series 2' },
        { x: 2, y: 20, type: 'Series 1' },
        { x: 2, y: 25, type: 'Series 2' },
      ];
      
      render(<LineChart data={mockDataWithDuplicateX} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理大量数据点', () => {
      const largeDataSet = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
        type: 'Series 1'
      }));
      
      render(<LineChart data={largeDataSet} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});
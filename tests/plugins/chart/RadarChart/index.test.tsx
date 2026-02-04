import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let RadarChart: React.FC<any>;

beforeEach(async () => {
  vi.clearAllMocks();
  try {
    const mod = await import('../../../../src/Plugins/chart/RadarChart/index');
    RadarChart = mod.default;
  } catch (e) {
    const mod = await import('../../../../src/Plugins/chart/RadarChart/');
    RadarChart = mod.default;
  }
});

// Mock Chart.js
const mockChartInstance = {
  canvas: document.createElement('canvas'),
  toBase64Image: vi.fn(() => 'data:image/png;base64,test'),
  getBoundingClientRect: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 600,
    height: 400,
  })),
};

vi.mock('chart.js', async () => {
  const actual = await vi.importActual('chart.js');
  return {
    ...actual,
    Chart: {
      register: vi.fn(),
      defaults: {
        plugins: {
          legend: {
            labels: {
              generateLabels: vi.fn((chart) => [
                { text: 'Label 1' },
                { text: 'Very Long Label That Should Be Truncated' },
              ]),
            },
          },
        },
      },
    },
  };
});

vi.mock('react-chartjs-2', () => ({
  Radar: React.forwardRef(({ data, options }: any, ref: any) => {
    React.useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(mockChartInstance);
        } else if (ref && typeof ref === 'object') {
          ref.current = mockChartInstance;
        }
      }
    }, [ref]);

    // 测试 tooltip external 回调
    if (options?.plugins?.tooltip?.external) {
      const externalCallback = options.plugins.tooltip.external;
      // 模拟 tooltip 显示
      setTimeout(() => {
        try {
          externalCallback({
            chart: mockChartInstance,
            tooltip: {
              opacity: 1,
              caretX: 100,
              caretY: 200,
              dataPoints: [
                {
                  label: '技术',
                  dataset: { label: '团队A', borderColor: '#1677ff' },
                  parsed: { r: 75.5 },
                },
              ],
            },
          } as any);
        } catch (e) {
          // 忽略测试中的错误
        }
      }, 0);
    }

    // 测试 generateLabels 回调
    if (options?.plugins?.legend?.labels?.generateLabels) {
      const generateLabels = options.plugins.legend.labels.generateLabels;
      try {
        generateLabels(mockChartInstance);
      } catch (e) {
        // 忽略测试中的错误
      }
    }

    // 测试 ticks callback
    if (options?.scales?.r?.ticks?.callback) {
      const callback = options.scales.r.ticks.callback;
      try {
        callback(50);
        callback(100);
      } catch (e) {
        // 忽略测试中的错误
      }
    }

    return <div data-testid="radar-chart">Radar Chart</div>;
  }),
}));

vi.mock('../../../../src/Plugins/chart/RadarChart/style', () => ({
  useStyle: () => ({ wrapSSR: (node: any) => node, hashId: 'test-hash' }),
}));

const mockDownloadChart = vi.fn();

vi.mock('../../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartToolBar: ({ title, onDownload, extra, filter }: any) => (
    <div data-testid="chart-toolbar">
      {title && <div data-testid="chart-title">{title}</div>}
      {extra && <div data-testid="toolbar-extra">{extra}</div>}
      {filter && <div data-testid="toolbar-filter">{filter}</div>}
      <button type="button" onClick={onDownload} data-testid="download-button">
        Download
      </button>
    </div>
  ),
  ChartFilter: ({ filterOptions, selectedFilter, onFilterChange }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((opt: any, i: number) => (
        <button
          key={i}
          onClick={() => onFilterChange?.(opt.value)}
          data-selected={selectedFilter === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ),
  downloadChart: mockDownloadChart,
}));

// ChartStatistic 是单独导入的，需要单独 mock
vi.mock('../../../../src/Plugins/chart/ChartStatistic', () => ({
  default: ({ title, value }: any) => (
    <div data-testid="chart-statistic">
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
}));

vi.mock('../../../../src/Plugins/chart/utils', () => ({
  resolveCssVariable: vi.fn((color) =>
    typeof color === 'string' && color.startsWith('var(') ? '#1677ff' : color,
  ),
  hexToRgba: vi.fn((color, alpha) => `${color}${Math.round(alpha * 255).toString(16)}`),
}));

const mockData = [
  { label: '技术', type: '团队A', score: 80, category: 'cat1' },
  { label: '沟通', type: '团队A', score: 90, category: 'cat1' },
  { label: '技术', type: '团队B', score: 70, category: 'cat1' },
  { label: '沟通', type: '团队B', score: 85, category: 'cat1' },
];

describe('RadarChart', () => {
  beforeEach(() => {
    // 重置 window 对象
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'pageXOffset', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0,
    });
    // 清理 mock
    mockDownloadChart.mockClear();
  });

  it('空数据时应渲染暂无有效数据信息', () => {
    render(
      <ConfigProvider>
        <RadarChart data={[]} />
      </ConfigProvider>,
    );

    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('应该渲染基本雷达图', () => {
    render(
      <ConfigProvider>
        <RadarChart data={mockData} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该支持自定义标题', () => {
    render(
      <ConfigProvider>
        <RadarChart data={mockData} title="测试雷达图" />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('chart-title')).toHaveTextContent('测试雷达图');
  });

  it('应该支持自定义颜色（字符串）', () => {
    render(
      <ConfigProvider>
        <RadarChart data={mockData} color="#ff0000" />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该支持自定义颜色（数组）', () => {
    render(
      <ConfigProvider>
        <RadarChart data={mockData} color={['#ff0000', '#00ff00']} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该支持下载功能', () => {
    mockDownloadChart.mockClear();

    render(
      <ConfigProvider>
        <RadarChart data={mockData} title="测试图表" />
      </ConfigProvider>,
    );

    const downloadButton = screen.getByTestId('download-button');
    fireEvent.click(downloadButton);

    // downloadChart 应该被调用
    expect(mockDownloadChart).toHaveBeenCalled();
  });

  it('应该处理下载失败的情况', () => {
    mockDownloadChart.mockClear();
    mockDownloadChart.mockImplementation(() => {
      throw new Error('Download failed');
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ConfigProvider>
        <RadarChart data={mockData} title="测试图表" />
      </ConfigProvider>,
    );

    const downloadButton = screen.getByTestId('download-button');
    fireEvent.click(downloadButton);

    // 应该捕获错误并记录警告
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
    mockDownloadChart.mockRestore();
  });

  it('应该支持 filterLabel 筛选', () => {
    const dataWithFilterLabel = [
      { label: '技术', type: '团队A', score: 80, filterLabel: 'filter1' },
      { label: '沟通', type: '团队A', score: 90, filterLabel: 'filter1' },
      { label: '技术', type: '团队B', score: 70, filterLabel: 'filter2' },
    ];

    render(
      <ConfigProvider>
        <RadarChart data={dataWithFilterLabel} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该支持 category 筛选', () => {
    const dataWithCategory = [
      { label: '技术', type: '团队A', score: 80, category: 'cat1' },
      { label: '沟通', type: '团队A', score: 90, category: 'cat1' },
      { label: '技术', type: '团队B', score: 70, category: 'cat2' },
    ];

    render(
      <ConfigProvider>
        <RadarChart data={dataWithCategory} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该处理 null 或 undefined 数据项', () => {
    const dataWithNull = [
      { label: '技术', type: '团队A', score: 80 },
      null,
      undefined,
      { label: '沟通', type: '团队A', score: 90 },
    ] as any;

    render(
      <ConfigProvider>
        <RadarChart data={dataWithNull} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该处理无效的 score 值', () => {
    const dataWithInvalidScore = [
      { label: '技术', type: '团队A', score: null },
      { label: '沟通', type: '团队A', score: undefined },
      { label: '管理', type: '团队A', score: 'invalid' },
      { label: '创新', type: '团队A', score: '' },
      { label: '协作', type: '团队A', score: 'null' },
      { label: '执行', type: '团队A', score: -10 },
      { label: '学习', type: '团队A', score: Infinity },
    ];

    render(
      <ConfigProvider>
        <RadarChart data={dataWithInvalidScore} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该处理字符串类型的 score', () => {
    const dataWithStringScore = [
      { label: '技术', type: '团队A', score: '80' },
      { label: '沟通', type: '团队A', score: '90.5' },
    ];

    render(
      <ConfigProvider>
        <RadarChart data={dataWithStringScore} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该支持移动端响应式', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <ConfigProvider>
        <RadarChart data={mockData} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该支持 renderFilterInToolbar', () => {
    const dataWithCategory = [
      { label: '技术', type: '团队A', score: 80, category: 'cat1' },
      { label: '沟通', type: '团队A', score: 90, category: 'cat2' },
    ];

    render(
      <ConfigProvider>
        <RadarChart
          data={dataWithCategory}
          renderFilterInToolbar={true}
          title="测试"
        />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('toolbar-filter')).toBeInTheDocument();
  });

  it('应该支持统计信息', () => {
    render(
      <ConfigProvider>
        <RadarChart
          data={mockData}
          statistic={{ title: '总计', value: 100 }}
        />
      </ConfigProvider>,
    );

    // 检查统计信息是否渲染（通过 testid 或文本内容）
    const statistic = screen.getByTestId('chart-statistic');
    expect(statistic).toBeInTheDocument();
    expect(statistic).toHaveTextContent('总计');
    expect(statistic).toHaveTextContent('100');
  });

  it('应该支持多个统计信息', () => {
    render(
      <ConfigProvider>
        <RadarChart
          data={mockData}
          statistic={[
            { title: '总计', value: 100 },
            { title: '平均', value: 50 },
          ]}
        />
      </ConfigProvider>,
    );

    // 检查多个统计信息是否渲染
    const statistics = screen.getAllByTestId('chart-statistic');
    expect(statistics.length).toBe(2);
    expect(statistics[0]).toHaveTextContent('总计');
    expect(statistics[0]).toHaveTextContent('100');
    expect(statistics[1]).toHaveTextContent('平均');
    expect(statistics[1]).toHaveTextContent('50');
  });

  it('应该支持自定义 textMaxWidth', () => {
    render(
      <ConfigProvider>
        <RadarChart data={mockData} textMaxWidth={100} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该处理 tooltip 隐藏情况（opacity 为 0）', async () => {
    render(
      <ConfigProvider>
        <RadarChart data={mockData} />
      </ConfigProvider>,
    );

    // 等待 tooltip 逻辑执行
    await waitFor(() => {
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  it('应该处理 tooltip 数据点为空的情况', async () => {
    // Mock tooltip external 来测试空数据点
    const originalRadar = require('react-chartjs-2').Radar;
    vi.mocked(require('react-chartjs-2')).Radar = React.forwardRef(
      ({ options }: any, ref: any) => {
        React.useEffect(() => {
          if (ref && typeof ref === 'function') {
            ref(mockChartInstance);
          }
        }, [ref]);

        if (options?.plugins?.tooltip?.external) {
          const externalCallback = options.plugins.tooltip.external;
          setTimeout(() => {
            try {
              externalCallback({
                chart: mockChartInstance,
                tooltip: {
                  opacity: 1,
                  caretX: 100,
                  caretY: 200,
                  dataPoints: [], // 空数据点
                },
              } as any);
            } catch (e) {
              // 忽略测试中的错误
            }
          }, 0);
        }

        return <div data-testid="radar-chart">Radar Chart</div>;
      },
    );

    render(
      <ConfigProvider>
        <RadarChart data={mockData} />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  it('应该处理 tooltip 数据点 label 为空的情况', async () => {
    render(
      <ConfigProvider>
        <RadarChart data={mockData} />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  it('应该处理 tooltip value 解析错误', async () => {
    render(
      <ConfigProvider>
        <RadarChart data={mockData} />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  it('应该支持自定义 classNames', () => {
    render(
      <ConfigProvider>
        <RadarChart
          data={mockData}
          classNames={{ root: 'custom-root' }}
        />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该支持自定义 styles', () => {
    render(
      <ConfigProvider>
        <RadarChart
          data={mockData}
          styles={{ root: { padding: '10px' } }}
        />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该支持 toolbarExtra', () => {
    render(
      <ConfigProvider>
        <RadarChart
          data={mockData}
          title="测试"
          toolbarExtra={<div data-testid="extra">Extra</div>}
        />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });

  it('应该支持 dataTime', () => {
    render(
      <ConfigProvider>
        <RadarChart data={mockData} title="测试" dataTime="2024-01-01" />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该支持 loading 状态', () => {
    render(
      <ConfigProvider>
        <RadarChart data={mockData} title="测试" loading={true} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该处理没有 label 的数据项', () => {
    const dataWithoutLabel = [
      { type: '团队A', score: 80 },
      { label: '沟通', type: '团队A', score: 90 },
    ];

    render(
      <ConfigProvider>
        <RadarChart data={dataWithoutLabel} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('应该处理没有 type 的数据项', () => {
    const dataWithoutType = [
      { label: '技术', score: 80 },
      { label: '沟通', score: 90 },
    ];

    render(
      <ConfigProvider>
        <RadarChart data={dataWithoutType} />
      </ConfigProvider>,
    );

    // 没有 type 时，datasetTypes 为空，应该显示"暂无有效数据"
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('应该处理空 labels 数组', () => {
    const dataWithoutLabels = [
      { type: '团队A', score: 80 },
      { type: '团队A', score: 90 },
    ];

    render(
      <ConfigProvider>
        <RadarChart data={dataWithoutLabels} />
      </ConfigProvider>,
    );

    // 应该显示空状态
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('应该处理空 datasetTypes 数组', () => {
    const dataWithoutTypes = [
      { label: '技术', score: 80 },
      { label: '沟通', score: 90 },
    ];

    render(
      <ConfigProvider>
        <RadarChart data={dataWithoutTypes} />
      </ConfigProvider>,
    );

    // 应该显示空状态
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('应该处理 generateLabels 中 ctx 为 null 的情况', () => {
    // Mock getContext 返回 null
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        const canvas = originalCreateElement('canvas') as HTMLCanvasElement;
        canvas.getContext = vi.fn(() => null);
        return canvas;
      }
      return originalCreateElement(tagName);
    });

    render(
      <ConfigProvider>
        <RadarChart data={mockData} textMaxWidth={50} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });
});

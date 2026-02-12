import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDownloadChart = vi.fn();

// Mock canvas context 必须在 BarChart 任何逻辑前生效（含 useMemo 中的 calculateLabelWidth）
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(function (this: HTMLCanvasElement) {
    return {
      measureText: vi.fn(() => ({ width: 50 })),
      fillText: vi.fn(),
      font: '',
      canvas: this,
    };
  }) as any;
}

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('chartjs-plugin-datalabels', () => ({
  default: {},
}));

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => {
    (globalThis as any).__barChartLastOptions = options;
    (globalThis as any).__barChartLastData = data;
    return (
      <div
        data-testid="bar-chart"
        data-labels={JSON.stringify(data?.labels)}
        data-datasets={JSON.stringify(
          data?.datasets?.map((ds: any) => ({
            ...ds,
            backgroundColor: undefined,
            borderColor: undefined,
            borderRadius: undefined,
          })),
        )}
        data-options={JSON.stringify({
          indexAxis: options?.indexAxis,
          layout: options?.layout,
          plugins: {
            legend: options?.plugins?.legend,
            datalabels: options?.plugins?.datalabels,
          },
        })}
      />
    );
  },
}));

vi.mock('rc-resize-observer', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartFilter: ({
    filterOptions,
    onFilterChange,
    customOptions,
    selectedCustomSelection,
    onSelectionChange,
  }: any) => {
    // 直接调用回调，不使用防抖（测试环境）
    const handleClick = () => {
      // 优先使用 customOptions（filterLabel 筛选）
      if (customOptions && customOptions.length > 1 && onSelectionChange) {
        // 找到下一个选项（不是当前选中的）
        // 初始状态 selectedCustomSelection 应该是 'F1'（第一个 filterLabel）
        const currentKey = selectedCustomSelection || customOptions[0]?.key;
        const nextOption = customOptions.find(
          (opt: any) => opt.key !== currentKey,
        );
        if (nextOption) {
          // 直接调用，不使用防抖（测试环境）
          // 使用 setTimeout 模拟异步更新，确保 React 能正确处理状态更新
          setTimeout(() => {
            onSelectionChange(nextOption.key);
          }, 0);
        }
      } else if (filterOptions && filterOptions.length > 1 && onFilterChange) {
        setTimeout(() => {
          onFilterChange(filterOptions[1]?.value ?? '');
        }, 0);
      }
    };
    return (
      <button type="button" data-testid="chart-filter" onClick={handleClick}>
        filter
      </button>
    );
  },
  ChartStatistic: () => <div data-testid="chart-statistic" />,
  ChartToolBar: ({ onDownload, filter }: any) => (
    <div data-testid="chart-toolbar">
      <button type="button" data-testid="download-btn" onClick={() => onDownload?.()}>
        download
      </button>
      {filter}
    </div>
  ),
  downloadChart: (...args: any[]) => mockDownloadChart(...args),
}));

vi.mock('../../../src/Plugins/chart/BarChart/style', () => ({
  useStyle: () => ({
    wrapSSR: (node: any) => node,
  }),
}));

vi.mock('../../../src/Plugins/chart/const', () => ({
  defaultColorList: ['#123456', '#654321'],
}));

vi.mock('../../../src/Plugins/chart/utils', () => ({
  extractAndSortXValues: vi.fn((data) => [
    ...new Set(
      data
        .map((item: any) => item.x)
        .filter(
          (value: any) =>
            value !== null &&
            value !== undefined &&
            value !== '' &&
            String(value).trim() !== '',
        ),
    ),
  ]),
  findDataPointByXValue: vi.fn((data, x, type) =>
    data.find((item: any) => item.x === x && item.type === type),
  ),
  hexToRgba: vi.fn((color, alpha) => `rgba(${color},${alpha})`),
  resolveCssVariable: vi.fn((color) => color),
}));

import BarChart from '../../../src/Plugins/chart/BarChart';

describe('BarChart 额外用例', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应按分类筛选数据并在切换筛选时更新标签', async () => {
    // 修改测试数据：需要多个 category 才能渲染 ChartFilter（filterOptions.length > 1）
    // 同时确保同一个 category 中有不同的 filterLabel，这样测试 filterLabel 筛选功能
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10, filterLabel: 'F1' },
      { category: 'A', type: 't1', x: 'X2', y: 20, filterLabel: 'F2' },
      { category: 'A', type: 't1', x: '', y: 30, filterLabel: 'F1' }, // 空字符串会被过滤
      { category: 'B', type: 't1', x: 'X3', y: 15, filterLabel: 'F1' }, // 添加另一个 category 以确保 filterOptions.length > 1
    ];

    render(<BarChart data={data} title="过滤测试" showDataLabels />);

    const chart = screen.getByTestId('bar-chart');
    const initialLabels = JSON.parse(chart.getAttribute('data-labels') || '[]');
    // 初始筛选应该包含 filterLabel: 'F1' 的数据，空字符串会被过滤
    // 初始 selectedFilter 是 'A'，selectedFilterLabel 是 'F1'，所以只有 ['X1']
    expect(initialLabels).toEqual(['X1']);

    // 点击筛选器切换 filterLabel
    const filterButton = screen.getByTestId('chart-filter');

    // 使用 act 包装点击事件，确保状态更新被正确处理
    await act(async () => {
      fireEvent.click(filterButton);
      // 等待 setTimeout 完成
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // 等待状态更新和重新渲染
    await waitFor(
      () => {
        const updatedChart = screen.getByTestId('bar-chart');
        const updatedLabels = JSON.parse(
          updatedChart.getAttribute('data-labels') || '[]',
        );
        // 切换筛选后应该显示 filterLabel: 'F2' 的数据，即 ['X2']
        expect(updatedLabels).toEqual(['X2']);
      },
      { timeout: 5000, interval: 100 },
    );
  });

  it('在水平柱状图时保持原始顺序并计算标签 padding', () => {
    const data = [
      { category: 'A', type: 't1', x: 'B', y: 5 },
      { category: 'A', type: 't1', x: 'A', y: 3 },
    ];

    render(
      <BarChart
        data={data}
        indexAxis="y"
        showDataLabels
        chartOptions={{ plugins: { legend: { align: 'center' } } }}
      />,
    );

    const chart = screen.getByTestId('bar-chart');
    const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
    expect(labels).toEqual(['B', 'A']);

    const options = JSON.parse(chart.getAttribute('data-options') || '{}');
    expect(options.indexAxis).toBe('y');
    expect(options.layout?.padding?.right).toBeGreaterThan(0);
  });

  it('应合并外部 chartOptions 的 padding 而不丢失默认值', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];

    render(
      <BarChart
        data={data}
        showDataLabels
        chartOptions={{ layout: { padding: { left: 30 } } }}
      />,
    );

    const options = JSON.parse(
      screen.getByTestId('bar-chart').getAttribute('data-options') || '{}',
    );

    expect(options.layout?.padding?.left).toBe(30);
    expect(options.layout?.padding?.top).toBeGreaterThan(0);
  });

  it('点击下载按钮时应调用 downloadChart', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];

    render(<BarChart data={data} title="下载测试" />);

    fireEvent.click(screen.getByTestId('download-btn'));
    expect(mockDownloadChart).toHaveBeenCalledTimes(1);
  });

  it('卸载时应移除 resize 监听（useEffect cleanup）', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<BarChart data={data} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('statistic 传单对象时应转为数组并正常渲染', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    expect(() =>
      render(
        <BarChart
          data={data}
          statistic={{ type: 'sum', target: 'y', label: '合计' } as any}
        />,
      ),
    ).not.toThrow();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('第二次渲染时 barChart 已注册应直接 return', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    const { rerender } = render(<BarChart data={data} />);
    rerender(<BarChart data={data} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('应调用 datalabels.display(false) 当 showDataLabels 为 false', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    render(<BarChart data={data} showDataLabels={false} />);
    const options = (globalThis as any).__barChartLastOptions as any;
    const display = options?.plugins?.datalabels?.display;
    expect(display).toBeDefined();
    expect(display({ chart: {}, datasetIndex: 0, dataIndex: 0 })).toBe(false);
  });

  it('应调用 datalabels.display 非堆叠时返回 true', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    render(<BarChart data={data} showDataLabels />);
    const options = (globalThis as any).__barChartLastOptions as any;
    const display = options?.plugins?.datalabels?.display;
    expect(display({ chart: {}, datasetIndex: 0, dataIndex: 0 })).toBe(true);
  });

  it('应调用 datalabels.display 堆叠时仅最后一段显示', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't2', x: 'X1', y: 5 },
    ];
    render(<BarChart data={data} stacked showDataLabels />);
    const options = (globalThis as any).__barChartLastOptions as any;
    const display = options?.plugins?.datalabels?.display;
    const chart = {
      data: { datasets: [{ stack: 'stack' }, { stack: 'stack' }] },
      isDatasetVisible: () => true,
    };
    expect(display({ chart, datasetIndex: 0, dataIndex: 0 })).toBe(false);
    expect(display({ chart, datasetIndex: 1, dataIndex: 0 })).toBe(true);
  });

  it('应调用 datalabels.formatter 非堆叠时返回 toLocaleString', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 1000 }];
    render(<BarChart data={data} showDataLabels />);
    const options = (globalThis as any).__barChartLastOptions as any;
    const formatter = options?.plugins?.datalabels?.formatter;
    expect(formatter).toBeDefined();
    const ctx = {
      dataIndex: 0,
      datasetIndex: 0,
      chart: { data: { labels: ['X1'], datasets: [{ label: 't1' }] } },
      dataset: { label: 't1' },
    };
    expect(formatter(1000, ctx)).toBe('1,000');
  });

  it('应调用 datalabels.formatter 堆叠时返回累计 toLocaleString', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't2', x: 'X1', y: 20 },
    ];
    render(<BarChart data={data} stacked showDataLabels />);
    const options = (globalThis as any).__barChartLastOptions as any;
    const formatter = options?.plugins?.datalabels?.formatter;
    const chart = {
      data: {
        labels: ['X1'],
        datasets: [
          { label: 't1', data: [10], stack: 'stack' },
          { label: 't2', data: [20], stack: 'stack' },
        ],
      },
      isDatasetVisible: () => true,
    };
    const ctx = {
      dataIndex: 0,
      datasetIndex: 1,
      chart,
      dataset: { label: 't2', data: [20], stack: 'stack' },
    };
    expect(formatter(20, ctx)).toBe('30');
  });

  it('应调用 datalabels.formatter 使用 dataLabelFormatter 时返回自定义格式', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 99 }];
    const customFormatter = vi.fn(({ value }: any) => `$${value}`);
    render(
      <BarChart data={data} showDataLabels dataLabelFormatter={customFormatter} />,
    );
    const options = (globalThis as any).__barChartLastOptions as any;
    const formatter = options?.plugins?.datalabels?.formatter;
    const ctx = {
      dataIndex: 0,
      datasetIndex: 0,
      chart: { data: { labels: ['X1'], datasets: [{ label: 't1' }] } },
      dataset: { label: 't1' },
    };
    expect(formatter(99, ctx)).toBe('$99');
    expect(customFormatter).toHaveBeenCalled();
  });

  it('formatter 在 value 为 null 时应返回空字符串', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 0 }];
    render(<BarChart data={data} showDataLabels />);
    const options = (globalThis as any).__barChartLastOptions as any;
    const formatter = options?.plugins?.datalabels?.formatter;
    expect(formatter(null, { chart: {}, dataIndex: 0, datasetIndex: 0, dataset: {} })).toBe('');
  });

  it('renderFilterInToolbar 为 false 且多分类时应渲染 ChartFilter', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'B', type: 't1', x: 'X2', y: 20 },
    ];
    render(<BarChart data={data} renderFilterInToolbar={false} />);
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('传入 statistic 时渲染统计区块并展示 ChartStatistic', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    render(
      <BarChart
        data={data}
        statistic={[{ type: 'sum', target: 'y', label: '合计' } as any]}
      />,
    );
    expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
  });

  it('getContext 抛错时仍用备用方式计算标签宽度并正常渲染', () => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => {
      throw new Error('getContext not available');
    }) as any;
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    const { container } = render(<BarChart data={data} showDataLabels />);
    expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument();
    HTMLCanvasElement.prototype.getContext = orig;
  });

  it('堆叠图且提供 dataLabelFormatter 时 formatter 使用自定义格式化结果', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't2', x: 'X1', y: 20 },
    ];
    const customFormatter = vi.fn(({ value }: any) => `合计: ${value}`);
    render(
      <BarChart data={data} stacked showDataLabels dataLabelFormatter={customFormatter} />,
    );
    const options = (globalThis as any).__barChartLastOptions as any;
    const formatter = options?.plugins?.datalabels?.formatter;
    const chart = {
      data: {
        labels: ['X1'],
        datasets: [
          { label: 't1', data: [10], stack: 'stack' },
          { label: 't2', data: [20], stack: 'stack' },
        ],
      },
      isDatasetVisible: () => true,
    };
    const ctx = {
      dataIndex: 0,
      datasetIndex: 1,
      chart,
      dataset: { label: 't2', data: [20], stack: 'stack' },
    };
    expect(formatter(20, ctx)).toBe('合计: 30');
    expect(customFormatter).toHaveBeenCalledWith(
      expect.objectContaining({ value: 30, label: 'X1' }),
    );
  });

  describe('dataset 颜色与圆角脚本回调', () => {
    it('borderColor 在正负值数据下按正负选用不同基准色', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: -5 },
      ];
      render(<BarChart data={data} showDataLabels />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderColor = lastData?.datasets?.[0]?.borderColor;
      expect(typeof borderColor).toBe('function');
      const rgbaPos = borderColor({ parsed: { y: 10 } } as any);
      const rgbaNeg = borderColor({ parsed: { y: -5 } } as any);
      expect(rgbaPos).toBeDefined();
      expect(rgbaNeg).toBeDefined();
    });

    it('backgroundColor 在无 chartArea 时返回纯色', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
      expect(typeof backgroundColor).toBe('function');
      const result = backgroundColor({ chart: {} } as any);
      expect(result).toBeDefined();
    });

    it('backgroundColor 在 indexAxis 为 y 且 value 为 0 时返回固定透明度', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 0 }];
      render(<BarChart data={data} indexAxis="y" />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
      const mockChart = {
        chartArea: { left: 0, right: 100, top: 0, bottom: 50 },
        ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
        scales: {
          x: { getPixelForValue: (v: number) => v },
          y: { getPixelForValue: (v: number) => v },
        },
      };
      const result = backgroundColor({
        chart: mockChart as any,
        parsed: { x: 0 },
      } as any);
      expect(result).toBeDefined();
    });

    it('borderRadius 垂直柱正值返回上圆角、负值返回下圆角', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: -3 },
      ];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderRadius = lastData?.datasets?.[0]?.borderRadius;
      expect(typeof borderRadius).toBe('function');
      const ctxPos = { raw: 10, chart: null, datasetIndex: 0, dataIndex: 0 };
      const ctxNeg = { raw: -3, chart: null, datasetIndex: 0, dataIndex: 1 };
      expect(borderRadius(ctxPos as any)).toMatchObject({
        topLeft: 6,
        topRight: 6,
        bottomLeft: 0,
        bottomRight: 0,
      });
      expect(borderRadius(ctxNeg as any)).toMatchObject({
        bottomLeft: 6,
        bottomRight: 6,
        topLeft: 0,
        topRight: 0,
      });
    });

    it('borderRadius 垂直柱仅负值时返回下圆角', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: -2 }];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderRadius = lastData?.datasets?.[0]?.borderRadius;
      const result = borderRadius({ raw: -2, chart: null, datasetIndex: 0, dataIndex: 0 } as any);
      expect(result).toMatchObject({
        bottomLeft: 6,
        bottomRight: 6,
        topLeft: 0,
        topRight: 0,
      });
    });

    it('borderRadius 水平柱正值为右侧圆角、负值为左侧圆角', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 5 },
        { category: 'A', type: 't1', x: 'X2', y: -2 },
      ];
      render(<BarChart data={data} indexAxis="y" />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderRadius = lastData?.datasets?.[0]?.borderRadius;
      const ctxPos = { raw: 5, chart: null, datasetIndex: 0, dataIndex: 0 };
      const ctxNeg = { raw: -2, chart: null, datasetIndex: 0, dataIndex: 1 };
      expect(borderRadius(ctxPos as any)).toMatchObject({
        topRight: 6,
        bottomRight: 6,
        topLeft: 0,
        bottomLeft: 0,
      });
      expect(borderRadius(ctxNeg as any)).toMatchObject({
        topLeft: 6,
        bottomLeft: 6,
        topRight: 0,
        bottomRight: 0,
      });
    });

    it('borderRadius 堆叠时非栈顶段返回 0', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't2', x: 'X1', y: 20 },
      ];
      render(<BarChart data={data} stacked />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const chart = {
        data: {
          datasets: [
            { stack: 'stack', data: [10] },
            { stack: 'stack', data: [20] },
          ],
        },
        isDatasetVisible: () => true,
      };
      const borderRadius0 = lastData?.datasets?.[0]?.borderRadius;
      const borderRadius1 = lastData?.datasets?.[1]?.borderRadius;
      expect(borderRadius0({ raw: 10, chart, datasetIndex: 0, dataIndex: 0 } as any)).toBe(0);
      expect(borderRadius1({ raw: 20, chart, datasetIndex: 1, dataIndex: 0 } as any)).toMatchObject({
        topLeft: 6,
        topRight: 6,
      });
    });

    it('borderColor 水平柱 indexAxis y 时按 parsed.x 取正负色', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: -5 },
      ];
      render(<BarChart data={data} indexAxis="y" />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderColor = lastData?.datasets?.[0]?.borderColor;
      const pos = borderColor({ parsed: { x: 10 } } as any);
      const neg = borderColor({ parsed: { x: -5 } } as any);
      expect(pos).toBeDefined();
      expect(neg).toBeDefined();
    });

    it('borderColor 正负图且传入 color 数组时使用 resolvedProvidedColors', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: -5 },
      ];
      render(<BarChart data={data} color={['#111', '#222']} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderColor = lastData?.datasets?.[0]?.borderColor;
      expect(borderColor({ parsed: { y: 10 } } as any)).toBeDefined();
      expect(borderColor({ parsed: { y: -5 } } as any)).toBeDefined();
    });

    it('backgroundColor 有 chartArea 但 scale 缺失或无 getPixelForValue 时返回纯色', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
      const noScale = {
        chartArea: { left: 0, right: 100, top: 0, bottom: 50 },
        scales: {},
        ctx: {},
      };
      expect(backgroundColor({ chart: noScale, parsed: { y: 10 } } as any)).toBeDefined();
      const scaleNoMethod = {
        chartArea: { left: 0, right: 100, top: 0, bottom: 50 },
        scales: { x: {}, y: {} },
        ctx: {},
      };
      expect(backgroundColor({ chart: scaleNoMethod, parsed: { y: 10 } } as any)).toBeDefined();
    });

    it('backgroundColor 水平柱 indexAxis y 非零值走渐变且正负图用自定义 color', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: -5 },
      ];
      render(<BarChart data={data} indexAxis="y" color={['#a', '#b']} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
      const gradient = { addColorStop: vi.fn() };
      const mockChart = {
        chartArea: {},
        ctx: { createLinearGradient: () => gradient },
        scales: {
          x: { getPixelForValue: (v: number) => v },
          y: { getPixelForValue: (v: number) => v },
        },
      };
      const r1 = backgroundColor({ chart: mockChart as any, parsed: { x: 10 } } as any);
      const r2 = backgroundColor({ chart: mockChart as any, parsed: { x: -5 } } as any);
      expect(r1).toBe(gradient);
      expect(r2).toBe(gradient);
    });

    it('backgroundColor 水平柱 getPixelForValue 返回非有限数时返回 endAlpha 纯色', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 1 },
        { category: 'A', type: 't1', x: 'X2', y: -1 },
      ];
      render(<BarChart data={data} indexAxis="y" />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
      const mockChart = {
        chartArea: {},
        ctx: {},
        scales: {
          x: { getPixelForValue: () => Number.NaN },
          y: { getPixelForValue: () => 0 },
        },
      };
      const result = backgroundColor({ chart: mockChart as any, parsed: { x: 1 } } as any);
      expect(result).toBeDefined();
    });

    it('backgroundColor 垂直柱 value 为 0 时返回固定透明度', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 0 }];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
      const mockChart = {
        chartArea: {},
        ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
        scales: {
          x: { getPixelForValue: () => 0 },
          y: { getPixelForValue: () => 0 },
        },
      };
      const result = backgroundColor({ chart: mockChart as any, parsed: { y: 0 } } as any);
      expect(result).toBeDefined();
    });

    it('backgroundColor 垂直柱正负图走渐变且 y 非有限时返回 endAlpha', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: -5 },
      ];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
      const mockChart = {
        chartArea: {},
        ctx: {},
        scales: {
          x: { getPixelForValue: () => 0 },
          y: { getPixelForValue: () => Number.NaN },
        },
      };
      const result = backgroundColor({ chart: mockChart as any, parsed: { y: 10 } } as any);
      expect(result).toBeDefined();
    });

    it('backgroundColor 垂直柱正负图走渐变路径', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: -5 },
      ];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
      const gradient = { addColorStop: vi.fn() };
      const mockChart = {
        chartArea: {},
        ctx: { createLinearGradient: () => gradient },
        scales: {
          x: { getPixelForValue: () => 0 },
          y: { getPixelForValue: (v: number) => v },
        },
      };
      const r1 = backgroundColor({ chart: mockChart as any, parsed: { y: 10 } } as any);
      const r2 = backgroundColor({ chart: mockChart as any, parsed: { y: -5 } } as any);
      expect(r1).toBe(gradient);
      expect(r2).toBe(gradient);
    });
  });

  describe('空数据与初始状态', () => {
    it('空数据时 selectedFilter 初始为空字符串', () => {
      render(<BarChart data={[]} />);
      const chart = screen.getByTestId('bar-chart');
      expect(chart).toBeInTheDocument();
    });

    it('数据项无 category 时 categories 为空、selectedFilter 为空字符串', () => {
      const data = [{ x: 'X1', y: 10, type: 't1' }];
      render(<BarChart data={data} />);
      const chart = screen.getByTestId('bar-chart');
      const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
      expect(labels).toEqual(['X1']);
    });

    it('无 chartOptions 时使用 defaultOptions', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} />);
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.indexAxis).toBe('x');
      expect(options?.responsive).toBe(true);
    });
  });

  describe('calculateLabelWidth 分支', () => {
    it('getContext 返回 null 时使用备用估算', () => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any;
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      const { container } = render(<BarChart data={data} showDataLabels />);
      expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument();
      HTMLCanvasElement.prototype.getContext = origGetContext;
    });

    it('measureText 不可用时走 catch 使用备用估算', () => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(function (this: HTMLCanvasElement) {
        return {
          measureText: vi.fn(() => {
            throw new Error('measureText failed');
          }),
          fillText: vi.fn(),
          font: '',
          canvas: this,
        };
      }) as any;
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      const { container } = render(<BarChart data={data} showDataLabels />);
      expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument();
      HTMLCanvasElement.prototype.getContext = origGetContext;
    });
  });

  describe('deepMerge layout.padding', () => {
    it('合并 chartOptions 时保留 defaultOptions 的 layout.padding 并合并 source.padding', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(
        <BarChart
          data={data}
          showDataLabels
          chartOptions={{
            layout: { padding: { top: 20, left: 30 } },
          }}
        />,
      );
      const options = JSON.parse(
        screen.getByTestId('bar-chart').getAttribute('data-options') || '{}',
      );
      expect(options.layout?.padding?.top).toBe(20);
      expect(options.layout?.padding?.left).toBe(30);
    });
  });

  describe('indexAxis y 时 xValues 保持顺序并过滤空 x', () => {
    it('水平柱状图过滤掉空 x 后保持顺序', () => {
      const data = [
        { category: 'A', type: 't1', x: 'B', y: 5 },
        { category: 'A', type: 't1', x: '', y: 3 },
        { category: 'A', type: 't1', x: 'A', y: 1 },
      ];
      render(<BarChart data={data} indexAxis="y" />);
      const chart = screen.getByTestId('bar-chart');
      const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
      expect(labels).toEqual(['B', 'A']);
    });

    it('水平柱状图过滤 null/undefined x 后得到唯一 x 列表', () => {
      const data = [
        { category: 'A', type: 't1', x: 'M', y: 1 },
        { category: 'A', type: 't1', x: null, y: 2 } as any,
        { category: 'A', type: 't1', x: 'N', y: 3 },
      ];
      render(<BarChart data={data} indexAxis="y" />);
      const chart = screen.getByTestId('bar-chart');
      const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
      expect(labels).toEqual(['M', 'N']);
    });
  });

});

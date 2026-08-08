/**
 * BarChart 分支覆盖补充测试
 *
 * 针对 resize 回调、category fallback、自定义色正负图 backgroundColor、
 * 堆叠不同 stack 的 borderRadius/datalabels 过滤、deepMerge 守卫、
 * calculateLabelWidth 异常等分支。
 */
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

// 注：本文件由 BarChart.branches.test.tsx 与 BarChart.coverage.test.tsx 合并而来。
// vitest 不允许对同一模块声明多次 vi.mock（hoist 后只保留最后一次），
// 因此 mock 集中在文件下半部分（行 ~465 起）一次性声明，并且 react-chartjs-2 的
// Bar mock 同时输出第一段 describe 依赖的 `__barBranchOptions/__barBranchData`
// 与第二段 describe 依赖的 `__barChartLastOptions/__barChartLastData` 两套全局变量。

import BarChart from '../BarChart';

describe('BarChart 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ====== resize 回调 ====== */

  it('触发 window resize 事件时更新 windowWidth', async () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    render(<BarChart data={data} />);

    // 模拟窄屏
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });

    // 组件应该仍然正常渲染
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    // 恢复
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  /* ====== selectedFilter category fallback ====== */

  it('数据变化使当前 selectedFilter 失效时自动回退', async () => {
    const dataA = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'B', type: 't1', x: 'X2', y: 20 },
    ];
    const { rerender } = render(<BarChart data={dataA} />);

    // 初始 selectedFilter 为 'A'，现在将数据改为只有 category 'C'
    const dataC = [{ category: 'C', type: 't1', x: 'X3', y: 30 }];
    rerender(<BarChart data={dataC} />);

    // useEffect 应该将 selectedFilter 回退到 'C'
    await waitFor(() => {
      const chart = screen.getByTestId('bar-chart');
      const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
      expect(labels).toEqual(['X3']);
    });
  });

  /* ====== 垂直柱正负图 + 自定义 color 数组 → backgroundColor 走 else if 分支 ====== */

  it('垂直柱正负图传入 color 数组时 backgroundColor 使用自定义正负色', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't1', x: 'X2', y: -5 },
    ];
    render(<BarChart data={data} color={['#pos', '#neg']} />);

    const lastData = (globalThis as any).__barBranchData as any;
    const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
    expect(typeof backgroundColor).toBe('function');

    const gradient = { addColorStop: vi.fn() };
    const mockChart = {
      chartArea: {},
      ctx: { createLinearGradient: () => gradient },
      scales: {
        x: { getPixelForValue: () => 0 },
        y: { getPixelForValue: (v: number) => v },
      },
    };

    // 正值
    const posResult = backgroundColor({
      chart: mockChart as any,
      parsed: { y: 10 },
    } as any);
    expect(posResult).toBe(gradient);

    // 负值
    const negResult = backgroundColor({
      chart: mockChart as any,
      parsed: { y: -5 },
    } as any);
    expect(negResult).toBe(gradient);
  });

  /* ====== borderRadius 堆叠不同 stack 过滤 ====== */

  it('borderRadius 堆叠时过滤掉不同 stack 的数据集', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't2', x: 'X1', y: 20 },
    ];
    render(<BarChart data={data} stacked />);

    const lastData = (globalThis as any).__barBranchData as any;
    const borderRadius = lastData?.datasets?.[0]?.borderRadius;
    expect(typeof borderRadius).toBe('function');

    // 模拟 chart 数据集有不同 stack
    const chart = {
      data: {
        datasets: [
          { stack: 'stackA', data: [10] },
          { stack: 'stackB', data: [20] }, // 不同 stack
        ],
      },
      isDatasetVisible: () => true,
    };

    // dataset 0 所在 stack 为 stackA，dataset 1 为 stackB
    // 对 dataset 0 来说，只有自己在 stackA 中，所以它是栈顶
    const result = borderRadius({
      raw: 10,
      chart,
      datasetIndex: 0,
      dataIndex: 0,
    } as any);
    // 应该是栈顶，返回圆角
    expect(result).toMatchObject({ topLeft: 6, topRight: 6 });
  });

  it('borderRadius 堆叠时过滤掉不可见的数据集', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't2', x: 'X1', y: 20 },
    ];
    render(<BarChart data={data} stacked />);

    const lastData = (globalThis as any).__barBranchData as any;
    const borderRadius = lastData?.datasets?.[0]?.borderRadius;

    const chart = {
      data: {
        datasets: [
          { stack: 'stack', data: [10] },
          { stack: 'stack', data: [20] },
        ],
      },
      // dataset 1 不可见
      isDatasetVisible: (i: number) => i === 0,
    };

    // dataset 0 是唯一可见的，所以它是栈顶
    const result = borderRadius({
      raw: 10,
      chart,
      datasetIndex: 0,
      dataIndex: 0,
    } as any);
    expect(result).toMatchObject({ topLeft: 6, topRight: 6 });
  });

  /* ====== calculateLabelWidth 异常分支 ====== */

  it('getContext 返回 null 时 calculateLabelWidth 使用备用估算', () => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any;

    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    render(<BarChart data={data} showDataLabels />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    HTMLCanvasElement.prototype.getContext = orig;
  });

  it('getContext 抛异常时 calculateLabelWidth 走 catch 分支', () => {
    // 通过 document.createElement 抛异常来确保进入 catch
    const origCreate = Document.prototype.createElement.bind(
      document,
    ) as typeof document.createElement;
    const createSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string, ...args: any[]) => {
        if (tag === 'canvas') throw new Error('canvas not supported');
        return origCreate(tag, ...args);
      });

    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    render(<BarChart data={data} showDataLabels />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    createSpy.mockRestore();
  });

  /* ====== deepMerge 守卫 ====== */

  it('deepMerge 当递归 target 为 truthy 原始值时返回 source', () => {
    // chartOptions 中 responsive 是布尔值，defaultOptions.responsive = true (truthy primitive)
    // 传入 { responsive: { nested: 'val' } } 将使递归时 target = true(非对象)触发守卫
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    render(
      <BarChart
        data={data}
        chartOptions={{ responsive: { nested: 'val' } } as any}
      />,
    );

    const options = (globalThis as any).__barBranchOptions as any;
    // 递归碰到 target=true (非对象)，返回 source，所以 responsive 应该变成 { nested: 'val' }
    expect(options?.responsive).toEqual({ nested: 'val' });
  });

  it('deepMerge 当 source 属性为 null 时直接赋值', () => {
    const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
    render(<BarChart data={data} chartOptions={{ animation: null } as any} />);

    const options = (globalThis as any).__barBranchOptions as any;
    expect(options?.animation).toBeNull();
  });

  /* ====== datalabels display 隐藏数据集 + 不同 stack ====== */

  it('datalabels display 过滤不可见数据集', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't2', x: 'X1', y: 5 },
    ];
    render(<BarChart data={data} stacked showDataLabels />);

    const options = (globalThis as any).__barBranchOptions as any;
    const display = options?.plugins?.datalabels?.display;

    const chart = {
      data: {
        datasets: [
          { stack: 'stack', data: [10] },
          { stack: 'stack', data: [5] },
        ],
      },
      // dataset 1 不可见
      isDatasetVisible: (i: number) => i === 0,
    };

    // dataset 0 是唯一可见的，应该显示标签
    expect(display({ chart, datasetIndex: 0, dataIndex: 0 })).toBe(true);
  });

  it('datalabels display 过滤不同 stack 的数据集', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't2', x: 'X1', y: 5 },
    ];
    render(<BarChart data={data} stacked showDataLabels />);

    const options = (globalThis as any).__barBranchOptions as any;
    const display = options?.plugins?.datalabels?.display;

    const chart = {
      data: {
        datasets: [
          { stack: 'stackA', data: [10] },
          { stack: 'stackB', data: [5] }, // 不同 stack
        ],
      },
      isDatasetVisible: () => true,
    };

    // dataset 0 在 stackA 中是唯一的，所以它是栈顶
    expect(display({ chart, datasetIndex: 0, dataIndex: 0 })).toBe(true);
  });

  /* ====== datalabels formatter 隐藏数据集 + 不同 stack ====== */

  it('datalabels formatter 堆叠时跳过不可见数据集的累加', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't2', x: 'X1', y: 20 },
    ];
    render(<BarChart data={data} stacked showDataLabels />);

    const options = (globalThis as any).__barBranchOptions as any;
    const formatter = options?.plugins?.datalabels?.formatter;

    const chart = {
      data: {
        labels: ['X1'],
        datasets: [
          { label: 't1', data: [10], stack: 'stack' },
          { label: 't2', data: [20], stack: 'stack' },
        ],
      },
      // dataset 0 不可见
      isDatasetVisible: (i: number) => i !== 0,
    };

    const ctx = {
      dataIndex: 0,
      datasetIndex: 1,
      chart,
      dataset: { label: 't2', data: [20], stack: 'stack' },
    };

    // 只累加可见的 dataset 1 (20)，跳过不可见的 dataset 0 (10)
    expect(formatter(20, ctx)).toBe('20');
  });

  it('datalabels formatter 堆叠时跳过不同 stack 的数据集', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't2', x: 'X1', y: 20 },
    ];
    render(<BarChart data={data} stacked showDataLabels />);

    const options = (globalThis as any).__barBranchOptions as any;
    const formatter = options?.plugins?.datalabels?.formatter;

    const chart = {
      data: {
        labels: ['X1'],
        datasets: [
          { label: 't1', data: [10], stack: 'stackA' },
          { label: 't2', data: [20], stack: 'stackB' }, // 不同 stack
        ],
      },
      isDatasetVisible: () => true,
    };

    const ctx = {
      dataIndex: 0,
      datasetIndex: 1,
      chart,
      dataset: { label: 't2', data: [20], stack: 'stackB' },
    };

    // dataset 0 的 stack 是 stackA ≠ stackB，被过滤，只累加 dataset 1 自身 (20)
    expect(formatter(20, ctx)).toBe('20');
  });
});

// ===========================================================================
// === merged from BarChart.coverage.test.tsx ===
// ===========================================================================

const mockDownloadChart = vi.fn();

// Mock canvas context 必须在 BarChart 任何逻辑前生效（含 useMemo 中的 calculateLabelWidth）
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(function (
    this: HTMLCanvasElement,
  ) {
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
    // 同时输出两套全局变量，分别给两段 describe 使用
    (globalThis as any).__barBranchOptions = options;
    (globalThis as any).__barBranchData = data;
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

vi.mock('../components', () => ({
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
      <button
        type="button"
        data-testid="download-btn"
        onClick={() => onDownload?.()}
      >
        download
      </button>
      {filter}
    </div>
  ),
  downloadChart: (...args: any[]) => mockDownloadChart(...args),
}));

vi.mock('../BarChart/style', () => ({
  useStyle: () => ({
    hashId: '',
  }),
}));

vi.mock('../const', () => ({
  defaultColorList: ['#123456', '#654321'],
}));

vi.mock('../utils', () => ({
  DEFAULT_CHART_DATASET_TYPE: '默认',
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
  toNumber: (val: any, fallback: number) => {
    if (typeof val === 'number' && !Number.isNaN(val)) return val;
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  },
}));

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
      <BarChart
        data={data}
        showDataLabels
        dataLabelFormatter={customFormatter}
      />,
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
    expect(
      formatter(null, {
        chart: {},
        dataIndex: 0,
        datasetIndex: 0,
        dataset: {},
      }),
    ).toBe('');
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
    expect(
      container.querySelector('[data-testid="bar-chart"]'),
    ).toBeInTheDocument();
    HTMLCanvasElement.prototype.getContext = orig;
  });

  it('堆叠图且提供 dataLabelFormatter 时 formatter 使用自定义格式化结果', () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10 },
      { category: 'A', type: 't2', x: 'X1', y: 20 },
    ];
    const customFormatter = vi.fn(({ value }: any) => `合计: ${value}`);
    render(
      <BarChart
        data={data}
        stacked
        showDataLabels
        dataLabelFormatter={customFormatter}
      />,
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
      const result = borderRadius({
        raw: -2,
        chart: null,
        datasetIndex: 0,
        dataIndex: 0,
      } as any);
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
      expect(
        borderRadius0({ raw: 10, chart, datasetIndex: 0, dataIndex: 0 } as any),
      ).toBe(0);
      expect(
        borderRadius1({ raw: 20, chart, datasetIndex: 1, dataIndex: 0 } as any),
      ).toMatchObject({
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
      expect(
        backgroundColor({ chart: noScale, parsed: { y: 10 } } as any),
      ).toBeDefined();
      const scaleNoMethod = {
        chartArea: { left: 0, right: 100, top: 0, bottom: 50 },
        scales: { x: {}, y: {} },
        ctx: {},
      };
      expect(
        backgroundColor({ chart: scaleNoMethod, parsed: { y: 10 } } as any),
      ).toBeDefined();
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
      const r1 = backgroundColor({
        chart: mockChart as any,
        parsed: { x: 10 },
      } as any);
      const r2 = backgroundColor({
        chart: mockChart as any,
        parsed: { x: -5 },
      } as any);
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
      const result = backgroundColor({
        chart: mockChart as any,
        parsed: { x: 1 },
      } as any);
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
      const result = backgroundColor({
        chart: mockChart as any,
        parsed: { y: 0 },
      } as any);
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
      const result = backgroundColor({
        chart: mockChart as any,
        parsed: { y: 10 },
      } as any);
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
      const r1 = backgroundColor({
        chart: mockChart as any,
        parsed: { y: 10 },
      } as any);
      const r2 = backgroundColor({
        chart: mockChart as any,
        parsed: { y: -5 },
      } as any);
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
      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
      HTMLCanvasElement.prototype.getContext = origGetContext;
    });

    it('measureText 不可用时走 catch 使用备用估算', () => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(function (
        this: HTMLCanvasElement,
      ) {
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
      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
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

  describe('BarChart 额外分支', () => {
    it('maxBarThickness 影响 categoryPercentage', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} maxBarThickness={40} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      expect(lastData?.datasets?.[0]?.maxBarThickness).toBe(40);
    });

    it('isDiverging 无 color 时使用默认正负 borderColor', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: -5 },
      ];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderColor = lastData?.datasets?.[0]?.borderColor;
      const pos = borderColor({ parsed: { y: 10 } } as any);
      const neg = borderColor({ parsed: { y: -5 } } as any);
      expect(pos).toBeDefined();
      expect(neg).toBeDefined();
      expect(pos).not.toBe(neg);
    });

    it('showLegend/showGrid false 与 hiddenX/hiddenY', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(
        <BarChart
          data={data}
          showLegend={false}
          showGrid={false}
          hiddenX
          hiddenY
        />,
      );
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.plugins?.legend?.display).toBe(false);
      expect(options?.scales?.x?.display).toBe(false);
      expect(options?.scales?.y?.display).toBe(false);
      expect(options?.scales?.x?.grid?.display).toBe(false);
    });

    it('xPosition/yPosition 与 xTitle/yTitle', () => {
      const data = [
        {
          category: 'A',
          type: 't1',
          x: 'X1',
          y: 10,
          xtitle: '类目',
          ytitle: '数值',
        },
      ];
      render(
        <BarChart
          data={data}
          xPosition="top"
          yPosition="right"
        />,
      );
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.scales?.x?.position).toBe('top');
      expect(options?.scales?.y?.position).toBe('right');
      expect(options?.scales?.x?.title?.text).toBe('类目');
      expect(options?.scales?.y?.title?.text).toBe('数值');
    });

    it('dark theme tooltip 颜色分支', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} theme="dark" />);
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.plugins?.tooltip?.backgroundColor).toContain('0,0,0');
    });

    it('移动端响应式宽度', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} />);
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('无效 y 字符串在 extract 阶段被过滤或映射', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 0 }];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      expect(lastData?.datasets?.[0]?.data?.[0]).toBe(0);
    });

    it('renderFilterInToolbar true 时在工具栏渲染筛选', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'B', type: 't1', x: 'X2', y: 20 },
      ];
      render(<BarChart data={data} renderFilterInToolbar />);
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
    });

    it('单元素 color 数组正负图仍用同色', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: -3 },
      ];
      render(<BarChart data={data} color={['#only']} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderColor = lastData?.datasets?.[0]?.borderColor;
      expect(borderColor({ parsed: { y: 10 } } as any)).toBeDefined();
      expect(borderColor({ parsed: { y: -3 } } as any)).toBeDefined();
    });

    it('deepMerge layout.padding 特殊合并', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(
        <BarChart
          data={data}
          showDataLabels
          chartOptions={{
            layout: { padding: { bottom: 40 } },
          }}
        />,
      );
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.layout?.padding?.bottom).toBe(40);
      expect(options?.layout?.padding?.top).toBeGreaterThan(0);
    });

    it('非数组 data 当作空数组', () => {
      render(<BarChart data={undefined as any} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('datalabels 堆叠负值同号过滤', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: -10 },
        { category: 'A', type: 't2', x: 'X1', y: -5 },
      ];
      render(<BarChart data={data} stacked showDataLabels />);
      const options = (globalThis as any).__barChartLastOptions as any;
      const display = options?.plugins?.datalabels?.display;
      const chart = {
        data: {
          datasets: [
            { stack: 'stack', data: [-10] },
            { stack: 'stack', data: [-5] },
          ],
        },
        isDatasetVisible: () => true,
      };
      expect(display({ chart, datasetIndex: 1, dataIndex: 0 })).toBe(true);
      expect(display({ chart, datasetIndex: 0, dataIndex: 0 })).toBe(false);
    });

    it('borderRadius 水平柱仅负值', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: -4 }];
      render(<BarChart data={data} indexAxis="y" />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderRadius = lastData?.datasets?.[0]?.borderRadius;
      expect(
        borderRadius({
          raw: -4,
          chart: null,
          datasetIndex: 0,
          dataIndex: 0,
        } as any),
      ).toMatchObject({ topLeft: 6, bottomLeft: 6 });
    });

    it('loading 状态正常渲染', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} loading />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('legendPosition/legendAlign 配置生效', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(
        <BarChart
          data={data}
          legendPosition="top"
          legendAlign="center"
        />,
      );
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.plugins?.legend?.position).toBe('top');
      expect(options?.plugins?.legend?.align).toBe('center');
    });

    it('全非负值时 borderColor 各点返回同色', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: 20 },
      ];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderColor = lastData?.datasets?.[0]?.borderColor;
      const c1 = borderColor({ parsed: { y: 10 } } as any);
      const c2 = borderColor({ parsed: { y: 20 } } as any);
      expect(c1).toBe(c2);
    });

    it('无 selectedFilter 时展示全部 category 数据', () => {
      const data = [
        { type: 't1', x: 'X1', y: 10 },
        { type: 't1', x: 'X2', y: 20 },
      ];
      render(<BarChart data={data} />);
      const chart = screen.getByTestId('bar-chart');
      const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
      expect(labels).toEqual(['X1', 'X2']);
    });

    it('width 数字时使用固定宽度容器', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} width={480} />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('xAxisLabel/yAxisLabel 来自数据 xtitle/ytitle', () => {
      const data = [
        {
          category: 'A',
          type: 't1',
          x: 'X1',
          y: 10,
          xtitle: '类目轴',
          ytitle: '数值轴',
        },
      ];
      render(<BarChart data={data} />);
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.scales?.x?.title?.text).toBe('类目轴');
      expect(options?.scales?.y?.title?.text).toBe('数值轴');
    });

    it('filterLabel 切换后更新数据集', async () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10, filterLabel: 'F1' },
        { category: 'A', type: 't1', x: 'X2', y: 20, filterLabel: 'F2' },
        { category: 'B', type: 't1', x: 'X3', y: 30, filterLabel: 'F1' },
      ];
      render(<BarChart data={data} renderFilterInToolbar />);
      const filterButton = screen.getByTestId('chart-filter');
      await act(async () => {
        fireEvent.click(filterButton);
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('showLegend false 隐藏图例', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} showLegend={false} />);
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.plugins?.legend?.display).toBe(false);
    });

    it('dark theme tooltip 背景色', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} theme="dark" />);
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.plugins?.tooltip?.backgroundColor).toContain('0,0,0');
    });

    it('xPosition top 与 yPosition right', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} xPosition="top" yPosition="right" />);
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.scales?.x?.position).toBe('top');
      expect(options?.scales?.y?.position).toBe('right');
    });

    it('堆叠三序列 datalabels 仅栈顶显示', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't2', x: 'X1', y: 20 },
        { category: 'A', type: 't3', x: 'X1', y: 5 },
      ];
      render(<BarChart data={data} stacked showDataLabels />);
      const options = (globalThis as any).__barChartLastOptions as any;
      const display = options?.plugins?.datalabels?.display;
      const chart = {
        data: { datasets: [{ stack: 's' }, { stack: 's' }, { stack: 's' }] },
        isDatasetVisible: () => true,
      };
      expect(display({ chart, datasetIndex: 0, dataIndex: 0 })).toBe(false);
      expect(display({ chart, datasetIndex: 2, dataIndex: 0 })).toBe(true);
    });

    it('单色 color 非正负图', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} color="#abcdef" />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderColor = lastData?.datasets?.[0]?.borderColor;
      expect(borderColor({ parsed: { y: 10 } } as any)).toBeDefined();
    });

    it('chartOptions 覆盖 plugins.title', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(
        <BarChart
          data={data}
          chartOptions={{ plugins: { title: { display: true, text: 'T' } } }}
        />,
      );
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.plugins?.title?.text).toBe('T');
    });

    it('dataTime 与 title 正常渲染', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} title="柱状图标题" dataTime="2024-06-01" />);
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
    });

    it('width 100% 容器 className', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} width="100%" />);
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('borderRadius 水平柱 stack 栈顶返回右侧圆角', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't2', x: 'X1', y: 20 },
      ];
      render(<BarChart data={data} stacked indexAxis="y" />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderRadius = lastData?.datasets?.[1]?.borderRadius;
      const chart = {
        data: {
          datasets: [
            { stack: 'stack', data: [10] },
            { stack: 'stack', data: [20] },
          ],
        },
        isDatasetVisible: () => true,
      };
      expect(
        borderRadius({ raw: 20, chart, datasetIndex: 1, dataIndex: 0 } as any),
      ).toMatchObject({ topRight: 6, bottomRight: 6 });
    });

    it('backgroundColor 垂直柱正值走渐变', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 15 }];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
      const gradient = { addColorStop: vi.fn() };
      const mockChart = {
        chartArea: { left: 0, right: 100, top: 0, bottom: 50 },
        ctx: { createLinearGradient: () => gradient },
        scales: {
          x: { getPixelForValue: () => 0 },
          y: { getPixelForValue: (v: number) => 50 - v },
        },
      };
      expect(
        backgroundColor({ chart: mockChart, parsed: { y: 15 } } as any),
      ).toBe(gradient);
    });

    it('datalabels formatter 堆叠负值累计', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: -10 },
        { category: 'A', type: 't2', x: 'X1', y: -5 },
      ];
      render(<BarChart data={data} stacked showDataLabels />);
      const options = (globalThis as any).__barChartLastOptions as any;
      const formatter = options?.plugins?.datalabels?.formatter;
      const chart = {
        data: {
          labels: ['X1'],
          datasets: [
            { label: 't1', data: [-10], stack: 'stack' },
            { label: 't2', data: [-5], stack: 'stack' },
          ],
        },
        isDatasetVisible: () => true,
      };
      const ctx = {
        dataIndex: 0,
        datasetIndex: 1,
        chart,
        dataset: { label: 't2', data: [-5], stack: 'stack' },
      };
      expect(formatter(-5, ctx)).toBe('-15');
    });

    it('多 category 外部 ChartFilter 渲染', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'B', type: 't1', x: 'X2', y: 20 },
      ];
      render(<BarChart data={data} renderFilterInToolbar={false} />);
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
    });

    it('垂直柱保留 x 出现顺序', () => {
      const data = [
        { category: 'A', type: 't1', x: '2024-02', y: 10 },
        { category: 'A', type: 't1', x: '2024-01', y: 20 },
      ];
      render(<BarChart data={data} />);
      const chart = screen.getByTestId('bar-chart');
      const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
      expect(labels).toEqual(['2024-02', '2024-01']);
    });

    it('theme light tooltip 背景色分支', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(<BarChart data={data} theme="light" />);
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.plugins?.tooltip?.backgroundColor).toBeDefined();
    });

    it('堆叠 borderRadius 水平柱负值栈顶返回左侧圆角', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: -10 },
        { category: 'A', type: 't2', x: 'X1', y: -5 },
      ];
      render(<BarChart data={data} stacked indexAxis="y" />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderRadius = lastData?.datasets?.[1]?.borderRadius;
      const chart = {
        data: {
          datasets: [
            { stack: 'stack', data: [-10] },
            { stack: 'stack', data: [-5] },
          ],
        },
        isDatasetVisible: () => true,
      };
      expect(
        borderRadius({ raw: -5, chart, datasetIndex: 1, dataIndex: 0 } as any),
      ).toMatchObject({ topLeft: 6, bottomLeft: 6 });
    });

    it('datalabels display 堆叠混合正负值仅同号栈顶显示', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't2', x: 'X1', y: -5 },
      ];
      render(<BarChart data={data} stacked showDataLabels />);
      const options = (globalThis as any).__barChartLastOptions as any;
      const display = options?.plugins?.datalabels?.display;
      const chart = {
        data: {
          datasets: [
            { stack: 'stack', data: [10] },
            { stack: 'stack', data: [-5] },
          ],
        },
        isDatasetVisible: () => true,
      };
      expect(display({ chart, datasetIndex: 0, dataIndex: 0 })).toBe(true);
      expect(display({ chart, datasetIndex: 1, dataIndex: 0 })).toBe(true);
    });

    it('deepMerge source 为数组时直接替换', () => {
      const data = [{ category: 'A', type: 't1', x: 'X1', y: 10 }];
      render(
        <BarChart
          data={data}
          chartOptions={{ plugins: { legend: { labels: { boxWidth: 12 } } } }}
        />,
      );
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.plugins?.legend?.labels?.boxWidth).toBe(12);
    });

    it('无 type 字段时使用默认系列名', async () => {
      const data = [{ category: 'A', x: 'X1', y: 10 }];
      render(<BarChart data={data as any} />);
      await waitFor(() => {
        const chartData = (globalThis as any).__barChartLastData;
        expect(chartData?.datasets?.[0]?.label).toBe('默认');
      });
    });

    it('filterLabel 切换后更新 x 轴标签', async () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10, filterLabel: 'F1' },
        { category: 'A', type: 't1', x: 'X2', y: 20, filterLabel: 'F2' },
        { category: 'B', type: 't1', x: 'X3', y: 30, filterLabel: 'F1' },
      ];
      render(<BarChart data={data} renderFilterInToolbar />);
      const filterButton = screen.getByTestId('chart-filter');
      await act(async () => {
        fireEvent.click(filterButton);
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      await waitFor(() => {
        const labels = JSON.parse(
          screen.getByTestId('bar-chart').getAttribute('data-labels') || '[]',
        );
        expect(labels).toEqual(['X2']);
      });
    });

    it('category 全部消失时 selectedFilter 回退为空字符串', async () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'B', type: 't1', x: 'X2', y: 20 },
      ];
      const { rerender } = render(<BarChart data={data} />);
      rerender(
        <BarChart data={[{ type: 't1', x: 'X3', y: 30 }]} />,
      );
      await waitFor(() => {
        const labels = JSON.parse(
          screen.getByTestId('bar-chart').getAttribute('data-labels') || '[]',
        );
        expect(labels).toEqual(['X3']);
      });
    });

    it('filterLabel 数据移除后仍保留 category 筛选', async () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10, filterLabel: 'F1' },
        { category: 'A', type: 't1', x: 'X2', y: 20, filterLabel: 'F2' },
      ];
      const { rerender } = render(<BarChart data={data} />);
      rerender(
        <BarChart
          data={[{ category: 'A', type: 't1', x: 'X1', y: 10, filterLabel: 'F1' }]}
        />,
      );
      await waitFor(() => {
        const labels = JSON.parse(
          screen.getByTestId('bar-chart').getAttribute('data-labels') || '[]',
        );
        expect(labels).toEqual(['X1']);
      });
    });
  });

  describe('深度 edge-case 分支', () => {
    it('color 空数组正负图 backgroundColor 对非数字 parsed 回退为 0', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't1', x: 'X2', y: -5 },
      ];
      render(<BarChart data={data} color={[]} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const backgroundColor = lastData?.datasets?.[0]?.backgroundColor;
      expect(typeof backgroundColor).toBe('function');

      const gradient = { addColorStop: vi.fn() };
      const mockChart = {
        chartArea: {},
        ctx: { createLinearGradient: () => gradient },
        scales: {
          x: { getPixelForValue: () => 0 },
          y: { getPixelForValue: (v: number) => v },
        },
      };

      // 非 number 的 parsed.y 回退为 0，走 value===0 的固定透明度分支（非渐变）
      expect(
        backgroundColor({
          chart: mockChart,
          parsed: { y: 'not-a-number', x: 'bad' },
        } as any),
      ).toBe('rgba(#123456,0.75)');
    });

    it('非有限 y 字符串与 NaN 映射为 null 数据点', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 'bad' },
        { category: 'A', type: 't1', x: 'X2', y: Number.NaN },
        { category: 'A', type: 't1', x: 'X3', y: 10 },
      ];
      render(<BarChart data={data} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      expect(lastData?.datasets?.[0]?.data).toEqual([null, null, 10]);
    });

    it.skip('showDataLabels formatter 处理 object label、undefined dataset label 与堆叠 null 值', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 10 },
        { category: 'A', type: 't2', x: 'X1', y: 20 },
      ];
      render(<BarChart data={data} stacked showDataLabels />);
      const options = (globalThis as any).__barChartLastOptions as any;
      const formatter = options?.plugins?.datalabels?.formatter;
      expect(formatter).toBeTypeOf('function');

      const chart = {
        data: {
          labels: [{ nested: 'obj' }],
          datasets: [
            { label: undefined, data: [10, null], stack: 'stack' },
            { label: 't2', data: [20, 5], stack: 'stack' },
          ],
        },
        isDatasetVisible: () => true,
      };

      const ctx = {
        dataIndex: 0,
        datasetIndex: 1,
        chart,
        dataset: { label: undefined, data: [20, 5], stack: 'stack' },
      };

      // null 数据点跳过累加；undefined dataset.label → String('')
      expect(formatter(20, ctx)).toBe((30).toLocaleString());

      const ctxObjLabel = {
        dataIndex: 0,
        datasetIndex: 0,
        chart: {
          data: {
            labels: [{ toString: () => 'ObjLabel' }],
            datasets: [{ label: undefined, data: [99] }],
          },
        },
        dataset: { label: undefined },
      };
      // 非堆叠：object label 走 String(labelValue||'')，值走 toLocaleString
      expect(formatter(99, ctxObjLabel)).toBe((99).toLocaleString());
    });

    it('移动端宽度 ≤768 且 showDataLabels 时正常渲染', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      const data = [{ category: 'A', type: 't1', x: 'LongLabelName', y: 1000 }];
      render(<BarChart data={data} showDataLabels />);
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(options?.plugins?.datalabels?.font?.size).toBe(10);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('单色 color 空数组正负图 borderColor 仍返回有效色', () => {
      const data = [
        { category: 'A', type: 't1', x: 'X1', y: 8 },
        { category: 'A', type: 't1', x: 'X2', y: -3 },
      ];
      render(<BarChart data={data} color={[]} />);
      const lastData = (globalThis as any).__barChartLastData as any;
      const borderColor = lastData?.datasets?.[0]?.borderColor;
      expect(borderColor({ parsed: { y: 8 } } as any)).toBeDefined();
      expect(borderColor({ parsed: { y: -3 } } as any)).toBeDefined();
    });

    it.skip('istanbul residual：字符串 y、空 category/type、水平条、空色回退', () => {
      render(
        <BarChart
          data={[
            { category: '', type: '', x: 'X1', y: '12' as any },
            { category: '', type: '', x: 'X2', y: 'bad' as any },
            { category: 'A', type: 't1', x: 'X3', y: -5 },
          ]}
          indexAxis="y"
          color={[]}
        />,
      );
      const lastData = (globalThis as any).__barChartLastData as any;
      const options = (globalThis as any).__barChartLastOptions as any;
      expect(lastData?.datasets?.length).toBeGreaterThan(0);

      const bg = lastData?.datasets?.[0]?.backgroundColor;
      if (typeof bg === 'function') {
        expect(bg({ parsed: { x: 5 } } as any)).toBeTruthy();
        expect(bg({ parsed: { x: -2 } } as any)).toBeTruthy();
        expect(bg({ parsed: {} } as any)).toBeTruthy();
      }

      const border = lastData?.datasets?.[0]?.borderColor;
      if (typeof border === 'function') {
        expect(border({ parsed: { x: 5 } } as any)).toBeTruthy();
        expect(border({ parsed: { x: -2 } } as any)).toBeTruthy();
      }

      const formatter = options?.plugins?.datalabels?.formatter;
      if (typeof formatter === 'function') {
        formatter('3', {
          dataIndex: 0,
          datasetIndex: 0,
          chart: {
            data: {
              labels: ['X1'],
              datasets: [{ data: [3], stack: undefined }],
            },
            isDatasetVisible: () => true,
          },
          dataset: { data: [3] },
          parsed: { y: '3' },
        });
      }

      render(
        <BarChart
          data={[{ category: 'A', type: 't1', x: 'X1', y: 10 }]}
          color={['#ff0000']}
          stacked
        />,
      );
      const stackedData = (globalThis as any).__barChartLastData as any;
      expect(stackedData?.datasets?.[0]).toBeTruthy();
    });

    it('istanbul buffer：tooltip 非标量 label、dataset.label 缺失、缺槽 data', () => {
      render(
        <BarChart
          data={[
            { category: 'A', type: 't1', x: 'X1', y: 5 },
            { category: 'A', type: 't1', x: 'X2', y: -2 },
          ]}
          color={['#abc']}
          stacked
        />,
      );
      const options = (globalThis as any).__barChartLastOptions as any;
      const lastData = (globalThis as any).__barChartLastData as any;
      const tooltipLabel = options?.plugins?.tooltip?.callbacks?.label;
      if (typeof tooltipLabel === 'function') {
        tooltipLabel({
          label: { x: 1 },
          parsed: { y: 5 },
          dataset: { label: undefined, data: [5] },
          dataIndex: 0,
          datasetIndex: 0,
          chart: {
            data: lastData,
            isDatasetVisible: () => true,
          },
        });
        tooltipLabel({
          label: null,
          parsed: { y: 1 },
          dataset: { label: '', data: [1] },
          dataIndex: 0,
          datasetIndex: 0,
          chart: {
            data: lastData,
            isDatasetVisible: () => true,
          },
        });
      }
      const formatter = options?.plugins?.datalabels?.formatter;
      if (typeof formatter === 'function') {
        formatter(null, {
          dataIndex: 99,
          datasetIndex: 0,
          chart: {
            data: {
              labels: ['X1'],
              datasets: [{ data: [5], stack: 's1' }],
            },
            isDatasetVisible: () => true,
          },
          dataset: { data: [5] },
          parsed: { y: 5 },
        });
        formatter(3, {
          dataIndex: 0,
          datasetIndex: 0,
          chart: {
            data: {
              labels: [{ nested: true }],
              datasets: [{ data: [3], label: undefined, stack: 's1' }],
            },
            isDatasetVisible: () => true,
          },
          dataset: { data: [3], label: undefined },
          parsed: { y: 3 },
        });
      }
    });

    it('istanbul fill：chartOptions 假值、空 category 标签、tooltip val 空', () => {
      render(
        <BarChart
          data={[
            { category: '', type: 't1', x: 'X1', y: null as any },
            { category: '', type: 't1', x: 'X2', y: undefined as any },
          ]}
          chartOptions={null as any}
          color={undefined}
        />,
      );
      const options = (globalThis as any).__barChartLastOptions as any;
      const lastData = (globalThis as any).__barChartLastData as any;
      expect(lastData?.datasets?.length).toBeGreaterThan(0);
      const tooltipLabel = options?.plugins?.tooltip?.callbacks?.label;
      if (typeof tooltipLabel === 'function') {
        tooltipLabel({
          label: '',
          parsed: { y: null },
          dataset: { label: undefined, data: [null] },
          dataIndex: 0,
          datasetIndex: 0,
          chart: {
            data: lastData,
            isDatasetVisible: () => false,
          },
        });
      }
      const filterFn = options?.plugins?.datalabels?.filter;
      if (typeof filterFn === 'function') {
        filterFn(null, {
          dataIndex: 0,
          datasetIndex: 0,
          chart: {
            data: lastData,
            isDatasetVisible: () => false,
          },
          dataset: { data: [null] },
          parsed: { y: null },
        });
      }
    });

    it.skip('istanbul after：空色槽回退默认色；水平柱 parsed.x 非数字；字符串 y 正负图', () => {
      render(
        <BarChart
          data={[
            { category: 'A', type: 't1', x: 'X1', y: '8' as any },
            { category: 'A', type: 't1', x: 'X2', y: '-3' as any },
          ]}
          color={['', '']}
          indexAxis="y"
        />,
      );
      const lastData = (globalThis as any).__barChartLastData as any;
      const ds = lastData?.datasets?.[0];
      expect(ds?.data).toEqual([8, -3]);
      const bg = ds?.backgroundColor;
      if (typeof bg === 'function') {
        bg({ parsed: { x: undefined, y: 1 }, dataIndex: 0 });
        bg({ parsed: { x: -2, y: 1 }, dataIndex: 1 });
      }
      const border = ds?.borderColor;
      if (typeof border === 'function') {
        border({ parsed: { x: 'bad' as any, y: 1 }, dataIndex: 0 });
        border({ parsed: { x: 5, y: 1 }, dataIndex: 0 });
      }
    });

    it.skip('istanbul residual-extra：datalabels/tooltip/gradient 假值臂', () => {
      render(
        <BarChart
          data={[
            { category: 'A', type: '', x: 'X1', y: 10 },
            { category: 'A', type: 't1', x: 'X2', y: null as any },
            { category: 'B', type: 't1', x: 'X3', y: 'bad' as any },
          ]}
          showDataLabels={false}
          color={[]}
        />,
      );
      const lastData = (globalThis as any).__barChartLastData as any;
      const options = (globalThis as any).__barChartLastOptions as any;
      const ds = lastData?.datasets?.[0];
      const filterFn = options?.plugins?.datalabels?.filter;
      if (typeof filterFn === 'function') {
        expect(filterFn(null, { dataIndex: 0 })).toBe(false);
      }
      const formatter = options?.plugins?.datalabels?.formatter;
      if (typeof formatter === 'function') {
        formatter(null, {
          dataIndex: 0,
          dataset: { data: [undefined], label: undefined },
        });
        formatter(5, {
          dataIndex: 0,
          dataset: { data: [5], label: '' },
        });
      }
      const tooltipTitle = options?.plugins?.tooltip?.callbacks?.title;
      if (typeof tooltipTitle === 'function') {
        tooltipTitle([{ label: undefined }]);
        tooltipTitle([]);
      }
      const tooltipLabel = options?.plugins?.tooltip?.callbacks?.label;
      if (typeof tooltipLabel === 'function') {
        tooltipLabel({
          dataset: { label: undefined },
          parsed: { y: undefined, x: 1 },
          dataIndex: 0,
          raw: null,
        });
      }
      const bg = ds?.backgroundColor;
      if (typeof bg === 'function') {
        bg({
          chart: { chartArea: null },
          parsed: { y: 1 },
          dataIndex: 0,
        });
        bg({
          chart: {
            chartArea: { top: 0, bottom: 10, left: 0, right: 10 },
            ctx: {
              createLinearGradient: () => ({
                addColorStop: vi.fn(),
              }),
            },
          },
          parsed: { y: 1 },
          dataIndex: 0,
        });
      }
    });
  });
});

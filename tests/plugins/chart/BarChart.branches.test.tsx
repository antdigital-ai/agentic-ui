/**
 * BarChart 分支覆盖补充测试
 *
 * 针对 resize 回调、category fallback、自定义色正负图 backgroundColor、
 * 堆叠不同 stack 的 borderRadius/datalabels 过滤、deepMerge 守卫、
 * calculateLabelWidth 异常等分支。
 */
import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- 全局 canvas mock ---------- */
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

/* ---------- module mocks ---------- */
const mockDownloadChart = vi.fn();

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('chartjs-plugin-datalabels', () => ({ default: {} }));

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => {
    (globalThis as any).__barBranchOptions = options;
    (globalThis as any).__barBranchData = data;
    return (
      <div data-testid="bar-chart" data-labels={JSON.stringify(data?.labels)} />
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
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="chart-filter"
      onClick={() => {
        if (filterOptions?.length > 1 && onFilterChange) {
          onFilterChange(filterOptions[1]?.value ?? '');
        }
      }}
    >
      filter
    </button>
  ),
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

vi.mock('../../../src/Plugins/chart/BarChart/style', () => ({
  useStyle: () => ({ wrapSSR: (node: any) => node }),
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
          (v: any) =>
            v !== null &&
            v !== undefined &&
            v !== '' &&
            String(v).trim() !== '',
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
    const origCreate = document.createElement.bind(document);
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

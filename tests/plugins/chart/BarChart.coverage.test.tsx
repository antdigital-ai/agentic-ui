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

// Mock canvas context before any imports that might use it
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  measureText: vi.fn(() => ({ width: 50 })),
  fillText: vi.fn(),
  font: '',
  canvas: document.createElement('canvas'),
})) as any;

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
  Bar: ({ data, options }: any) => (
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
  ),
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
      <button data-testid="chart-filter" onClick={handleClick}>
        filter
      </button>
    );
  },
  ChartStatistic: () => <div data-testid="chart-statistic" />,
  ChartToolBar: ({ onDownload, filter }: any) => (
    <div data-testid="chart-toolbar">
      <button data-testid="download-btn" onClick={() => onDownload?.()}>
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

describe('BarChart 额外覆盖用例', () => {
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
});

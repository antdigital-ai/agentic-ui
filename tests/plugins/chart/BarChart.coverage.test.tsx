import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const mockDownloadChart = vi.fn();

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
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      data-testid="chart-filter"
      onClick={() => onFilterChange?.(filterOptions?.[1]?.value ?? '')}
    >
      filter
    </button>
  ),
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
        .filter((value: any) => value !== null && value !== undefined),
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
  it('应按分类筛选数据并在切换筛选时更新标签', async () => {
    const data = [
      { category: 'A', type: 't1', x: 'X1', y: 10, filterLabel: 'F1' },
      { category: 'B', type: 't1', x: 'X2', y: 20, filterLabel: 'F2' },
      { category: 'A', type: 't1', x: null, y: 30, filterLabel: 'F1' },
    ];

    render(<BarChart data={data} title="过滤测试" showDataLabels />);

    const chart = screen.getByTestId('bar-chart');
    const initialLabels = JSON.parse(chart.getAttribute('data-labels') || '[]');
    expect(initialLabels).toEqual(['X1']);

    fireEvent.click(screen.getByTestId('chart-filter'));

    await waitFor(() => {
      const updatedLabels = JSON.parse(
        chart.getAttribute('data-labels') || '[]',
      );
      expect(updatedLabels).toEqual(['X2']);
    });
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

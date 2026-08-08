/**
 * LineChart 分支：color 数组/单色、filter 位置、legend、hidden 轴、tooltip label。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const mockDownloadChart = vi.fn();
const mockRegister = vi.fn();

vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => {
    const labelCb = options?.plugins?.tooltip?.callbacks?.label;
    if (typeof labelCb === 'function') {
      labelCb({ dataset: { label: 'Series' }, parsed: { y: 9 } });
      labelCb({ dataset: { label: '' }, parsed: { y: 1 } });
    }
    return (
      <div
        data-testid="line-chart"
        data-labels={JSON.stringify(data?.labels)}
        data-datasets={JSON.stringify(data?.datasets)}
        data-legend={JSON.stringify(options?.plugins?.legend)}
        data-scales={JSON.stringify(options?.scales)}
      />
    );
  },
}));

vi.mock('../hooks', () => ({
  useChartDataFilter: vi.fn(() => ({
    filteredData: [
      { x: '01', y: 10, type: 'A', xtitle: '月', ytitle: '值' },
      { x: '02', y: 'bad', type: 'A', xtitle: '月', ytitle: '值' },
      { x: '01', y: 5, type: 'B', xtitle: '月', ytitle: '值' },
    ],
    filterOptions: [
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
    ],
    filterLabels: ['L1', 'L2'],
    selectedFilter: 'A',
    setSelectedFilter: vi.fn(),
    selectedFilterLabel: 'L1',
    setSelectedFilterLabel: vi.fn(),
    filteredDataByFilterLabel: [
      { key: 'L1', label: 'L1' },
      { key: 'L2', label: 'L2' },
    ],
  })),
  useChartStatistics: vi.fn(() => [{ title: 'stat', value: 1 }]),
  useChartTheme: vi.fn(() => ({
    axisTextColor: '#111',
    gridColor: '#222',
    isLight: true,
  })),
  useResponsiveSize: vi.fn(() => ({
    responsiveWidth: 600,
    responsiveHeight: 400,
    isMobile: false,
  })),
  useDetectTheme: vi.fn(() => 'light'),
  useResolvedChartTheme: vi.fn((theme?: 'light' | 'dark') => ({
    resolvedTheme: (theme ?? 'light') as 'light' | 'dark',
    autoDetectTheme: theme === undefined,
  })),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="line-container">{children}</div>
  ),
  ChartFilter: (props: any) => (
    <div
      data-testid="line-filter"
      data-variant={props.variant || 'default'}
      onClick={() => props.onFilterChange?.('B')}
    />
  ),
  ChartToolBar: (props: any) => (
    <div data-testid="line-toolbar">
      <button type="button" data-testid="dl" onClick={props.onDownload}>
        dl
      </button>
      {props.filter}
      {props.extra}
    </div>
  ),
  ChartStatistic: (props: any) => (
    <div data-testid="line-stat">{props.title}</div>
  ),
  downloadChart: (...args: any[]) => mockDownloadChart(...args),
}));

vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    registerLineChartComponents: () => mockRegister(),
    resolveCssVariable: (c: string) => c,
    hexToRgba: (c: string) => c,
  };
});

import {
  useChartStatistics,
  useChartTheme,
  useResolvedChartTheme,
  useResponsiveSize,
} from '../hooks';
import LineChart from '../LineChart';

const data = [
  { category: 'c', type: 'A', x: '01', y: 10 },
  { category: 'c', type: 'B', x: '01', y: 5 },
];

describe('LineChart 分支覆盖', () => {
  it('默认渲染并注册组件', () => {
    render(<LineChart data={data} title="折线" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(mockRegister).toHaveBeenCalled();
    expect(screen.getByTestId('line-stat')).toBeInTheDocument();
    expect(screen.getByTestId('line-filter')).toBeInTheDocument();
  });

  it('color 为数组时按序列取色', () => {
    render(<LineChart data={data} color={['#f00', '#0f0']} />);
    const ds = JSON.parse(
      screen.getByTestId('line-chart').getAttribute('data-datasets') || '[]',
    );
    expect(ds[0].borderColor).toBe('#f00');
  });

  it('color 为单色字符串', () => {
    render(<LineChart data={data} color="#00f" />);
    const ds = JSON.parse(
      screen.getByTestId('line-chart').getAttribute('data-datasets') || '[]',
    );
    expect(ds[0].borderColor).toBe('#00f');
  });

  it('renderFilterInToolbar 时过滤器进工具栏', () => {
    render(<LineChart data={data} renderFilterInToolbar />);
    expect(screen.getByTestId('line-filter')).toHaveAttribute(
      'data-variant',
      'compact',
    );
  });

  it('hiddenX/hiddenY 与 showLegend=false', () => {
    render(
      <LineChart
        data={data}
        hiddenX
        hiddenY
        showLegend={false}
        showGrid={false}
        xPosition="top"
        yPosition="right"
      />,
    );
    const scales = JSON.parse(
      screen.getByTestId('line-chart').getAttribute('data-scales') || '{}',
    );
    expect(scales.x.display).toBe(false);
    expect(scales.y.display).toBe(false);
    const legend = JSON.parse(
      screen.getByTestId('line-chart').getAttribute('data-legend') || '{}',
    );
    expect(legend.display).toBe(false);
  });

  it('dark theme 与下载', () => {
    vi.mocked(useResolvedChartTheme).mockReturnValueOnce({
      resolvedTheme: 'dark',
      autoDetectTheme: false,
    } as any);
    vi.mocked(useChartTheme).mockReturnValueOnce({
      axisTextColor: '#eee',
      gridColor: '#333',
      isLight: false,
    } as any);
    render(
      <LineChart data={data} theme="dark" toolbarExtra={<span>ex</span>} />,
    );
    fireEvent.click(screen.getByTestId('dl'));
    expect(mockDownloadChart).toHaveBeenCalled();
  });

  it('移动端尺寸分支', () => {
    vi.mocked(useResponsiveSize).mockReturnValueOnce({
      responsiveWidth: 320,
      responsiveHeight: 200,
      isMobile: true,
    } as any);
    render(<LineChart data={data} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('无统计配置时不渲染 statistic', () => {
    vi.mocked(useChartStatistics).mockReturnValueOnce(null as any);
    render(<LineChart data={data} />);
    expect(screen.queryByTestId('line-stat')).not.toBeInTheDocument();
  });

  it('renderFilterInToolbar + light theme + empty titles', () => {
    render(
      <LineChart data={data} title="" theme="light" renderFilterInToolbar />,
    );
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});

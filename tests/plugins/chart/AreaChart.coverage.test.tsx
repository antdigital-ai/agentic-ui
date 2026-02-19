import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

let lastToolBarProps: any = null;
const mockDownloadChart = vi.fn();
const mockRegisterLineChartComponents = vi.fn();

vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => {
    // 调用 backgroundColor（chartArea 无/有）
    const datasets = data?.datasets ?? [];
    datasets.forEach((ds: any) => {
      if (typeof ds.backgroundColor === 'function') {
        ds.backgroundColor({ chart: { chartArea: null } });
        const addColorStop = vi.fn();
        ds.backgroundColor({
          chart: {
            chartArea: { top: 0, bottom: 100 },
            ctx: {
              createLinearGradient: () => ({ addColorStop }),
            },
          },
        });
      }
    });
    // 调用 tooltip callbacks.label
    const labelCb = options?.plugins?.tooltip?.callbacks?.label;
    if (typeof labelCb === 'function') {
      labelCb({
        dataset: { label: 'Series A' },
        parsed: { y: 15 },
      });
    }
    return (
      <div
        data-testid="line-chart"
        data-labels={JSON.stringify(data?.labels)}
        data-datasets={JSON.stringify(
          datasets.map((d: any) =>
            typeof d.backgroundColor !== 'function'
              ? d
              : { ...d, backgroundColor: '[Function]' },
          ),
        )}
        data-options={JSON.stringify({
          plugins: options?.plugins,
          scales: options?.scales,
        })}
      />
    );
  },
}));

vi.mock('../../../src/Plugins/chart/hooks', () => ({
  useChartDataFilter: vi.fn(() => ({
    filteredData: [
      { x: '2024-01', y: 10, type: 'A', xtitle: '月', ytitle: '值' },
      { x: '2024-02', y: 20, type: 'B', xtitle: '月', ytitle: '值' },
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
  useChartStatistics: vi.fn(() => [{ title: 'stat' }]),
  useChartTheme: vi.fn(() => ({
    axisTextColor: '#111',
    gridColor: '#222',
    isLight: true,
  })),
  useResponsiveSize: vi.fn(() => ({
    responsiveWidth: '100%',
    responsiveHeight: 240,
    isMobile: false,
  })),
}));

vi.mock('../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="area-chart-container">{children}</div>
  ),
  ChartFilter: (props: any) => (
    <div
      data-testid="area-chart-filter"
      data-options={JSON.stringify(props.filterOptions)}
    >
      filter
    </div>
  ),
  ChartStatistic: () => <div data-testid="area-chart-statistic" />,
  ChartToolBar: (props: any) => {
    lastToolBarProps = props;
    return (
      <div data-testid="area-chart-toolbar">
        <button data-testid="area-download" onClick={() => props.onDownload()}>
          download
        </button>
        {props.filter}
      </div>
    );
  },
  downloadChart: (...args: any[]) => mockDownloadChart(...args),
}));

vi.mock('../../../src/Plugins/chart/utils', () => ({
  extractAndSortXValues: vi.fn((data) => data.map((item: any) => item.x)),
  findDataPointByXValue: vi.fn((data, x) =>
    data.find((item: any) => item.x === x),
  ),
  hexToRgba: vi.fn((color, alpha) => `rgba(${color},${alpha})`),
  resolveCssVariable: vi.fn((color) => color),
  registerLineChartComponents: () => mockRegisterLineChartComponents(),
  defaultColorList: ['#1a1a1a'],
}));

vi.mock('../../../src/Plugins/chart/AreaChart/style', () => ({
  useStyle: () => ({
    wrapSSR: (node: any) => node,
    hashId: 'hash',
  }),
}));

import AreaChart from '../../../src/Plugins/chart/AreaChart';
import { hexToRgba } from '../../../src/Plugins/chart/utils';

describe('AreaChart 额外覆盖用例', () => {
  it('在工具栏渲染过滤器并触发下载', () => {
    render(
      <AreaChart
        data={[{ x: '2024-01', y: 10, type: 'A' }]}
        renderFilterInToolbar
        title="覆盖测试"
      />,
    );

    expect(lastToolBarProps?.filter).toBeDefined();
    fireEvent.click(screen.getByTestId('area-download'));
    expect(mockDownloadChart).toHaveBeenCalledTimes(1);
    expect(mockRegisterLineChartComponents).toHaveBeenCalled();
  });

  it('在默认位置渲染 ChartFilter 且生成数据集', () => {
    render(<AreaChart data={[{ x: '2024-01', y: 10, type: 'A' }]} />);

    expect(screen.getByTestId('area-chart-filter')).toBeInTheDocument();
    const chart = screen.getByTestId('line-chart');
    const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
    expect(labels).toEqual(['2024-01', '2024-02']);
  });

  it('应执行 backgroundColor 渐变与 tooltip label 回调', () => {
    render(<AreaChart data={[{ x: '2024-01', y: 10, type: 'A' }]} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(hexToRgba).toHaveBeenCalled();
  });
});

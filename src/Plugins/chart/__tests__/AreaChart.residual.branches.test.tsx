/**
 * AreaChart 残留：statistic/空数据/主题与图例配置（mock Line）。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AreaChart from '../AreaChart';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Filler: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Line: React.forwardRef(({ data, options }: any, ref: any) => {
    (globalThis as any).__areaResidualData = data;
    (globalThis as any).__areaResidualOptions = options;
    return <div data-testid="area-line" ref={ref} />;
  }),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => <div data-testid="filter" />,
  ChartStatistic: () => <div data-testid="stat" />,
  ChartToolBar: ({ title, onDownload }: any) => (
    <div data-testid="tb">
      {title}
      <button type="button" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  downloadChart: vi.fn(),
}));

vi.mock('../AreaChart/style', () => ({
  useStyle: () => ({ hashId: 'a' }),
}));

vi.mock('../hooks', () => ({
  useChartDataFilter: (data: any) => ({
    filteredData: Array.isArray(data) ? data : [],
    filterOptions: [],
    selectedFilter: '',
    setSelectedFilter: vi.fn(),
    selectedFilterLabel: '',
  }),
  useChartStatistics: () => null,
  useChartTheme: () => ({}),
  useResolvedChartTheme: () => 'light',
  useResponsiveSize: () => ({
    width: 400,
    height: 300,
    isMobile: false,
    windowWidth: 1024,
  }),
}));

describe('AreaChart residual prop/config branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空数据与默认 props', () => {
    render(<AreaChart data={[]} title="Area" />);
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });

  it('多系列 / 关图例网格 / dark / loading', () => {
    render(
      <AreaChart
        data={[
          { x: 'a', y: 1, type: 't1' },
          { x: 'b', y: 2, type: 't1' },
          { x: 'a', y: 3, type: 't2' },
          { x: 'b', y: '4' as any, type: 't2' },
        ]}
        showLegend={false}
        showGrid={false}
        legendPosition="right"
        theme="dark"
        loading
        color={['#111', '']}
        xAxisLabel="X"
        yAxisLabel="Y"
        width={300}
        height={200}
        className="ac"
      />,
    );
    expect((globalThis as any).__areaResidualData?.datasets?.length).toBeGreaterThan(
      0,
    );
  });

  it('非数组 data 不抛错', () => {
    expect(() =>
      render(<AreaChart data={null as any} title="" />),
    ).not.toThrow();
  });
});

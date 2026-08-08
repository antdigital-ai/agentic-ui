/**
 * HistogramChart 残留：prop/config 分支（mock canvas，不触真实绘制路径）。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HistogramChart from '../HistogramChart';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Bar: React.forwardRef(({ data, options }: any, ref: any) => {
    (globalThis as any).__histResidualData = data;
    (globalThis as any).__histResidualOptions = options;
    return <div data-testid="hist-bar" ref={ref} />;
  }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="chart-statistic" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((o: any) => (
        <button
          key={o.value}
          type="button"
          data-testid={`f-${o.value}`}
          onClick={() => onFilterChange?.(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
  ChartToolBar: ({ title, onDownload, filter, extra }: any) => (
    <div data-testid="chart-toolbar">
      {title}
      {extra}
      {filter}
      <button type="button" data-testid="dl" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  downloadChart: vi.fn(),
}));

vi.mock('../HistogramChart/style', () => ({
  useStyle: () => ({ hashId: 'h' }),
}));

describe('HistogramChart residual prop/config branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  const sample = [
    { value: 1, category: 'A', filterLabel: 'F1' },
    { value: 2, category: 'A', filterLabel: 'F1' },
    { value: 5, category: 'B', filterLabel: 'F2' },
    { value: 8, category: 'B', filterLabel: 'F2' },
  ];

  it('statisticConfig 空数组 / 单对象 / 数组', () => {
    const { unmount } = render(
      <HistogramChart data={sample} statistic={[]} />,
    );
    expect(screen.queryByTestId('chart-statistic')).toBeNull();
    unmount();

    render(
      <HistogramChart
        data={sample}
        statistic={{ title: 't', value: 1 } as any}
      />,
    );
    expect(screen.getAllByTestId('chart-statistic').length).toBeGreaterThan(0);
  });

  it('非数组 data 安全为空；filter 切换；颜色假值', () => {
    const { unmount } = render(
      <HistogramChart data={null as any} title="H" />,
    );
    expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
    unmount();

    render(
      <HistogramChart
        data={sample}
        color={['', undefined as any, '#f00']}
        showLegend={false}
        showGrid={false}
        legendPosition="top"
        stacked={false}
        showFrequency
        binCount={3}
        xAxisLabel="X"
        yAxisLabel="Y"
        theme="dark"
        loading
      />,
    );
    const filterBtn = screen.queryByTestId('f-F2');
    if (filterBtn) {
      act(() => {
        fireEvent.click(filterBtn);
      });
    }
    expect((globalThis as any).__histResidualOptions).toBeTruthy();
  });

  it('width/height 与 toolbarExtra / renderFilterInToolbar', () => {
    render(
      <HistogramChart
        data={sample}
        width={320}
        height={240}
        toolbarExtra={<span data-testid="extra">e</span>}
        renderFilterInToolbar
        dataTime="2024"
        className="c"
        style={{ margin: 1 }}
      />,
    );
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });
});

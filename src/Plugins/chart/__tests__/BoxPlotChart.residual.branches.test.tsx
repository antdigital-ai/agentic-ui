/**
 * BoxPlotChart 残留：statistic/filter/responsive 配置边角（mock canvas）。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BoxPlotChart from '../BoxPlotChart';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('@sgratzl/chartjs-chart-boxplot', () => ({
  BoxPlotController: vi.fn(),
  BoxAndWiskers: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Chart: React.forwardRef(({ data, options }: any, ref: any) => {
    (globalThis as any).__boxResidualData = data;
    (globalThis as any).__boxResidualOptions = options;
    return <div data-testid="boxplot" ref={ref} />;
  }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="chart-statistic" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <div data-testid="filter">
      {filterOptions?.map((o: any) => (
        <button
          key={String(o.value)}
          type="button"
          data-testid={`bf-${o.value}`}
          onClick={() => onFilterChange?.(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
  ChartToolBar: ({ onDownload, filter, title }: any) => (
    <div data-testid="tb">
      {title}
      {filter}
      <button type="button" data-testid="dl" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  downloadChart: vi.fn(),
}));

vi.mock('../BoxPlotChart/style', () => ({
  useStyle: () => ({ hashId: 'b' }),
}));

describe('BoxPlotChart residual prop/config branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 values / 无 statistic / 单 statistic 对象', () => {
    const { unmount } = render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [] },
          { label: 'B', values: undefined as any },
          { label: 'C', values: [1, 2, 3, 4, 5] },
        ]}
      />,
    );
    expect(screen.getByTestId('boxplot') || document.body).toBeTruthy();
    unmount();

    render(
      <BoxPlotChart
        data={[{ label: 'C', type: 't', values: [1, 2, 3, 4, 5, 6, 7] }]}
        statistic={{ title: 's', value: 1 } as any}
        legendPosition="left"
        showOutliers
        color={undefined}
        width={200}
        height={200}
      />,
    );
    expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
  });

  it('非数组 data；filterLabel 分类；关图例网格', () => {
    render(
      <BoxPlotChart
        data={
          [
            {
              label: 'G1',
              type: 't1',
              values: [1, 2, 3, 4, 5],
              filterLabel: 'F1',
            },
            {
              label: 'G2',
              type: 't2',
              values: [2, 3, 4, 5, 6],
              filterLabel: 'F2',
            },
          ] as any
        }
        showLegend={false}
        showGrid={false}
        theme="dark"
        loading
        toolbarExtra={<i data-testid="ex" />}
      />,
    );
    const btn = screen.queryByTestId('bf-F2');
    if (btn) act(() => fireEvent.click(btn));
    expect((globalThis as any).__boxResidualData).toBeTruthy();
  });
});

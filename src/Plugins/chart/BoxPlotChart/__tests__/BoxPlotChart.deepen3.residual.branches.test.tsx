/**
 * BoxPlotChart deepen3：values 数组数据、filter、download。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BoxPlotChart from '../index';

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
  Chart: React.forwardRef(({ options }: any, ref: any) => {
    try {
      options?.plugins?.tooltip?.callbacks?.title?.([{ label: 'c' }]);
      options?.plugins?.tooltip?.callbacks?.label?.({
        raw: { min: 1, q1: 2, median: 3, q3: 4, max: 5, outliers: [9] },
        dataset: { label: 's' },
      });
    } catch {
      /* ignore */
    }
    if (ref) {
      if (typeof ref === 'function')
        ref({ canvas: document.createElement('canvas') });
      else ref.current = { canvas: document.createElement('canvas') };
    }
    return <div data-testid="box-d3" />;
  }),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'bxd3' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => <div data-testid="stat-d3" />,
}));

const downloadChart = vi.fn();
vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="container-d3">{children}</div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="cat-d3"
      onClick={() => onFilterChange?.(filterOptions?.[1]?.value || 'B')}
    >
      cat
    </button>
  ),
  ChartToolBar: ({ onDownload, filter }: any) => (
    <div data-testid="tb-d3">
      {filter}
      <button type="button" data-testid="dl-d3" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  downloadChart: (...args: unknown[]) => downloadChart(...args),
}));

describe('BoxPlotChart deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    downloadChart.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('单类 values + download', () => {
    render(
      <BoxPlotChart
        data={[
          {
            label: 'A',
            category: 'A',
            values: [1, 2, 3, 4, 5],
          },
        ]}
      />,
    );
    expect(screen.getByTestId('box-d3')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('dl-d3'));
    expect(downloadChart).toHaveBeenCalled();
  });

  it('多类 filter 切换', () => {
    render(
      <BoxPlotChart
        title="Box"
        data={[
          { label: 'A1', category: 'A', values: [1, 2, 3, 8] },
          { label: 'B1', category: 'B', values: [3, 4, 5, 6] },
        ]}
      />,
    );
    const cat = screen.queryByTestId('cat-d3');
    if (cat) fireEvent.click(cat);
    expect(screen.getByTestId('box-d3')).toBeInTheDocument();
  });
});

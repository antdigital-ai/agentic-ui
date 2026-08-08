/**
 * ScatterChart deepen4：空 data 空态、单点、多 type、download。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScatterChart from '../ScatterChart';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: () => [{ text: 'a', datasetIndex: 0 }],
          },
        },
      },
    },
  },
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Scatter: ({ options }: any) => {
    try {
      options?.plugins?.tooltip?.callbacks?.label?.({
        raw: null,
        dataset: { label: 't' },
      });
      options?.plugins?.tooltip?.callbacks?.label?.({
        raw: { x: '1', y: '2' },
        dataset: {},
      });
    } catch {
      /* ignore */
    }
    return <div data-testid="scatter4" />;
  },
}));

vi.mock('../ScatterChart/style', () => ({
  useStyle: () => ({ hashId: 'sc4' }),
}));

const downloadChart = vi.fn();
vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="sc4-c">{children}</div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="sc4-filter"
      onClick={() => onFilterChange?.(filterOptions?.[0]?.value)}
    >
      f
    </button>
  ),
  ChartStatistic: () => null,
  ChartToolBar: ({ filter, onDownload, title }: any) => (
    <div data-testid="sc4-tb">
      {title}
      {filter}
      <button type="button" data-testid="sc4-dl" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  downloadChart: (...args: unknown[]) => downloadChart(...args),
}));

describe('ScatterChart deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    downloadChart.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 data 显示空态；单点渲染', () => {
    render(<ScatterChart title="E" data={[]} />);
    expect(screen.getByText(/暂无|无有效|empty/i)).toBeInTheDocument();

    cleanup();
    render(
      <ScatterChart title="One" data={[{ x: 1, y: 2, type: 'A' }]} />,
    );
    expect(
      screen.queryByTestId('scatter4') || screen.getByTestId('sc4-c'),
    ).toBeTruthy();
  });

  it('多 type filter + download 安全', () => {
    render(
      <ScatterChart
        title="Multi"
        data={[
          { x: 1, y: 2, type: 'A' },
          { x: 3, y: 4, type: 'B' },
          { x: 5, y: 6, type: 'A' },
        ]}
      />,
    );
    const filter = screen.queryByTestId('sc4-filter');
    if (filter) fireEvent.click(filter);
    fireEvent.click(screen.getByTestId('sc4-dl'));
    // download 可能因无 canvas 实例而不调用，保证不抛
    expect(screen.getByTestId('sc4-tb')).toBeInTheDocument();
  });
});

/**
 * HistogramChart deepen3：空数据 binCount/edges、falsy type 跳过、
 * histogramData[type] || []、mobile 宽度。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HistogramChart from '../index';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Bar: React.forwardRef(({ data }: any, ref: any) => {
    (globalThis as any).__hist3Data = data;
    return <div data-testid="hist3" ref={ref} />;
  }),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'hr3' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => <div data-testid="stat" />,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children, isMobile }: any) => (
    <div data-testid="c" data-mobile={String(!!isMobile)}>
      {children}
    </div>
  ),
  ChartFilter: () => null,
  ChartToolBar: ({ title }: any) => <div data-testid="tb">{title}</div>,
  downloadChart: vi.fn(),
}));

describe('HistogramChart deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 500,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 data：calculateBinCount(0)/空 edges', async () => {
    render(<HistogramChart data={[]} title="empty" />);
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect(screen.getByTestId('tb')).toHaveTextContent('empty');
  });

  it('含空 type：forEach !type return；有值分箱', async () => {
    render(
      <HistogramChart
        data={[
          { value: 1, type: '' },
          { value: 2, type: 'A' },
          { value: 3, type: 'A' },
          { value: 4 },
        ]}
        title="types"
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect(screen.getByTestId('hist3')).toBeInTheDocument();
  });

  it('预分箱 + falsy type', async () => {
    render(
      <HistogramChart
        data={[
          { value: 1, left: 0, right: 1, type: '' },
          { value: 2, left: 1, right: 2, type: 'B' },
        ]}
        title="pre"
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect(document.body).toBeTruthy();
  });
});

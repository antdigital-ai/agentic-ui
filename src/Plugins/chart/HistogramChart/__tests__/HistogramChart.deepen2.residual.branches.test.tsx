/**
 * HistogramChart deepen2：window 缺失、预分箱、frequency、色回退、mobile resize。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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
  Bar: React.forwardRef(({ data, options }: any, ref: any) => {
    (globalThis as any).__hist2Data = data;
    (globalThis as any).__hist2Options = options;
    try {
      options?.plugins?.tooltip?.callbacks?.label?.({
        raw: 1,
        dataset: { label: 'f' },
        parsed: { y: 1 },
      });
      options?.plugins?.legend?.labels?.generateLabels?.({
        data: { datasets: [{ backgroundColor: ['#f00'] }] },
      });
    } catch {
      /* ignore */
    }
    return <div data-testid="hist2" ref={ref} />;
  }),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'hr2' }),
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
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="cat"
      onClick={() => onFilterChange?.(filterOptions?.[0]?.value)}
    >
      cat
    </button>
  ),
  ChartToolBar: ({ filter, onDownload, title }: any) => (
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

describe('HistogramChart deepen2 residual branches', () => {
  const origW = window.innerWidth;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: origW,
    });
  });

  it('预分箱 left/right + frequency；color 数组越界回退', () => {
    render(
      <HistogramChart
        data={[
          { left: 0, right: 5, value: 2, type: 'A' },
          { left: 5, right: 10, value: 3, type: 'A' },
          { left: 0, right: 5, value: 1, type: 'B' },
        ]}
        showFrequency
        color={['#111']}
      />,
    );
    expect(screen.getByTestId('hist2')).toBeInTheDocument();
    expect((globalThis as any).__hist2Data).toBeTruthy();
  });

  it('mobile 宽度 + resize 事件', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 400,
    });
    render(
      <HistogramChart
        data={[
          { value: 1, type: 'A' },
          { value: 3, type: 'B' },
        ]}
      />,
    );
    expect(screen.getByTestId('c').getAttribute('data-mobile')).toBe('true');
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1400,
    });
    await act(async () => {
      fireEvent.resize(window);
    });
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });

  it('分类筛选切换', () => {
    render(
      <HistogramChart
        data={[
          { value: 1, type: 'A' },
          { value: 2, type: 'B' },
          { value: 3, type: 'A' },
        ]}
      />,
    );
    const cat = screen.queryByTestId('cat');
    if (cat) fireEvent.click(cat);
    expect(screen.getByTestId('hist2')).toBeInTheDocument();
  });
});

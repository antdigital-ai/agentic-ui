/**
 * HistogramChart deepen residual：空分箱、同值、预分箱、频率、色回退、mobile。
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
    (globalThis as any).__histResData = data;
    (globalThis as any).__histResOptions = options;
    return <div data-testid="hist-res" ref={ref} />;
  }),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'hr' }),
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
      onClick={() => onFilterChange?.(filterOptions?.[1]?.value)}
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

describe('HistogramChart deepen residual branches', () => {
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

  it('空 data 空态；同值分箱', () => {
    const { rerender } = render(<HistogramChart data={[]} />);
    expect(screen.getByText(/暂无有效数据|暂无/)).toBeTruthy();

    rerender(
      <HistogramChart
        data={[
          { value: 5, type: 'A' },
          { value: 5, type: 'A' },
          { value: 5, type: 'A' },
        ]}
      />,
    );
    expect((globalThis as any).__histResData?.labels?.length).toBeGreaterThan(
      0,
    );
  });

  it('showFrequency；stacked false；color 字符串', () => {
    render(
      <HistogramChart
        data={[
          { value: 1, type: 'A' },
          { value: 2, type: 'A' },
          { value: 8, type: 'A' },
          { value: 3, type: 'B' },
          { value: 4, type: 'B' },
        ]}
        showFrequency
        stacked={false}
        color="#1677ff"
        showLegend
        binCount={4}
      />,
    );
    const ds = (globalThis as any).__histResData?.datasets;
    expect(ds?.length).toBeGreaterThan(0);
    const sum = (ds?.[0]?.data || []).reduce((a: number, b: number) => a + b, 0);
    expect(sum).toBeLessThanOrEqual(1.01);
  });

  it('预分箱 left/right；统计空数组；mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 500,
    });
    render(
      <HistogramChart
        data={[
          { left: 0, right: 1, value: 2, type: 'A' },
          { left: 1, right: 2, value: 3, type: 'A' },
          { left: 0, right: 1, value: 1, type: 'B' },
        ]}
        statistic={[]}
        renderFilterInToolbar
        theme="dark"
        xAxisLabel="x"
      />,
    );
    expect(screen.getByTestId('c').getAttribute('data-mobile')).toBe('true');
    expect(screen.queryByTestId('stat')).toBeNull();
    expect((globalThis as any).__histResData?.labels?.length).toBeGreaterThan(
      0,
    );
  });

  it('color 数组越界回退；下载；分类切换', () => {
    render(
      <HistogramChart
        data={[
          { value: 1, category: 'C1', type: 'T1' },
          { value: 2, category: 'C1', type: 'T2' },
          { value: 3, category: 'C2', type: 'T1' },
          { value: 4, category: 'C2', type: 'T2' },
        ]}
        color={['#111']}
        renderFilterInToolbar
      />,
    );
    act(() => {
      fireEvent.click(screen.getByTestId('cat'));
    });
    fireEvent.click(screen.getByTestId('dl'));
    expect((globalThis as any).__histResData).toBeTruthy();
  });

  it('无 type 走默认；statistic 单对象', () => {
    render(
      <HistogramChart
        data={[{ value: 1 }, { value: 2 }, { value: 10 }]}
        statistic={{ title: 's' } as any}
      />,
    );
    expect(screen.getByTestId('stat')).toBeInTheDocument();
  });
});

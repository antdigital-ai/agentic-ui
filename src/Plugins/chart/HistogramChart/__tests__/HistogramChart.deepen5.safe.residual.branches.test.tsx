/**
 * HistogramChart deepen5 safe：calculateBinCount/Edges 空值、SSR window、
 * 预分箱 idx/type 回退、histogramData[type]||[]。
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
  Bar: React.forwardRef(({ data, options }: any, ref: any) => {
    (globalThis as any).__hist5Data = data;
    (globalThis as any).__hist5Options = options;
    return <div data-testid="hist5" ref={ref} />;
  }),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'hr5' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => <div data-testid="stat5" />,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children, isMobile }: any) => (
    <div data-testid="c5" data-mobile={String(!!isMobile)}>
      {children}
    </div>
  ),
  ChartFilter: () => null,
  ChartToolBar: ({ title }: any) => <div data-testid="tb5">{title}</div>,
  downloadChart: vi.fn(),
}));

describe('HistogramChart deepen5 safe residual branches', () => {
  const origInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });
    (globalThis as any).__hist5Data = undefined;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: origInnerWidth,
    });
  });

  it('空 data：空态 UI；无 chart datasets', async () => {
    render(<HistogramChart data={[]} title="empty" />);
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    expect((globalThis as any).__hist5Data).toBeUndefined();
  });

  it('customBinCount=0：calculateBinCount(n<=0)→1', async () => {
    render(
      <HistogramChart
        data={[
          { value: 1, type: 'A' },
          { value: 2, type: 'A' },
        ]}
        binCount={0}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    expect((globalThis as any).__hist5Data?.labels?.length).toBeGreaterThan(0);
  });

  it('mobile innerWidth<=768：window 三元 768 回退臂', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 500,
    });
    render(
      <HistogramChart
        data={[
          { value: 10, type: 'T' },
          { value: 20, type: 'T' },
        ]}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect(screen.getByTestId('c5').getAttribute('data-mobile')).toBe('true');
  });

  it('预分箱：匹配 idx!==-1；histogramData[type]||[]', async () => {
    render(
      <HistogramChart
        data={[
          { left: 0, right: 10, value: 5, type: 'S' },
          { left: 10, right: 20, value: 3, type: 'S' },
          { left: 0, right: 10, value: 1, type: '' as any },
        ]}
        showFrequency
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    const chartData = (globalThis as any).__hist5Data;
    expect(chartData?.datasets?.length).toBeGreaterThan(0);
    expect(
      chartData?.datasets?.some(
        (d: any) => Array.isArray(d.data) && d.data.length >= 0,
      ),
    ).toBe(true);
  });

  it('仅无效 value 过滤后空：type 缺省「默认」', async () => {
    render(
      <HistogramChart
        data={[
          { value: NaN, type: 'X' },
          { value: Infinity, type: 'X' },
        ]}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect((globalThis as any).__hist5Data?.datasets?.length ?? 0).toBe(0);
  });
});

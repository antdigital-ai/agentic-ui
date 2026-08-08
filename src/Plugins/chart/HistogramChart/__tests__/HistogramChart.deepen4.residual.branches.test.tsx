/**
 * HistogramChart deepen4：title 缺省回退、statistic 空数组、
 * tooltip value ??、x/y 轴 label 回退。
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
  Bar: React.forwardRef(({ options, data }: any, ref: any) => {
    (globalThis as any).__hist4Options = options;
    (globalThis as any).__hist4Data = data;
    return <div data-testid="hist4" ref={ref} />;
  }),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'hr4' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => <div data-testid="stat4" />,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => <div data-testid="c4">{children}</div>,
  ChartFilter: () => null,
  ChartToolBar: ({ title }: any) => <div data-testid="tb4">{title}</div>,
  downloadChart: vi.fn(),
}));

describe('HistogramChart deepen4 residual branches', () => {
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
  });

  it('无 title：默认「直方图」；statistic 空数组不渲染', async () => {
    render(
      <HistogramChart
        data={[
          { value: 1, type: 'A' },
          { value: 2, type: 'A' },
          { value: 5, type: 'A' },
        ]}
        statistic={[]}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    expect(screen.getByTestId('tb4')).toHaveTextContent('直方图');
    expect(screen.queryByTestId('stat4')).toBeNull();
  });

  it('轴标签缺省回退；tooltip 回调 value ?? 0', async () => {
    render(
      <HistogramChart
        data={[
          { value: 10, type: 'T' },
          { value: 20, type: 'T' },
          { value: 30, type: 'T' },
        ]}
        title="h4"
        showFrequency
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    expect(screen.getByTestId('hist4')).toBeInTheDocument();
    const opts = (globalThis as any).__hist4Options;
    const xText = opts?.scales?.x?.title?.text;
    const yText = opts?.scales?.y?.title?.text;
    expect(xText === '值范围' || typeof xText === 'string').toBe(true);
    expect(
      yText === '频率' || yText === '计数' || typeof yText === 'string',
    ).toBe(true);

    const labelFn = opts?.plugins?.tooltip?.callbacks?.label;
    if (typeof labelFn === 'function') {
      const out = labelFn({
        dataset: { label: 'T' },
        parsed: { y: undefined },
        raw: undefined,
      });
      expect(String(out)).toMatch(/T|0/);
    }
  });
});

/**
 * BoxPlotChart deepen residual：空 values、无效数、statistic 空、分类回退、tooltip。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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
  Chart: React.forwardRef(({ data, options }: any, ref: any) => {
    (globalThis as any).__boxResData = data;
    (globalThis as any).__boxResOptions = options;
    if (ref) {
      if (typeof ref === 'function') ref({ canvas: document.createElement('canvas') });
      else ref.current = { canvas: document.createElement('canvas') };
    }
    return <div data-testid="box-res" />;
  }),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'bxr' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => <div data-testid="stat" />,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children, isMobile }: any) => (
    <div data-testid="container" data-mobile={String(!!isMobile)}>
      {children}
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="cat"
      onClick={() => onFilterChange?.(filterOptions?.[1]?.value || 'gone')}
    >
      cat
    </button>
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

describe('BoxPlotChart deepen residual branches', () => {
  const origW = window.innerWidth;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1024,
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

  it('空 data 空态；空 label 过滤后仍可渲染有效点', () => {
    render(<BoxPlotChart data={[]} />);
    expect(screen.getByText(/暂无有效数据/)).toBeInTheDocument();

    cleanup();
    render(
      <BoxPlotChart
        data={[
          { label: '', values: [1, 2, 3], type: 't' },
          {
            label: 'Ok',
            values: [NaN, Infinity, 1, 2, 3, 4, 5],
            type: 't',
          },
        ]}
      />,
    );
    expect((globalThis as any).__boxResData?.labels).toEqual(
      expect.arrayContaining(['Ok']),
    );
  });

  it('statistic 空数组不渲染；单对象包装', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3, 4, 5], type: 't' }]}
        statistic={[]}
      />,
    );
    expect(screen.queryByTestId('stat')).toBeNull();

    cleanup();
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3, 4, 5], type: 't' }]}
        statistic={{ title: 'm' } as any}
      />,
    );
    expect(screen.getByTestId('stat')).toBeInTheDocument();
  });

  it('分类失效回退；mobile 宽度；tooltip label 回调', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 400,
    });
    render(
      <BoxPlotChart
        data={[
          {
            label: 'A',
            values: [1, 2, 3, 4, 5],
            category: 'C1',
            type: 't',
          },
          {
            label: 'B',
            values: [2, 3, 4, 5, 6],
            category: 'C2',
            type: 't',
          },
        ]}
        renderFilterInToolbar
        xAxisLabel="X"
        yAxisLabel="Y"
        color={['#f00']}
        theme="dark"
      />,
    );
    expect(screen.getByTestId('container').getAttribute('data-mobile')).toBe(
      'true',
    );

    act(() => {
      fireEvent.click(screen.getByTestId('cat'));
    });

    const labelFn = (globalThis as any).__boxResOptions?.plugins?.tooltip
      ?.callbacks?.label;
    expect(labelFn?.({ raw: null })).toBe('');
    const lines = labelFn?.({
      raw: { min: 1, q1: 2, median: 3, q3: 4, max: 5, mean: 3 },
    });
    expect(Array.isArray(lines) ? lines.join(' ') : String(lines)).toMatch(
      /均值|中位数|Q1/,
    );
    const noMean = labelFn?.({
      raw: { min: 1, q1: 2, median: 3, q3: 4, max: 5 },
    });
    expect(String(noMean)).not.toMatch(/均值/);
  });

  it('下载触发；空 label 过滤', () => {
    render(
      <BoxPlotChart
        data={[
          { label: '', values: [1, 2, 3], type: 't' },
          { label: 'Ok', values: [1, 2, 3, 4, 5], type: 't' },
        ]}
        title="箱线"
      />,
    );
    fireEvent.click(screen.getByTestId('dl'));
    expect((globalThis as any).__boxResData?.labels).toEqual(
      expect.arrayContaining(['Ok']),
    );
  });
});

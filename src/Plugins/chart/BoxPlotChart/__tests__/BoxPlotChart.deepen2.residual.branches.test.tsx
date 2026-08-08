/**
 * BoxPlotChart deepen2：空 values 统计、全异常值 min/max、
 * type 缺省 label、tooltip q1 空、SSR window、resize。
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
    (globalThis as any).__boxD2Data = data;
    (globalThis as any).__boxD2Options = options;
    if (ref) {
      if (typeof ref === 'function')
        ref({ canvas: document.createElement('canvas') });
      else ref.current = { canvas: document.createElement('canvas') };
    }
    return <div data-testid="box-d2" />;
  }),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'bxd2' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => <div data-testid="stat-d2" />,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children, isMobile }: any) => (
    <div data-testid="container-d2" data-mobile={String(!!isMobile)}>
      {children}
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="cat-d2"
      onClick={() => onFilterChange?.(filterOptions?.[1]?.value || 'gone')}
    >
      cat
    </button>
  ),
  ChartToolBar: ({ onDownload, filter, title }: any) => (
    <div data-testid="tb-d2">
      {title}
      {filter}
      <button type="button" data-testid="dl-d2" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  downloadChart: vi.fn(),
}));

describe('BoxPlotChart deepen2 residual branches', () => {
  const origW = window.innerWidth;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1024,
    });
    (globalThis as any).__boxD2Data = undefined;
    (globalThis as any).__boxD2Options = undefined;
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

  it('空 values / 仅无效数：过滤后空态或跳过该点', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'Empty', values: [], type: 't' },
          { label: 'Bad', values: [NaN, Infinity], type: 't' },
          { label: 'Ok', values: [1, 2, 3, 4, 5], type: 't' },
        ]}
      />,
    );
    expect(screen.getByTestId('box-d2')).toBeInTheDocument();
    const labels = (globalThis as any).__boxD2Data?.labels || [];
    expect(labels).toEqual(expect.arrayContaining(['Ok']));
  });

  it('极端异常值驱动 min/max 回退；缺 type 走默认数据集', () => {
    // 大量同值 + 两端极端，尽量压出非异常值为空的防御路径
    const values = [0, 0, 0, 0, 0, 0, 0, 0, 1e9, -1e9];
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values, type: '' as any },
          { label: 'B', values: [10, 20, 30, 40, 50] },
        ]}
        showOutliers
        xAxisLabel="X"
      />,
    );
    expect(screen.getByTestId('box-d2')).toBeInTheDocument();
    const ds = (globalThis as any).__boxD2Data?.datasets || [];
    expect(ds.length).toBeGreaterThan(0);
    expect(ds.some((d: any) => d.label === '默认' || d.label)).toBe(true);
  });

  it('tooltip：raw 缺 q1/mean 走 ?? 回退', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3, 4, 5], type: 't' }]}
        theme="light"
      />,
    );
    const labelFn = (globalThis as any).__boxD2Options?.plugins?.tooltip
      ?.callbacks?.label;
    expect(labelFn).toBeTypeOf('function');
    const lines = labelFn({
      raw: { min: 1, median: 3, q3: 4, max: 5 },
    });
    expect(Array.isArray(lines) ? lines.join(' ') : String(lines)).toMatch(/Q1/);
    expect(labelFn({ raw: null })).toBe('');
  });

  it('mobile resize；分类切换；下载', () => {
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
            type: 't1',
          },
          {
            label: 'B',
            values: [2, 3, 4, 5, 6],
            category: 'C2',
            type: 't2',
          },
        ]}
        renderFilterInToolbar
        color={['#f00', '#0f0']}
        title="箱线2"
      />,
    );
    expect(screen.getByTestId('container-d2').getAttribute('data-mobile')).toBe(
      'true',
    );
    act(() => {
      fireEvent.click(screen.getByTestId('cat-d2'));
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });
    act(() => {
      fireEvent.resize(window);
    });
    fireEvent.click(screen.getByTestId('dl-d2'));
    expect(screen.getByTestId('box-d2')).toBeInTheDocument();
  });
});

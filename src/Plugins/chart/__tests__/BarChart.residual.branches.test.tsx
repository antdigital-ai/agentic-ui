/**
 * BarChart 残留：y 字符串/颜色回退/空数据（mock Bar）。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BarChart from '../BarChart';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => {
    (globalThis as any).__barResidualData = data;
    (globalThis as any).__barResidualOptions = options;
    return <div data-testid="bar" />;
  },
}));

vi.mock('../BarChart/style', () => ({
  useStyle: () => ({ hashId: 'b' }),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => <div data-testid="filter" />,
  ChartStatistic: () => <div data-testid="stat" />,
  ChartToolBar: ({ title }: any) => <div data-testid="tb">{title}</div>,
  downloadChart: vi.fn(),
}));

vi.mock('../hooks', async () => {
  const actual = await vi.importActual<any>('../hooks');
  return {
    ...actual,
    useResponsiveSize: () => ({
      width: 400,
      height: 300,
      isMobile: false,
      windowWidth: 1200,
    }),
  };
});

vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>();
  return {
    ...actual,
    resolveCssVariable: (color: string) => color || '#1677ff',
  };
});

describe('BarChart residual prop/config branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空数据与 title', () => {
    render(<BarChart data={[]} title="Bars" />);
    expect(screen.getByTestId('tb')).toHaveTextContent('Bars');
  });

  it('字符串 y / 假颜色 / 关图例网格 / stacked', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: '10', type: 't1' },
          { x: 'b', y: 20, type: 't1' },
          { x: 'a', y: NaN as any, type: 't2' },
          { x: 'b', y: null as any, type: 't2' },
        ]}
        color={['#111111', '#222222']}
        showLegend={false}
        showGrid={false}
        stacked
        theme="dark"
        loading
        indexAxis="y"
        xAxisLabel="X"
        yAxisLabel="Y"
      />,
    );
    expect((globalThis as any).__barResidualData?.datasets?.length).toBeGreaterThan(
      0,
    );
  });

  it('非数组 data', () => {
    expect(() => render(<BarChart data={undefined as any} />)).not.toThrow();
  });

  it('发散图 borderColor/backgroundColor：非数字 parsed 回退 0、单色 resolvedProvidedColors', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: '10', type: 't1' },
          { x: 'b', y: '-5', type: 't1' },
          { x: 'c', y: 0, type: 't1' },
        ]}
        color="#336699"
        title="div-single"
      />,
    );
    const ds = (globalThis as any).__barResidualData?.datasets?.[0];
    expect(ds?.data).toEqual([10, -5, 0]);
    const borderColor = ds?.borderColor;
    const backgroundColor = ds?.backgroundColor;
    if (typeof borderColor === 'function') {
      expect(borderColor({ parsed: { y: undefined } } as any)).toBeTruthy();
      expect(borderColor({ parsed: { y: 10 } } as any)).toBeTruthy();
      expect(borderColor({ parsed: { y: -3 } } as any)).toBeTruthy();
    }
    if (typeof backgroundColor === 'function') {
      const mockChart = {
        chartArea: { left: 0, right: 200, top: 0, bottom: 200 },
        ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
        scales: {
          x: { getPixelForValue: (v: number) => v * 10 },
          y: { getPixelForValue: (v: number) => 100 - v * 10 },
        },
      };
      expect(
        backgroundColor({ chart: mockChart, parsed: { y: undefined } } as any),
      ).toBeTruthy();
      expect(
        backgroundColor({ chart: mockChart, parsed: { y: 8 } } as any),
      ).toBeTruthy();
      expect(
        backgroundColor({ chart: mockChart, parsed: { y: 0 } } as any),
      ).toBeTruthy();
    }
  });

  it('color 数组 pickByIndex 回退 defaultColorList；多 type 标签默认', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 1, type: '' },
          { x: 'b', y: 2, type: 't2' },
        ]}
        color={['#aa0000']}
      />,
    );
    const datasets = (globalThis as any).__barResidualData?.datasets;
    expect(datasets?.[0]?.label).toBe('默认');
    expect(datasets?.[1]?.label).toBe('t2');
    expect(datasets?.[0]?.borderColor).toBeDefined();
  });

  it('window resize 更新宽度', () => {
    render(
      <BarChart
        data={[{ x: 'a', y: 1, type: 't' }]}
        title="resize"
      />,
    );
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });
});

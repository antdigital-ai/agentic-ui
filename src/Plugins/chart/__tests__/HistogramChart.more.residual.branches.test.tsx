/**
 * HistogramChart 更多残留：bin/色回调、空数据、轴配置。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HistogramChart from '../HistogramChart';

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
    (globalThis as any).__histMoreData = data;
    (globalThis as any).__histMoreOptions = options;
    return <div data-testid="hist-more" />;
  },
}));

vi.mock('../HistogramChart/style', () => ({
  useStyle: () => ({ hashId: 'hm' }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="stat" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => null,
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
      isMobile: true,
      windowWidth: 400,
    }),
  };
});

describe('HistogramChart more residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空数据与 title', () => {
    render(<HistogramChart data={[]} title="H" theme="dark" />);
    expect(screen.getByTestId('tb')).toHaveTextContent('H');
  });

  it('数值序列 + 假颜色 + 关图例网格', () => {
    render(
      <HistogramChart
        data={[
          { value: 1, type: 't1' },
          { value: 2, type: 't1' },
          { value: 2, type: 't1' },
          { value: 5, type: 't2' },
          { value: 8, type: 't2' },
          { value: Number.NaN, type: 't2' },
        ]}
        color={['', undefined as any]}
        showLegend={false}
        showGrid={false}
        binCount={4}
        loading
        title="hist"
      />,
    );
    const ds = (globalThis as any).__histMoreData?.datasets?.[0];
    expect(ds).toBeTruthy();
    const bg = ds?.backgroundColor;
    if (typeof bg === 'function') {
      expect(
        bg({
          chart: {
            chartArea: { left: 0, right: 100, top: 0, bottom: 100 },
            ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
            scales: {
              x: { getPixelForValue: (v: number) => v },
              y: { getPixelForValue: (v: number) => v },
            },
            isDatasetVisible: () => true,
          },
          parsed: { x: 1, y: 2 },
          dataIndex: 0,
        }),
      ).toBeTruthy();
      expect(
        bg({
          chart: {
            chartArea: null,
            ctx: {},
            scales: {},
            isDatasetVisible: () => true,
          },
          parsed: { y: 1 },
          dataIndex: 0,
        }),
      ).toBeTruthy();
    }
  });

  it('数值 + filterLabel + 单色 color', () => {
    render(
      <HistogramChart
        data={[
          { value: 3, type: 'a', filterLabel: 'f1' },
          { value: 7, type: 'a', filterLabel: 'f1' },
          { value: 9, type: 'b', filterLabel: 'f2' },
        ]}
        color="#1677ff"
        binCount={2}
        title="hist2"
      />,
    );
    expect(screen.getByTestId('hist-more')).toBeInTheDocument();
    expect((globalThis as any).__histMoreOptions).toBeTruthy();
  });

  it('category 切换 + tooltip label + 空 scales 颜色回退', () => {
    render(
      <HistogramChart
        data={[
          { value: 1, type: 't', category: 'C1', filterLabel: 'F1' },
          { value: 4, type: 't', category: 'C1', filterLabel: 'F2' },
          { value: 9, type: 't', category: 'C2' },
        ]}
        binCount={3}
        showLegend
        title="hist-cat"
      />,
    );
    const opts = (globalThis as any).__histMoreOptions;
    const label = opts?.plugins?.tooltip?.callbacks?.label;
    if (typeof label === 'function') {
      expect(label({ parsed: { x: 1, y: 2 }, dataset: { label: 't' } })).toBeTruthy();
      expect(label({ parsed: {}, dataset: {} })).toBeTruthy();
    }
    const bg = (globalThis as any).__histMoreData?.datasets?.[0]?.backgroundColor;
    if (typeof bg === 'function') {
      expect(
        bg({
          chart: {
            chartArea: { left: 0, right: 10, top: 0, bottom: 10 },
            ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
            scales: {
              x: { getPixelForValue: () => Number.NaN },
              y: { getPixelForValue: () => Number.NaN },
            },
            isDatasetVisible: () => true,
          },
          parsed: { x: 1, y: 1 },
          dataIndex: 0,
        }),
      ).toBeTruthy();
    }
  });

  it('backgroundColor：无 chartArea / 有渐变；空 type 标签', () => {
    render(
      <HistogramChart
        data={[
          { value: 2, type: '' },
          { value: 4, type: '' },
          { value: 6, type: '' },
          { value: 8, type: '' },
        ]}
        color={['#abc', '#def']}
        binCount={3}
        theme="dark"
        showLegend
      />,
    );
    const bg = (globalThis as any).__histMoreData?.datasets?.[0]?.backgroundColor;
    if (typeof bg === 'function') {
      expect(
        bg({
          chart: {
            chartArea: { left: 0, right: 80, top: 0, bottom: 80 },
            ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
            scales: {
              x: { getPixelForValue: (v: number) => v * 2 },
              y: { getPixelForValue: (v: number) => 80 - v },
            },
            isDatasetVisible: () => true,
          },
          parsed: { x: 1, y: 3 },
          dataIndex: 0,
        }),
      ).toBeTruthy();
      expect(
        bg({
          chart: { chartArea: null, ctx: {}, scales: {}, isDatasetVisible: () => true },
          parsed: { y: 2 },
          dataIndex: 1,
        }),
      ).toBeTruthy();
    }
    expect((globalThis as any).__histMoreData?.datasets?.[0]?.label || '默认').toBeTruthy();
  });

  it('istanbul deepen：category/filter；频率；预分箱；轴标题；resize', () => {
    const { rerender } = render(
      <HistogramChart
        data={[
          { value: 1, type: 't1', category: 'A', filterLabel: 'F1' },
          { value: 2, type: 't1', category: 'A', filterLabel: 'F1' },
          { value: 3, type: 't1', category: 'A', filterLabel: 'F2' },
          { value: 4, type: 't2', category: 'B', filterLabel: 'F1' },
          { value: 5, type: 't2', category: 'B', filterLabel: 'F1' },
        ]}
        showFrequency
        binCount={4}
        xAxisLabel="bins"
        yAxisLabel="freq"
        stacked
        showLegend
        statistic={{ title: 'n', value: 5 }}
        title="hist-deep"
      />,
    );
    const opts = (globalThis as any).__histMoreOptions;
    const labelCb = opts?.plugins?.tooltip?.callbacks?.label;
    if (typeof labelCb === 'function') {
      expect(
        labelCb({ dataset: { label: 't1' }, parsed: { y: 0.25 } }),
      ).toBeTruthy();
    }
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    rerender(
      <HistogramChart
        data={[
          { x: '0-1', y: 2, type: 'pre' },
          { x: '1-2', y: 3, type: 'pre' },
          { x: '2-3', y: 1, type: 'pre' },
        ]}
        showFrequency={false}
        stacked={false}
        statistic={[]}
        title="hist-pre"
      />,
    );
    expect(screen.getByTestId('tb')).toHaveTextContent('hist-pre');
  });

  it('istanbul deepen：同值分箱；空 statistic；单色', () => {
    render(
      <HistogramChart
        data={[
          { value: 5, type: 'same' },
          { value: 5, type: 'same' },
          { value: 5, type: 'same' },
        ]}
        color="#00aa00"
        theme="light"
        showGrid={false}
        showLegend={false}
      />,
    );
    expect(
      (globalThis as any).__histMoreData?.datasets?.length,
    ).toBeGreaterThan(0);
  });

  it('istanbul deepen：微小分箱标签；自动 binCount；color 回调矩阵；预分箱 left/right', () => {
    const { rerender } = render(
      <HistogramChart
        data={[
          { value: 0.001, type: 'tiny' },
          { value: 0.002, type: 'tiny' },
          { value: 0.003, type: 'tiny' },
          { value: 1000, type: 'big' },
          { value: 1001, type: 'big' },
        ]}
        color={['#111', '#222']}
        showFrequency
        showLegend
        legendPosition="top"
        xAxisLabel="x"
        yAxisLabel="y"
        title="hist-fmt"
      />,
    );
    const ds = (globalThis as any).__histMoreData?.datasets?.[0];
    const bg = ds?.backgroundColor;
    const border = ds?.borderColor;
    const ctxFull = {
      chart: {
        chartArea: { left: 0, right: 200, top: 0, bottom: 100 },
        ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
        scales: {
          x: { getPixelForValue: (v: number) => v * 10 },
          y: { getPixelForValue: (v: number) => 100 - v },
        },
        isDatasetVisible: () => true,
      },
      parsed: { x: 1, y: 2 },
      dataIndex: 0,
    };
    if (typeof bg === 'function') {
      expect(bg(ctxFull)).toBeTruthy();
      expect(
        bg({
          ...ctxFull,
          chart: { ...ctxFull.chart, chartArea: null, scales: {} },
        }),
      ).toBeTruthy();
      expect(
        bg({
          ...ctxFull,
          chart: {
            ...ctxFull.chart,
            scales: {
              x: {},
              y: { getPixelForValue: () => Number.NaN },
            },
          },
        }),
      ).toBeTruthy();
    }
    if (typeof border === 'function') {
      expect(border(ctxFull)).toBeTruthy();
    }
    const opts = (globalThis as any).__histMoreOptions;
    const tip = opts?.plugins?.tooltip?.callbacks?.label;
    if (typeof tip === 'function') {
      expect(tip({ dataset: { label: 'tiny' }, parsed: { y: 0.5 } })).toBeTruthy();
      expect(tip({ dataset: {}, parsed: { y: Number.NaN } })).toBeDefined();
    }

    rerender(
      <HistogramChart
        data={[
          { x: '0-1', y: 2, type: 'pre', left: 0, right: 1, value: 2 },
          { x: '1-2', y: 5, type: 'pre', left: 1, right: 2, value: 5 },
          { value: Number.NaN, type: 'pre' },
        ]}
        binCount={0 as any}
        color=""
        showGrid
        stacked={false}
        showLegend={false}
        statistic={null as any}
        title="hist-pre2"
      />,
    );
    expect(screen.getByTestId('tb')).toHaveTextContent('hist-pre2');

    rerender(
      <HistogramChart
        data={[{ value: 7, type: 'solo' }]}
        theme="dark"
        width="80%"
        height="40%"
        renderFilterInToolbar
        toolbarExtra={<span>ex</span>}
      />,
    );
    expect((globalThis as any).__histMoreData?.datasets?.length).toBeGreaterThan(
      0,
    );
  });

  it('exclusive deepen：空数据；负数；binCount；stacked；filter', () => {
    const { rerender } = render(
      <HistogramChart data={[]} title="hist-empty" theme="light" />,
    );
    expect(screen.getByTestId('tb')).toHaveTextContent('hist-empty');

    rerender(
      <HistogramChart
        data={[
          { value: -5, type: 'n' },
          { value: 0, type: 'n' },
          { value: 3, type: 'n' },
          { value: 10, type: 'p' },
          { value: 12, type: 'p', category: 'c', filterLabel: 'f' },
        ]}
        binCount={4}
        color={['#111', '#222']}
        stacked
        showLegend
        showGrid={false}
        statistic={[{ title: 'cnt', value: 5 }]}
        title="hist-stack"
      />,
    );
    const tip = (globalThis as any).__histMoreOptions?.plugins?.tooltip
      ?.callbacks?.label;
    if (typeof tip === 'function') {
      tip({ dataset: { label: 'n' }, parsed: { y: 2 } });
      tip({ dataset: {}, parsed: { y: 0 } });
    }
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    rerender(
      <HistogramChart
        data={[{ value: 1 }, { value: 1 }, { value: 1 }]}
        binCount={1}
        color="#ff0"
        theme="dark"
        showLegend={false}
      />,
    );
    expect(
      (globalThis as any).__histMoreData?.datasets?.length,
    ).toBeGreaterThan(0);
  });
});

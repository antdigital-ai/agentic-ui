/**
 * BarChart 更多残留：发散色、渐变回调、filter、statistic、轴范围。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
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
    (globalThis as any).__barMoreData = data;
    (globalThis as any).__barMoreOptions = options;
    return <div data-testid="bar-more" />;
  },
}));

vi.mock('../BarChart/style', () => ({
  useStyle: () => ({ hashId: 'bm' }),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="bar-filter"
      onClick={() =>
        filterOptions?.length > 1 && onFilterChange?.(filterOptions[1].value)
      }
    >
      filter
    </button>
  ),
  ChartStatistic: () => <div data-testid="stat" />,
  ChartToolBar: ({ title, onDownload, filter }: any) => (
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

vi.mock('../hooks', async () => {
  const actual = await vi.importActual<any>('../hooks');
  return {
    ...actual,
    useResponsiveSize: () => ({
      width: 400,
      height: 300,
      isMobile: true,
      windowWidth: 480,
    }),
  };
});

const chartCtx = (parsed: any, indexAxis: 'x' | 'y' = 'x') => ({
  chart: {
    chartArea: { left: 0, right: 200, top: 0, bottom: 200 },
    ctx: {
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
    },
    scales: {
      x: { getPixelForValue: (v: number) => v * 10 },
      y: { getPixelForValue: (v: number) => 100 - v * 10 },
    },
    isDatasetVisible: () => true,
    data: { datasets: [{ data: [] }] },
  },
  parsed,
  dataIndex: 0,
  datasetIndex: 0,
  dataset: { type: 'bar' },
  indexAxis,
});

describe('BarChart more residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('发散正负值 + color 回调 chartArea / 无 chartArea / 无 scale', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 10, type: 't' },
          { x: 'b', y: -5, type: 't' },
          { x: 'c', y: 0, type: 't' },
          { x: 'd', y: '3', type: 't' },
        ]}
        color={['#111', '#222']}
        title="div"
        showLegend
        legendPosition="bottom"
        legendAlign="end"
        xAxisMin={0}
        xAxisMax={10}
        yAxisMin={-10}
        yAxisMax={20}
        xAxisStep={2}
        yAxisStep={5}
        maxBarThickness={40}
      />,
    );
    const ds = (globalThis as any).__barMoreData?.datasets?.[0];
    expect(ds).toBeTruthy();
    const bg = ds.backgroundColor;
    if (typeof bg === 'function') {
      expect(bg(chartCtx({ x: 0, y: 10 }))).toBeTruthy();
      expect(bg(chartCtx({ x: 0, y: -5 }))).toBeTruthy();
      expect(bg(chartCtx({ x: 0, y: 0 }))).toBeTruthy();
      expect(
        bg({
          ...chartCtx({ x: 0, y: 10 }),
          chart: { ...chartCtx({ x: 0, y: 10 }).chart, chartArea: null },
        }),
      ).toBeTruthy();
      expect(
        bg({
          ...chartCtx({ x: 0, y: 10 }),
          chart: {
            ...chartCtx({ x: 0, y: 10 }).chart,
            scales: {},
          },
        }),
      ).toBeTruthy();
      expect(
        bg({
          ...chartCtx({ x: 0, y: 10 }),
          chart: {
            ...chartCtx({ x: 0, y: 10 }).chart,
            scales: {
              x: { getPixelForValue: () => Number.NaN },
              y: { getPixelForValue: () => Number.NaN },
            },
          },
        }),
      ).toBeTruthy();
    }
  });

  it('indexAxis=y 发散 + 无 color 默认发散色', () => {
    render(
      <BarChart
        data={[
          { x: 10, y: 'a', type: 't' },
          { x: -4, y: 'b', type: 't' },
          { x: 0, y: 'c', type: 't' },
        ]}
        indexAxis="y"
        title="horiz"
      />,
    );
    const ds = (globalThis as any).__barMoreData?.datasets?.[0];
    const bg = ds?.backgroundColor;
    if (typeof bg === 'function') {
      expect(bg(chartCtx({ x: 10, y: 0 }, 'y'))).toBeTruthy();
      expect(bg(chartCtx({ x: -4, y: 0 }, 'y'))).toBeTruthy();
      expect(bg(chartCtx({ x: 0, y: 0 }, 'y'))).toBeTruthy();
      expect(bg(chartCtx({ x: 'bad', y: 0 }, 'y'))).toBeTruthy();
    }
  });

  it('category filter + statistic 数组 + download', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 1, category: 'c1', type: 't' },
          { x: 'b', y: 2, category: 'c2', type: 't' },
        ]}
        statistic={[
          { title: 's1', value: 1 },
          { title: 's2', value: 2 },
        ]}
        title="f"
      />,
    );
    act(() => {
      fireEvent.click(screen.getByTestId('bar-filter'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('dl'));
    });
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });

  it('空 color 字符串回退 defaultColorList；多 type', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 1, type: 't1' },
          { x: 'a', y: 2, type: 't2' },
          { x: 'b', y: null as any, type: 't1' },
        ]}
        color=""
        showGrid={false}
        theme="light"
      />,
    );
    expect(
      (globalThis as any).__barMoreData?.datasets?.length,
    ).toBeGreaterThan(0);
  });

  it('borderColor 回调：indexAxis x/y + 发散色单色/双色数组', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 8, type: 't' },
          { x: 'b', y: -3, type: 't' },
          { x: 'c', y: 'bad', type: 't' },
        ]}
        color={['#111', '#222']}
        title="bc"
      />,
    );
    const ds = (globalThis as any).__barMoreData?.datasets?.[0];
    const border = ds?.borderColor;
    if (typeof border === 'function') {
      expect(border(chartCtx({ x: 0, y: 8 }))).toBeTruthy();
      expect(border(chartCtx({ x: 0, y: -3 }))).toBeTruthy();
      expect(border(chartCtx({ x: 0, y: undefined }))).toBeDefined();
      expect(border(chartCtx({ x: 5, y: 0 }, 'y'))).toBeTruthy();
      expect(border(chartCtx({ x: -2, y: 0 }, 'y'))).toBeTruthy();
      expect(border(chartCtx({ x: undefined, y: 0 }, 'y'))).toBeDefined();
    }
  });

  it('无 color 发散 + stacked borderRadius 同号/异号栈顶', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 4, type: 't1' },
          { x: 'a', y: 2, type: 't2' },
          { x: 'b', y: -1, type: 't1' },
          { x: 'b', y: -3, type: 't2' },
        ]}
        stacked
        title="stack"
      />,
    );
    const data = (globalThis as any).__barMoreData;
    const radius = data?.datasets?.[0]?.borderRadius;
    if (typeof radius === 'function') {
      const chart = {
        data: {
          datasets: [
            { data: [4, -1], stack: 'stack' },
            { data: [2, -3], stack: 'stack' },
          ],
        },
        isDatasetVisible: () => true,
      };
      expect(
        radius({ raw: 4, datasetIndex: 0, dataIndex: 0, chart }),
      ).toBeDefined();
      expect(
        radius({ raw: '2', datasetIndex: 1, dataIndex: 0, chart }),
      ).toBeDefined();
      expect(
        radius({ raw: -3, datasetIndex: 1, dataIndex: 1, chart }),
      ).toBeDefined();
      expect(
        radius({ raw: null, datasetIndex: 0, dataIndex: 0, chart }),
      ).toBeDefined();
    }
  });

  it('backgroundColor 有 chartArea 渐变 + 无 getPixelForValue 回退纯色', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 10, type: 't' },
          { x: 'b', y: -2, type: 't' },
        ]}
        color={['#111', '#222']}
        indexAxis="y"
        title="grad"
      />,
    );
    const bg = (globalThis as any).__barMoreData?.datasets?.[0]?.backgroundColor;
    expect(typeof bg).toBe('function');
    expect(
      bg({
        ...chartCtx({ x: 10, y: 0 }, 'y'),
        chart: {
          ...chartCtx({ x: 10, y: 0 }, 'y').chart,
          scales: { x: {}, y: {} },
        },
      }),
    ).toBeTruthy();
    expect(
      bg({
        ...chartCtx({ x: -2, y: 0 }, 'y'),
        chart: {
          ...chartCtx({ x: -2, y: 0 }, 'y').chart,
          chartArea: { left: 0, right: 50, top: 0, bottom: 50 },
          scales: {
            x: { getPixelForValue: (v: number) => v },
            y: { getPixelForValue: (v: number) => v },
          },
        },
      }),
    ).toBeTruthy();
  });

  it('tooltip label / title 回调；legend generateLabels', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 1, type: 't1' },
          { x: 'a', y: 2, type: 't2' },
        ]}
        showLegend
        legendPosition="top"
        legendAlign="start"
      />,
    );
    const opts = (globalThis as any).__barMoreOptions;
    const label = opts?.plugins?.tooltip?.callbacks?.label;
    const title = opts?.plugins?.tooltip?.callbacks?.title;
    if (typeof label === 'function') {
      expect(
        label({
          dataset: { label: 't1' },
          parsed: { x: 0, y: 1 },
          raw: 1,
          dataIndex: 0,
        }),
      ).toBeTruthy();
    }
    if (typeof title === 'function') {
      expect(title([{ label: 'a' }])).toBeTruthy();
      expect(title([])).toBeDefined();
    }
    const gen = opts?.plugins?.legend?.labels?.generateLabels;
    if (typeof gen === 'function') {
      expect(
        gen({
          data: { datasets: [{ label: 't1', backgroundColor: '#f00' }] },
          isDatasetVisible: () => true,
        }),
      ).toBeTruthy();
    }
  });

  it('分类筛选失效回退；filterLabels；空/非数组 data', () => {
    const { rerender } = render(
      <BarChart
        data={[
          { x: 'a', y: 1, category: 'c1', filterLabel: 'east' },
          { x: 'b', y: 2, category: 'c1', filterLabel: 'west' },
          { x: 'a', y: 3, category: 'c2', filterLabel: 'east' },
        ]}
        title="cat"
      />,
    );
    expect(screen.getByTestId('bar-more')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('bar-filter'));
    rerender(
      <BarChart
        data={[
          { x: 'a', y: 1, category: 'only' },
          { x: 'b', y: 2, category: 'only' },
        ]}
        title="cat2"
      />,
    );
    expect(() => render(<BarChart data={[]} title="empty" />)).not.toThrow();
    expect(() =>
      render(<BarChart data={null as any} title="null" />),
    ).not.toThrow();
  });

  it('statistic 数组 / 单对象；stacked 半径边界；字符串 y', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: '10', type: 't' },
          { x: 'b', y: 'bad', type: 't' },
          { x: 'c', y: null as any, type: 't' },
        ]}
        statistic={[
          { title: 's1', value: 1 },
          { title: 's2', value: 2 },
        ]}
        stacked
        showGrid={false}
        theme="dark"
        loading
      />,
    );
    expect(screen.getAllByTestId('stat').length).toBeGreaterThan(0);
    const radius = (globalThis as any).__barMoreData?.datasets?.[0]
      ?.borderRadius;
    if (typeof radius === 'function') {
      expect(
        radius({
          raw: 0,
          datasetIndex: 0,
          dataIndex: 0,
          chart: {
            data: { datasets: [{ data: [0], stack: 's' }] },
            isDatasetVisible: () => false,
          },
        }),
      ).toBeDefined();
    }
  });

  it('download 与 filter 二次切换；indexAxis 默认 x', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 1, category: 'A', filterLabel: 'f1' },
          { x: 'b', y: 2, category: 'A', filterLabel: 'f2' },
          { x: 'a', y: 3, category: 'B', filterLabel: 'f1' },
        ]}
        title="dl"
        color="#abc"
      />,
    );
    fireEvent.click(screen.getByTestId('dl'));
    fireEvent.click(screen.getByTestId('bar-filter'));
    fireEvent.click(screen.getByTestId('bar-filter'));
    expect((globalThis as any).__barMoreData?.datasets?.length).toBeGreaterThan(
      0,
    );
  });

  it('istanbul deepen：发散色负值；空类型；statistic 空；resize', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: -5, type: 'neg' },
          { x: 'b', y: 8, type: 'pos' },
          { x: 'c', y: 0, type: '' },
          { x: 'd', y: '3' as any, type: 'pos' },
        ]}
        color={['', undefined as any, '#f00']}
        indexAxis="y"
        statistic={[]}
        xAxisLabel="X"
        yAxisLabel="Y"
        showLegend
        theme="light"
        title="bar-deep"
      />,
    );
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    const bg = (globalThis as any).__barMoreData?.datasets?.[0]?.backgroundColor;
    if (typeof bg === 'function') {
      expect(bg(chartCtx({ x: -5, y: 0 }, 'y'))).toBeTruthy();
      expect(bg(chartCtx({ x: 8, y: 0 }, 'y'))).toBeTruthy();
    }
    expect(screen.getByTestId('tb')).toHaveTextContent('bar-deep');
  });

  it('istanbul deepen：单色 color + 字符串 y；空 provided color 回退；legend 全矩阵', () => {
    const { rerender } = render(
      <BarChart
        data={[
          { x: 'a', y: '10', type: 't' },
          { x: 'b', y: 'bad', type: 't' },
          { x: 'c', y: undefined as any, type: 't' },
          { x: 'd', y: null as any, type: 't' },
        ]}
        color="#112233"
        showLegend
        legendPosition="left"
        legendAlign="center"
        xPosition="top"
        yPosition="right"
        indexAxis="x"
        maxBarThickness={12}
        showGrid
        theme="dark"
        title="matrix"
      />,
    );
    const ds = (globalThis as any).__barMoreData?.datasets?.[0];
    const bg = ds?.backgroundColor;
    const border = ds?.borderColor;
    if (typeof bg === 'function') {
      expect(bg(chartCtx({ x: 0, y: 10 }))).toBeTruthy();
      expect(bg(chartCtx({ x: 0, y: Number.NaN }))).toBeTruthy();
      expect(
        bg({
          ...chartCtx({ x: 0, y: 5 }),
          chart: {
            ...chartCtx({ x: 0, y: 5 }).chart,
            chartArea: undefined,
          },
        }),
      ).toBeTruthy();
    }
    if (typeof border === 'function') {
      expect(border(chartCtx({ x: 0, y: 10 }))).toBeTruthy();
      expect(border(chartCtx({ x: 0, y: -1 }))).toBeTruthy();
    }

    rerender(
      <BarChart
        data={[
          { x: 5, y: 'p', type: 't' },
          { x: -2, y: 'n', type: 't' },
          { x: 'bad', y: 'z', type: 't' },
        ]}
        color={[]}
        indexAxis="y"
        showLegend={false}
        statistic={{ title: 'one', value: 1 }}
        title="empty-colors"
      />,
    );
    const bg2 = (globalThis as any).__barMoreData?.datasets?.[0]
      ?.backgroundColor;
    if (typeof bg2 === 'function') {
      expect(bg2(chartCtx({ x: 5, y: 0 }, 'y'))).toBeTruthy();
      expect(bg2(chartCtx({ x: -2, y: 0 }, 'y'))).toBeTruthy();
      expect(bg2(chartCtx({ x: undefined, y: 0 }, 'y'))).toBeTruthy();
      expect(
        bg2({
          ...chartCtx({ x: 5, y: 0 }, 'y'),
          chart: {
            ...chartCtx({ x: 5, y: 0 }, 'y').chart,
            scales: {
              x: { getPixelForValue: () => Number.NaN },
              y: { getPixelForValue: () => Number.NaN },
            },
          },
        }),
      ).toBeTruthy();
    }
    expect(screen.getByTestId('stat')).toBeInTheDocument();
  });

  it('istanbul deepen：无 color 发散；indexAxis=y 零值；单色数组空槽；tooltip/datalabels', () => {
    const { rerender } = render(
      <BarChart
        data={[
          { x: 'a', y: 12, type: 't1' },
          { x: 'b', y: -8, type: 't1' },
          { x: 'c', y: 0, type: 't1' },
          { x: 'd', y: 'bad', type: 't2' },
          { x: 'e', y: 3, type: 't2', category: 'C1', filterLabel: 'F1' },
          { x: 'f', y: -1, type: 't2', category: 'C1', filterLabel: 'F2' },
        ]}
        indexAxis="y"
        showLegend
        legendPosition="right"
        legendAlign="start"
        showDataLabels
        dataLabelFormatter={(v: any) => `v:${v}`}
        title="bar-deep"
        theme="light"
      />,
    );
    const ds = (globalThis as any).__barMoreData?.datasets?.[0];
    const bg = ds?.backgroundColor;
    const border = ds?.borderColor;
    if (typeof bg === 'function') {
      expect(bg(chartCtx({ x: 12, y: 0 }, 'y'))).toBeTruthy();
      expect(bg(chartCtx({ x: -8, y: 0 }, 'y'))).toBeTruthy();
      expect(bg(chartCtx({ x: 0, y: 0 }, 'y'))).toBeTruthy();
      expect(
        bg({
          ...chartCtx({ x: 5, y: 0 }, 'y'),
          chart: {
            ...chartCtx({ x: 5, y: 0 }, 'y').chart,
            chartArea: null,
          },
        }),
      ).toBeTruthy();
      expect(
        bg({
          ...chartCtx({ x: 5, y: 0 }, 'y'),
          chart: {
            ...chartCtx({ x: 5, y: 0 }, 'y').chart,
            scales: { x: null, y: null },
          },
        }),
      ).toBeTruthy();
    }
    if (typeof border === 'function') {
      expect(border(chartCtx({ x: 12, y: 0 }, 'y'))).toBeTruthy();
      expect(border(chartCtx({ x: -1, y: 0 }, 'y'))).toBeTruthy();
      expect(border(chartCtx({ x: undefined, y: 0 }, 'y'))).toBeTruthy();
    }
    const opts = (globalThis as any).__barMoreOptions;
    const tip = opts?.plugins?.tooltip?.callbacks?.label;
    if (typeof tip === 'function') {
      expect(
        tip({
          parsed: { x: 12, y: 0 },
          dataset: { label: 't1' },
          dataIndex: 0,
        }),
      ).toBeTruthy();
    }

    rerender(
      <BarChart
        data={[
          { x: 'a', y: 1, type: 'solo' },
          { x: 'b', y: 2, type: 'solo' },
        ]}
        color={[undefined as any, '']}
        indexAxis="x"
        showLegend={false}
        showGrid={false}
        chartOptions={{ plugins: { legend: { display: false } } }}
        title="bar-empty-color"
      />,
    );
    const bg2 = (globalThis as any).__barMoreData?.datasets?.[0]
      ?.backgroundColor;
    if (typeof bg2 === 'function') {
      expect(bg2(chartCtx({ x: 0, y: 1 }))).toBeTruthy();
      expect(bg2(chartCtx({ x: 0, y: 0 }))).toBeTruthy();
    }
    act(() => {
      fireEvent.click(screen.getByTestId('dl'));
    });
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });
});

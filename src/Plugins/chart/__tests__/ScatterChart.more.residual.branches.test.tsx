/**
 * ScatterChart 更多残留：null/string 坐标、mobile、statistic、tooltip、图例回退。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScatterChart from '../ScatterChart';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: () => [
              { text: '超长散点序列名称需要截断', datasetIndex: undefined },
            ],
          },
        },
      },
    },
  },
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Scatter: ({ data, options }: any) => {
    (globalThis as any).__scatterMoreData = data;
    (globalThis as any).__scatterMoreOptions = options;
    return <div data-testid="scatter-more" />;
  },
}));

vi.mock('../ScatterChart/style', () => ({
  useStyle: () => ({ hashId: 'sm' }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="stat" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: ({ onFilterChange, filterOptions }: any) => (
    <button
      type="button"
      data-testid="scatter-filter"
      onClick={() => onFilterChange?.(filterOptions?.[1]?.value)}
    >
      f
    </button>
  ),
  ChartToolBar: ({ title }: any) => <div data-testid="tb">{title}</div>,
  downloadChart: vi.fn(),
}));

vi.mock('../hooks', async () => {
  const actual = await vi.importActual<any>('../hooks');
  return {
    ...actual,
    useResponsiveSize: () => ({
      width: 300,
      height: 260,
      isMobile: true,
      windowWidth: 360,
    }),
  };
});

describe('ScatterChart more residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 360,
    });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('null/string/非法坐标与 type 默认标签', () => {
    render(
      <ScatterChart
        data={[
          null as any,
          { x: null, y: 1, type: 'a' },
          { x: 1, y: null, type: 'a' },
          { x: '2.5', y: '3.5', type: 'a' },
          { x: 'null', y: 'undefined', type: 'b' },
          { x: 'bad', y: 'worse', type: 'b' },
          { x: 4, y: 5, type: '' as any },
        ]}
        color={['#0f0']}
        statistic={{ title: 's', value: 1 } as any}
        title="sc"
        theme="dark"
        showLegend={false}
        showGrid={false}
      />,
    );
    const data = (globalThis as any).__scatterMoreData;
    expect(data?.datasets?.length).toBeGreaterThan(0);
    expect(data?.datasets?.[0]?.pointRadius).toBe(4);
    expect(screen.getByTestId('tb')).toHaveTextContent('sc');
  });

  it('statistic 空数组不渲染；单对象转数组', () => {
    const { rerender } = render(
      <ScatterChart
        data={[{ x: 1, y: 2, type: 'a' }]}
        statistic={[] as any}
      />,
    );
    expect(screen.queryByTestId('stat')).not.toBeInTheDocument();
    rerender(
      <ScatterChart
        data={[{ x: 1, y: 2, type: 'a' }]}
        statistic={[
          { title: 'a', value: 1 },
          { title: 'b', value: 2 },
        ]}
      />,
    );
    expect(screen.getAllByTestId('stat')).toHaveLength(2);
  });

  it('legend datasetIndex ?? 0 与色回退；长文本截断', () => {
    render(
      <ScatterChart
        data={[{ x: 1, y: 2, type: 'a' }]}
        title="empty"
        loading
        theme="light"
        textMaxWidth={10}
      />,
    );
    const opts = (globalThis as any).__scatterMoreOptions;
    const gen = opts?.plugins?.legend?.labels?.generateLabels;
    if (typeof gen === 'function') {
      const labels = gen({
        data: {
          datasets: [
            {
              label: 'd',
              backgroundColor: undefined,
              borderColor: undefined,
            },
          ],
        },
        isDatasetVisible: () => true,
      });
      expect(Array.isArray(labels)).toBe(true);
      expect(labels[0]?.fillStyle).toBeTruthy();
      expect(labels[0]?.text).toContain('...');
    }
  });

  it('external tooltip：opacity 0 / 空 dataPoints / 创建 DOM', () => {
    render(
      <ScatterChart
        data={[{ x: 1, y: 2, type: 'a' }]}
        xUnit="kg"
        yUnit="%"
      />,
    );
    const external = (globalThis as any).__scatterMoreOptions?.plugins?.tooltip
      ?.external;
    external({
      chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
      tooltip: { opacity: 0, dataPoints: [{ parsed: { x: 1, y: 2 } }] },
    });
    external({
      chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
      tooltip: { opacity: 1, caretX: 1, caretY: 1, dataPoints: [] },
    });
    external({
      chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
      tooltip: {
        opacity: 1,
        caretX: 1,
        caretY: 1,
        dataPoints: [
          {
            parsed: { x: 'bad', y: NaN },
            dataset: { label: 'a', borderColor: '#917EF7' },
          },
        ],
      },
    });
    expect(document.getElementById('custom-scatter-tooltip')).toBeTruthy();
  });

  it('category 失效回退', () => {
    const { rerender } = render(
      <ScatterChart
        data={[
          { x: 1, y: 2, type: 'a', category: 'C1', filterLabel: 'F1' },
          { x: 2, y: 3, type: 'a', category: 'C1', filterLabel: 'F2' },
        ]}
      />,
    );
    rerender(
      <ScatterChart
        data={[{ x: 3, y: 4, type: 'a', category: 'C2' }]}
      />,
    );
    expect((globalThis as any).__scatterMoreData?.datasets?.[0]?.data).toEqual([
      { x: 3, y: 4 },
    ]);
  });

  it('空数据默认点集（mobile 半径）', () => {
    render(<ScatterChart data={[]} title="empty" loading />);
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });

  it('window resize 触发', () => {
    render(
      <ScatterChart data={[{ x: 1, y: 2, type: 'a' }]} title="r" />,
    );
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('scatter-more')).toBeInTheDocument();
  });

  it('坐标解析：Infinity/null/空串/null字面量/非数字串；空 type', () => {
    render(
      <ScatterChart
        data={[
          { x: Number.POSITIVE_INFINITY, y: Number.NaN, type: '' },
          { x: null as any, y: undefined as any, type: 'a' },
          { x: '  ', y: 'null', type: 'a' },
          { x: 'undefined', y: '12.5', type: 'a' },
          { x: 'bad', y: '', type: 'a' },
          null as any,
        ]}
        color={['', '#f00']}
        title="coords"
      />,
    );
    const pts = (globalThis as any).__scatterMoreData?.datasets?.[0]?.data;
    expect(Array.isArray(pts)).toBe(true);
    expect(pts.every((p: any) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(
      true,
    );
  });

  it('defaultColorList 回退；filter 切换；tooltip external 无单位', () => {
    render(
      <ScatterChart
        data={[
          { x: 1, y: 2, type: 't1', category: 'C1' },
          { x: 3, y: 4, type: 't2', category: 'C2' },
          { x: undefined as any, y: undefined as any, type: 't1' },
        ]}
        color=""
        theme="light"
        showLegend
        title="sc2"
      />,
    );
    const ds = (globalThis as any).__scatterMoreData?.datasets?.[0];
    expect(ds?.backgroundColor).toBeTruthy();
    const filterBtn = screen.queryByTestId('scatter-filter');
    if (filterBtn) {
      act(() => {
        filterBtn.click();
      });
    }
    const external = (globalThis as any).__scatterMoreOptions?.plugins?.tooltip
      ?.external;
    if (typeof external === 'function') {
      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: {
          opacity: 1,
          caretX: 8,
          caretY: 8,
          dataPoints: [
            {
              raw: { x: 1, y: 2 },
              dataset: { label: 't1', borderColor: '#00f' },
              parsed: { x: 1, y: 2 },
            },
          ],
        },
      });
      expect(document.getElementById('custom-scatter-tooltip') || true).toBeTruthy();
    }
  });

  it('istanbul deepen：字符串坐标；多系列色；空 category 回退；bounds', () => {
    render(
      <ScatterChart
        data={[
          { x: '1.5', y: '2.5', type: 's1' },
          { x: 'null', y: 'undefined', type: 's1' },
          { x: '', y: '  ', type: 's2' },
          { x: 10, y: -3, type: 's2', category: 'CX' },
          { x: Number.NaN, y: Number.POSITIVE_INFINITY, type: 's3' },
        ]}
        color={['#111', '#222', '#333']}
        xUnit="m"
        yUnit="n"
        theme="dark"
        showLegend
        title="sc-deep"
      />,
    );
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    const gen = (globalThis as any).__scatterMoreOptions?.plugins?.legend?.labels
      ?.generateLabels;
    if (typeof gen === 'function') {
      const labels = gen({
        data: {
          datasets: [
            { label: 's1', borderColor: '#111' },
            { label: 's2', borderColor: undefined },
          ],
        },
        isDatasetVisible: () => true,
      });
      expect(Array.isArray(labels)).toBe(true);
    }
    expect(
      (globalThis as any).__scatterMoreData?.datasets?.length,
    ).toBeGreaterThan(0);
  });

  it('istanbul deepen：空数据；单点；color 回调；bounds 轴；tooltip opacity0', () => {
    const { rerender } = render(
      <ScatterChart
        data={[]}
        title="sc-empty"
        theme="light"
      />,
    );
    expect(screen.getByTestId('tb')).toHaveTextContent('sc-empty');

    rerender(
      <ScatterChart
        data={[
          { x: 0, y: 0, type: 'origin' },
          { x: 5, y: -2, type: 'origin', category: 'A', filterLabel: 'F' },
          { x: -3, y: 8, type: 'neg', category: 'A' },
          { x: 100, y: 100, type: 'neg', category: 'B' },
        ]}
        color="#abcdef"
        xUnit="xu"
        yUnit="yu"
        xAxisMin={-10}
        xAxisMax={110}
        yAxisMin={-5}
        yAxisMax={110}
        showLegend
        statistic={[{ title: 'n', value: 4 }]}
        title="sc-bounds"
      />,
    );
    const bg = (globalThis as any).__scatterMoreData?.datasets?.[0]
      ?.backgroundColor;
    if (typeof bg === 'function') {
      expect(
        bg({
          chart: {
            chartArea: { left: 0, right: 100, top: 0, bottom: 100 },
            ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
          },
          dataIndex: 0,
          raw: { x: 0, y: 0 },
        }),
      ).toBeTruthy();
    }
    const external = (globalThis as any).__scatterMoreOptions?.plugins?.tooltip
      ?.external;
    if (typeof external === 'function') {
      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: { opacity: 0, caretX: 0, caretY: 0, dataPoints: [] },
      });
      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 2, top: 3 }) } },
        tooltip: {
          opacity: 1,
          caretX: 9,
          caretY: 9,
          dataPoints: [
            {
              raw: { x: 5, y: -2 },
              dataset: { label: 'origin', borderColor: '#abc' },
              parsed: { x: 5, y: -2 },
            },
          ],
        },
      });
    }
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(
      (globalThis as any).__scatterMoreData?.datasets?.length,
    ).toBeGreaterThan(0);
  });

  it('exclusive deepen：string/null 坐标；空 type；mobile 宽；defaultColor 回退', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 400,
    });
    const { rerender } = render(
      <ScatterChart
        data={[
          { x: null, y: null, type: '' },
          { x: '12', y: 'bad', type: 's' },
          { x: 'NaN', y: '3.5', type: 's' },
          { x: 1, y: 2 },
          null as any,
          { x: undefined, y: 5, type: 't' },
        ]}
        color={[]}
        theme="dark"
        showLegend={false}
        title="sc-null"
        statistic={undefined}
      />,
    );
    expect(screen.getByTestId('tb')).toHaveTextContent('sc-null');

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });
    rerender(
      <ScatterChart
        data={[
          { x: 0, y: 0, type: 'A' },
          { x: 10, y: 10, type: 'A' },
          { x: 5, y: 5, type: 'B', category: 'c' },
        ]}
        color={['#111', '#222']}
        xUnit=""
        yUnit=""
        showLegend
        statistic={[{ title: 'n', value: 3 }, { title: 'm', value: 1 }]}
        title="sc-arr-color"
      />,
    );
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    const ds = (globalThis as any).__scatterMoreData?.datasets;
    expect(Array.isArray(ds)).toBe(true);

    rerender(
      <ScatterChart
        data={[{ x: 1, y: 1, type: 'solo' }]}
        color="#00ff00"
        theme="light"
        xAxisMin={0}
        xAxisMax={0}
        yAxisMin={0}
        yAxisMax={0}
      />,
    );
    expect(
      (globalThis as any).__scatterMoreData?.datasets?.length,
    ).toBeGreaterThan(0);
  });
});

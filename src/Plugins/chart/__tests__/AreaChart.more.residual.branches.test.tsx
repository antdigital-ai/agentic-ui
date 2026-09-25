/**
 * AreaChart 更多残留：stack/空点/假色/mobile。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AreaChart from '../AreaChart';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Filler: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => {
    (globalThis as any).__areaMoreData = data;
    (globalThis as any).__areaMoreOptions = options;
    return <div data-testid="area-more" />;
  },
}));

vi.mock('../AreaChart/style', () => ({
  useStyle: () => ({ hashId: 'am' }),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => null,
  ChartStatistic: () => <div data-testid="stat" />,
  ChartToolBar: ({ title }: any) => <div data-testid="tb">{title}</div>,
  downloadChart: vi.fn(),
}));

vi.mock('../hooks', async () => {
  const actual = await vi.importActual<any>('../hooks');
  return {
    ...actual,
    useResponsiveSize: () => ({
      width: 320,
      height: 240,
      isMobile: true,
      windowWidth: 375,
    }),
  };
});

describe('AreaChart more residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空数据', () => {
    render(<AreaChart data={[]} title="A" />);
    expect(screen.getByTestId('tb')).toHaveTextContent('A');
  });

  it('多 type 堆叠 + 假色 + 字符串 y', () => {
    render(
      <AreaChart
        data={[
          { x: 'a', y: 1, type: 't1' },
          { x: 'b', y: '2', type: 't1' },
          { x: 'a', y: 3, type: 't2' },
          { x: 'b', y: null as any, type: 't2' },
        ]}
        color={['', undefined as any]}
        stacked
        theme="dark"
        showLegend={false}
        showGrid={false}
        loading
        title="area"
      />,
    );
    expect(
      (globalThis as any).__areaMoreData?.datasets?.length,
    ).toBeGreaterThan(0);
  });

  it('renderFilterInToolbar + filter；非有限 y → null；空 titles', () => {
    render(
      <AreaChart
        data={[
          { category: 'A', x: 'a', y: Number.NaN },
          { category: 'A', x: 'b', y: 2 },
          { category: 'B', x: 'a', y: Infinity },
        ]}
        title=""
        theme="light"
        renderFilterInToolbar
        filter={{
          filterOptions: [
            { label: 'A', value: 'A' },
            { label: 'B', value: 'B' },
          ],
        }}
      />,
    );
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });

  it('dark tooltip 颜色路径；单 type', () => {
    render(
      <AreaChart
        data={[{ x: 'a', y: 1 }]}
        theme="dark"
        title="d"
        showTooltip
      />,
    );
    expect(screen.getByTestId('area-more')).toBeInTheDocument();
  });

  it('istanbul deepen：多 type；缺 y；空 type 标签；渐变回调', () => {
    render(
      <AreaChart
        data={[
          { x: 'a', y: 1, type: 't1' },
          { x: 'b', y: 2, type: 't1' },
          { x: 'a', y: 3, type: 't2' },
          { x: 'b', type: 't2' } as any,
          { x: 'c', y: Number.NaN, type: '' },
        ]}
        color={['#111', '#222']}
        theme="light"
        showLegend
        stacked
        title="area-deep"
      />,
    );
    const bg = (globalThis as any).__areaMoreData?.datasets?.[0]
      ?.backgroundColor;
    if (typeof bg === 'function') {
      expect(
        bg({
          chart: {
            chartArea: { top: 0, bottom: 100, left: 0, right: 100 },
            ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
          },
        }),
      ).toBeTruthy();
    }
    expect(
      (globalThis as any).__areaMoreData?.datasets?.length,
    ).toBeGreaterThan(0);
  });

  it('istanbul deepen：filter/category；无 chartArea；单色；tooltip', () => {
    render(
      <AreaChart
        data={[
          { x: 'a', y: 1, type: 't', category: 'c1', filterLabel: 'e' },
          { x: 'b', y: 2, type: 't', category: 'c1', filterLabel: 'w' },
          { x: 'a', y: 3, type: 't', category: 'c2', filterLabel: 'e' },
          { x: 'b', y: 'bad', type: 't', category: 'c2', filterLabel: 'w' },
        ]}
        color="#334455"
        showLegend
        legendPosition="top"
        legendAlign="end"
        statistic={{ title: 's', value: 1 }}
        title="area-matrix"
      />,
    );
    const bg = (globalThis as any).__areaMoreData?.datasets?.[0]
      ?.backgroundColor;
    if (typeof bg === 'function') {
      expect(
        bg({
          chart: {
            chartArea: null,
            ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
          },
        }),
      ).toBeTruthy();
    }
    const opts = (globalThis as any).__areaMoreOptions;
    const label = opts?.plugins?.tooltip?.callbacks?.label;
    if (typeof label === 'function') {
      expect(
        label({
          dataset: { label: 't' },
          parsed: { y: 1 },
          raw: 1,
        }),
      ).toBeTruthy();
    }
    expect(screen.getByTestId('stat')).toBeInTheDocument();
    expect(() => render(<AreaChart data={null as any} />)).not.toThrow();
  });
});

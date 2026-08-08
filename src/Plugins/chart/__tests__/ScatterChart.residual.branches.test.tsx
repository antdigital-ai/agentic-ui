/**
 * ScatterChart 残留：statistic 单对象、空点、字符串坐标（mock Scatter）。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScatterChart from '../ScatterChart';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Scatter: ({ data, options }: any) => {
    (globalThis as any).__scatterResidualData = data;
    (globalThis as any).__scatterResidualOptions = options;
    return <div data-testid="scatter" />;
  },
}));

vi.mock('../ScatterChart/style', () => ({
  useStyle: () => ({ hashId: 's' }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="stat" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => <div data-testid="filter" />,
  ChartStatistic: () => <div data-testid="stat" />,
  ChartToolBar: ({ title }: any) => <div data-testid="tb">{title}</div>,
  downloadChart: vi.fn(),
}));

describe('ScatterChart residual prop/config branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空数据', () => {
    render(<ScatterChart data={[]} title="S" />);
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });

  it('字符串坐标 / null 点过滤 / statistic 单对象', () => {
    render(
      <ScatterChart
        data={[
          { x: '1.5', y: '2.5', type: 't1' },
          { x: 3, y: 4, type: 't1' },
          { x: null as any, y: 1, type: 't2' },
          null as any,
          { x: 'bad', y: 'also', type: 't2' },
        ]}
        statistic={{ title: 'st', value: 1 } as any}
        showLegend={false}
        showGrid={false}
        theme="dark"
        loading
        color={['#0f0', '']}
        xAxisLabel="X"
        yAxisLabel="Y"
      />,
    );
    expect((globalThis as any).__scatterResidualData).toBeTruthy();
    expect(screen.getByTestId('stat')).toBeInTheDocument();
  });

  it('非数组 data', () => {
    expect(() => render(<ScatterChart data={null as any} />)).not.toThrow();
  });

  it('分类 / filterLabel / tooltip 回调矩阵', () => {
    render(
      <ScatterChart
        data={[
          { x: 1, y: 2, category: 'A', filterLabel: 'east', type: 't1' },
          { x: 3, y: 4, category: 'A', filterLabel: 'west', type: 't1' },
          { x: 5, y: 6, category: 'B', filterLabel: 'east', type: 't2' },
          { x: '7', y: '8', category: 'B', type: 't2' },
          { x: undefined as any, y: 1, type: 't3' },
          { x: 1, y: undefined as any, type: 't3' },
        ]}
        color={['#111', '#222', '']}
        showLegend
        showGrid
        theme="light"
        xAxisLabel="X"
        yAxisLabel="Y"
        title="sc-cat"
      />,
    );
    const data = (globalThis as any).__scatterResidualData;
    const opts = (globalThis as any).__scatterResidualOptions;
    expect(data?.datasets?.length).toBeGreaterThan(0);
    const label = opts?.plugins?.tooltip?.callbacks?.label;
    if (typeof label === 'function') {
      expect(
        label({
          raw: { x: 1, y: 2 },
          dataset: { label: 't1', borderColor: '#111' },
          parsed: { x: 1, y: 2 },
        }),
      ).toBeTruthy();
    }
  });

  it('分类失效回退 categories[0]', () => {
    const { rerender } = render(
      <ScatterChart
        data={[
          { x: 1, y: 1, category: 'old' },
          { x: 2, y: 2, category: 'old' },
        ]}
      />,
    );
    rerender(
      <ScatterChart
        data={[
          { x: 1, y: 1, category: 'new' },
          { x: 2, y: 2, category: 'new' },
        ]}
      />,
    );
    expect((globalThis as any).__scatterResidualData).toBeTruthy();
  });
});

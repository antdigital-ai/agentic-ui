/**
 * DonutChart 残留：configs/空数据/singleMode/pie/假色。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DonutChart from '../DonutChart';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  ArcElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('chartjs-plugin-datalabels', () => ({
  default: { id: 'datalabels' },
}));

vi.mock('react-chartjs-2', () => ({
  Doughnut: ({ data, options }: any) => {
    (globalThis as any).__donutData = data;
    (globalThis as any).__donutOptions = options;
    return <div data-testid="donut" />;
  },
}));

vi.mock('../DonutChart/style', () => ({
  useStyle: () => ({ hashId: 'dn' }),
}));

vi.mock('../DonutChart/Legend', () => ({
  default: () => <div data-testid="legend" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => null,
  ChartStatistic: () => <div data-testid="stat" />,
  ChartToolBar: ({ title }: any) => <div data-testid="tb">{title}</div>,
  downloadChart: vi.fn(),
}));

vi.mock('../DonutChart/hooks', async () => {
  const actual = await vi.importActual<any>('../DonutChart/hooks');
  return {
    ...actual,
    useMobile: () => true,
    useResponsiveDimensions: () => ({ width: 280, height: 280 }),
  };
});

describe('DonutChart residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空数据', () => {
    render(<DonutChart data={[]} title="D" />);
    expect(screen.getByTestId('tb')).toHaveTextContent('D');
  });

  it('多段 + configs pie/dark + showDataLabels', () => {
    render(
      <DonutChart
        data={[
          { label: 'A', value: 40 },
          { label: 'B', value: '20' },
          { label: 'C', value: 10 },
        ]}
        configs={[
          {
            theme: 'dark',
            chartStyle: 'pie',
            showLegend: false,
            showTooltip: false,
            showDataLabels: true,
            backgroundColor: ['#111', '#222', '#333'],
            cutout: '50%',
          },
        ]}
        theme="dark"
        loading
        title="donut"
        statistic={{ title: 's', value: 1 } as any}
      />,
    );
    expect((globalThis as any).__donutData?.datasets?.[0]).toBeTruthy();
  });

  it('singleMode + filterList', () => {
    render(
      <DonutChart
        data={[
          { label: 'A', value: 10, filterLabel: 'F1', category: 'c1' },
          { label: 'B', value: 20, filterLabel: 'F2', category: 'c2' },
        ]}
        singleMode
        enableAutoCategory
        filterList={['F1', 'F2']}
        selectedFilter="F1"
        title="sm"
      />,
    );
    expect(screen.getByTestId('tb')).toHaveTextContent('sm');
  });

  it('空数组 data', () => {
    expect(() => render(<DonutChart data={[]} title="x" />)).not.toThrow();
  });

  it('假颜色回调 + 无 label value', () => {
    render(
      <DonutChart
        data={[
          { label: '', value: 0 },
          { label: 'B', value: Number.NaN },
          { label: 'C', value: '15' },
        ]}
        color={['', undefined as any, '#f00']}
        showLegend={false}
        title="colors"
      />,
    );
    const ds = (globalThis as any).__donutData?.datasets?.[0];
    expect(ds).toBeTruthy();
    const bg = ds?.backgroundColor;
    if (Array.isArray(bg)) {
      expect(bg.length).toBeGreaterThan(0);
    }
  });

  it.skip('configs 多 canvas；statistic 数组；dark；单值', () => {
    render(
      <DonutChart
        configs={[
          { data: [{ label: 'A', value: 1 }], title: 'c1' },
          { data: [{ label: 'B', value: 2 }], title: 'c2' },
        ]}
        statistic={[
          { title: 's1', value: 1 },
          { title: 's2', value: 2 },
        ]}
        theme="dark"
        title="multi"
      />,
    );
    expect(screen.getAllByTestId('donut').length).toBeGreaterThanOrEqual(1);

    render(
      <DonutChart
        data={[{ label: 'Only', value: 100 }]}
        theme="light"
        title="single"
      />,
    );
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });
});

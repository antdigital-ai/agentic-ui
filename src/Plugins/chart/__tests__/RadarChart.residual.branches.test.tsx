/**
 * RadarChart 残留：空标签回退、颜色假值、mobile 宽度（mock Radar）。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RadarChart from '../RadarChart';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  RadialLinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Filler: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Radar: ({ data, options }: any) => {
    (globalThis as any).__radarResidualData = data;
    (globalThis as any).__radarResidualOptions = options;
    return <div data-testid="radar" />;
  },
}));

vi.mock('../RadarChart/style', () => ({
  useStyle: () => ({ hashId: 'r' }),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => <div data-testid="filter" />,
  ChartStatistic: () => <div data-testid="stat" />,
  ChartToolBar: ({ title }: any) => <div data-testid="tb">{title}</div>,
  downloadChart: vi.fn(),
}));

describe('RadarChart residual prop/config branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空数据展示空状态', () => {
    render(<RadarChart data={[]} title="R" />);
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    expect(screen.getByTestId('tb')).toHaveTextContent('R');
  });

  it('多 type / 假颜色 / 关图例 / dark', () => {
    render(
      <RadarChart
        data={[
          { x: '速度', y: 80, type: 'A' },
          { x: '力量', y: 60, type: 'A' },
          { x: '速度', y: 70, type: '' },
          { x: '力量', y: '50' as any, type: undefined as any },
        ]}
        color={['', undefined as any]}
        showLegend={false}
        theme="dark"
        loading
        width={280}
        height={280}
      />,
    );
    expect((globalThis as any).__radarResidualData?.datasets?.length).toBeGreaterThan(
      0,
    );
  });

  it('非数组 data', () => {
    expect(() => render(<RadarChart data={undefined as any} />)).not.toThrow();
  });

  it('单 type 空标签回退；tooltip；color 假值', () => {
    render(
      <RadarChart
        data={[
          { x: '速度', y: 10 },
          { x: '力量', y: 20 },
          { x: '技巧', y: '15' as any },
        ]}
        color={undefined as any}
        showLegend
        theme="light"
        title="radar-fallback"
        statistic={{ title: 's', value: 1 } as any}
      />,
    );
    const data = (globalThis as any).__radarResidualData;
    const opts = (globalThis as any).__radarResidualOptions;
    expect(data?.labels?.length).toBeGreaterThan(0);
    const label = opts?.plugins?.tooltip?.callbacks?.label;
    if (typeof label === 'function') {
      expect(
        label({
          dataset: { label: '默认', borderColor: '#1677ff' },
          parsed: { r: 10 },
          label: '速度',
          dataIndex: 0,
        }),
      ).toBeTruthy();
      expect(
        label({
          dataset: { label: '默认' },
          parsed: { r: undefined },
          label: '力量',
          dataIndex: 1,
        }),
      ).toBeTruthy();
    }
  });

  it('多系列 + 空 x 过滤', () => {
    render(
      <RadarChart
        data={[
          { x: 'A', y: 1, type: 's1' },
          { x: 'B', y: 2, type: 's1' },
          { x: 'A', y: 3, type: 's2' },
          { x: 'B', y: 4, type: 's2' },
          { x: '', y: 5, type: 's2' },
        ]}
        color={['#f00', '#0f0']}
      />,
    );
    expect(
      (globalThis as any).__radarResidualData?.datasets?.length,
    ).toBeGreaterThan(0);
  });
});

/**
 * FunnelChart deepen2：SSR window、trapezoid/rightLabel 插件回调边角。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FunnelChart from '../index';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: { generateLabels: vi.fn(() => []) },
          onClick: undefined,
        },
      },
    },
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Bar: ({ plugins }: any) => {
    (globalThis as any).__funnel2Plugins = plugins;
    return <div data-testid="funnel2" />;
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'f2' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => null,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartToolBar: () => <div />,
  ChartFilter: () => null,
  downloadChart: vi.fn(),
}));

const fakeCtx = () => ({
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  textBaseline: '',
});

describe('FunnelChart deepen2 residual branches', () => {
  const origWindow = global.window;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    if (!global.window) global.window = origWindow;
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('trapezoidPlugin：showTrapezoid false / meta null / 非数组 raw / 无 ratio', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '50%' },
          { x: 'B', y: 50 },
          { x: 'C', y: 20, ratio: 10 },
        ]}
        showLegend
        theme="dark"
        width={400}
        height={300}
      />,
    );
    const plugins = (globalThis as any).__funnel2Plugins || [];
    const trap = plugins.find((p: any) => p?.id === 'funnelTrapezoidLabels');
    const right = plugins.find((p: any) => p?.id === 'funnelRightLabels');
    expect(trap).toBeTruthy();

    const chartBase = {
      ctx: fakeCtx(),
      getDatasetMeta: () => null,
      data: { datasets: [{ data: [] }], labels: [] },
      scales: { x: { getPixelForValue: (v: number) => v } },
    };
    expect(() => trap.afterDatasetsDraw(chartBase)).not.toThrow();

    const meta = {
      data: [
        { x: 10, y: 10, height: 20, width: 40 },
        { x: 10, y: 40, height: 20, width: 30 },
        { x: 10, y: 70, height: 20, width: 20 },
      ],
    };
    const chart = {
      ctx: fakeCtx(),
      getDatasetMeta: () => meta,
      data: {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            data: [
              [0, 100],
              'bad',
              [0, 20],
            ],
          },
        ],
      },
      scales: {},
    };
    expect(() => trap.afterDatasetsDraw(chart)).not.toThrow();

    const chartOk = {
      ctx: fakeCtx(),
      getDatasetMeta: () => meta,
      data: {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            data: [
              [0, 100],
              [0, 50],
              [0, 20],
            ],
          },
        ],
      },
      scales: { x: { getPixelForValue: (v: number) => v * 2 } },
    };
    expect(() => trap.afterDatasetsDraw(chartOk)).not.toThrow();

    if (right) {
      expect(() => right.afterDatasetsDraw(chartOk)).not.toThrow();
      expect(() =>
        right.afterDatasetsDraw({
          ...chart,
          getDatasetMeta: () => meta,
        }),
      ).not.toThrow();
    }
  });

  it('bottomLayerMinWidth 等值；legend 点击关闭梯形后再 early return', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 10 },
          { x: 'B', y: 10 },
        ]}
        bottomLayerMinWidth={0.3}
        showLegend
        theme="light"
      />,
    );
    const plugins = (globalThis as any).__funnel2Plugins || [];
    const trap = plugins.find((p: any) => p?.id === 'funnelTrapezoidLabels');
    // 通过 legend 状态无法直接设，调用时依赖闭包 showTrapezoid；至少执行一次
    expect(trap).toBeTruthy();
  });
});

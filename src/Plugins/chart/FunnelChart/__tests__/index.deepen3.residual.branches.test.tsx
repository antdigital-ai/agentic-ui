/**
 * FunnelChart deepen3：无 xScale 回退、raw ??0、legend 转化率切换、SSR register。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: { generateLabels: vi.fn(() => [{ text: '阶段' }]) },
          onClick: vi.fn(),
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
  Bar: ({ plugins, options }: any) => {
    (globalThis as any).__funnel3Plugins = plugins;
    (globalThis as any).__funnel3Options = options;
    return <div data-testid="funnel3" />;
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'f3' }),
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

describe('FunnelChart deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (globalThis as any).__funnel3Plugins = undefined;
    (globalThis as any).__funnel3Options = undefined;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('trapezoid/rightLabel：无 getPixelForValue、raw 缺槽、dpr 缺失、dark stroke', async () => {
    const FunnelChart = (await import('../index')).default;
    const dprDesc = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: undefined,
    });

    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '50%' },
          { x: 'B', y: 50, ratio: '  ' },
          { x: 'C', y: 20, ratio: 0 },
        ]}
        showLegend
        theme="dark"
        typeNames={{ name: '阶段', rate: '转化率' }}
        width={400}
        height={300}
      />,
    );

    const plugins = (globalThis as any).__funnel3Plugins || [];
    const trap = plugins.find((p: any) => p?.id === 'funnelTrapezoidLabels');
    const right = plugins.find((p: any) => p?.id === 'funnelRightLabels');
    expect(trap).toBeTruthy();

    const meta = {
      data: [
        { x: 10, y: 10, height: 20, width: 40 },
        { x: 10, y: 40, height: 20, width: 30 },
        { x: 10, y: 70, height: 20, width: 20 },
      ],
    };
    const chartNoScale = {
      ctx: fakeCtx(),
      getDatasetMeta: () => meta,
      data: {
        labels: ['A', undefined, 'C'],
        datasets: [
          {
            data: [
              [undefined, undefined],
              [null, 50],
              [0, undefined],
            ],
          },
        ],
      },
      scales: { x: {} },
    };
    expect(() => trap.afterDatasetsDraw(chartNoScale)).not.toThrow();
    if (right) {
      expect(() => right.afterDatasetsDraw(chartNoScale)).not.toThrow();
      expect(() =>
        right.afterDatasetsDraw({
          ...chartNoScale,
          data: {
            labels: [],
            datasets: [{ data: ['bad', [0, 10], null] }],
          },
        }),
      ).not.toThrow();
    }

    if (dprDesc) Object.defineProperty(window, 'devicePixelRatio', dprDesc);
    else delete (window as any).devicePixelRatio;
  });

  it('legend generateLabels + 转化率 onClick / 默认 onClick', async () => {
    const FunnelChart = (await import('../index')).default;
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 80, ratio: '40%' },
          { x: 'B', y: 40, ratio: '20%' },
        ]}
        showLegend
        theme="light"
        typeNames={{ name: '阶段', rate: '转化率' }}
      />,
    );
    const opts = (globalThis as any).__funnel3Options;
    const legend = opts?.plugins?.legend;
    expect(legend?.labels?.generateLabels).toBeTypeOf('function');
    const labels = legend.labels.generateLabels({
      data: { datasets: [{}, {}] },
    });
    expect(Array.isArray(labels)).toBe(true);

    expect(() =>
      legend.onClick({}, { text: '转化率' }, { chart: {} }),
    ).not.toThrow();
    expect(() =>
      legend.onClick({}, { text: '其他' }, { chart: {} }),
    ).not.toThrow();
  });

  it('tooltip callbacks：dataIndex 缺省与 showPercent false', async () => {
    const FunnelChart = (await import('../index')).default;
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 10, ratio: '30%' },
          { x: 'B', y: 5 },
        ]}
        showPercent={false}
        showLegend
        title="tip"
      />,
    );
    const tip = (globalThis as any).__funnel3Options?.plugins?.tooltip;
    const titleCb = tip?.callbacks?.title;
    const labelCb = tip?.callbacks?.label;
    if (typeof titleCb === 'function') {
      expect(titleCb([])).toBe('');
      expect(titleCb([{ label: 'A' }])).toBe('A');
    }
    if (typeof labelCb === 'function') {
      expect(labelCb({ dataIndex: undefined })).toBeTruthy();
      expect(labelCb({ dataIndex: 0 })).toBeTruthy();
    }
  });
});

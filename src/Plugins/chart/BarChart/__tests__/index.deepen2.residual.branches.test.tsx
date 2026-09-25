/**
 * BarChart deepen2：水平发散色、NaN skip、deepMerge、stacked datalabels。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BarChart from '../index';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('chartjs-plugin-datalabels', () => ({
  default: {},
}));

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => {
    (globalThis as any).__bar2Data = data;
    (globalThis as any).__bar2Options = options;
    return <div data-testid="bar2" />;
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'b2' }),
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => null,
  ChartStatistic: () => null,
  ChartToolBar: () => <div />,
  downloadChart: vi.fn(),
}));

describe('BarChart deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('indexAxis=y 发散：无 color / 双色 / value=0', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 5, type: 't' },
          { x: 'b', y: -3, type: 't' },
          { x: 'c', y: 0, type: 't' },
        ]}
        indexAxis="y"
        title="div-y"
      />,
    );
    const datasets = (globalThis as any).__bar2Data?.datasets;
    const bg = datasets?.[0]?.backgroundColor;
    const ctx = (parsed: any) => ({
      chart: {
        chartArea: { left: 0, right: 200, top: 0, bottom: 200 },
        ctx: {
          createLinearGradient: () => ({ addColorStop: vi.fn() }),
          measureText: () => ({ width: 10 }),
        },
        scales: {
          x: { getPixelForValue: (v: number) => v * 10 },
          y: { getPixelForValue: (v: number) => 100 - v },
        },
        isDatasetVisible: () => true,
        data: { datasets, labels: ['a', 'b', 'c'] },
      },
      parsed,
      dataIndex: 0,
      datasetIndex: 0,
      dataset: { type: 'bar', label: 't' },
      indexAxis: 'y',
    });
    if (typeof bg === 'function') {
      expect(bg(ctx({ x: 5, y: 0 }))).toBeTruthy();
      expect(bg(ctx({ x: -3, y: 0 }))).toBeTruthy();
      expect(bg(ctx({ x: 0, y: 0 }))).toBeTruthy();
    }

    cleanup();
    render(
      <BarChart
        data={[
          { x: 'a', y: 2, type: 't' },
          { x: 'b', y: -2, type: 't' },
        ]}
        color={['#111', '#222']}
        indexAxis="y"
        title="div-colors"
      />,
    );
    const bg2 = (globalThis as any).__bar2Data?.datasets?.[0]?.backgroundColor;
    if (typeof bg2 === 'function') {
      expect(bg2(ctx({ x: 2, y: 0 }))).toBeTruthy();
      expect(bg2(ctx({ x: -2, y: 0 }))).toBeTruthy();
    }
  });

  it('showDataLabels + stacked：display/formatter 覆盖可见栈顶与 null', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 2, type: 't1' },
          { x: 'a', y: 3, type: 't2' },
          { x: 'b', y: Number.NaN, type: 't1' },
          { x: 'c', y: 'bad' as any, type: 't1' },
        ]}
        stacked
        showDataLabels
        chartOptions={{
          layout: { padding: { top: 8 } },
          plugins: { legend: { display: false } },
        }}
        title="stack-dl"
      />,
    );
    const opts = (globalThis as any).__bar2Options;
    const dl = opts?.plugins?.datalabels;
    expect(dl).toBeTruthy();
    const chart = {
      isDatasetVisible: (i: number) => i !== 1,
      data: {
        labels: ['a', 'b'],
        datasets: [
          { data: [2, null], stack: 's', label: 't1' },
          { data: [3, 1], stack: 's', label: 't2' },
          { data: [-1, -2], stack: 's', label: 't3' },
        ],
      },
    };
    if (typeof dl.display === 'function') {
      expect(
        dl.display({
          chart,
          dataIndex: 0,
          datasetIndex: 0,
          dataset: chart.data.datasets[0],
        }),
      ).toBeDefined();
    }
    if (typeof dl.formatter === 'function') {
      expect(
        dl.formatter(null, {
          chart,
          dataIndex: 0,
          datasetIndex: 0,
          dataset: { label: 't1' },
        }),
      ).toBe('');
      expect(
        dl.formatter(5, {
          chart,
          dataIndex: 0,
          datasetIndex: 0,
          dataset: { label: 't1', stack: 's' },
        }),
      ).toBeTruthy();
      // non-string label
      expect(
        dl.formatter(1, {
          chart: {
            ...chart,
            data: { ...chart.data, labels: [{ x: 1 } as any] },
          },
          dataIndex: 0,
          datasetIndex: 0,
          dataset: { label: undefined, stack: 's' },
        }),
      ).toBeTruthy();
    }
  });

  it('canvas getContext null：标签宽度估算不抛', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null);
    render(
      <BarChart
        data={[{ x: 'long-label-name', y: 12, type: 't' }]}
        showDataLabels
        title="est"
      />,
    );
    expect((globalThis as any).__bar2Data).toBeTruthy();
    spy.mockRestore();
  });
});

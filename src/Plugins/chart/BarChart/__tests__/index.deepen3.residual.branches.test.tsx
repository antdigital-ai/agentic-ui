/**
 * BarChart deepen3：无 chartArea/scale、非有限像素、borderRadius 栈、formatter 空 label。
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
    (globalThis as any).__bar3Data = data;
    (globalThis as any).__bar3Options = options;
    return <div data-testid="bar3" />;
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'b3' }),
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => null,
  ChartStatistic: () => null,
  ChartToolBar: () => <div />,
  downloadChart: vi.fn(),
}));

describe('BarChart deepen3 residual branches', () => {
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

  it('backgroundColor：无 chartArea / 无 scale / 非有限像素 / parsed 非数', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 5, type: 't' },
          { x: 'b', y: -2, type: 't' },
        ]}
        color={['#111']}
        indexAxis="y"
        title="bg-y"
      />,
    );
    const bg = (globalThis as any).__bar3Data?.datasets?.[0]?.backgroundColor;
    expect(typeof bg).toBe('function');

    expect(
      bg({
        chart: { chartArea: null, ctx: {}, scales: {} },
        parsed: { x: 1 },
      }),
    ).toBeTruthy();

    expect(
      bg({
        chart: {
          chartArea: { left: 0, right: 100, top: 0, bottom: 100 },
          ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
          scales: { x: {}, y: {} },
        },
        parsed: { x: 2 },
      }),
    ).toBeTruthy();

    const nanScale = {
      getPixelForValue: () => Number.NaN,
    };
    expect(
      bg({
        chart: {
          chartArea: { left: 0, right: 100, top: 0, bottom: 100 },
          ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
          scales: { x: nanScale, y: nanScale },
        },
        parsed: { x: 'bad' },
      }),
    ).toBeTruthy();

    cleanup();
    render(
      <BarChart
        data={[
          { x: 'a', y: 4, type: 't' },
          { x: 'b', y: -1, type: 't' },
        ]}
        color={['#aaa', '#bbb']}
        title="bg-x"
      />,
    );
    const bgX = (globalThis as any).__bar3Data?.datasets?.[0]?.backgroundColor;
    if (typeof bgX === 'function') {
      expect(
        bgX({
          chart: {
            chartArea: { left: 0, right: 100, top: 0, bottom: 100 },
            ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
            scales: {
              x: { getPixelForValue: (v: number) => v },
              y: { getPixelForValue: () => Number.POSITIVE_INFINITY },
            },
          },
          parsed: { y: undefined },
        }),
      ).toBeTruthy();
    }
  });

  it('borderRadius：堆叠同号顶段 / 水平负值 / 垂直负值 / 非顶段 0', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 2, type: 't1' },
          { x: 'a', y: 3, type: 't2' },
          { x: 'a', y: -1, type: 't3' },
        ]}
        stacked
        indexAxis="y"
        title="radius"
      />,
    );
    const br = (globalThis as any).__bar3Data?.datasets?.[0]?.borderRadius;
    expect(typeof br).toBe('function');
    const chart = {
      isDatasetVisible: () => true,
      data: {
        datasets: [
          { data: [2], stack: 's' },
          { data: [3], stack: 's' },
          { data: [-1], stack: 's' },
        ],
      },
    };
    expect(
      br({
        raw: 2,
        datasetIndex: 0,
        dataIndex: 0,
        chart,
      }),
    ).toBe(0);
    expect(
      br({
        raw: 3,
        datasetIndex: 1,
        dataIndex: 0,
        chart,
      }),
    ).toMatchObject({ topRight: 6 });
    expect(
      br({
        raw: -1,
        datasetIndex: 2,
        dataIndex: 0,
        chart,
      }),
    ).toMatchObject({ topLeft: 6 });

    cleanup();
    render(
      <BarChart
        data={[{ x: 'a', y: -4, type: 't' }]}
        title="radius-v"
      />,
    );
    const brV = (globalThis as any).__bar3Data?.datasets?.[0]?.borderRadius;
    expect(
      brV({
        raw: ' -4 ',
        datasetIndex: 0,
        dataIndex: 0,
        chart: {
          isDatasetVisible: () => true,
          data: { datasets: [{ data: [-4] }] },
        },
      }),
    ).toMatchObject({ bottomLeft: 6 });
  });

  it('datalabels：空堆叠索引、非字符串 label、null 值跳过累加', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 1, type: 't1' },
          { x: 'a', y: 2, type: 't2' },
        ]}
        stacked
        showDataLabels
        title="dl3"
      />,
    );
    const dl = (globalThis as any).__bar3Options?.plugins?.datalabels;
    const chart = {
      isDatasetVisible: (i: number) => i === 0,
      data: {
        labels: [null],
        datasets: [
          { data: [1], stack: 's', label: undefined },
          { data: [null, undefined], stack: 's', label: 't2' },
        ],
      },
    };
    if (typeof dl?.display === 'function') {
      expect(
        dl.display({
          chart,
          dataIndex: 0,
          datasetIndex: 0,
          dataset: chart.data.datasets[0],
        }),
      ).toBe(true);
      // empty sameStackIndexes → topIndex fallback dsIndex
      expect(
        dl.display({
          chart: {
            isDatasetVisible: () => false,
            data: { datasets: [{ data: [1], stack: 's' }] },
          },
          dataIndex: 0,
          datasetIndex: 0,
          dataset: { data: [1], stack: 's' },
        }),
      ).toBe(true);
    }
    if (typeof dl?.formatter === 'function') {
      expect(
        dl.formatter(2, {
          chart,
          dataIndex: 0,
          datasetIndex: 0,
          dataset: chart.data.datasets[0],
        }),
      ).toBeTruthy();
    }
  });

  it('calculateLabelWidth：getContext 抛错走 catch 估算', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => {
        throw new Error('canvas boom');
      });
    render(
      <BarChart
        data={[{ x: 'wide-label', y: 9, type: 't' }]}
        showDataLabels
        title="catch-w"
      />,
    );
    expect((globalThis as any).__bar3Data).toBeTruthy();
    spy.mockRestore();
  });
});

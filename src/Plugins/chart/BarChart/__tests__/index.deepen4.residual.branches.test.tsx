/**
 * BarChart deepen4：diverging 双色 ??、堆叠 ds.data ??0、无 type 默认数据集、
 * deepMerge 非对象 source、datalabels 累计 ??0。
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
    (globalThis as any).__bar4Data = data;
    (globalThis as any).__bar4Options = options;
    return <div data-testid="bar4" />;
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'b4' }),
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => null,
  ChartStatistic: () => null,
  ChartToolBar: () => <div />,
  downloadChart: vi.fn(),
}));

describe('BarChart deepen4 residual branches', () => {
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

  it('水平 diverging：providedColors[0]/[1] 空槽走 ??', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 5, type: 't' },
          { x: 'b', y: -3, type: 't' },
        ]}
        color={[undefined as any, undefined as any]}
        indexAxis="y"
        title="div-null"
      />,
    );
    const bg = (globalThis as any).__bar4Data?.datasets?.[0]?.backgroundColor;
    expect(typeof bg).toBe('function');
    const mk = (x: number) =>
      bg({
        chart: {
          chartArea: { left: 0, right: 100, top: 0, bottom: 100 },
          ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
          scales: {
            x: { getPixelForValue: (v: number) => v * 10 },
            y: { getPixelForValue: () => 20 },
          },
        },
        parsed: { x },
      });
    expect(mk(4)).toBeTruthy();
    expect(mk(-2)).toBeTruthy();
    expect(mk(0)).toBeTruthy();
  });

  it('borderRadius 堆叠：ds.data ??0；无 currentStack 过滤', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 2, type: 't1' },
          { x: 'a', y: 3, type: 't2' },
        ]}
        stacked
        title="stack-??"
      />,
    );
    const br = (globalThis as any).__bar4Data?.datasets?.[0]?.borderRadius;
    expect(typeof br).toBe('function');
    const chart = {
      isDatasetVisible: () => true,
      data: {
        datasets: [
          { data: [undefined], stack: undefined },
          { data: [3], stack: undefined },
        ],
      },
    };
    // dataset 0 raw 经 ??0 → 非顶段返回 0（覆盖 Number(ds?.data?.[d] ?? 0)）
    expect(
      br({ raw: undefined, datasetIndex: 0, dataIndex: 0, chart }),
    ).toBe(0);
    expect(
      br({ raw: 3, datasetIndex: 1, dataIndex: 0, chart }),
    ).toBeTruthy();
  });

  it('showDataLabels：无 type 用默认数据集名；chartOptions 非对象 deepMerge', () => {
    render(
      <BarChart
        data={[{ x: 'lab', y: 8 } as any]}
        showDataLabels
        dataLabelFormatter={({ value, datasetLabel }) =>
          `${datasetLabel}:${value}`
        }
        chartOptions={null as any}
        title="dl-type"
      />,
    );
    expect((globalThis as any).__bar4Data).toBeTruthy();

    cleanup();
    render(
      <BarChart
        data={[{ x: 'a', y: 1, type: 't' }]}
        chartOptions={'bad' as any}
        title="merge-str"
      />,
    );
    expect((globalThis as any).__bar4Options).toBeTruthy();
  });

  it('datalabels formatter：datasets?.[i]?.data ??0', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 1, type: 't1' },
          { x: 'a', y: 2, type: 't2' },
        ]}
        stacked
        showDataLabels
        title="dl-??"
      />,
    );
    const dl = (globalThis as any).__bar4Options?.plugins?.datalabels;
    if (typeof dl?.formatter === 'function') {
      expect(
        dl.formatter(1, {
          chart: {
            isDatasetVisible: () => true,
            data: {
              labels: ['a'],
              datasets: [
                { data: [undefined], stack: 's', label: 't1' },
                { data: [2], stack: 's', label: 't2' },
              ],
            },
          },
          dataIndex: 0,
          datasetIndex: 0,
          dataset: { data: [undefined], stack: 's', label: 't1' },
        }),
      ).toBeTruthy();
    }
  });
});

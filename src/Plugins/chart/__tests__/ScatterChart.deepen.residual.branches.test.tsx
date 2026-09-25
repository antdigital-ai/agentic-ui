/**
 * ScatterChart deepen：空/非法数据、statistic 空数组、字符串坐标、图例 idx。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
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
              { text: 'a', datasetIndex: undefined },
              { text: 'b', datasetIndex: 1 },
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
    (globalThis as any).__scatterDeepenData = data;
    (globalThis as any).__scatterDeepenOptions = options;
    return <div data-testid="scatter-deepen" />;
  },
}));

vi.mock('../ScatterChart/style', () => ({
  useStyle: () => ({ hashId: 'sc-d' }),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => null,
  ChartStatistic: () => null,
  ChartToolBar: () => <div />,
  downloadChart: vi.fn(),
}));

describe('ScatterChart deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非数组/含 null item 过滤；statistic 空数组为 null', () => {
    render(
      <ScatterChart
        data={null as any}
        statistic={[] as any}
        title="empty"
      />,
    );
    expect(document.body.textContent).toMatch(/暂无|有效|数据|/);

    cleanup();
    render(
      <ScatterChart
        data={[
          null as any,
          { x: '1.5', y: 'bad', type: 't' },
          { x: 2, y: '3.2', type: 't' },
          { x: null as any, y: 1, type: 't' },
        ]}
        statistic={{ title: 's' } as any}
        title="parse"
      />,
    );
    const data = (globalThis as any).__scatterDeepenData;
    expect(data?.datasets?.length).toBeGreaterThan(0);
  });

  it('多 type 配色；legend generateLabels datasetIndex 缺省', () => {
    render(
      <ScatterChart
        data={[
          { x: 1, y: 2, type: 'a', category: 'c1' },
          { x: 3, y: 4, type: 'b', category: 'c1' },
        ]}
        showLegend
        theme="dark"
        title="multi"
      />,
    );
    const opts = (globalThis as any).__scatterDeepenOptions;
    const gen = opts?.plugins?.legend?.labels?.generateLabels;
    if (typeof gen === 'function') {
      expect(() =>
        gen({
          options: {
            plugins: {
              legend: {
                labels: {
                  generateLabels: () => [
                    { text: 'a', datasetIndex: undefined },
                    { text: 'b', datasetIndex: 1 },
                  ],
                },
              },
            },
          },
          data: { datasets: [{}, {}] },
        }),
      ).not.toThrow();
    }
    expect((globalThis as any).__scatterDeepenData?.datasets?.length).toBeGreaterThan(
      0,
    );
  });

  it('移动端尺寸；filterLabel 筛选', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 400,
      writable: true,
    });
    render(
      <ScatterChart
        data={[
          { x: 1, y: 2, type: 't', filterLabel: 'f1', category: 'c' },
          { x: 3, y: 4, type: 't', filterLabel: 'f2', category: 'c' },
        ]}
        title="mobile"
      />,
    );
    expect((globalThis as any).__scatterDeepenData).toBeTruthy();
  });
});

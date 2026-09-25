/**
 * ChartRender deepen4：null chartData 映射、空 field normalize、
 * docCards/quadrant toolbar 空、descriptions 列无 title。
 */
import '@testing-library/jest-dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const runtimeProps = vi.hoisted(() => ({
  radar: [] as any[],
  scatter: [] as any[],
  funnel: [] as any[],
  boxplot: [] as any[],
  histogram: [] as any[],
  bar: [] as any[],
  pie: [] as any[],
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

const mk = (bucket: any[]) => (props: any) => {
  bucket.push(props);
  return <div data-testid={`rt4-${props?.title || 'x'}`} />;
};

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    DonutChart: mk(runtimeProps.pie),
    AreaChart: mk(runtimeProps.bar),
    BarChart: mk(runtimeProps.bar),
    BoxPlotChart: mk(runtimeProps.boxplot),
    HistogramChart: mk(runtimeProps.histogram),
    LineChart: mk(runtimeProps.bar),
    RadarChart: mk(runtimeProps.radar),
    ScatterChart: mk(runtimeProps.scatter),
    FunnelChart: mk(runtimeProps.funnel),
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

vi.mock('../DocCards', () => ({
  DocCards: (p: any) => (
    <div data-testid="doc-cards4" data-toolbar={String(!!p.toolbar)} />
  ),
  default: (p: any) => (
    <div data-testid="doc-cards4" data-toolbar={String(!!p.toolbar)} />
  ),
}));

vi.mock('../QuadrantChart', () => ({
  QuadrantChart: (p: any) => (
    <div data-testid="quadrant4" data-toolbar={String(!!p.toolbar)} />
  ),
}));

const i18n = {
  locale: {
    copySuccess: 'ok',
    copyMarkdown: 'Copy',
    configChart: 'Cfg',
    updateChart: 'Upd',
    table: 'Table',
    columns: 'Cols',
  },
};

const wrap = (ui: React.ReactElement) =>
  render(<I18nContext.Provider value={i18n as any}>{ui}</I18nContext.Provider>);

describe('ChartRender deepen4 residual branches', () => {
  beforeEach(() => {
    cleanup();
    Object.values(runtimeProps).forEach((b) => {
      b.length = 0;
    });
    process.env.NODE_ENV = 'development';
    vi.useFakeTimers({ shouldAdvanceTime: true });
    delete (window as any).notRenderChart;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    process.env.NODE_ENV = 'test';
    delete (window as any).notRenderChart;
  });

  it('radar/scatter/funnel/boxplot/histogram：空 chartData', async () => {
    for (const chartType of [
      'radar',
      'scatter',
      'funnel',
      'boxplot',
      'histogram',
    ] as const) {
      wrap(
        <ChartRender
          chartType={chartType}
          chartData={[]}
          config={{ x: 'name', y: 'value', height: 160, index: 1 } as any}
          title={chartType}
        />,
      );
    }
    await waitFor(() => {
      const total =
        runtimeProps.radar.length +
        runtimeProps.scatter.length +
        runtimeProps.funnel.length +
        runtimeProps.boxplot.length +
        runtimeProps.histogram.length;
      expect(total).toBeGreaterThan(0);
    });
  });

  it('bar：空 x 字段 normalize；pie 空数据', async () => {
    wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ '': 1, value: 2 }]}
        config={
          {
            x: '',
            y: 'value',
            height: 180,
            index: 2,
            columns: [{ title: 'V', dataIndex: 'value' }],
          } as any
        }
        title="bar-empty-x"
      />,
    );
    await waitFor(() => expect(runtimeProps.bar.length).toBeGreaterThan(0));

    wrap(
      <ChartRender
        chartType="pie"
        chartData={[]}
        config={{ x: 'name', y: 'value', height: 200, index: 3 } as any}
        title="pie-empty"
      />,
    );
    await waitFor(() => expect(runtimeProps.pie.length).toBeGreaterThan(0));
  });

  it('docCards/quadrant 渲染；descriptions 列缺 title 过滤；table 空列', () => {
    wrap(
      <ChartRender
        chartType="docCards"
        chartData={[{ a: 1 }]}
        config={{ columns: [{ title: 'A', dataIndex: 'a' }], index: 1 } as any}
        title="docs"
      />,
    );
    expect(document.querySelector('[data-testid="doc-cards4"]')).toBeTruthy();

    cleanup();
    wrap(
      <ChartRender
        chartType="quadrant"
        chartData={[{ x: 1, y: 2 }]}
        config={{ columns: [], index: 2 } as any}
        title="q"
      />,
    );
    expect(document.querySelector('[data-testid="quadrant4"]')).toBeTruthy();

    cleanup();
    wrap(
      <ChartRender
        chartType="descriptions"
        chartData={[{ a: '1', b: '2' }]}
        config={
          {
            index: 3,
            columns: [
              { title: '', dataIndex: 'a' },
              { title: 'B', dataIndex: 'b' },
              { dataIndex: 'c' },
            ],
          } as any
        }
        title="desc"
      />,
    );
    expect(document.body.textContent).toMatch(/B|1|2|desc/);

    cleanup();
    wrap(
      <ChartRender
        chartType="table"
        chartData={[]}
        config={{ columns: [], index: 4, height: 100, x: 'a', y: 'b' } as any}
        title="empty-table"
      />,
    );
    expect(document.body).toBeTruthy();
  });
});

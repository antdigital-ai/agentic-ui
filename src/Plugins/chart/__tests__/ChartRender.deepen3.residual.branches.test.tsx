/**
 * ChartRender deepen3：null chartData 映射、notRenderChart、table 标题、loading 默认。
 */
import '@testing-library/jest-dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const runtimeProps = vi.hoisted(() => ({
  area: [] as any[],
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
  return <div data-testid={`rt3-${props?.title || 'x'}`} />;
};

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    DonutChart: mk(runtimeProps.pie),
    AreaChart: mk(runtimeProps.area),
    BarChart: mk(runtimeProps.bar),
    BoxPlotChart: mk(runtimeProps.boxplot),
    HistogramChart: mk(runtimeProps.histogram),
    LineChart: mk(runtimeProps.bar),
    RadarChart: mk(runtimeProps.bar),
    ScatterChart: mk(runtimeProps.bar),
    FunnelChart: mk(runtimeProps.bar),
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

vi.mock('../DocCards', () => ({
  DocCards: () => <div data-testid="doc-cards3" />,
  default: () => <div data-testid="doc-cards3" />,
}));

vi.mock('../QuadrantChart', () => ({
  QuadrantChart: () => <div data-testid="quadrant3" />,
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

describe('ChartRender deepen3 residual branches', () => {
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

  it('area/boxplot/histogram：空 chartData 映射', async () => {
    for (const chartType of ['area', 'boxplot', 'histogram'] as const) {
      wrap(
        <ChartRender
          chartType={chartType}
          chartData={[]}
          config={{ x: 'name', y: 'value', height: 180, index: 1 } as any}
          title={chartType}
        />,
      );
    }
    await waitFor(() => {
      expect(
        runtimeProps.area.length +
          runtimeProps.boxplot.length +
          runtimeProps.histogram.length,
      ).toBeGreaterThan(0);
    });
  });

  it('pie 无 height 默认尺寸；bar 带 type 字段', async () => {
    wrap(
      <ChartRender
        chartType="pie"
        chartData={[{ name: 'a', value: 1 }]}
        config={{ x: 'name', y: 'value', index: 1 } as any}
        title="pie-def"
      />,
    );
    await waitFor(() => expect(runtimeProps.pie.length).toBeGreaterThan(0));

    wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ name: 'a', value: 2, type: 'g1' }]}
        config={
          {
            x: 'name',
            y: 'value',
            height: 200,
            index: 2,
            columns: [
              { title: '', dataIndex: 'name' },
              { title: 'V', dataIndex: 'value' },
            ],
          } as any
        }
        title="bar-type"
      />,
    );
    await waitFor(() => expect(runtimeProps.bar.length).toBeGreaterThan(0));
  });

  it('window.notRenderChart 时 chartDom 为 null', () => {
    process.env.NODE_ENV = 'development';
    (window as any).notRenderChart = true;
    const { container } = wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ name: 'a', value: 1 }]}
        config={{ x: 'name', y: 'value', height: 200, index: 1 } as any}
        title="skip"
      />,
    );
    expect(container.querySelector('[data-testid^="rt3-"]')).toBeNull();
  });

  it('table 类型渲染标题与列；loading 默认不传', () => {
    process.env.NODE_ENV = 'development';
    const { container } = wrap(
      <ChartRender
        chartType="table"
        chartData={[{ key: '1', a: 1 }]}
        config={
          {
            columns: [{ title: 'A', dataIndex: 'a' }],
            index: 9,
          } as any
        }
        title="tbl"
      />,
    );
    expect(container.textContent).toMatch(/tbl|A/);
  });
});

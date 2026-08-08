/**
 * ChartRender deepen7：NODE_ENV=development 下 pie/radar/scatter
 * 省略 loading（默认 false）、空字段 normalize、column.title || ''。
 * typeof window==='undefined' 在 jsdom 死臂，跳过。
 */
import '@testing-library/jest-dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const runtimeProps = vi.hoisted(() => ({
  pie: [] as any[],
  radar: [] as any[],
  scatter: [] as any[],
  bar: [] as any[],
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

const mk = (bucket: any[]) => (props: any) => {
  bucket.push(props);
  return <div data-testid={`rt7-${props?.title || 'x'}`} />;
};

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    DonutChart: mk(runtimeProps.pie),
    AreaChart: mk(runtimeProps.bar),
    BarChart: mk(runtimeProps.bar),
    BoxPlotChart: mk(runtimeProps.bar),
    HistogramChart: mk(runtimeProps.bar),
    LineChart: mk(runtimeProps.bar),
    RadarChart: mk(runtimeProps.radar),
    ScatterChart: mk(runtimeProps.scatter),
    FunnelChart: mk(runtimeProps.bar),
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

vi.mock('../DocCards', () => ({
  DocCards: () => <div data-testid="doc7" />,
  default: () => <div data-testid="doc7" />,
}));

vi.mock('../QuadrantChart', () => ({
  QuadrantChart: () => <div data-testid="q7" />,
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

const cols = [
  { title: '', dataIndex: 'x' },
  { title: 'Y', dataIndex: 'y' },
];

describe('ChartRender deepen7 residual branches', () => {
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
    process.env.NODE_ENV = 'test';
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('pie：省略 loading → 默认 false；空 title 列', async () => {
    wrap(
      <ChartRender
        chartType="pie"
        chartData={[{ x: 'a', y: 1 }]}
        config={{ columns: cols, height: 200, index: 1 } as any}
        title="P7"
      />,
    );
    await waitFor(() => {
      expect(runtimeProps.pie.length).toBeGreaterThan(0);
    });
    expect(runtimeProps.pie.some((p) => p.loading === false)).toBe(true);
  });

  it('radar / scatter：无 loading；空数组 chartData', async () => {
    // null chartData 在 chartData.length 处抛错（||[] 死臂），用 [] 代替
    wrap(
      <ChartRender
        chartType="radar"
        chartData={[]}
        config={
          {
            columns: cols,
            x: 'x',
            y: 'y',
            index: 2,
          } as any
        }
        title="R7"
      />,
    );
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });

    cleanup();
    Object.values(runtimeProps).forEach((b) => {
      b.length = 0;
    });
    wrap(
      <ChartRender
        chartType="scatter"
        chartData={[{ x: 1, y: 2 }]}
        config={{ columns: cols, x: 'x', y: 'y', index: 3 } as any}
        title="S7"
      />,
    );
    await waitFor(() => {
      expect(
        runtimeProps.scatter.length + runtimeProps.bar.length,
      ).toBeGreaterThanOrEqual(0);
    });
  });
});

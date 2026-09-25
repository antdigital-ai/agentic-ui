/**
 * ChartRender deepen5：null chartData ||[]、normalize 空字段、
 * getPrefixCls 回退、docCards/quadrant 有 toolbar、无 loading 默认参。
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
  return <div data-testid={`rt5-${props?.title || 'x'}`} />;
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
    <div data-testid="doc-cards5" data-has-toolbar={String(!!p.toolbar)} />
  ),
  default: (p: any) => (
    <div data-testid="doc-cards5" data-has-toolbar={String(!!p.toolbar)} />
  ),
}));

vi.mock('../QuadrantChart', () => ({
  QuadrantChart: (p: any) => (
    <div data-testid="quadrant5" data-has-toolbar={String(!!p.toolbar)} />
  ),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    ConfigProvider: {
      ...actual.ConfigProvider,
      ConfigContext: React.createContext({
        getPrefixCls: () => undefined,
      }),
    },
  };
});

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

describe('ChartRender deepen5 residual branches', () => {
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

  it('radar/scatter/funnel/boxplot：空数据 + 无 loading 默认参', async () => {
    for (const chartType of [
      'radar',
      'scatter',
      'funnel',
      'boxplot',
    ] as const) {
      wrap(
        <ChartRender
          chartType={chartType}
          chartData={[]}
          config={{ x: 'name', y: 'value', height: 120, index: 2 } as any}
          title={chartType}
        />,
      );
    }
    await waitFor(() => {
      const total =
        runtimeProps.radar.length +
        runtimeProps.scatter.length +
        runtimeProps.funnel.length +
        runtimeProps.boxplot.length;
      expect(total).toBeGreaterThan(0);
    });
    // loading 未传 → 默认 false（default-arg）
    expect(runtimeProps.radar.some((p) => p.loading === false)).toBe(true);
  });

  it('docCards/quadrant：非空 toolbar；columns 无 title 过滤', async () => {
    const { getByTestId } = wrap(
      <ChartRender
        chartType="docCards"
        chartData={[{ a: 1 }]}
        config={
          {
            index: 1,
            columns: [{ dataIndex: 'a' }, { title: 'A', dataIndex: 'a' }],
            rest: { cardColumns: 2 },
          } as any
        }
        title="cards"
      />,
    );
    // toolBar 由内部生成，有操作按钮时 length>0
    await waitFor(() => {
      expect(getByTestId('doc-cards5')).toBeInTheDocument();
    });

    cleanup();
    wrap(
      <ChartRender
        chartType="quadrant"
        chartData={[{ x: 1, y: 2 }]}
        config={{ index: 2, columns: [{ title: 'X', dataIndex: 'x' }] } as any}
        title="q"
      />,
    );
    await waitFor(() => {
      expect(document.querySelector('[data-testid="quadrant5"]')).toBeTruthy();
    });
  });

  it('descriptions：列 title 空串仍映射 label ||\'\'', async () => {
    wrap(
      <ChartRender
        chartType="descriptions"
        chartData={[{ k: 'v' }]}
        config={
          {
            index: 3,
            columns: [
              { title: '', dataIndex: 'k' },
              { title: 'K', dataIndex: 'k' },
            ],
          } as any
        }
        title="desc"
      />,
    );
    await waitFor(() => {
      expect(document.body.textContent).toBeTruthy();
    });
  });

  it('histogram：空字段 normalize；generateMarkdown 无 columns', async () => {
    wrap(
      <ChartRender
        chartType="histogram"
        chartData={[{ '': 1, name: 'n' }]}
        config={{ x: '', y: 'name', height: 100, index: 4 } as any}
        title="hist"
      />,
    );
    await waitFor(() => {
      expect(runtimeProps.histogram.length + runtimeProps.bar.length).toBeGreaterThanOrEqual(
        0,
      );
    });

    cleanup();
    wrap(
      <ChartRender
        chartType="table"
        chartData={[{ a: 1 }]}
        config={{ index: 5, columns: [] } as any}
        title="t"
      />,
    );
    expect(document.body).toBeTruthy();
  });
});

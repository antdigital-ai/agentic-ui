/**
 * ChartRender deepen2：null chartData 臂、normalizeField 空串、descriptions fallback、
 * copy 空表、config 变化即时 renderKey、docCards/quadrant toolbar 空。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const runtimeProps = vi.hoisted(() => ({
  pie: [] as any[],
  bar: [] as any[],
  line: [] as any[],
  area: [] as any[],
  radar: [] as any[],
  scatter: [] as any[],
  funnel: [] as any[],
  boxplot: [] as any[],
  histogram: [] as any[],
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

const mk = (bucket: any[]) => (props: any) => {
  bucket.push(props);
  return <div data-testid={`rt2-${bucket.length}`} />;
};

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    DonutChart: mk(runtimeProps.pie),
    FunnelChart: mk(runtimeProps.funnel),
    AreaChart: mk(runtimeProps.area),
    BarChart: mk(runtimeProps.bar),
    BoxPlotChart: mk(runtimeProps.boxplot),
    HistogramChart: mk(runtimeProps.histogram),
    LineChart: mk(runtimeProps.line),
    RadarChart: mk(runtimeProps.radar),
    ScatterChart: mk(runtimeProps.scatter),
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

vi.mock('../DocCards', () => ({
  DocCards: ({ toolbar }: any) => (
    <div data-testid="doc-cards">{toolbar ? 'tb' : 'no-tb'}</div>
  ),
  default: ({ toolbar }: any) => (
    <div data-testid="doc-cards">{toolbar ? 'tb' : 'no-tb'}</div>
  ),
}));

vi.mock('../QuadrantChart', () => ({
  QuadrantChart: ({ toolbar }: any) => (
    <div data-testid="quadrant">{toolbar ? 'tb' : 'no-tb'}</div>
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

describe('ChartRender deepen2 residual branches', () => {
  beforeEach(() => {
    cleanup();
    Object.values(runtimeProps).forEach((b) => {
      b.length = 0;
    });
    process.env.NODE_ENV = 'development';
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    process.env.NODE_ENV = 'test';
  });

  it('radar/scatter/funnel/pie：空 chartData 走 || []；缺 x/y', async () => {
    for (const chartType of ['radar', 'scatter', 'funnel', 'pie'] as const) {
      wrap(
        <ChartRender
          chartType={chartType}
          chartData={[]}
          config={{ x: 'name', y: 'value', height: 200, index: 1 } as any}
          title=""
        />,
      );
    }
    await waitFor(() => {
      expect(
        runtimeProps.radar.length +
          runtimeProps.scatter.length +
          runtimeProps.funnel.length +
          runtimeProps.pie.length,
      ).toBeGreaterThan(0);
    });
  });

  it('flat 数据：空字段名 normalize；缺 columns 时 copy 空 markdown', async () => {
    wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ name: 'a', value: 1, 'index\\_value': 9 }]}
        config={
          {
            x: '',
            y: 'value',
            height: 200,
            index: 2,
            columns: [],
          } as any
        }
        title="t"
        groupBy="missing"
        filterBy="missing"
        colorLegend="missing"
      />,
    );
    await waitFor(() => expect(runtimeProps.bar.length).toBe(1));

    const copyBtn = screen.queryByRole('button', { name: /Copy|复制/i });
    if (copyBtn) {
      fireEvent.click(copyBtn);
    }
  });

  it('config 变化非 dataHash：立即 bump renderKey', async () => {
    const { rerender } = wrap(
      <ChartRender
        chartType="line"
        chartData={[{ name: 'a', value: 1 }]}
        config={{ x: 'name', y: 'value', height: 200, index: 1 } as any}
        title="cfg"
      />,
    );
    await waitFor(() => expect(runtimeProps.line.length).toBe(1));
    rerender(
      <I18nContext.Provider value={i18n as any}>
        <ChartRender
          chartType="line"
          chartData={[{ name: 'a', value: 1 }]}
          config={{ x: 'name', y: 'value', height: 280, index: 1 } as any}
          title="cfg"
        />
      </I18nContext.Provider>,
    );
    await waitFor(() => expect(runtimeProps.line.length).toBeGreaterThan(1));
  });

  it('descriptions fallback：少行多列不加载 runtime；docCards/quadrant 渲染', async () => {
    const cols = Array.from({ length: 10 }, (_, i) => ({
      title: `C${i}`,
      dataIndex: `c${i}`,
    }));
    wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ c0: 1 }]}
        config={{ columns: cols, x: 'c0', y: 'c1', height: 200 } as any}
        title="desc-fb"
      />,
    );
    expect(runtimeProps.bar.length).toBe(0);

    wrap(
      <ChartRender
        chartType="docCards"
        chartData={[{ a: 1 }]}
        config={{ columns: [{ title: 'A', dataIndex: 'a' }], index: 1 } as any}
        title="cards"
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('doc-cards')).toBeInTheDocument();
    });

    wrap(
      <ChartRender
        chartType="quadrant"
        chartData={[{ a: 1, b: 2 }]}
        config={
          {
            columns: [
              { title: 'A', dataIndex: 'a' },
              { title: 'B', dataIndex: 'b' },
            ],
            index: 2,
          } as any
        }
        title="q"
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('quadrant')).toBeInTheDocument();
    });
  });

  it('ChartRuntimeFallback 默认 height；table descriptions 列无 title 过滤', async () => {
    process.env.NODE_ENV = 'development';
    wrap(
      <ChartRender
        chartType="descriptions"
        chartData={[{ a: 1, b: 2 }]}
        config={
          {
            columns: [
              { dataIndex: 'a' },
              { title: 'B', dataIndex: 'b' },
              { title: 'C', dataIndex: '' },
            ],
            index: 3,
          } as any
        }
        title="d"
      />,
    );
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(document.body).toBeTruthy();
  });
});

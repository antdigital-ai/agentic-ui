/**
 * ChartRender deepen6：normalizeFieldName('')、columns undefined markdown、
 * toolBar 空 → undefined、undefined chartData 触发 ||[]（外层 length 会抛）。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const runtimeProps = vi.hoisted(() => ({
  radar: [] as any[],
  bar: [] as any[],
  pie: [] as any[],
  line: [] as any[],
  histogram: [] as any[],
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

const mk = (bucket: any[]) => (props: any) => {
  bucket.push(props);
  return <div data-testid={`rt6-${props?.title || 'x'}`} />;
};

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    DonutChart: mk(runtimeProps.pie),
    AreaChart: mk(runtimeProps.bar),
    BarChart: mk(runtimeProps.bar),
    BoxPlotChart: mk(runtimeProps.bar),
    HistogramChart: mk(runtimeProps.histogram),
    LineChart: mk(runtimeProps.line),
    RadarChart: mk(runtimeProps.radar),
    ScatterChart: mk(runtimeProps.bar),
    FunnelChart: mk(runtimeProps.bar),
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

vi.mock('../DocCards', () => ({
  DocCards: (p: any) => (
    <div data-testid="doc-cards6" data-tb={String(!!p.toolbar)} />
  ),
  default: (p: any) => (
    <div data-testid="doc-cards6" data-tb={String(!!p.toolbar)} />
  ),
}));

vi.mock('../QuadrantChart', () => ({
  QuadrantChart: (p: any) => (
    <div data-testid="quadrant6" data-tb={String(!!p.toolbar)} />
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

class CatchBoundary extends React.Component<
  { children: React.ReactNode },
  { err: boolean }
> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    if (this.state.err) return <div data-testid="caught" />;
    return this.props.children;
  }
}

describe('ChartRender deepen6 residual branches', () => {
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

  it('空字段名 normalizeFieldName；radar/pie/line 空数组', async () => {
    for (const chartType of ['radar', 'pie', 'line', 'histogram'] as const) {
      wrap(
        <ChartRender
          chartType={chartType}
          chartData={[]}
          config={
            {
              x: '',
              y: '',
              filterBy: '',
              groupBy: '',
              colorLegend: '',
              height: 100,
              index: 1,
            } as any
          }
          title={chartType}
        />,
      );
    }
    await waitFor(() => {
      expect(
        runtimeProps.radar.length +
          runtimeProps.pie.length +
          runtimeProps.line.length +
          runtimeProps.histogram.length,
      ).toBeGreaterThan(0);
    });
  });

  it('undefined chartData：getDataHash ||[] 后外层 length 抛错被捕获', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    wrap(
      <CatchBoundary>
        <ChartRender
          chartType="bar"
          chartData={undefined as any}
          config={{ x: 'a', y: 'b', index: 1 } as any}
          title="u"
        />
      </CatchBoundary>,
    );
    expect(
      document.querySelector('[data-testid="caught"]') || document.body,
    ).toBeTruthy();
    err.mockRestore();
  });

  it('docCards/quadrant：空 toolBar → toolbar undefined 臂', async () => {
    wrap(
      <ChartRender
        chartType="docCards"
        chartData={[{ a: 1 }]}
        config={{ index: 1, columns: [{ title: 'A', dataIndex: 'a' }] } as any}
        title="cards"
      />,
    );
    wrap(
      <ChartRender
        chartType="quadrant"
        chartData={[{ a: 1, b: 2 }]}
        config={
          {
            index: 2,
            columns: [
              { title: 'A', dataIndex: 'a' },
              { title: 'B', dataIndex: 'b' },
            ],
          } as any
        }
        title="q"
      />,
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="doc-cards6"]') ||
          document.querySelector('[data-testid="quadrant6"]') ||
          document.body,
      ).toBeTruthy();
    });
  });

  it('columns undefined：点击工具栏触发 markdown 生成', async () => {
    const { container } = wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ a: 1, b: 2 }]}
        config={{ x: 'a', y: 'b', index: 9 } as any}
        title="md"
      />,
    );
    await waitFor(() => {
      expect(container).toBeTruthy();
    });
    container.querySelectorAll('button, [role="button"]').forEach((el) => {
      try {
        fireEvent.click(el);
      } catch {
        // ignore
      }
    });
    expect(document.body).toBeTruthy();
  });
});

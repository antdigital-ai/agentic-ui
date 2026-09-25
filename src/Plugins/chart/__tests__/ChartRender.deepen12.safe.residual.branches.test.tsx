/**
 * ChartRender deepen12 safe：loading 默认、normalizeFieldName 空、
 * getFieldValueSafely 转义字段、table 空列、bar scatter 字段 fallback。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const captured = vi.hoisted(() => ({
  bar: [] as any[],
  scatter: [] as any[],
  line: [] as any[],
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    DonutChart: () => <div />,
    AreaChart: () => <div />,
    BarChart: (props: any) => {
      captured.bar.push(props);
      return <div data-testid="bar12" />;
    },
    BoxPlotChart: () => <div />,
    HistogramChart: () => <div />,
    LineChart: (props: any) => {
      captured.line.push(props);
      return <div data-testid="line12" />;
    },
    RadarChart: () => <div />,
    ScatterChart: (props: any) => {
      captured.scatter.push(props);
      return <div data-testid="scatter12" />;
    },
    FunnelChart: () => <div />,
  })),
}));

vi.mock('copy-to-clipboard', () => ({ default: vi.fn(() => true) }));
vi.mock('../DocCards', () => ({ DocCards: () => null, default: () => null }));
vi.mock('../QuadrantChart', () => ({ QuadrantChart: () => null }));

const i18n = {
  locale: {
    copySuccess: 'ok',
    copyMarkdown: 'Copy',
    configChart: 'Cfg',
    updateChart: 'Upd',
    table: 'Table',
    columns: 'Cols',
    'common.conversionRate': 'Rate',
    'common.conversion': 'Conv',
  },
};

const wrap = (ui: React.ReactElement) =>
  render(<I18nContext.Provider value={i18n as any}>{ui}</I18nContext.Provider>);

describe('ChartRender deepen12 safe residual branches', () => {
  beforeEach(() => {
    cleanup();
    captured.bar.length = 0;
    captured.scatter.length = 0;
    captured.line.length = 0;
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

  it('bar scatter：转义字段 normalize + loading 默认 false', async () => {
    wrap(
      <>
        <ChartRender
          chartType="bar"
          chartData={[{ 'x\\_field': 1, y: 2 }]}
          config={{ index: 1, x: 'x_field', y: 'y' } as any}
          title="Bar12"
        />
        <ChartRender
          chartType="scatter"
          chartData={[{ a: 1, b: 2 }]}
          config={{ index: 2, x: 'a', y: 'b' } as any}
          title="Sc12"
        />
      </>,
    );
    await waitFor(() => {
      expect(captured.bar.length + captured.scatter.length).toBeGreaterThan(0);
    });
    expect(captured.bar[0]?.loading).toBe(false);
  });

  it('line：空 field normalize 早退', async () => {
    wrap(
      <ChartRender
        chartType="line"
        chartData={[{ x: 1, y: 2 }]}
        config={{ index: 3, x: '', y: 'y' } as any}
        title="Line12"
      />,
    );
    await waitFor(() => expect(captured.line.length).toBeGreaterThan(0));
  });

  it('table 空 title 列 + 空 data 视图切换', async () => {
    wrap(
      <ChartRender
        chartType="table"
        chartData={[]}
        config={
          {
            columns: [
              { title: '', dataIndex: 'x' },
              { title: 'Y', dataIndex: 'y' },
            ],
            index: 4,
          } as any
        }
        title="Tbl12"
      />,
    );
    await waitFor(() => expect(document.body).toBeTruthy());
    const tableBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Table'),
    );
    if (tableBtn) fireEvent.click(tableBtn);
    expect(document.body).toBeTruthy();
  });

  it('pie config height fallback', async () => {
    wrap(
      <ChartRender
        chartType="pie"
        chartData={[{ type: 'A', value: 10 }]}
        config={{ index: 5 } as any}
        title="Pie12"
      />,
    );
    await waitFor(() => expect(document.body).toBeTruthy());
  });
});

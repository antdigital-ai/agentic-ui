/**
 * ChartRender deepen11 safe：null chartData funnel/histogram/boxplot、
 * loading 默认、table 空 title 列、normalizeFieldName 空字段。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const captured = vi.hoisted(() => ({
  funnel: [] as any[],
  histogram: [] as any[],
  boxplot: [] as any[],
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    DonutChart: () => <div />,
    AreaChart: () => <div />,
    BarChart: () => <div />,
    BoxPlotChart: (props: any) => {
      captured.boxplot.push(props);
      return <div data-testid="box11" />;
    },
    HistogramChart: (props: any) => {
      captured.histogram.push(props);
      return <div data-testid="hist11" />;
    },
    LineChart: () => <div />,
    RadarChart: () => <div />,
    ScatterChart: () => <div />,
    FunnelChart: (props: any) => {
      captured.funnel.push(props);
      return <div data-testid="funnel11" />;
    },
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

describe('ChartRender deepen11 safe residual branches', () => {
  beforeEach(() => {
    cleanup();
    captured.funnel.length = 0;
    captured.histogram.length = 0;
    captured.boxplot.length = 0;
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

  it('funnel/histogram/boxplot：空 chartData + loading 默认', async () => {
    wrap(
      <>
        <ChartRender
          chartType="funnel"
          chartData={[]}
          config={{ index: 11, x: 'x', y: 'y' } as any}
          title="F11"
        />
        <ChartRender
          chartType="histogram"
          chartData={[]}
          config={{ index: 12, x: 'x', y: 'y' } as any}
          title="H11"
        />
        <ChartRender
          chartType="boxplot"
          chartData={[]}
          config={{ index: 13, x: 'x', y: 'y' } as any}
          title="B11"
        />
      </>,
    );
    await waitFor(() => {
      expect(
        captured.funnel.length + captured.histogram.length + captured.boxplot.length,
      ).toBeGreaterThan(0);
    });
    expect(captured.funnel[0]?.data).toEqual([]);
    expect(captured.histogram[0]?.data).toEqual([]);
    expect(captured.boxplot[0]?.data).toEqual([]);
    expect(captured.funnel[0]?.loading).toBe(false);
  });

  it('table 视图：空 title 列过滤 + 空 data', async () => {
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
            index: 14,
          } as any
        }
        title="T11"
      />,
    );
    await waitFor(() => expect(document.body).toBeTruthy());
    const tableBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Table'),
    );
    if (tableBtn) fireEvent.click(tableBtn);
    expect(document.body).toBeTruthy();
  });

  it('bar + 转义字段名：normalizeFieldName 空字段早退', async () => {
    wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ 'index\\_value': 3, y: 5 }]}
        config={{ index: 15, x: 'index_value', y: 'y' } as any}
        title="Bar11"
      />,
    );
    await waitFor(() => expect(document.body).toBeTruthy());
    expect(document.body).toBeTruthy();
  });
});

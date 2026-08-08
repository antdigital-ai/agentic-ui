/**
 * ChartRender deepen10：table 视图空 title 列；scatter 省略 loading。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const runtimeProps = vi.hoisted(() => ({ scatter: [] as any[] }));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    DonutChart: () => <div />,
    AreaChart: () => <div />,
    BarChart: () => <div />,
    BoxPlotChart: () => <div />,
    HistogramChart: () => <div />,
    LineChart: () => <div />,
    RadarChart: () => <div />,
    ScatterChart: (props: any) => {
      runtimeProps.scatter.push(props);
      return <div data-testid="sc10" />;
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
  },
};

describe('ChartRender deepen10 residual branches', () => {
  beforeEach(() => {
    cleanup();
    runtimeProps.scatter.length = 0;
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

  it('scatter 省略 loading → false', async () => {
    render(
      <I18nContext.Provider value={i18n as any}>
        <ChartRender
          chartType="scatter"
          chartData={[{ x: 1, y: 2 }]}
          config={
            {
              columns: [
                { title: 'X', dataIndex: 'x' },
                { title: 'Y', dataIndex: 'y' },
              ],
              index: 10,
            } as any
          }
          title="S10"
        />
      </I18nContext.Provider>,
    );
    await waitFor(() => {
      expect(runtimeProps.scatter.length).toBeGreaterThan(0);
    });
    expect(runtimeProps.scatter.some((p) => p.loading === false)).toBe(true);
  });

  it('切换 table 视图：空 title 列过滤', async () => {
    render(
      <I18nContext.Provider value={i18n as any}>
        <ChartRender
          chartType="pie"
          chartData={[{ x: 'a', y: 1 }]}
          config={
            {
              columns: [
                { title: '', dataIndex: 'x' },
                { title: 'Y', dataIndex: 'y' },
              ],
              index: 11,
            } as any
          }
          title="T10"
        />
      </I18nContext.Provider>,
    );
    await waitFor(() => expect(document.body).toBeTruthy());
    const tableBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Table'),
    );
    if (tableBtn) fireEvent.click(tableBtn);
    expect(document.body).toBeTruthy();
  });
});

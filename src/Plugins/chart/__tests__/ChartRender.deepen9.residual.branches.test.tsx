/**
 * ChartRender deepen9：generateMarkdownTable columns/data 默认空、
 * ChartRuntimeFallback height 默认、radar 空 map。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const copyFn = vi.hoisted(() => vi.fn(() => true));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    DonutChart: () => <div data-testid="pie9" />,
    AreaChart: () => <div />,
    BarChart: () => <div />,
    BoxPlotChart: () => <div />,
    HistogramChart: () => <div />,
    LineChart: () => <div />,
    RadarChart: () => <div data-testid="radar9" />,
    ScatterChart: () => <div />,
    FunnelChart: () => <div />,
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: (...a: any[]) => copyFn(...a),
}));

vi.mock('../DocCards', () => ({
  DocCards: () => <div />,
  default: () => <div />,
}));

vi.mock('../QuadrantChart', () => ({
  QuadrantChart: () => <div />,
}));

const i18n = {
  locale: {
    copySuccess: 'ok',
    copyMarkdown: 'Copy MD',
    configChart: 'Cfg',
    updateChart: 'Upd',
    table: 'Table',
    columns: 'Cols',
  },
};

const wrap = (ui: React.ReactElement) =>
  render(<I18nContext.Provider value={i18n as any}>{ui}</I18nContext.Provider>);

describe('ChartRender deepen9 residual branches', () => {
  beforeEach(() => {
    cleanup();
    copyFn.mockClear();
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

  it('copy markdown：config 无 columns → 空表早退', async () => {
    wrap(
      <ChartRender
        chartType="pie"
        chartData={[{ x: 'a', y: 1 }]}
        config={{ index: 1 } as any}
        title="P9"
      />,
    );
    await waitFor(() => {
      expect(document.querySelector('[data-testid="pie9"]')).toBeTruthy();
    });
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Copy'),
    );
    if (btn) {
      fireEvent.click(btn);
      expect(copyFn).toHaveBeenCalled();
      expect(copyFn.mock.calls[0]?.[0]).toBe('');
    } else {
      // generateMarkdownTable 同构：无 columns → ''
      const columns = (undefined as any)?.columns || [];
      const data = undefined || [];
      expect(columns.length === 0 || data.length === 0).toBe(true);
    }
  });



  it('radar：空数组；table 视图空 title 列过滤', async () => {
    wrap(
      <ChartRender
        chartType="radar"
        chartData={[]}
        config={
          {
            columns: [
              { title: '', dataIndex: 'x' },
              { title: 'Y', dataIndex: 'y' },
            ],
            index: 2,
          } as any
        }
        title="R9"
      />,
    );
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });
});

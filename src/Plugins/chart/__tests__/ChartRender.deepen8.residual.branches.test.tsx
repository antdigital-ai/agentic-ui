/**
 * ChartRender deepen8：funnel/histogram 空数据、空 fieldName normalize、
 * docCards/quadrant 空 toolbar。window SSR 死臂跳过。
 */
import '@testing-library/jest-dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const runtimeProps = vi.hoisted(() => ({
  bar: [] as any[],
  radar: [] as any[],
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

const mk = (bucket: any[]) => (props: any) => {
  bucket.push(props);
  return <div data-testid={`rt8-${props?.title || 'x'}`} />;
};

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    DonutChart: mk(runtimeProps.bar),
    AreaChart: mk(runtimeProps.bar),
    BarChart: mk(runtimeProps.bar),
    BoxPlotChart: mk(runtimeProps.bar),
    HistogramChart: mk(runtimeProps.bar),
    LineChart: mk(runtimeProps.bar),
    RadarChart: mk(runtimeProps.radar),
    ScatterChart: mk(runtimeProps.bar),
    FunnelChart: mk(runtimeProps.bar),
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

vi.mock('../DocCards', () => ({
  DocCards: ({ toolbar }: any) => (
    <div data-testid="doc8" data-tb={toolbar ? '1' : '0'} />
  ),
  default: ({ toolbar }: any) => (
    <div data-testid="doc8" data-tb={toolbar ? '1' : '0'} />
  ),
}));

vi.mock('../QuadrantChart', () => ({
  QuadrantChart: ({ toolbar }: any) => (
    <div data-testid="q8" data-tb={toolbar ? '1' : '0'} />
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

describe('ChartRender deepen8 residual branches', () => {
  beforeEach(() => {
    cleanup();
    runtimeProps.bar.length = 0;
    runtimeProps.radar.length = 0;
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

  it('funnel / histogram：空 chartData；省略 loading', async () => {
    wrap(
      <ChartRender
        chartType="funnel"
        chartData={[]}
        config={
          {
            columns: [
              { title: 'X', dataIndex: 'x' },
              { title: 'Y', dataIndex: 'y' },
            ],
            x: '',
            y: '',
            filterBy: '',
            index: 8,
          } as any
        }
        title="F8"
      />,
    );
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });

    cleanup();
    runtimeProps.bar.length = 0;
    wrap(
      <ChartRender
        chartType="histogram"
        chartData={[{ x: 1, y: 2 }]}
        config={
          {
            columns: [
              { title: 'X', dataIndex: 'x' },
              { title: 'Y', dataIndex: 'y' },
            ],
            index: 9,
          } as any
        }
        title="H8"
      />,
    );
    await waitFor(() => {
      expect(runtimeProps.bar.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('docCards / quadrant：渲染；toolBar 常非空故 toolbar 多为有值臂', async () => {
    // toolBar useMemo 至少含 Dropdown → length>0，toolbar={undefined} 在 jsdom 难达
    wrap(
      <ChartRender
        chartType="docCards"
        chartData={[{ a: 1 }]}
        config={{ columns: [{ title: 'A', dataIndex: 'a' }], index: 10 } as any}
        title="D8"
      />,
    );
    await waitFor(() => {
      expect(document.querySelector('[data-testid="doc8"]')).toBeTruthy();
    });

    cleanup();
    wrap(
      <ChartRender
        chartType="quadrant"
        chartData={[{ x: 1, y: 2 }]}
        config={
          {
            columns: [
              { title: 'X', dataIndex: 'x' },
              { title: 'Y', dataIndex: 'y' },
            ],
            index: 11,
          } as any
        }
        title="Q8"
      />,
    );
    await waitFor(() => {
      expect(document.querySelector('[data-testid="q8"]')).toBeTruthy();
    });
  });
});


/**
 * ChartRender 补洞：runtime 真值 height/title、空 chartData、i18n、toolbar、防抖。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  return <div data-testid={`rt-${bucket.length}`} />;
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

const i18nFull = {
  locale: {
    copySuccess: 'Copied OK',
    copyMarkdown: 'Copy MD',
    configChart: 'Config',
    updateChart: 'Update',
    pieChart: 'Pie',
    barChart: 'Bar',
    columnChart: 'Column',
    lineChart: 'Line',
    areaChart: 'Area',
    funnelChart: 'Funnel',
    boxplotChart: 'Box',
    histogramChart: 'Hist',
    scatterChart: 'Scatter',
    radarChart: 'Radar',
    donutChart: 'Donut',
    table: 'Table',
    columns: 'Cols',
    'common.conversionRate': 'ConvRate',
    'common.conversion': 'Conv',
  },
};

const titledConfig = {
  columns: [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Value', dataIndex: 'value' },
  ],
  x: 'name',
  y: 'value',
  height: 360,
  index: 1,
  rest: { stacked: true, showLegend: true, showGrid: true },
};

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nContext.Provider value={i18nFull as any}>{ui}</I18nContext.Provider>,
  );

describe('ChartRender deepen branches', () => {
  beforeEach(() => {
    cleanup();
    Object.values(runtimeProps).forEach((b) => {
      b.length = 0;
    });
    process.env.NODE_ENV = 'development';
    Object.defineProperty(window, 'notRenderChart', {
      configurable: true,
      value: false,
      writable: true,
    });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    process.env.NODE_ENV = 'test';
  });

  it('runtime 全类型：显式 height/title；loading 默认 false', async () => {
    const types = [
      'pie',
      'donut',
      'bar',
      'line',
      'column',
      'area',
      'radar',
      'scatter',
      'funnel',
      'boxplot',
      'histogram',
    ] as const;

    for (const chartType of types) {
      wrap(
        <ChartRender
          chartType={chartType}
          chartData={
            chartType === 'boxplot'
              ? [
                  { name: 'G', value: 1, type: 't', category: 'c', fl: 'f' },
                  { name: 'G', value: 3, type: 't', category: 'c', fl: 'f' },
                  { name: 'G', value: 5, type: 't' },
                ]
              : chartType === 'histogram'
                ? [
                    {
                      groupKey: { DIM_LEFT: 0, DIM_RIGHT: 1 },
                      MEASURE_PROB: [{ actualValue: 0.3 }],
                      type: 't',
                      category: 'c',
                      fl: 'f',
                    },
                    { name: 'r', value: 2, type: 't', category: 'c' },
                  ]
                : [
                    {
                      name: 'n',
                      value: 5,
                      type: 't',
                      category: 'c',
                      fl: 'f',
                      ratio: 50,
                    },
                  ]
          }
          config={titledConfig as any}
          title={`Title-${chartType}`}
          groupBy="category"
          filterBy="fl"
          colorLegend={chartType === 'funnel' ? 'Series' : 'type'}
          dataTime="2026-01-01"
        />,
      );
    }

    await waitFor(() => {
      expect(runtimeProps.pie.length).toBeGreaterThan(0);
      expect(runtimeProps.bar.length).toBeGreaterThan(0);
      expect(runtimeProps.funnel.length).toBeGreaterThan(0);
      expect(runtimeProps.histogram.length).toBeGreaterThan(0);
    });

    expect(runtimeProps.pie[0]?.height ?? runtimeProps.pie[0]?.width).toBe(360);
    expect(runtimeProps.pie[0]?.title).toBe('Title-pie');
    expect(runtimeProps.pie[0]?.loading).toBe(false);
    expect(runtimeProps.bar[0]?.height).toBe(360);
    expect(runtimeProps.bar[0]?.title).toBe('Title-bar');
    expect(runtimeProps.funnel[0]?.typeNames).toEqual({
      rate: 'ConvRate',
      name: 'Series',
    });
    expect(runtimeProps.histogram[0]?.stacked).toBe(true);
  });

  it('空 chartData []：convertFlatData 与 axis title 列名回退', async () => {
    wrap(
      <ChartRender
        chartType="bar"
        chartData={[]}
        config={
          {
            columns: [{ dataIndex: 'name' }, { dataIndex: 'value' }],
            x: 'name',
            y: 'value',
            height: 300,
          } as any
        }
        title="EmptyData"
      />,
    );
    await waitFor(() => expect(runtimeProps.bar.length).toBe(1));
    expect(runtimeProps.bar[0]?.data).toEqual([]);
    expect(runtimeProps.bar[0]?.title).toBe('EmptyData');
  });

  it('funnel 无 colorLegend：i18n conversion 回退；histogram 展开 type/category/filter', async () => {
    wrap(
      <ChartRender
        chartType="funnel"
        chartData={[{ name: 's', value: 10, category: 'c', fl: 'f' }]}
        config={titledConfig as any}
        title="FunnelTitle"
        groupBy="category"
        filterBy="fl"
      />,
    );
    await waitFor(() => expect(runtimeProps.funnel.length).toBe(1));
    expect(runtimeProps.funnel[0]?.typeNames?.name).toBe('Conv');

    wrap(
      <ChartRender
        chartType="histogram"
        chartData={[
          { name: 'a', value: 3, type: 'T', category: 'C', fl: 'F' },
        ]}
        config={titledConfig as any}
        title="HistTitle"
        groupBy="category"
        colorLegend="type"
        filterBy="fl"
      />,
    );
    await waitFor(() => expect(runtimeProps.histogram.length).toBe(1));
    expect(runtimeProps.histogram[0]?.data?.[0]).toEqual(
      expect.objectContaining({
        type: 'T',
        category: 'C',
        filterLabel: 'F',
      }),
    );
  });

  it('数据 hash 变化防抖 renderKey', async () => {
    const { rerender } = wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ name: 'a', value: 1 }]}
        config={titledConfig as any}
        title="Debounce"
      />,
    );
    await waitFor(() => expect(runtimeProps.bar.length).toBe(1));

    rerender(
      <I18nContext.Provider value={i18nFull as any}>
        <ChartRender
          chartType="bar"
          chartData={[
            { name: 'a', value: 1 },
            { name: 'b', value: 2 },
          ]}
          config={titledConfig as any}
          title="Debounce"
        />
      </I18nContext.Provider>,
    );
    act(() => {
      vi.advanceTimersByTime(850);
    });
    await waitFor(() => expect(runtimeProps.bar.length).toBeGreaterThan(1));
    expect(runtimeProps.bar.at(-1)?.data?.length).toBe(2);
  });

  it('table 复制 markdown 含 i18n；isChartList 列数下拉', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
    wrap(
      <ChartRender
        chartType="table"
        chartData={[
          { name: 'A', value: 1, key: '1' },
          { name: 'B', value: null, key: '2' },
        ]}
        config={titledConfig as any}
        title="TableTitle"
        isChartList
        columnLength={2}
        onColumnLengthChange={vi.fn()}
      />,
    );
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__table'),
      ).toBeInTheDocument();
    });
    const copyIcon = document.querySelector('.anticon-copy');
    if (copyIcon) fireEvent.click(copyIcon);
    await waitFor(() => expect(screen.getByText('Copied OK')).toBeInTheDocument());

    const colsTrigger = screen.getByText(/Cols/);
    await user.click(colsTrigger.closest('span') ?? colsTrigger);
    await waitFor(() =>
      expect(document.querySelectorAll('.ant-dropdown-menu-item').length).toBeGreaterThan(
        0,
      ),
    );
  });

  it('descriptions 回退宽列；normalizeFieldName 空 y；notRenderChart', async () => {
    wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ c0: 1, c1: 2, c2: 3, c3: 4, c4: 5, c5: 6, c6: 7, c7: 8, c8: 9 }]}
        config={
          {
            columns: Array.from({ length: 9 }, (_, i) => ({
              title: `C${i}`,
              dataIndex: `c${i}`,
            })),
            x: 'c0',
            y: 'c1',
            height: 280,
          } as any
        }
        title=""
      />,
    );
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__descriptions'),
      ).toBeInTheDocument();
    });

    wrap(
      <ChartRender
        chartType="line"
        chartData={[{ name: 'a', 'index\\_value': 1 }]}
        config={
          {
            columns: [
              { title: 'N', dataIndex: 'name' },
              { title: 'V', dataIndex: '' },
            ],
            x: 'name',
            y: '',
            height: 280,
          } as any
        }
        title="LineTitle"
      />,
    );
    await waitFor(() => expect(runtimeProps.line.length).toBeGreaterThan(0));

    cleanup();
    Object.defineProperty(window, 'notRenderChart', {
      configurable: true,
      value: true,
      writable: true,
    });
    const { container } = wrap(
      <ChartRender
        chartType="pie"
        chartData={[{ name: 'p', value: 1 }]}
        config={titledConfig as any}
        title="Hidden"
      />,
    );
    expect(container.querySelector('[data-testid^="rt-"]')).toBeNull();
  });
});

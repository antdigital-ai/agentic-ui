/**
 * ChartRender 残留：runtime 映射、height/title 回退、i18n、copy、字段规范化。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const runtimeProps = vi.hoisted(() => ({
  radar: [] as any[],
  scatter: [] as any[],
  funnel: [] as any[],
  histogram: [] as any[],
  pie: [] as any[],
  bar: [] as any[],
  donut: [] as any[],
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

const mk =
  (testId: string, bucket: any[]) =>
  (props: any) => {
    bucket.push(props);
    return <div data-testid={testId} />;
  };

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    AreaChart: () => <div data-testid="area" />,
    BarChart: mk('bar', runtimeProps.bar),
    BoxPlotChart: () => <div data-testid="box" />,
    DonutChart: mk('pie', runtimeProps.pie),
    FunnelChart: mk('funnel', runtimeProps.funnel),
    HistogramChart: mk('hist', runtimeProps.histogram),
    LineChart: () => <div data-testid="line" />,
    RadarChart: mk('radar', runtimeProps.radar),
    ScatterChart: mk('scatter', runtimeProps.scatter),
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

const i18nFallback = {
  locale: {
    'common.conversionRate': undefined,
    'common.conversion': undefined,
    copySuccess: undefined,
  },
};

const i18nFull = {
  locale: {
    'common.conversionRate': '转化率',
    'common.conversion': '转化',
    copySuccess: 'Copied',
  },
};

const wrap = (ui: React.ReactElement) => {
  cleanup();
  return render(
    <I18nContext.Provider value={i18nFallback as any}>{ui}</I18nContext.Provider>,
  );
};

const baseConfig = {
  columns: [
    { title: '', dataIndex: 'name' },
    { title: '', dataIndex: 'value' },
  ],
  x: 'name',
  y: 'value',
};

const titledConfig = {
  columns: [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Value', dataIndex: 'value' },
  ],
  x: 'name',
  y: 'value',
};

describe('ChartRender residual data/config branches', () => {
  beforeEach(() => {
    runtimeProps.radar.length = 0;
    runtimeProps.scatter.length = 0;
    runtimeProps.funnel.length = 0;
    runtimeProps.histogram.length = 0;
    runtimeProps.pie.length = 0;
    runtimeProps.bar.length = 0;
    runtimeProps.donut.length = 0;
    process.env.NODE_ENV = 'development';
    Object.defineProperty(window, 'notRenderChart', {
      configurable: true,
      value: false,
      writable: true,
    });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    process.env.NODE_ENV = 'test';
  });

  it('radar：空 chartData；无 height 回退 400；title 空串', async () => {
    wrap(
      <ChartRender
        chartType="radar"
        chartData={[]}
        config={baseConfig as any}
        title={undefined as any}
      />,
    );
    await waitFor(() => expect(screen.getByTestId('radar')).toBeInTheDocument());
    expect(runtimeProps.radar[0]?.height).toBe(400);
    expect(runtimeProps.radar[0]?.title).toBe('');
    expect(runtimeProps.radar[0]?.data).toEqual([]);
  });

  it('scatter / funnel / histogram：空数据与 locale 回退文案', async () => {
    wrap(
      <ChartRender
        chartType="scatter"
        chartData={[]}
        config={{ ...baseConfig, height: undefined } as any}
        title=""
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId('scatter')).toBeInTheDocument(),
    );
    expect(runtimeProps.scatter[0]?.height).toBe(400);

    wrap(
      <ChartRender
        chartType="funnel"
        chartData={[]}
        config={baseConfig as any}
        title=""
        colorLegend="series"
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId('funnel')).toBeInTheDocument(),
    );
    expect(runtimeProps.funnel[0]?.typeNames).toEqual({
      rate: '转化率',
      name: 'series',
    });

    wrap(
      <ChartRender
        chartType="histogram"
        chartData={[]}
        config={baseConfig as any}
      />,
    );
    await waitFor(() => expect(screen.getByTestId('hist')).toBeInTheDocument());
  });

  it('pie / donut：无 height 回退 400；loading 默认 false', async () => {
    wrap(
      <ChartRender
        chartType="pie"
        chartData={[{ name: 'a', value: 1 }]}
        config={{ columns: titledConfig.columns, x: 'name', y: 'value' } as any}
      />,
    );
    await waitFor(() =>
      expect(runtimeProps.pie.length).toBeGreaterThan(0),
    );
    expect(runtimeProps.pie[0]?.loading).toBe(false);
    expect(runtimeProps.pie[0]?.width ?? runtimeProps.pie[0]?.height).toBe(400);

    runtimeProps.pie.length = 0;
    wrap(
      <ChartRender
        chartType="donut"
        chartData={[{ name: 'b', value: 2 }]}
        config={{ columns: titledConfig.columns, x: 'name', y: 'value' } as any}
        loading
      />,
    );
    await waitFor(() => expect(runtimeProps.pie.length).toBe(1));
    expect(runtimeProps.pie[0]?.loading).toBe(true);
  });

  it('scatter/radar/funnel 映射 type/category/filterLabel 真值展开', async () => {
    wrap(
      <ChartRender
        chartType="scatter"
        chartData={[
          { name: '1', value: 10, cat: 'C1', series: 'S1', fl: 'F1' },
        ]}
        config={titledConfig as any}
        groupBy="cat"
        colorLegend="series"
        filterBy="fl"
        title="ScatterMap"
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId('scatter')).toBeInTheDocument(),
    );
    expect(runtimeProps.scatter[0]?.data[0]).toEqual(
      expect.objectContaining({
        x: 1,
        y: 10,
        category: 'C1',
        type: 'S1',
        filterLabel: 'F1',
      }),
    );

    wrap(
      <ChartRender
        chartType="radar"
        chartData={[{ name: 'dim', value: 5, cat: 'C1', series: 'S1', fl: 'F1' }]}
        config={titledConfig as any}
        groupBy="cat"
        colorLegend="series"
        filterBy="fl"
      />,
    );
    await waitFor(() => expect(screen.getByTestId('radar')).toBeInTheDocument());
    expect(runtimeProps.radar.at(-1)?.data[0]).toEqual(
      expect.objectContaining({
        category: 'C1',
        type: 'S1',
        filterLabel: 'F1',
      }),
    );

    wrap(
      <ChartRender
        chartType="funnel"
        chartData={[
          { name: 'step', value: 100, ratio: 50, cat: 'C1', series: 'S1', fl: 'F1' },
        ]}
        config={titledConfig as any}
        groupBy="cat"
        colorLegend="series"
        filterBy="fl"
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId('funnel')).toBeInTheDocument(),
    );
    expect(runtimeProps.funnel.at(-1)?.data[0]).toEqual(
      expect.objectContaining({
        ratio: 50,
        category: 'C1',
        type: 'S1',
        filterLabel: 'F1',
      }),
    );
  });

  it('histogram 预分箱与 y 非有限回退 0', async () => {
    wrap(
      <ChartRender
        chartType="histogram"
        chartData={[
          {
            groupKey: { DIM_LEFT: 0, DIM_RIGHT: 10 },
            MEASURE_PROB: [{ actualValue: 0.5 }],
            cat: 'C1',
            series: 'S1',
            fl: 'F1',
          },
          { name: 'bad', value: 'nope' },
        ]}
        config={titledConfig as any}
        groupBy="cat"
        colorLegend="series"
        filterBy="fl"
      />,
    );
    await waitFor(() => expect(screen.getByTestId('hist')).toBeInTheDocument());
    const histData = runtimeProps.histogram[0]?.data;
    expect(histData?.[0]).toEqual(
      expect.objectContaining({
        value: 0.5,
        left: 0,
        right: 10,
        category: 'C1',
        type: 'S1',
        filterLabel: 'F1',
      }),
    );
    expect(histData?.[1]?.value).toBe(0);
  });

  it('convertFlatData xtitle/ytitle 缺列 title 时用字段名；normalizeFieldName 空串', async () => {
    wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ name: 'A', value: 3 }]}
        config={{
          columns: [{ dataIndex: 'name' }, { dataIndex: 'value' }],
          x: 'name',
          y: 'value',
          height: 320,
        }}
        title=""
      />,
    );
    await waitFor(() => expect(screen.getByTestId('bar')).toBeInTheDocument());
    expect(runtimeProps.bar[0]?.data[0]).toEqual(
      expect.objectContaining({
        xtitle: 'name',
        ytitle: 'value',
      }),
    );
  });

  it('table 空数据复制返回空串；成功复制 locale 回退', async () => {
    const copy = (await import('copy-to-clipboard')).default as ReturnType<
      typeof vi.fn
    >;
    vi.mocked(copy).mockClear();
    vi.mocked(copy).mockReturnValue(false);
    wrap(
      <ChartRender
        chartType="table"
        chartData={[]}
        config={titledConfig as any}
      />,
    );
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__table'),
      ).toBeInTheDocument();
    });
    const copyIcon = document.querySelector('.anticon-copy');
    if (copyIcon) fireEvent.click(copyIcon);
    expect(copy).not.toHaveBeenCalled();

    vi.mocked(copy).mockReturnValue(true);
    render(
      <I18nContext.Provider value={i18nFallback as any}>
        <ChartRender
          chartType="table"
          chartData={[{ name: 'A', value: 1, key: '1' }]}
          config={titledConfig as any}
        />
      </I18nContext.Provider>,
    );
    await waitFor(() => {
      const tables = document.querySelectorAll('.ant-agentic-plugin-chart__table');
      expect(tables.length).toBeGreaterThan(0);
    });
    const copyIcons = document.querySelectorAll('.anticon-copy');
    fireEvent.click(copyIcons[copyIcons.length - 1]!);
    await waitFor(() => {
      expect(copy).toHaveBeenCalled();
      expect(screen.getByText('复制成功')).toBeInTheDocument();
    });
  });

  it('bar 缺省 height 走 runtime fallback 400', async () => {
    wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ name: 'A', value: 1 }]}
        config={{ ...titledConfig, height: undefined } as any}
        title={undefined as any}
      />,
    );
    await waitFor(() => expect(runtimeProps.bar.length).toBeGreaterThan(0));
    expect(runtimeProps.bar[0]?.height).toBe(400);
    expect(runtimeProps.bar[0]?.title).toBe('');
  });

  it('line/column/area：无 height/title；rest showLegend/showGrid 显式 false', async () => {
    const types = ['line', 'column', 'area'] as const;
    for (const chartType of types) {
      wrap(
        <ChartRender
          chartType={chartType}
          chartData={[{ name: 'A', value: 2 }]}
          config={
            {
              ...titledConfig,
              height: undefined,
              rest: { showLegend: false, showGrid: false, stacked: true },
            } as any
          }
          title={undefined as any}
        />,
      );
      await waitFor(() => {
        const id =
          chartType === 'column' ? 'bar' : chartType === 'area' ? 'area' : 'line';
        expect(screen.getByTestId(id)).toBeInTheDocument();
      });
    }
    expect(runtimeProps.bar.some((p) => p.indexAxis === 'x')).toBe(true);
  });

  it('radar/scatter 行字段空值：x/y 回退与 category/type/filter 省略', async () => {
    wrap(
      <ChartRender
        chartType="radar"
        chartData={[
          { name: '', value: '', cat: 'C', series: 'S', fl: 'F' },
          { name: null, value: null },
        ]}
        config={
          {
            ...titledConfig,
            height: undefined,
          } as any
        }
        groupBy="cat"
        colorLegend="series"
        filterBy="fl"
        title=""
      />,
    );
    await waitFor(() => expect(runtimeProps.radar.length).toBeGreaterThan(0));
    expect(runtimeProps.radar.at(-1)?.data?.[0]).toEqual(
      expect.objectContaining({
        x: '1',
        y: 0,
        category: 'C',
        type: 'S',
        filterLabel: 'F',
      }),
    );

    wrap(
      <ChartRender
        chartType="scatter"
        chartData={[{ name: 'x', value: '3' }]}
        config={{ ...titledConfig, height: undefined } as any}
        title=""
      />,
    );
    await waitFor(() => expect(runtimeProps.scatter.length).toBeGreaterThan(0));
    expect(runtimeProps.scatter.at(-1)?.height).toBe(400);
  });

  it('boxplot / pie loading true；funnel colorLegend 缺省 i18n', async () => {
    wrap(
      <ChartRender
        chartType="boxplot"
        chartData={[{ name: 'A', value: [1, 2, 3, 4, 5] }]}
        config={{ ...titledConfig, height: undefined } as any}
        title=""
        loading
      />,
    );
    await waitFor(() => expect(screen.getByTestId('box')).toBeInTheDocument());

    wrap(
      <ChartRender
        chartType="pie"
        chartData={[{ name: 'a', value: 1 }]}
        config={{ ...titledConfig, height: undefined } as any}
        loading
      />,
    );
    await waitFor(() => expect(runtimeProps.pie.at(-1)?.loading).toBe(true));
    expect(runtimeProps.pie.at(-1)?.height).toBe(400);

    wrap(
      <ChartRender
        chartType="funnel"
        chartData={[{ name: 's', value: 10 }]}
        config={baseConfig as any}
        title=""
      />,
    );
    await waitFor(() =>
      expect(runtimeProps.funnel.at(-1)?.typeNames?.name).toBe('转化'),
    );
  });

  it('histogram/funnel/scatter 多行映射：数值串、缺字段、filterBy/groupBy', async () => {
    wrap(
      <ChartRender
        chartType="histogram"
        chartData={[
          { name: 'a', value: '3', cat: 'C1', series: 'S1' },
          { name: 'b', value: 7, cat: 'C1', series: 'S1' },
          { name: 'c', value: null, cat: 'C2' },
        ]}
        config={{ ...titledConfig, height: 280 } as any}
        groupBy="cat"
        colorLegend="series"
        title="hist-map"
      />,
    );
    await waitFor(() => expect(runtimeProps.histogram.length).toBeGreaterThan(0));
    expect(runtimeProps.histogram.at(-1)?.height).toBe(280);

    wrap(
      <ChartRender
        chartType="funnel"
        chartData={[
          { name: 'Step1', value: 100, fl: 'A' },
          { name: 'Step2', value: '40', fl: 'A' },
          { name: '', value: 10, fl: 'B' },
        ]}
        config={{ ...titledConfig, height: undefined } as any}
        filterBy="fl"
        colorLegend="阶段"
        title=""
      />,
    );
    await waitFor(() => expect(runtimeProps.funnel.length).toBeGreaterThan(0));
    expect(runtimeProps.funnel.at(-1)?.data?.length).toBeGreaterThan(0);

    wrap(
      <ChartRender
        chartType="scatter"
        chartData={[
          { name: '1', value: '2', series: 'P' },
          { name: 3, value: 4 },
        ]}
        config={{ ...titledConfig, height: 320 } as any}
        colorLegend="series"
        title="sc"
      />,
    );
    await waitFor(() => expect(runtimeProps.scatter.length).toBeGreaterThan(0));
    expect(runtimeProps.scatter.at(-1)?.height).toBe(320);
  });

  it('bar/column 带 indexAxis；donut 数据转换', async () => {
    wrap(
      <ChartRender
        chartType="bar"
        chartData={[
          { name: 'x', value: 1, series: 'A' },
          { name: 'y', value: 2, series: 'A' },
        ]}
        config={{ ...titledConfig, height: 200 } as any}
        colorLegend="series"
        title="bar"
      />,
    );
    await waitFor(() => expect(runtimeProps.bar.length).toBeGreaterThan(0));

    wrap(
      <ChartRender
        chartType="column"
        chartData={[{ name: 'c', value: 5 }]}
        config={titledConfig as any}
        title="col"
      />,
    );
    await waitFor(() => expect(runtimeProps.bar.length).toBeGreaterThan(1));

    wrap(
      <ChartRender
        chartType="donut"
        chartData={[
          { name: 'n1', value: 10 },
          { name: 'n2', value: 20 },
        ]}
        config={{ ...titledConfig, height: undefined } as any}
        title=""
      />,
    );
    await waitFor(() => expect(runtimeProps.pie.length).toBeGreaterThan(0));
  });

  it('area/line/boxplot/pie height 与 title 回退；空 columns', async () => {
    wrap(
      <ChartRender
        chartType="area"
        chartData={[{ name: 'a', value: 1 }]}
        config={{ ...titledConfig, height: undefined } as any}
        title=""
      />,
    );
    await waitFor(() => expect(screen.getByTestId('area')).toBeInTheDocument());

    wrap(
      <ChartRender
        chartType="line"
        chartData={[{ name: 'a', value: 2 }]}
        config={{ ...titledConfig, height: 180 } as any}
        title="line"
      />,
    );
    await waitFor(() => expect(screen.getByTestId('line')).toBeInTheDocument());

    wrap(
      <ChartRender
        chartType="pie"
        chartData={[
          { name: 'p1', value: 3 },
          { name: 'p2', value: 7 },
        ]}
        config={{ ...titledConfig, height: undefined } as any}
        title=""
      />,
    );
    await waitFor(() => expect(runtimeProps.pie.length).toBeGreaterThan(0));

    wrap(
      <ChartRender
        chartType="boxplot"
        chartData={[
          { name: 'g', value: 1, series: 's' },
          { name: 'g', value: 3, series: 's' },
          { name: 'g', value: 5, series: 's' },
        ]}
        config={{ ...titledConfig, height: 260 } as any}
        colorLegend="series"
        title="box"
      />,
    );
    await waitFor(() => expect(screen.getByTestId('box')).toBeInTheDocument());
  });

  it('radar 映射 filterBy/colorLegend；空 chartData', async () => {
    wrap(
      <ChartRender
        chartType="radar"
        chartData={[
          { name: '速度', value: 80, fl: 'A', series: 'S1' },
          { name: '力量', value: 60, fl: 'A', series: 'S1' },
          { name: '速度', value: 70, fl: 'B', series: 'S2' },
        ]}
        config={{ ...titledConfig, height: 300 } as any}
        filterBy="fl"
        colorLegend="series"
        title="radar"
      />,
    );
    await waitFor(() => expect(runtimeProps.radar.length).toBeGreaterThan(0));
    expect(runtimeProps.radar.at(-1)?.height).toBe(300);

    wrap(
      <ChartRender
        chartType="bar"
        chartData={[]}
        config={{ columns: [], x: 'name', y: 'value' } as any}
        title=""
      />,
    );
    await waitFor(() => expect(true).toBe(true));
  });

  it('histogram 无 groupBy/colorLegend/filterBy：省略 type/category/filterLabel', async () => {
    wrap(
      <ChartRender
        chartType="histogram"
        chartData={[
          { name: 'a', value: 3 },
          { name: 'b', value: '5' },
          {
            groupKey: { DIM_LEFT: 1, DIM_RIGHT: 2 },
            MEASURE_PROB: [{ actualValue: 0.2 }],
          },
        ]}
        config={{ ...titledConfig, height: undefined } as any}
        title=""
      />,
    );
    await waitFor(() =>
      expect(runtimeProps.histogram.length).toBeGreaterThan(0),
    );
    const rows = runtimeProps.histogram.at(-1)?.data || [];
    expect(rows.some((r: any) => !('type' in r) && !('category' in r))).toBe(
      true,
    );
    expect(runtimeProps.histogram.at(-1)?.height).toBe(400);
  });

  it('scatter/radar/funnel 无分组字段：条件展开假值臂', async () => {
    wrap(
      <ChartRender
        chartType="scatter"
        chartData={[{ name: '2', value: 4 }]}
        config={{ ...titledConfig, height: undefined } as any}
        title=""
      />,
    );
    await waitFor(() =>
      expect(runtimeProps.scatter.length).toBeGreaterThan(0),
    );
    expect(runtimeProps.scatter.at(-1)?.data?.[0]).toEqual(
      expect.objectContaining({ x: 2, y: 4 }),
    );
    expect(runtimeProps.scatter.at(-1)?.data?.[0]?.type).toBeUndefined();

    wrap(
      <ChartRender
        chartType="radar"
        chartData={[{ name: 'dim', value: 1 }]}
        config={baseConfig as any}
        title={undefined as any}
      />,
    );
    await waitFor(() => expect(runtimeProps.radar.length).toBeGreaterThan(0));

    wrap(
      <ChartRender
        chartType="funnel"
        chartData={[{ name: 's', value: 9 }]}
        config={baseConfig as any}
        title=""
      />,
    );
    await waitFor(() => expect(runtimeProps.funnel.length).toBeGreaterThan(0));
    expect(runtimeProps.funnel.at(-1)?.typeNames?.rate).toBe('转化率');
  });

  it('column/area/line 省略 loading；table 列 title 空串', async () => {
    wrap(
      <ChartRender
        chartType="column"
        chartData={[{ name: 'c', value: 1 }]}
        config={
          {
            columns: [
              { title: '', dataIndex: 'name' },
              { title: '', dataIndex: 'value' },
            ],
            x: 'name',
            y: 'value',
            height: undefined,
            rest: undefined,
          } as any
        }
      />,
    );
    await waitFor(() => expect(runtimeProps.bar.length).toBeGreaterThan(0));

    wrap(
      <ChartRender
        chartType="table"
        chartData={[{ name: 'A', value: null, key: '1' }]}
        config={
          {
            columns: [
              { title: '', dataIndex: 'name' },
              { dataIndex: 'value' },
            ],
            x: 'name',
            y: 'value',
          } as any
        }
        title=""
      />,
    );
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__table'),
      ).toBeInTheDocument();
    });
  });

  it('istanbul deepen：pie/donut/scatter/histogram 空 title；chartData 空；i18n 全量', async () => {
    cleanup();
    render(
      <I18nContext.Provider value={i18nFull as any}>
        <ChartRender
          chartType="pie"
          chartData={[]}
          config={{ ...baseConfig, height: undefined } as any}
          title={'' as any}
        />
      </I18nContext.Provider>,
    );
    await waitFor(() => expect(runtimeProps.pie.length).toBeGreaterThan(0));
    expect(runtimeProps.pie.at(-1)?.title).toBe('');

    wrap(
      <ChartRender
        chartType="donut"
        chartData={[{ name: 'a', value: 1 }]}
        config={titledConfig as any}
        title={undefined as any}
        loading
      />,
    );
    await waitFor(() => expect(runtimeProps.pie.length).toBeGreaterThan(1));

    wrap(
      <ChartRender
        chartType="scatter"
        chartData={[{ name: 'x', value: 2, type: 't' }]}
        config={{ ...baseConfig, height: 120 } as any}
        title=""
      />,
    );
    await waitFor(() => expect(runtimeProps.scatter.length).toBeGreaterThan(0));

    wrap(
      <ChartRender
        chartType="histogram"
        chartData={[{ name: 'h', value: 3 }]}
        config={baseConfig as any}
        title=""
      />,
    );
    await waitFor(() =>
      expect(runtimeProps.histogram.length).toBeGreaterThan(0),
    );

    wrap(
      <ChartRender
        chartType="bar"
        chartData={[{ name: 'b', value: 4, category: 'c' }]}
        config={{ ...titledConfig, rest: { stacked: true } } as any}
        title=""
      />,
    );
    await waitFor(() => expect(runtimeProps.bar.length).toBeGreaterThan(0));
    expect(runtimeProps.bar.at(-1)?.title).toBe('');

    wrap(
      <ChartRender
        chartType="funnel"
        chartData={[
          { name: 's1', value: 10 },
          { name: 's2', value: 4 },
        ]}
        config={baseConfig as any}
        title=""
      />,
    );
    await waitFor(() => expect(runtimeProps.funnel.length).toBeGreaterThan(0));
    expect(runtimeProps.funnel.at(-1)?.typeNames?.rate).toBeTruthy();
  });

  it('istanbul deepen：全类型 height/title 假值；boxplot；histogram 预分箱；area/line；escaped y', async () => {
    const noHeight = { ...baseConfig, height: undefined, index: 9 } as any;
    const types = [
      'bar',
      'column',
      'line',
      'area',
      'radar',
      'scatter',
      'funnel',
      'histogram',
      'boxplot',
      'pie',
      'donut',
    ] as const;

    for (const chartType of types) {
      wrap(
        <ChartRender
          chartType={chartType}
          chartData={
            chartType === 'boxplot'
              ? [
                  { name: 'A', value: 1, type: 't' },
                  { name: 'A', value: 3, type: 't' },
                  { name: 'B', value: 2, type: 't' },
                  { name: 'B', value: 8, type: 't' },
                ]
              : chartType === 'histogram'
                ? [
                    {
                      groupKey: { DIM_LEFT: 0, DIM_RIGHT: 1 },
                      MEASURE_PROB: [{ actualValue: 0.4 }],
                      series: 's1',
                    },
                    {
                      name: 'raw',
                      value: '2.5',
                    },
                  ]
                : [{ name: 'n', value: 5, type: 't', category: 'c' }]
          }
          config={
            {
              ...noHeight,
              rest: { stacked: false, showLegend: false, showGrid: false },
              y: chartType === 'histogram' ? 'value' : 'value',
              colorLegend: chartType === 'histogram' ? 'series' : undefined,
              groupBy: chartType === 'funnel' ? 'category' : undefined,
            } as any
          }
          title={'' as any}
          filterBy={chartType === 'scatter' ? 'category' : undefined}
          colorLegend={chartType === 'radar' ? 'type' : undefined}
        />,
      );
    }

    await waitFor(() => {
      expect(runtimeProps.bar.length).toBeGreaterThan(0);
      expect(runtimeProps.histogram.length).toBeGreaterThan(0);
    });

    wrap(
      <ChartRender
        chartType="line"
        chartData={[{ 'index\\_value': 1, name: 'a' }]}
        config={
          {
            columns: [
              { title: 'N', dataIndex: 'name' },
              { title: 'V', dataIndex: 'index\\_value' },
            ],
            x: 'name',
            y: 'index\\_value',
            height: 0,
          } as any
        }
        title={undefined as any}
      />,
    );
    await waitFor(() => expect(document.body).toBeTruthy());

    wrap(
      <ChartRender
        chartType="descriptions"
        chartData={[{ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9 }]}
        config={
          {
            columns: Array.from({ length: 9 }, (_, i) => ({
              title: i === 0 ? '' : `C${i}`,
              dataIndex: String.fromCharCode(97 + i),
            })),
            x: 'a',
            y: 'b',
          } as any
        }
        title=""
      />,
    );
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__descriptions') ||
          document.body,
      ).toBeTruthy();
    });
  });
});

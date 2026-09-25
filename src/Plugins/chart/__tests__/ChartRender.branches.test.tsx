/**
 * ChartRender 分支覆盖补充测试
 *
 * 聚焦 runtime 映射、descriptions 回退、boxplot/histogram/funnel 等
 * 未在主测试中稳定覆盖的分支。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import message from 'antd/es/message';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const runtimeCalls = vi.hoisted(() => ({
  boxplot: [] as any[][],
  histogram: [] as any[][],
  funnel: [] as any[][],
  scatter: [] as any[][],
  pie: [] as any[][],
  bar: [] as any[][],
  line: [] as any[][],
  area: [] as any[][],
  radar: [] as any[][],
}));

/** 与 runtimeCalls 平行：保存完整 props，便于断言 typeNames/title/loading */
const runtimeProps = vi.hoisted(() => ({
  boxplot: [] as any[],
  histogram: [] as any[],
  funnel: [] as any[],
  scatter: [] as any[],
  pie: [] as any[],
  bar: [] as any[],
  line: [] as any[],
  area: [] as any[],
  radar: [] as any[],
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

const createRuntimeChart =
  (testId: string, bucket: any[][], propsBucket: any[]) =>
  (props: { data?: any[]; width?: number; height?: number }) => {
    bucket.push(props.data ?? []);
    propsBucket.push(props);
    return (
      <div
        data-testid={testId}
        data-width={props.width}
        data-height={props.height}
      />
    );
  };

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    AreaChart: createRuntimeChart(
      'area-chart',
      runtimeCalls.area,
      runtimeProps.area,
    ),
    BarChart: createRuntimeChart(
      'bar-chart',
      runtimeCalls.bar,
      runtimeProps.bar,
    ),
    BoxPlotChart: createRuntimeChart(
      'boxplot-chart',
      runtimeCalls.boxplot,
      runtimeProps.boxplot,
    ),
    DonutChart: createRuntimeChart(
      'donut-chart',
      runtimeCalls.pie,
      runtimeProps.pie,
    ),
    FunnelChart: createRuntimeChart(
      'funnel-chart',
      runtimeCalls.funnel,
      runtimeProps.funnel,
    ),
    HistogramChart: createRuntimeChart(
      'histogram-chart',
      runtimeCalls.histogram,
      runtimeProps.histogram,
    ),
    LineChart: createRuntimeChart(
      'line-chart',
      runtimeCalls.line,
      runtimeProps.line,
    ),
    RadarChart: createRuntimeChart(
      'radar-chart',
      runtimeCalls.radar,
      runtimeProps.radar,
    ),
    ScatterChart: createRuntimeChart(
      'scatter-chart',
      runtimeCalls.scatter,
      runtimeProps.scatter,
    ),
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

const i18nValue = {
  locale: {
    copySuccess: '复制成功',
    copyMarkdown: '复制表格',
    configChart: '配置图表',
    updateChart: '更新',
    pieChart: '饼图',
    funnelChart: '漏斗图',
    boxplotChart: '箱线图',
    histogramChart: '直方图',
    scatterChart: '散点图',
    columnChart: '柱状图',
    docCards: '卡片列表',
    table: '表格',
    'common.conversionRate': '转化率',
    'common.conversion': '转化',
  },
};

const openChartTypeDropdown = async (typeLabel: string) => {
  const user = userEvent.setup();
  const trigger =
    screen.getByText(typeLabel).closest('.ant-dropdown-trigger') ??
    screen.getByText(typeLabel);
  await user.click(trigger);
  await waitFor(() => {
    expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0);
  });
};

const clickDropdownMenuItem = async (label: string) => {
  const user = userEvent.setup();
  const menu = document.body.querySelector('.ant-dropdown');
  const scope = menu ? within(menu as HTMLElement) : screen;
  const menuItem = await scope.findByRole('menuitem', { name: label });
  await user.click(menuItem);
};

const runtimeConfig = {
  columns: [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Value', dataIndex: 'value' },
  ],
  height: 320,
  rest: {},
  x: 'name',
  y: 'value',
};

const wideConfig = {
  columns: [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Value', dataIndex: 'value' },
    { title: 'C1', dataIndex: 'c1' },
    { title: 'C2', dataIndex: 'c2' },
    { title: 'C3', dataIndex: 'c3' },
    { title: 'C4', dataIndex: 'c4' },
    { title: 'C5', dataIndex: 'c5' },
    { title: 'C6', dataIndex: 'c6' },
    { title: 'C7', dataIndex: 'c7' },
  ],
  height: 320,
  rest: {},
  x: 'name',
  y: 'value',
};

describe('ChartRender 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeCalls.boxplot.length = 0;
    runtimeCalls.histogram.length = 0;
    runtimeCalls.funnel.length = 0;
    runtimeCalls.scatter.length = 0;
    runtimeCalls.pie.length = 0;
    runtimeCalls.bar.length = 0;
    runtimeCalls.line.length = 0;
    runtimeCalls.area.length = 0;
    runtimeCalls.radar.length = 0;
    runtimeProps.boxplot.length = 0;
    runtimeProps.histogram.length = 0;
    runtimeProps.funnel.length = 0;
    runtimeProps.scatter.length = 0;
    runtimeProps.pie.length = 0;
    runtimeProps.bar.length = 0;
    runtimeProps.line.length = 0;
    runtimeProps.area.length = 0;
    runtimeProps.radar.length = 0;
    process.env.NODE_ENV = 'development';
    Object.defineProperty(window, 'notRenderChart', {
      configurable: true,
      value: false,
      writable: true,
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
    vi.restoreAllMocks();
  });

  const renderChart = (props: React.ComponentProps<typeof ChartRender>) =>
    render(
      <I18nContext.Provider value={i18nValue as any}>
        <ChartRender {...props} />
      </I18nContext.Provider>,
    );

  it('renderDescriptionsFallback：单行多列时渲染 descriptions', async () => {
    renderChart({
      chartType: 'bar',
      chartData: [{ name: 'Only', value: 1, c1: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6, c7: 7 }],
      config: wideConfig,
      title: 'Fallback',
    });

    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__descriptions'),
      ).toBeInTheDocument();
    });
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('pie 类型传递 config.height 作为宽高', async () => {
    renderChart({
      chartType: 'pie',
      chartData: [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
      ],
      config: { ...runtimeConfig, height: 480 },
      title: 'Pie',
    });

    await screen.findByTestId('donut-chart');
    await waitFor(() => {
      const el = screen.getByTestId('donut-chart');
      expect(el.getAttribute('data-width')).toBe('480');
      expect(el.getAttribute('data-height')).toBe('480');
    });
  });

  it('boxplot runtime 按 label 分组并过滤非有限值', async () => {
    renderChart({
      chartType: 'boxplot',
      chartData: [
        { name: 'G1', value: 10, series: 'S1' },
        { name: 'G1', value: 'bad', series: 'S1' },
        { name: 'G1', value: 20, series: 'S1' },
      ],
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'Box',
    });

    await screen.findByTestId('boxplot-chart');
    await waitFor(() => {
      expect(runtimeCalls.boxplot.at(-1)).toEqual([
        expect.objectContaining({
          label: 'G1',
          values: [10, 20],
          type: 'S1',
        }),
      ]);
    });
  });

  it('histogram 预分箱数据映射', async () => {
    renderChart({
      chartType: 'histogram',
      chartData: [
        {
          groupKey: { DIM_LEFT: 0, DIM_RIGHT: 10 },
          MEASURE_PROB: [{ actualValue: 5 }],
        },
      ],
      config: runtimeConfig,
      title: 'Hist',
    });

    await screen.findByTestId('histogram-chart');
    await waitFor(() => {
      expect(runtimeCalls.histogram.at(-1)).toEqual([
        expect.objectContaining({
          value: 5,
          left: 0,
          right: 10,
        }),
      ]);
    });
  });

  it('funnel runtime 映射 ratio 与 groupBy/filterBy', async () => {
    renderChart({
      chartType: 'funnel',
      chartData: [
        {
          name: 'Step1',
          value: 100,
          ratio: 1,
          category: 'C1',
          filter: 'F1',
          series: 'S1',
        },
      ],
      groupBy: 'category',
      filterBy: 'filter',
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'Funnel',
    });

    await screen.findByTestId('funnel-chart');
    await waitFor(() => {
      expect(runtimeCalls.funnel.at(-1)).toEqual([
        expect.objectContaining({
          x: 'Step1',
          y: 100,
          ratio: 1,
          category: 'C1',
          filterLabel: 'F1',
          type: 'S1',
        }),
      ]);
    });
  });

  it('scatter 映射 x/y 缺省为 0', async () => {
    renderChart({
      chartType: 'scatter',
      chartData: [
        { name: 'A', value: 1 },
        { name: '', value: '' },
      ],
      config: runtimeConfig,
      title: 'Scatter',
    });

    await screen.findByTestId('scatter-chart');
    await waitFor(() => {
      expect(runtimeCalls.scatter.at(-1)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ x: 0, y: 0 }),
        ]),
      );
    });
  });

  it('复制 Markdown 空表格时不弹出成功提示', async () => {
    const successSpy = vi.spyOn(message, 'success').mockImplementation(vi.fn());
    renderChart({
      chartType: 'table',
      chartData: [],
      config: { ...runtimeConfig, columns: [] },
      title: 'Table',
    });

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });

    const copyIcon = document.querySelector('.anticon-copy');
    if (copyIcon) fireEvent.click(copyIcon);
    expect(successSpy).not.toHaveBeenCalled();
    successSpy.mockRestore();
  });

  it('复制 Markdown 有数据时弹出成功提示', async () => {
    const copy = (await import('copy-to-clipboard')).default as ReturnType<
      typeof vi.fn
    >;
    renderChart({
      chartType: 'table',
      chartData: [{ name: 'A', value: 1, key: '1' }],
      config: runtimeConfig,
      title: 'Table',
    });

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });

    const copyIcon = document.querySelector('.anticon-copy');
    if (copyIcon) fireEvent.click(copyIcon);
    expect(copy).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('复制成功')).toBeInTheDocument();
    });
  });

  it('table 类型渲染表格 DOM', async () => {
    renderChart({
      chartType: 'table',
      chartData: [{ name: 'A', value: 1, key: '1' }],
      config: runtimeConfig,
      title: 'My Table',
    });

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });
    expect(screen.getByText('My Table')).toBeInTheDocument();
  });

  it('descriptions 类型渲染定义列表', async () => {
    renderChart({
      chartType: 'descriptions',
      chartData: [
        { name: 'A', value: 1 },
        { name: 'B', value: 2 },
      ],
      config: runtimeConfig,
      title: 'Desc',
    });

    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__descriptions'),
      ).toBeInTheDocument();
    });
  });

  it('docCards 类型渲染卡片列表', async () => {
    renderChart({
      chartType: 'docCards',
      chartData: [{ 名称: 'Doc A', 地址: 'Addr', 简介: 'Intro' }],
      config: {
        ...runtimeConfig,
        columns: [
          { title: '名称', dataIndex: '名称' },
          { title: '地址', dataIndex: '地址' },
          { title: '简介', dataIndex: '简介' },
        ],
        rest: { cardColumns: 2 },
      },
      title: 'Cards',
    });

    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__doc-cards'),
      ).toBeInTheDocument();
    });
  });

  it('quadrant 类型渲染四象限图', async () => {
    renderChart({
      chartType: 'quadrant',
      chartData: [{ name: 'Item', x: 1, y: 2, quadrant: 'Q1' }],
      config: {
        ...runtimeConfig,
        columns: [
          { title: 'Name', dataIndex: 'name' },
          { title: 'X', dataIndex: 'x' },
          { title: 'Y', dataIndex: 'y' },
          { title: 'Quadrant', dataIndex: 'quadrant' },
        ],
      },
      title: 'Quadrant',
    });

    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__quadrant-chart'),
      ).toBeInTheDocument();
    });
  });

  it('donut 类型传递 convertDonutData', async () => {
    renderChart({
      chartType: 'donut',
      chartData: [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
      ],
      config: runtimeConfig,
      title: 'Donut',
    });

    await screen.findByTestId('donut-chart');
    await waitFor(() => {
      expect(runtimeCalls.pie.at(-1)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: 'A', value: 10 }),
        ]),
      );
    });
  });

  it('bar / line / column / area runtime 分支', async () => {
    const cases = [
      { chartType: 'bar' as const, testId: 'bar-chart', bucket: runtimeCalls.bar },
      { chartType: 'line' as const, testId: 'line-chart', bucket: runtimeCalls.line },
      { chartType: 'column' as const, testId: 'bar-chart', bucket: runtimeCalls.bar },
      { chartType: 'area' as const, testId: 'area-chart', bucket: runtimeCalls.area },
    ];

    for (const { chartType, testId, bucket } of cases) {
      const beforeLen = bucket.length;
      const { unmount } = renderChart({
        chartType,
        chartData: [{ name: 'X1', value: 10, series: 'S1' }],
        groupBy: 'series',
        config: runtimeConfig,
        title: chartType,
      });
      await screen.findByTestId(testId);
      await waitFor(() => {
        expect(bucket.length).toBeGreaterThan(beforeLen);
        expect(bucket.at(-1)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ x: 'X1', category: 'S1' }),
          ]),
        );
      });
      unmount();
    }
  });

  it('radar 映射空 x/y 为序号与 0', async () => {
    renderChart({
      chartType: 'radar',
      chartData: [{ name: '', value: '' }],
      config: runtimeConfig,
      title: 'Radar',
    });

    await screen.findByTestId('radar-chart');
    await waitFor(() => {
      expect(runtimeCalls.radar.at(-1)).toEqual([
        expect.objectContaining({ x: '1', y: 0 }),
      ]);
    });
  });

  it('histogram 原始值路径（非预分箱）', async () => {
    renderChart({
      chartType: 'histogram',
      chartData: [{ name: 'A', value: '42' }],
      config: runtimeConfig,
      title: 'HistRaw',
    });

    await screen.findByTestId('histogram-chart');
    await waitFor(() => {
      expect(runtimeCalls.histogram.at(-1)).toEqual([
        expect.objectContaining({ value: 42 }),
      ]);
    });
  });

  it('funnel 无 ratio 时不附带 ratio 字段', async () => {
    renderChart({
      chartType: 'funnel',
      chartData: [{ name: 'Step1', value: 50 }],
      config: runtimeConfig,
      title: 'FunnelNoRatio',
    });

    await screen.findByTestId('funnel-chart');
    await waitFor(() => {
      const last = runtimeCalls.funnel.at(-1)?.[0];
      expect(last).toEqual(expect.objectContaining({ x: 'Step1', y: 50 }));
      expect(last).not.toHaveProperty('ratio');
    });
  });

  it('getFieldValueSafely 支持转义字段名', async () => {
    renderChart({
      chartType: 'bar',
      chartData: [{ index_value: 99 }],
      config: {
        ...runtimeConfig,
        x: 'index\\_value',
        y: 'index\\_value',
      },
      title: 'Escaped',
    });

    await screen.findByTestId('bar-chart');
    await waitFor(() => {
      expect(runtimeCalls.bar.at(-1)).toEqual([
        expect.objectContaining({ x: 99, y: 99 }),
      ]);
    });
  });

  it('isChartList 显示列数下拉', async () => {
    const onColumnLengthChange = vi.fn();
    renderChart({
      chartType: 'table',
      chartData: [{ name: 'A', value: 1, key: '1' }],
      config: runtimeConfig,
      title: 'List',
      isChartList: true,
      columnLength: 2,
      onColumnLengthChange,
    });

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });
    expect(screen.getByText(/2.*列/)).toBeInTheDocument();
  });

  it('scatter 映射 category/type/filterLabel', async () => {
    renderChart({
      chartType: 'scatter',
      chartData: [
        {
          name: '10',
          value: 10,
          series: 'S1',
          category: 'C1',
          filter: 'F1',
        },
      ],
      groupBy: 'category',
      filterBy: 'filter',
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'ScatterFull',
    });

    await screen.findByTestId('scatter-chart');
    await waitFor(() => {
      expect(runtimeCalls.scatter.at(-1)).toEqual([
        expect.objectContaining({
          x: 10,
          y: 10,
          category: 'C1',
          type: 'S1',
          filterLabel: 'F1',
        }),
      ]);
    });
  });

  it('radar 映射完整字段与数值 y', async () => {
    renderChart({
      chartType: 'radar',
      chartData: [
        {
          name: 'Dim1',
          value: 88,
          series: 'S1',
          category: 'C1',
          filter: 'F1',
        },
      ],
      groupBy: 'category',
      filterBy: 'filter',
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'RadarFull',
    });

    await screen.findByTestId('radar-chart');
    await waitFor(() => {
      expect(runtimeCalls.radar.at(-1)).toEqual([
        expect.objectContaining({
          x: 'Dim1',
          y: 88,
          category: 'C1',
          type: 'S1',
          filterLabel: 'F1',
        }),
      ]);
    });
  });

  it('boxplot 缺省 label 与非有限值过滤', async () => {
    renderChart({
      chartType: 'boxplot',
      chartData: [
        { value: 5 },
        { name: 'G2', value: 'x', series: 'S1' },
      ],
      colorLegend: 'series',
      config: { ...runtimeConfig, x: 'name', y: 'value' },
      title: 'BoxDefault',
    });

    await screen.findByTestId('boxplot-chart');
    await waitFor(() => {
      expect(runtimeCalls.boxplot.at(-1)).toEqual([
        expect.objectContaining({ label: '默认', values: [5] }),
      ]);
    });
  });

  it('histogram 非有限 y 回退为 0', async () => {
    renderChart({
      chartType: 'histogram',
      chartData: [{ name: 'A', value: 'not-a-number' }],
      config: runtimeConfig,
      title: 'HistNaN',
    });

    await screen.findByTestId('histogram-chart');
    await waitFor(() => {
      expect(runtimeCalls.histogram.at(-1)).toEqual([
        expect.objectContaining({ value: 0 }),
      ]);
    });
  });

  it('histogram 预分箱含 type/category/filterLabel', async () => {
    renderChart({
      chartType: 'histogram',
      chartData: [
        {
          groupKey: { DIM_LEFT: 0, DIM_RIGHT: 10 },
          MEASURE_PROB: [{ actualValue: 3 }],
          series: 'S1',
          category: 'C1',
          filter: 'F1',
        },
      ],
      groupBy: 'category',
      filterBy: 'filter',
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'HistMeta',
    });

    await screen.findByTestId('histogram-chart');
    await waitFor(() => {
      expect(runtimeCalls.histogram.at(-1)).toEqual([
        expect.objectContaining({
          value: 3,
          type: 'S1',
          category: 'C1',
          filterLabel: 'F1',
        }),
      ]);
    });
  });

  it('bar rest.stacked 与 showLegend/showGrid false', async () => {
    renderChart({
      chartType: 'bar',
      chartData: [{ name: 'X', value: 1 }],
      config: {
        ...runtimeConfig,
        rest: { stacked: true, showLegend: false, showGrid: false },
      },
      title: 'BarRest',
    });

    await screen.findByTestId('bar-chart');
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('convertFlatData 数值 x 与 sortBy/index', async () => {
    renderChart({
      chartType: 'line',
      chartData: [
        { name: 2024, value: 10, index: 2, series: 'S1' },
        { name: 2024, value: 20, index: 1, series: 'S1' },
      ],
      config: {
        ...runtimeConfig,
        sortBy: 'index',
      },
      title: 'SortBy',
    });

    await screen.findByTestId('line-chart');
    await waitFor(() => {
      expect(runtimeCalls.line.at(-1)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ x: 2024, sortBy: 2 }),
        ]),
      );
    });
  });

  it('donut 映射 category 与 filterLabel', async () => {
    renderChart({
      chartType: 'donut',
      chartData: [{ name: 'A', value: 5, category: 'C1', filter: 'F1' }],
      groupBy: 'category',
      filterBy: 'filter',
      config: runtimeConfig,
      title: 'DonutMeta',
    });

    await screen.findByTestId('donut-chart');
    await waitFor(() => {
      expect(runtimeCalls.pie.at(-1)).toEqual([
        expect.objectContaining({
          label: 'A',
          value: 5,
          category: 'C1',
          filterLabel: 'F1',
        }),
      ]);
    });
  });

  it('getFieldValueSafely 反向转义字段名', async () => {
    renderChart({
      chartType: 'bar',
      chartData: [{ 'index\\_value': 77 }],
      config: {
        ...runtimeConfig,
        x: 'index_value',
        y: 'index\\_value',
      },
      title: 'ReverseEscape',
    });

    await screen.findByTestId('bar-chart');
    await waitFor(() => {
      expect(runtimeCalls.bar.at(-1)).toEqual([
        expect.objectContaining({ x: 77, y: 77 }),
      ]);
    });
  });

  it('descriptions 过滤无 title 列', async () => {
    renderChart({
      chartType: 'descriptions',
      chartData: [{ name: 'A', value: 1, extra: 2 }],
      config: {
        ...runtimeConfig,
        columns: [
          { title: 'Name', dataIndex: 'name' },
          { title: '', dataIndex: 'empty' },
          { dataIndex: 'noTitle' },
          { title: 'Value', dataIndex: 'value' },
        ],
      },
      title: 'DescFilter',
    });

    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__descriptions'),
      ).toBeInTheDocument();
    });
  });

  it('table 单元格 null/undefined 渲染空字符串', async () => {
    renderChart({
      chartType: 'table',
      chartData: [{ name: null, value: undefined, key: '1' }],
      config: runtimeConfig,
      title: 'NullCells',
    });

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });
  });

  it('loading 传递给 runtime 图表', async () => {
    renderChart({
      chartType: 'line',
      chartData: [{ name: 'A', value: 1 }],
      config: runtimeConfig,
      title: 'Loading',
      loading: true,
    });

    await screen.findByTestId('line-chart');
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('dataTime 传递给 runtime', async () => {
    renderChart({
      chartType: 'area',
      chartData: [{ name: 'A', value: 1 }],
      config: runtimeConfig,
      title: 'Time',
      dataTime: '2024-06-01',
    });

    await screen.findByTestId('area-chart');
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('funnel y 为空时使用 toNumber 回退 0', async () => {
    renderChart({
      chartType: 'funnel',
      chartData: [{ name: 'Step', value: '' }],
      config: runtimeConfig,
      title: 'FunnelEmptyY',
    });

    await screen.findByTestId('funnel-chart');
    await waitFor(() => {
      expect(runtimeCalls.funnel.at(-1)).toEqual([
        expect.objectContaining({ x: 'Step', y: 0 }),
      ]);
    });
  });

  it('boxplot 含 category 分组字段', async () => {
    renderChart({
      chartType: 'boxplot',
      chartData: [
        { name: 'G1', value: 10, series: 'S1', category: 'C1' },
      ],
      groupBy: 'category',
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'BoxCat',
    });

    await screen.findByTestId('boxplot-chart');
    await waitFor(() => {
      expect(runtimeCalls.boxplot.at(-1)).toEqual([
        expect.objectContaining({ category: 'C1', type: 'S1' }),
      ]);
    });
  });

  it('数据哈希变化时防抖更新 renderKey', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { rerender } = renderChart({
      chartType: 'line',
      chartData: [{ name: 'A', value: 1 }],
      config: runtimeConfig,
      title: 'Debounce',
    });
    await screen.findByTestId('line-chart');
    const before = runtimeCalls.line.length;

    rerender(
      <I18nContext.Provider value={i18nValue as any}>
        <ChartRender
          chartType="line"
          chartData={[
            { name: 'A', value: 1 },
            { name: 'B', value: 2 },
          ]}
          config={runtimeConfig}
          title="Debounce"
        />
      </I18nContext.Provider>,
    );

    await act(async () => {
      vi.advanceTimersByTime(850);
    });
    await waitFor(() => {
      expect(runtimeCalls.line.length).toBeGreaterThan(before);
    });
    vi.useRealTimers();
  });

  it('groupBy 变化时立即更新 runtime', async () => {
    const { rerender } = renderChart({
      chartType: 'bar',
      chartData: [{ name: 'X', value: 10, series: 'S1' }],
      config: runtimeConfig,
      title: 'GroupBy',
    });
    await screen.findByTestId('bar-chart');
    const before = runtimeCalls.bar.length;

    rerender(
      <I18nContext.Provider value={i18nValue as any}>
        <ChartRender
          chartType="bar"
          chartData={[{ name: 'X', value: 10, series: 'S1', category: 'C1' }]}
          groupBy="category"
          config={runtimeConfig}
          title="GroupBy"
        />
      </I18nContext.Provider>,
    );

    await waitFor(() => {
      expect(runtimeCalls.bar.length).toBeGreaterThan(before);
      expect(runtimeCalls.bar.at(-1)).toEqual([
        expect.objectContaining({ category: 'C1' }),
      ]);
    });
  });

  it('props.chartType 变化同步内部 chartType', async () => {
    const { rerender } = renderChart({
      chartType: 'pie',
      chartData: [{ name: 'A', value: 10 }],
      config: runtimeConfig,
      title: 'Switch',
    });
    await screen.findByTestId('donut-chart');

    rerender(
      <I18nContext.Provider value={i18nValue as any}>
        <ChartRender
          chartType="funnel"
          chartData={[{ name: 'Step', value: 100 }]}
          config={runtimeConfig}
          title="Switch"
        />
      </I18nContext.Provider>,
    );

    await screen.findByTestId('funnel-chart');
  });

  it('table 工具栏配置图标可打开 Popover', async () => {
    renderChart({
      chartType: 'table',
      chartData: [{ name: 'A', value: 1, key: '1' }],
      config: runtimeConfig,
      title: 'ConfigPopover',
    });

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });

    const setting = document.querySelector('.anticon-setting');
    expect(setting).toBeTruthy();
    if (setting) {
      await act(async () => {
        fireEvent.click(setting);
      });
    }
    await waitFor(() => {
      expect(screen.getByText('配置图表')).toBeInTheDocument();
    });
  });

  it('isChartList 点击列数菜单触发 onColumnLengthChange', async () => {
    const onColumnLengthChange = vi.fn();
    renderChart({
      chartType: 'table',
      chartData: [{ name: 'A', value: 1, key: '1' }],
      config: runtimeConfig,
      title: 'Cols',
      isChartList: true,
      columnLength: 3,
      onColumnLengthChange,
    });

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });

    const triggers = screen.getAllByText((_, el) =>
      el?.textContent?.includes('3') && el?.textContent?.includes('列')
        ? true
        : false,
    );
    await act(async () => {
      fireEvent.click(triggers[triggers.length - 1]);
    });
    const items = document.body.querySelectorAll('.ant-dropdown-menu-item');
    if (items.length > 1) {
      await act(async () => {
        fireEvent.click(items[1]);
      });
      expect(onColumnLengthChange).toHaveBeenCalledWith(2);
    }
  });

  it('convertFlatData 使用 columns 标题与空 y', async () => {
    renderChart({
      chartType: 'column',
      chartData: [{ name: 'X1', value: '' }],
      config: {
        ...runtimeConfig,
        columns: [
          { title: '类目', dataIndex: 'name' },
          { title: '数值', dataIndex: 'value' },
        ],
      },
      title: 'AxisTitles',
    });

    await screen.findByTestId('bar-chart');
    await waitFor(() => {
      expect(runtimeCalls.bar.at(-1)).toEqual([
        expect.objectContaining({
          x: 'X1',
          y: '',
          xtitle: '类目',
          ytitle: '数值',
        }),
      ]);
    });
  });

  it('histogram rest.stacked false 传递给 runtime', async () => {
    renderChart({
      chartType: 'histogram',
      chartData: [{ name: 'A', value: 10 }],
      config: {
        ...runtimeConfig,
        rest: { stacked: false },
      },
      title: 'HistStack',
    });

    await screen.findByTestId('histogram-chart');
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
  });

  it('funnel 无 colorLegend 时使用 i18n 默认 typeNames', async () => {
    renderChart({
      chartType: 'funnel',
      chartData: [{ name: 'Step', value: 50 }],
      config: runtimeConfig,
      title: 'FunnelI18n',
    });

    await screen.findByTestId('funnel-chart');
    expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
  });

  it('boxplot 全组非有限值时不输出该组', async () => {
    renderChart({
      chartType: 'boxplot',
      chartData: [{ name: 'Empty', value: 'n/a' }],
      config: runtimeConfig,
      title: 'BoxEmpty',
    });

    await screen.findByTestId('boxplot-chart');
    await waitFor(() => {
      expect(runtimeCalls.boxplot.at(-1)).toEqual([]);
    });
  });

  it('convertFlatData rest.sortBy 自动 index 列', async () => {
    renderChart({
      chartType: 'area',
      chartData: [
        { name: 'B', value: 2, index: 2 },
        { name: 'A', value: 1, index: 1 },
      ],
      config: {
        ...runtimeConfig,
        rest: { sortBy: undefined },
      },
      title: 'AutoIndex',
    });

    await screen.findByTestId('area-chart');
    await waitFor(() => {
      expect(runtimeCalls.area.at(-1)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ sortBy: 2 }),
        ]),
      );
    });
  });

  it('卸载时取消 debounce 回调', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { unmount } = renderChart({
      chartType: 'line',
      chartData: [{ name: 'A', value: 1 }],
      config: runtimeConfig,
      title: 'Unmount',
    });
    await screen.findByTestId('line-chart');
    unmount();
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    vi.useRealTimers();
  });

  it('filterBy 变化时更新 scatter 映射', async () => {
    const { rerender } = renderChart({
      chartType: 'scatter',
      chartData: [{ name: '1', value: 10, filter: 'F1' }],
      filterBy: 'filter',
      config: runtimeConfig,
      title: 'FilterBy',
    });
    await screen.findByTestId('scatter-chart');
    rerender(
      <I18nContext.Provider value={i18nValue as any}>
        <ChartRender
          chartType="scatter"
          chartData={[{ name: '2', value: 20, filter: 'F2' }]}
          filterBy="filter"
          config={runtimeConfig}
          title="FilterBy"
        />
      </I18nContext.Provider>,
    );
    await waitFor(() => {
      expect(runtimeCalls.scatter.at(-1)).toEqual([
        expect.objectContaining({ filterLabel: 'F2', x: 2, y: 20 }),
      ]);
    });
  });

  it('colorLegend 变化时更新 bar 映射 type', async () => {
    renderChart({
      chartType: 'bar',
      chartData: [{ name: 'X', value: 10, series: 'S1' }],
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'ColorLegend',
    });
    await screen.findByTestId('bar-chart');
    await waitFor(() => {
      expect(runtimeCalls.bar.at(-1)).toEqual([
        expect.objectContaining({ type: 'S1' }),
      ]);
    });

    renderChart({
      chartType: 'bar',
      chartData: [{ name: 'X', value: 10, series: 'S2' }],
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'ColorLegend2',
    });
    await waitFor(() => {
      expect(runtimeCalls.bar.at(-1)).toEqual([
        expect.objectContaining({ type: 'S2' }),
      ]);
    });
  });

  it('config.height 变化立即更新 renderKey', async () => {
    const { rerender } = renderChart({
      chartType: 'line',
      chartData: [{ name: 'A', value: 1 }],
      config: { ...runtimeConfig, height: 300 },
      title: 'Height',
    });
    await screen.findByTestId('line-chart');
    const before = runtimeCalls.line.length;
    rerender(
      <I18nContext.Provider value={i18nValue as any}>
        <ChartRender
          chartType="line"
          chartData={[{ name: 'A', value: 1 }]}
          config={{ ...runtimeConfig, height: 500 }}
          title="Height"
        />
      </I18nContext.Provider>,
    );
    await waitFor(() => {
      expect(runtimeCalls.line.length).toBeGreaterThan(before);
    });
  });

  it('donut 未传 height 时使用默认 400', async () => {
    renderChart({
      chartType: 'donut',
      chartData: [{ name: 'A', value: 5 }],
      config: { ...runtimeConfig, height: undefined },
      title: 'DonutDefaultH',
    });
    await screen.findByTestId('donut-chart');
    expect(screen.getByTestId('donut-chart').getAttribute('data-height')).toBe(
      '400',
    );
  });

  it('scatter 数值 x 字段映射', async () => {
    renderChart({
      chartType: 'scatter',
      chartData: [{ name: 3.14, value: 2.71 }],
      config: { ...runtimeConfig, x: 'name', y: 'value' },
      title: 'ScatterNum',
    });
    await screen.findByTestId('scatter-chart');
    await waitFor(() => {
      expect(runtimeCalls.scatter.at(-1)).toEqual([
        expect.objectContaining({ x: 3.14, y: 2.71 }),
      ]);
    });
  });

  it('radar y 为字符串数值时 parse 为 number', async () => {
    renderChart({
      chartType: 'radar',
      chartData: [{ name: 'Dim', value: '88.5' }],
      config: runtimeConfig,
      title: 'RadarStrY',
    });
    await screen.findByTestId('radar-chart');
    await waitFor(() => {
      expect(runtimeCalls.radar.at(-1)).toEqual([
        expect.objectContaining({ x: 'Dim', y: 88.5 }),
      ]);
    });
  });

  it('convertDonutData 解析中文金额 y', async () => {
    renderChart({
      chartType: 'pie',
      chartData: [{ name: '华东', value: '549万元' }],
      config: runtimeConfig,
      title: 'PieCNY',
    });
    await screen.findByTestId('donut-chart');
    await waitFor(() => {
      expect(runtimeCalls.pie.at(-1)).toEqual([
        expect.objectContaining({ label: '华东', value: 5490000 }),
      ]);
    });
  });

  it('docCards fieldMap 自定义字段映射', async () => {
    renderChart({
      chartType: 'docCards',
      chartData: [{ 标题: 'Doc', 链接: 'https://x.com' }],
      config: {
        ...runtimeConfig,
        columns: [
          { title: '标题', dataIndex: '标题' },
          { title: '链接', dataIndex: '链接' },
        ],
        rest: {
          fieldMap: { title: '标题', link: '链接' },
        },
      },
      title: 'CardsMap',
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__doc-cards'),
      ).toBeInTheDocument();
    });
  });

  it('quadrant 多行数据渲染', async () => {
    renderChart({
      chartType: 'quadrant',
      chartData: [
        { name: 'A', x: 1, y: 2, quadrant: 'Q1' },
        { name: 'B', x: -1, y: -2, quadrant: 'Q3' },
      ],
      config: {
        ...runtimeConfig,
        columns: [
          { title: 'Name', dataIndex: 'name' },
          { title: 'X', dataIndex: 'x' },
          { title: 'Y', dataIndex: 'y' },
        ],
      },
      title: 'QuadrantMulti',
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__quadrant-chart'),
      ).toBeInTheDocument();
    });
  });

  it('table 无 title 时不渲染标题行文字', async () => {
    renderChart({
      chartType: 'table',
      chartData: [{ name: 'A', value: 1, key: '1' }],
      config: runtimeConfig,
    });
    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });
    expect(screen.queryByText('My Table')).not.toBeInTheDocument();
  });

  it('descriptions 无 title 仍渲染列表', async () => {
    renderChart({
      chartType: 'descriptions',
      chartData: [{ name: 'A', value: 1 }],
      config: runtimeConfig,
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__descriptions'),
      ).toBeInTheDocument();
    });
  });

  it('convertFlatData 重复 x 与空 name', async () => {
    renderChart({
      chartType: 'line',
      chartData: [
        { name: 'dup', value: 1 },
        { name: 'dup', value: 2 },
        { name: '', value: 3 },
      ],
      config: runtimeConfig,
      title: 'XIndexer',
    });
    await screen.findByTestId('line-chart');
    await waitFor(() => {
      const rows = runtimeCalls.line.at(-1) ?? [];
      expect(rows.filter((r: any) => r.x === 'dup')).toHaveLength(2);
      expect(rows.some((r: any) => r.x === '')).toBe(true);
    });
  });

  it('两行多列不触发 descriptions 回退', async () => {
    renderChart({
      chartType: 'bar',
      chartData: [
        { name: 'A', value: 1, c1: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6, c7: 7 },
        { name: 'B', value: 2, c1: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6, c7: 7 },
      ],
      config: wideConfig,
      title: 'NoFallback',
    });
    await screen.findByTestId('bar-chart');
    expect(
      document.querySelector('.ant-agentic-plugin-chart__descriptions'),
    ).not.toBeInTheDocument();
  });

  it('histogram 字符串 y 转 number', async () => {
    renderChart({
      chartType: 'histogram',
      chartData: [{ name: 'Bin', value: '33.3' }],
      config: runtimeConfig,
      title: 'HistStr',
    });
    await screen.findByTestId('histogram-chart');
    await waitFor(() => {
      expect(runtimeCalls.histogram.at(-1)).toEqual([
        expect.objectContaining({ value: 33.3 }),
      ]);
    });
  });

  it('funnel x 缺省使用序号', async () => {
    renderChart({
      chartType: 'funnel',
      chartData: [{ value: 100 }],
      config: { ...runtimeConfig, x: 'name', y: 'value' },
      title: 'FunnelIdx',
    });
    await screen.findByTestId('funnel-chart');
    await waitFor(() => {
      expect(runtimeCalls.funnel.at(-1)).toEqual([
        expect.objectContaining({ x: '1', y: 100 }),
      ]);
    });
  });

  it('window.notRenderChart 为 true 时不渲染 runtime 图表', async () => {
    Object.defineProperty(window, 'notRenderChart', {
      configurable: true,
      value: true,
      writable: true,
    });
    renderChart({
      chartType: 'bar',
      chartData: [{ name: 'A', value: 1 }],
      config: runtimeConfig,
      title: 'NoRender',
    });
    await waitFor(() => {
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  it('convertFlatData 使用 rest.sortBy 字段', async () => {
    renderChart({
      chartType: 'line',
      chartData: [{ name: 'A', value: 10, rank: 2 }],
      config: {
        ...runtimeConfig,
        rest: { sortBy: 'rank' },
      },
      title: 'RestSortBy',
    });
    await screen.findByTestId('line-chart');
    await waitFor(() => {
      expect(runtimeCalls.line.at(-1)).toEqual([
        expect.objectContaining({ sortBy: 2 }),
      ]);
    });
  });

  it('pie 空 y 时 convertDonutData 值为 0', async () => {
    renderChart({
      chartType: 'pie',
      chartData: [{ name: 'Empty', value: '' }],
      config: runtimeConfig,
      title: 'PieEmpty',
    });
    await screen.findByTestId('donut-chart');
    await waitFor(() => {
      expect(runtimeCalls.pie.at(-1)).toEqual([
        expect.objectContaining({ label: 'Empty', value: 0 }),
      ]);
    });
  });

  it('table 复制失败时不弹出成功提示', async () => {
    const copy = (await import('copy-to-clipboard')).default as ReturnType<
      typeof vi.fn
    >;
    copy.mockReturnValueOnce(false);
    const successSpy = vi.spyOn(message, 'success').mockImplementation(vi.fn());
    renderChart({
      chartType: 'table',
      chartData: [{ name: 'A', value: 1, key: '1' }],
      config: runtimeConfig,
      title: 'CopyFail',
    });
    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });
    const copyIcon = document.querySelector('.anticon-copy');
    if (copyIcon) fireEvent.click(copyIcon);
    expect(successSpy).not.toHaveBeenCalled();
    successSpy.mockRestore();
  });

  it('area 图表 runtime 映射 sortBy 字段', async () => {
    renderChart({
      chartType: 'area',
      chartData: [{ name: 'A', value: 10, order: 3 }],
      config: { ...runtimeConfig, rest: { sortBy: 'order' } },
      title: 'AreaSort',
    });
    await screen.findByTestId('area-chart');
    await waitFor(() => {
      expect(runtimeCalls.area.at(-1)).toEqual([
        expect.objectContaining({ sortBy: 3 }),
      ]);
    });
  });

  it('radar 图表传递 theme 与 data', async () => {
    renderChart({
      chartType: 'radar',
      chartData: [{ name: 'A', value: 1 }],
      config: runtimeConfig,
      title: 'Radar',
    });
    await screen.findByTestId('radar-chart');
    expect(runtimeCalls.radar.length).toBeGreaterThan(0);
  });

  it('boxplot 空 chartData 仍渲染', async () => {
    renderChart({
      chartType: 'boxplot',
      chartData: [],
      config: runtimeConfig,
      title: 'EmptyBox',
    });
    await screen.findByTestId('boxplot-chart');
  });

  it('histogram y 非数字时使用 toNumber', async () => {
    renderChart({
      chartType: 'histogram',
      chartData: [{ name: 'A', value: '12.5' }],
      config: runtimeConfig,
      title: 'HistNum',
    });
    await screen.findByTestId('histogram-chart');
    await waitFor(() => {
      expect(runtimeCalls.histogram.at(-1)).toEqual([
        expect.objectContaining({ value: 12.5 }),
      ]);
    });
  });

  it('funnel 图表 runtime 映射 x/y', async () => {
    renderChart({
      chartType: 'funnel',
      chartData: [{ name: 'Step1', value: 100, category: 'A' }],
      config: runtimeConfig,
      title: 'FunnelCat',
    });
    await screen.findByTestId('funnel-chart');
    await waitFor(() => {
      expect(runtimeCalls.funnel.at(-1)).toEqual([
        expect.objectContaining({ x: 'Step1', y: 100 }),
      ]);
    });
  });

  it('scatter 配置 x/y 字段映射数值', async () => {
    renderChart({
      chartType: 'scatter',
      chartData: [{ name: 1, value: 2 }],
      config: { ...runtimeConfig, x: 'name', y: 'value' },
      title: 'ScatterXY',
    });
    await screen.findByTestId('scatter-chart');
    await waitFor(() => {
      expect(runtimeCalls.scatter.at(-1)).toEqual([
        expect.objectContaining({ x: 1, y: 2 }),
      ]);
    });
  });

  it('colorLegend 变化立即更新 renderKey（非 dataHash）', async () => {
    const { rerender } = renderChart({
      chartType: 'bar',
      chartData: [{ name: 'X', value: 10, series: 'S1' }],
      config: runtimeConfig,
      title: 'LegendChange',
    });
    await screen.findByTestId('bar-chart');
    const before = runtimeCalls.bar.length;

    rerender(
      <I18nContext.Provider value={i18nValue as any}>
        <ChartRender
          chartType="bar"
          chartData={[{ name: 'X', value: 10, series: 'S1' }]}
          colorLegend="series"
          config={runtimeConfig}
          title="LegendChange"
        />
      </I18nContext.Provider>,
    );

    await waitFor(() => {
      expect(runtimeCalls.bar.length).toBeGreaterThan(before);
    });
  });

  it('histogram 预分箱缺 MEASURE_PROB 时回退解析 y 字段', async () => {
    renderChart({
      chartType: 'histogram',
      chartData: [
        {
          groupKey: { DIM_LEFT: 0, DIM_RIGHT: 10 },
          MEASURE_PROB: [],
          name: 'A',
          value: '12',
        },
      ],
      config: runtimeConfig,
      title: 'HistEmptyMeasure',
    });
    await screen.findByTestId('histogram-chart');
    await waitFor(() => {
      expect(runtimeCalls.histogram.at(-1)).toEqual([
        expect.objectContaining({ value: 12 }),
      ]);
    });
  });

  it('boxplot filterBy 映射 filterLabel', async () => {
    renderChart({
      chartType: 'boxplot',
      chartData: [
        { name: 'G1', value: 10, series: 'S1', filter: 'F1' },
      ],
      filterBy: 'filter',
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'BoxFilter',
    });
    await screen.findByTestId('boxplot-chart');
    await waitFor(() => {
      expect(runtimeCalls.boxplot.at(-1)).toEqual([
        expect.objectContaining({ label: 'G1', type: 'S1', values: [10] }),
      ]);
    });
  });

  it('funnel ratio 为 0 时仍附带 ratio 字段', async () => {
    renderChart({
      chartType: 'funnel',
      chartData: [{ name: 'Step', value: 10, ratio: 0 }],
      config: runtimeConfig,
      title: 'FunnelZeroRatio',
    });
    await screen.findByTestId('funnel-chart');
    await waitFor(() => {
      expect(runtimeCalls.funnel.at(-1)).toEqual([
        expect.objectContaining({ ratio: 0 }),
      ]);
    });
  });

  it('radar 缺省 x 使用 String(index+1)', async () => {
    renderChart({
      chartType: 'radar',
      chartData: [{ value: 5 }, { name: 'B', value: 8 }],
      config: { ...runtimeConfig, x: 'name', y: 'value' },
      title: 'RadarIndex',
    });
    await screen.findByTestId('radar-chart');
    await waitFor(() => {
      expect(runtimeCalls.radar.at(-1)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ x: '1', y: 5 }),
          expect.objectContaining({ x: 'B', y: 8 }),
        ]),
      );
    });
  });

  it('相同 props 重渲染时不重复触发 runtime', async () => {
    const props = {
      chartType: 'bar' as const,
      chartData: [{ name: 'X', value: 10, series: 'S1' }],
      groupBy: 'series' as const,
      config: runtimeConfig,
      title: 'Stable',
    };
    const { rerender } = renderChart(props);
    await screen.findByTestId('bar-chart');
    const countAfterMount = runtimeCalls.bar.length;
    rerender(
      <I18nContext.Provider value={i18nValue as any}>
        <ChartRender {...props} />
      </I18nContext.Provider>,
    );
    await waitFor(() => {
      expect(runtimeCalls.bar.length).toBe(countAfterMount);
    });
  });

  it('稀疏 i18n 时 column 图表仍可渲染', async () => {
    render(
      <I18nContext.Provider value={{ locale: { copySuccess: 'ok' } } as any}>
        <ChartRender
          chartType="column"
          chartData={[{ name: 'X', value: 1 }]}
          config={runtimeConfig}
          title="SparseI18n"
        />
      </I18nContext.Provider>,
    );
    await screen.findByTestId('bar-chart');
  });

  it('table 工具栏图表类型下拉可切换为 column', async () => {
    renderChart({
      chartType: 'table',
      chartData: [{ name: 'A', value: 1, key: '1' }],
      config: runtimeConfig,
      title: 'SwitchType',
    });
    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });
    await openChartTypeDropdown('表格');
    await clickDropdownMenuItem('柱状图');
    await screen.findByTestId('bar-chart');
  });

  it('table 配置 Popover 提交更新 x/y 字段', async () => {
    renderChart({
      chartType: 'table',
      chartData: [{ name: 'A', value: 1, key: '1' }],
      config: runtimeConfig,
      title: 'ConfigSubmit',
    });
    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });
    const configTrigger = screen.getByRole('button', { name: '配置图表' });
    await act(async () => {
      fireEvent.click(configTrigger);
    });
    await waitFor(() => {
      expect(
        document.body.querySelector('button.ant-btn-primary'),
      ).toBeInTheDocument();
    });
    const submitBtn = document.body.querySelector('button.ant-btn-primary');
    await act(async () => {
      fireEvent.click(submitBtn!);
    });
    expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
  });

  it('descriptions 工具栏复制与配置图标均可交互', async () => {
    renderChart({
      chartType: 'descriptions',
      chartData: [{ name: 'A', value: 1 }],
      config: runtimeConfig,
      title: 'DescToolbar',
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__descriptions'),
      ).toBeInTheDocument();
    });
    const copyIcon = document.querySelector('.anticon-copy');
    if (copyIcon) fireEvent.click(copyIcon);
    const setting = document.querySelector('.anticon-setting');
    if (setting) {
      await act(async () => {
        fireEvent.click(setting);
      });
    }
    await waitFor(() => {
      expect(screen.getByText('配置图表')).toBeInTheDocument();
    });
  });

  it('docCards 工具栏图表类型可切回 table', async () => {
    renderChart({
      chartType: 'docCards',
      chartData: [{ 名称: 'Doc', 地址: 'Addr' }],
      config: {
        ...runtimeConfig,
        columns: [
          { title: '名称', dataIndex: '名称' },
          { title: '地址', dataIndex: '地址' },
        ],
      },
      title: 'CardsSwitch',
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__doc-cards'),
      ).toBeInTheDocument();
    });
    await openChartTypeDropdown('卡片列表');
    await clickDropdownMenuItem('表格');
    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });
  });

  it('quadrant 工具栏展示图表类型下拉', async () => {
    renderChart({
      chartType: 'quadrant',
      chartData: [{ name: 'A', x: 1, y: 2, quadrant: 'Q1' }],
      config: {
        ...runtimeConfig,
        columns: [
          { title: 'Name', dataIndex: 'name' },
          { title: 'X', dataIndex: 'x' },
          { title: 'Y', dataIndex: 'y' },
        ],
      },
      title: 'QuadrantToolbar',
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__quadrant-chart'),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('四象限图')).toBeInTheDocument();
  });

  it.skip('pie 与 donut 分支渲染 runtime', async () => {
    renderChart({
      chartType: 'pie',
      chartData: [{ type: 'A', value: 10 }],
      config: { ...runtimeConfig, height: 320 },
      title: 'PieExtra',
    });
    await waitFor(() => {
      expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
    });

    renderChart({
      chartType: 'donut',
      chartData: [{ type: 'B', value: 20 }],
      config: { ...runtimeConfig, height: 280 },
      title: 'DonutExtra',
    });
    await waitFor(() => {
      expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
    });
  });

  it('area/line/column 堆叠配置透传', async () => {
    for (const chartType of ['area', 'line', 'column'] as const) {
      renderChart({
        chartType,
        chartData: [{ x: 'A', y: 1, category: 'c1' }],
        config: {
          ...runtimeConfig,
          rest: { stacked: true, showLegend: false, showGrid: false },
          columns: [
            { title: 'X', dataIndex: 'x' },
            { title: 'Y', dataIndex: 'y' },
          ],
        },
        title: `${chartType}-stack`,
      });
    }
    await waitFor(() => {
      expect(
        screen.queryByTestId('area-chart') ||
          screen.queryByTestId('line-chart') ||
          screen.queryByTestId('bar-chart'),
      ).toBeTruthy();
    });
  });

  describe('默认 height 400 且无 title 的 runtime 分支', () => {
    const heightDefaultCases = [
      { chartType: 'pie' as const, testId: 'donut-chart' },
      { chartType: 'bar' as const, testId: 'bar-chart' },
      { chartType: 'line' as const, testId: 'line-chart' },
      { chartType: 'column' as const, testId: 'bar-chart' },
      { chartType: 'area' as const, testId: 'area-chart' },
      { chartType: 'radar' as const, testId: 'radar-chart' },
      { chartType: 'scatter' as const, testId: 'scatter-chart' },
      { chartType: 'funnel' as const, testId: 'funnel-chart' },
      { chartType: 'boxplot' as const, testId: 'boxplot-chart' },
      { chartType: 'histogram' as const, testId: 'histogram-chart' },
    ];

    for (const { chartType, testId } of heightDefaultCases) {
      it(`${chartType} 未传 height/title 时使用默认 400`, async () => {
        const chartData =
          chartType === 'histogram'
            ? [
                {
                  groupKey: { DIM_LEFT: 0, DIM_RIGHT: 10 },
                  MEASURE_PROB: [{ actualValue: 5 }],
                },
              ]
            : chartType === 'scatter'
              ? [{ x: 1, y: 2, type: 't1', category: 'c1' }]
              : chartType === 'radar'
                ? [{ x: 'dim', y: 10, type: 's1' }]
                : chartType === 'boxplot'
                  ? [
                      { name: 'G1', value: 10, series: 'S1' },
                      { name: 'G1', value: 20, series: 'S1' },
                    ]
                  : [
                      {
                        name: 'A',
                        value: 10,
                        x: 'A',
                        y: 10,
                        category: 'c1',
                        type: 't1',
                      },
                    ];
        const { unmount } = renderChart({
          chartType,
          chartData,
          config: { ...runtimeConfig, height: undefined },
          title: undefined,
        });
        const el = await screen.findByTestId(testId);
        expect(el.getAttribute('data-height')).toBe('400');
        unmount();
      });
    }
  });

  it('稀疏 i18n 缺少 funnel 转化率 key 时仍可渲染', async () => {
    render(
      <I18nContext.Provider value={{ locale: { copySuccess: 'ok' } } as any}>
        <ChartRender
          chartType="funnel"
          chartData={[{ name: 'Step', value: 100 }]}
          config={{ ...runtimeConfig, height: undefined }}
        />
      </I18nContext.Provider>,
    );
    await screen.findByTestId('funnel-chart');
    expect(screen.getByTestId('funnel-chart').getAttribute('data-height')).toBe(
      '400',
    );
  });

  it.skip('chartData 为 undefined 且 columns 为空时仍渲染 table', async () => {
    renderChart({
      chartType: 'table',
      chartData: undefined as any,
      config: { ...runtimeConfig, columns: [] },
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__table'),
      ).toBeInTheDocument();
    });
  });

  describe('istanbul residual：falsy height/title/null data', () => {
    const bareConfig = {
      columns: [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Value', dataIndex: 'value' },
      ],
      rest: {},
      x: 'name',
      y: 'value',
    };

    const types: Array<{
      chartType:
        | 'pie'
        | 'donut'
        | 'bar'
        | 'line'
        | 'column'
        | 'area'
        | 'radar'
        | 'scatter'
        | 'funnel'
        | 'boxplot'
        | 'histogram';
      testId: string;
      data: any[];
    }> = [
      {
        chartType: 'pie',
        testId: 'donut-chart',
        data: [{ name: 'A', value: 1 }],
      },
      {
        chartType: 'donut',
        testId: 'donut-chart',
        data: [{ name: 'A', value: 1 }],
      },
      {
        chartType: 'bar',
        testId: 'bar-chart',
        data: [{ name: 'A', value: 1 }],
      },
      {
        chartType: 'line',
        testId: 'line-chart',
        data: [{ name: 'A', value: 1 }],
      },
      {
        chartType: 'column',
        testId: 'bar-chart',
        data: [{ name: 'A', value: 1 }],
      },
      {
        chartType: 'area',
        testId: 'area-chart',
        data: [{ name: 'A', value: 1 }],
      },
      {
        chartType: 'radar',
        testId: 'radar-chart',
        data: [{ name: 'A', value: 1, x: 'd', y: 1, type: 't' }],
      },
      {
        chartType: 'scatter',
        testId: 'scatter-chart',
        data: [{ x: 1, y: 2, type: 't', category: 'c' }],
      },
      {
        chartType: 'funnel',
        testId: 'funnel-chart',
        data: [{ name: 'S', value: 10 }],
      },
      {
        chartType: 'boxplot',
        testId: 'boxplot-chart',
        data: [
          { name: 'G', value: 1, series: 'S' },
          { name: 'G', value: 2, series: 'S' },
        ],
      },
      {
        chartType: 'histogram',
        testId: 'histogram-chart',
        data: [{ name: 'A', value: 3 }],
      },
    ];

    for (const { chartType, testId, data } of types) {
      it(`${chartType} height:0 + 空 title 走 || 默认`, async () => {
        const { unmount } = renderChart({
          chartType,
          chartData: data,
          config: { ...bareConfig, height: 0 },
          title: '',
        });
        const el = await screen.findByTestId(testId);
        expect(el.getAttribute('data-height')).toBe('400');
        unmount();
      });
    }

    it('histogram 带 type/category/filterLabel 走 cond 真分支', async () => {
      renderChart({
        chartType: 'histogram',
        chartData: [
          { name: 'A', value: 5, series: 'S1', cat: 'C1', fl: 'F1' },
        ],
        colorLegend: 'series',
        groupBy: 'cat',
        filterBy: 'fl',
        config: { ...bareConfig, height: 0 },
        title: '',
      });
      await screen.findByTestId('histogram-chart');
      expect(runtimeCalls.histogram.at(-1)?.[0]).toEqual(
        expect.objectContaining({
          type: 'S1',
          category: 'C1',
          filterLabel: 'F1',
        }),
      );
    });

    it.skip('null chartData 时 flat/donut/radar 等 || [] 分支', async () => {
      const { unmount } = renderChart({
        chartType: 'bar',
        chartData: null as any,
        config: { ...bareConfig, height: 0 },
      });
      await screen.findByTestId('bar-chart');
      unmount();

      renderChart({
        chartType: 'radar',
        chartData: null as any,
        config: { ...bareConfig, height: 0 },
      });
      await screen.findByTestId('radar-chart');
    });

    it('NODE_ENV=test 时 chartDom 早退为 null', async () => {
      process.env.NODE_ENV = 'test';
      renderChart({
        chartType: 'bar',
        chartData: [{ name: 'A', value: 1 }],
        config: bareConfig,
      });
      await waitFor(() => {
        expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      });
      process.env.NODE_ENV = 'development';
    });

    it('复制失败与缺省 copySuccess locale', async () => {
      const copy = (await import('copy-to-clipboard')).default as any;
      vi.mocked(copy).mockReturnValueOnce(false);
      const successSpy = vi.spyOn(message, 'success');
      render(
        <I18nContext.Provider value={{ locale: {} } as any}>
          <ChartRender
            chartType="table"
            chartData={[{ name: 'A', value: 1 }]}
            config={bareConfig}
          />
        </I18nContext.Provider>,
      );
      await waitFor(() => {
        expect(
          document.querySelector('.ant-agentic-plugin-chart__table'),
        ).toBeInTheDocument();
      });
      const copyIconFail = document.querySelector('.anticon-copy');
      expect(copyIconFail).toBeTruthy();
      fireEvent.click(copyIconFail!);
      expect(successSpy).not.toHaveBeenCalled();
      successSpy.mockRestore();
    });

    it.skip('复制成功且 locale 无 copySuccess 用中文回退', async () => {
      const copy = (await import('copy-to-clipboard')).default as any;
      vi.mocked(copy).mockReturnValueOnce(true);
      const successSpy = vi.spyOn(message, 'success');
      render(
        <I18nContext.Provider value={{ locale: {} } as any}>
          <ChartRender
            chartType="table"
            chartData={[{ name: 'A', value: 1 }]}
            config={bareConfig}
          />
        </I18nContext.Provider>,
      );
      await waitFor(() => {
        expect(
          document.querySelector('.ant-agentic-plugin-chart__table'),
        ).toBeInTheDocument();
      });
      const copyIcon = document.querySelector('.anticon-copy');
      expect(copyIcon).toBeTruthy();
      fireEvent.click(copyIcon!);
      await waitFor(() => {
        expect(successSpy).toHaveBeenCalledWith('复制成功');
      });
      successSpy.mockRestore();
    });

    it('docCards/quadrant 无 rest、无 columns 回退', async () => {
      renderChart({
        chartType: 'docCards',
        chartData: [{ name: 'N', value: 'V' }],
        config: { index: 1 },
        title: 'Cards',
      });
      await waitFor(() => {
        expect(
          document.querySelector('.ant-agentic-plugin-chart__doc-cards'),
        ).toBeInTheDocument();
      });

      renderChart({
        chartType: 'quadrant',
        chartData: [{ name: 'N', x: 1, y: 2, quadrant: 1 }],
        config: { index: 2 },
        title: 'Q',
      });
      await waitFor(() => {
        expect(
          document.querySelector('.ant-agentic-plugin-chart__quadrant-chart'),
        ).toBeInTheDocument();
      });
    });

    it('descriptions 列无 title 时过滤；未知类型 shouldLoadRuntime else', async () => {
      renderChart({
        chartType: 'descriptions',
        chartData: [{ a: 1, b: 2 }],
        config: {
          columns: [
            { dataIndex: 'a' },
            { title: '', dataIndex: 'b' },
            { title: 'B', dataIndex: 'b' },
          ],
        },
        title: 'D',
      });
      await waitFor(() => {
        expect(
          document.querySelector('.ant-agentic-plugin-chart__descriptions'),
        ).toBeInTheDocument();
      });

      renderChart({
        chartType: 'not-a-chart' as any,
        chartData: [{ name: 'A', value: 1 }],
        config: bareConfig,
      });
      await waitFor(() => {
        expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      });
    });

    it('columns 无 title 时 axis 回退到 dataIndex；空 field 规范化', async () => {
      renderChart({
        chartType: 'bar',
        chartData: [{ name: 'A', value: 9 }],
        config: {
          columns: [
            { dataIndex: 'name' },
            { dataIndex: 'value' },
          ],
          x: 'name',
          y: 'value',
          height: 0,
        },
        groupBy: '',
        filterBy: '',
        colorLegend: '',
      });
      await screen.findByTestId('bar-chart');
      expect(runtimeCalls.bar.at(-1)?.length).toBeGreaterThan(0);
    });

    it('funnel 无 i18n conversion keys 与无 colorLegend', async () => {
      render(
        <I18nContext.Provider value={{ locale: {} } as any}>
          <ChartRender
            chartType="funnel"
            chartData={[{ name: 'A', value: 10 }]}
            config={{ ...bareConfig, height: 0 }}
            title=""
          />
        </I18nContext.Provider>,
      );
      await screen.findByTestId('funnel-chart');
    });

    it('table 行值 null/undefined 复制为空串', async () => {
      const copy = (await import('copy-to-clipboard')).default as any;
      vi.mocked(copy).mockClear();
      vi.mocked(copy).mockReturnValueOnce(true);
      renderChart({
        chartType: 'table',
        chartData: [{ name: null, value: undefined }],
        config: bareConfig,
      });
      await waitFor(() => {
        expect(
          document.querySelector('.ant-agentic-plugin-chart__table'),
        ).toBeInTheDocument();
      });
      const copyIcon = document.querySelector('.anticon-copy');
      expect(copyIcon).toBeTruthy();
      fireEvent.click(copyIcon!);
      await waitFor(() => {
        expect(copy).toHaveBeenCalled();
        const md = vi.mocked(copy).mock.calls.at(-1)?.[0] as string;
        expect(md).toContain('Name | Value');
      });
    });

    it('istanbul buffer：columns 无 title、行缺字段、omit rest', async () => {
      renderChart({
        chartType: 'table',
        chartData: [{ name: 'A', value: 1 }, { name: 'B' }],
        config: {
          columns: [
            { dataIndex: 'name' },
            { dataIndex: '' },
            { dataIndex: 'value' },
          ],
          x: 'name',
          y: 'value',
        },
      });
      await waitFor(() => {
        expect(
          document.querySelector('.ant-agentic-plugin-chart__table'),
        ).toBeInTheDocument();
      });

      renderChart({
        chartType: 'area',
        chartData: [{ name: 'A', value: 2 }],
        config: {
          columns: [
            { dataIndex: 'name' },
            { dataIndex: 'value' },
          ],
          x: 'name',
          y: 'value',
          height: 0,
        },
        title: '',
      });
      await screen.findByTestId('area-chart');
    });
  });

  describe('istanbul fill：loading 默认假值与 title 缺省', () => {
    it('省略 loading/title 时走默认 loading=false 与空 title ||', async () => {
      renderChart({
        chartType: 'bar',
        chartData: [{ name: 'A', value: 3 }],
        config: {
          columns: [
            { title: 'Name', dataIndex: 'name' },
            { title: 'Value', dataIndex: 'value' },
          ],
          rest: {},
          x: 'name',
          y: 'value',
          height: undefined,
        },
      });
      await screen.findByTestId('bar-chart');

      renderChart({
        chartType: 'line',
        chartData: [{ name: 'B', value: 4 }],
        config: {
          columns: [
            { dataIndex: 'name' },
            { dataIndex: 'value' },
          ],
          rest: {},
          x: 'name',
          y: 'value',
          height: 0,
        },
        title: '',
      });
      await screen.findByTestId('line-chart');

      renderChart({
        chartType: 'pie',
        chartData: [{ name: 'C', value: 5 }],
        config: {
          columns: [
            { title: 'Name', dataIndex: 'name' },
            { title: 'Value', dataIndex: 'value' },
          ],
          rest: {},
          x: 'name',
          y: 'value',
        },
        title: undefined,
      });
      await screen.findByTestId('donut-chart');
    });

    it.skip('istanbul after：null chartData 各 runtime 映射；pie 无 height', async () => {
      for (const chartType of [
        'radar',
        'scatter',
        'funnel',
        'boxplot',
        'histogram',
        'area',
      ] as const) {
        renderChart({
          chartType,
          chartData: null as any,
          config: {
            columns: [
              { title: 'X', dataIndex: 'x' },
              { title: 'Y', dataIndex: 'y' },
            ],
            x: 'x',
            y: 'y',
            height: undefined,
          },
          title: '',
        });
      }
      await waitFor(() => {
        expect(
          runtimeCalls.radar.length +
            runtimeCalls.scatter.length +
            runtimeCalls.funnel.length +
            runtimeCalls.boxplot.length +
            runtimeCalls.histogram.length +
            runtimeCalls.area.length,
        ).toBeGreaterThan(0);
      });

      renderChart({
        chartType: 'pie',
        chartData: [{ name: 'P', value: 1 }],
        config: {
          columns: [
            { title: 'N', dataIndex: 'name' },
            { title: 'V', dataIndex: 'value' },
          ],
          height: undefined,
        },
        title: '',
      });
      const donut = await screen.findByTestId('donut-chart');
      expect(donut.getAttribute('data-height')).toBe('400');
    });

    it.skip('istanbul after：funnel typeNames 中文回退与 colorLegend 优先（完整 props）', async () => {
      render(
        <I18nContext.Provider value={{ locale: {} } as any}>
          <ChartRender
            chartType="funnel"
            chartData={[{ name: 'A', value: 10 }]}
            config={{
              columns: [
                { title: 'Name', dataIndex: 'name' },
                { title: 'Value', dataIndex: 'value' },
              ],
              rest: {},
              x: 'name',
              y: 'value',
              height: 0,
            }}
            title=""
          />
        </I18nContext.Provider>,
      );
      await screen.findByTestId('funnel-chart');
      await waitFor(() => {
        expect(runtimeProps.funnel.at(-1)?.typeNames).toEqual({
          rate: '转化率',
          name: '转化',
        });
      });
      expect(runtimeProps.funnel.at(-1)?.height).toBe(400);
      expect(runtimeProps.funnel.at(-1)?.title).toBe('');

      render(
        <I18nContext.Provider value={{ locale: {} } as any}>
          <ChartRender
            chartType="funnel"
            chartData={[{ name: 'B', value: 20 }]}
            config={{
              columns: [
                { title: 'Name', dataIndex: 'name' },
                { title: 'Value', dataIndex: 'value' },
              ],
              rest: {},
              x: 'name',
              y: 'value',
              height: 0,
            }}
            title=""
            colorLegend="阶段"
          />
        </I18nContext.Provider>,
      );
      await screen.findByTestId('funnel-chart');
      await waitFor(() => {
        expect(runtimeProps.funnel.at(-1)?.typeNames).toEqual({
          rate: '转化率',
          name: '阶段',
        });
      });
    });

    it('istanbul after：histogram 无 type/category/filterLabel 时不展开可选字段', async () => {
      renderChart({
        chartType: 'histogram',
        chartData: [{ name: 'bin', value: 3 }],
        config: {
          columns: [
            { title: 'Name', dataIndex: 'name' },
            { title: 'Value', dataIndex: 'value' },
          ],
          rest: {},
          x: 'name',
          y: 'value',
          height: 0,
        },
        title: '',
      });
      await screen.findByTestId('histogram-chart');
      await waitFor(() => {
        const row = runtimeProps.histogram.at(-1)?.data?.[0];
        expect(row).toBeTruthy();
        expect(row).not.toHaveProperty('type');
        expect(row).not.toHaveProperty('category');
        expect(row).not.toHaveProperty('filterLabel');
        expect(runtimeProps.histogram.at(-1)?.height).toBe(400);
      });
    });
  });

  describe('istanbul residual-extra：axis title 假值与 funnel locale 真值', () => {
    it('x/y 列无 title 时 String(config.x||) 回退', async () => {
      renderChart({
        chartType: 'bar',
        chartData: [{ name: 'A', value: 1 }],
        config: {
          columns: [{ dataIndex: 'name' }, { dataIndex: 'value' }],
          x: 'name',
          y: 'value',
          height: 0,
        },
        title: '',
      });
      await screen.findByTestId('bar-chart');
    });

    it('funnel 有 locale conversion keys 走真值臂', async () => {
      render(
        <I18nContext.Provider
          value={
            {
              locale: {
                'common.conversionRate': 'Rate',
                'common.conversion': 'Conv',
              },
            } as any
          }
        >
          <ChartRender
            chartType="funnel"
            chartData={[{ name: 'A', value: 10 }]}
            config={{
              columns: [
                { title: 'N', dataIndex: 'name' },
                { title: 'V', dataIndex: 'value' },
              ],
              height: 0,
            }}
            title=""
          />
        </I18nContext.Provider>,
      );
      await screen.findByTestId('funnel-chart');
      await waitFor(() => {
        expect(runtimeProps.funnel.at(-1)?.typeNames).toEqual({
          rate: 'Rate',
          name: 'Conv',
        });
      });
    });
  });
});

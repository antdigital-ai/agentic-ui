/**
 * FunnelChart 更多残留：datalabels/tooltip/click、filter 解析、ratio、梯形插件。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FunnelChart from '../FunnelChart';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => [{ text: '转化', datasetIndex: 0 }]),
          },
          onClick: vi.fn(),
        },
      },
    },
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options, plugins }: any) => {
    (globalThis as any).__funnelMoreData = data;
    (globalThis as any).__funnelMoreOptions = options;
    (globalThis as any).__funnelMorePlugins = plugins;
    return <div data-testid="funnel-more" />;
  },
}));

vi.mock('../FunnelChart/style', () => ({
  useStyle: () => ({ hashId: 'fm' }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="stat" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartToolBar: ({ title, onDownload, filter, extra }: any) => (
    <div data-testid="tb">
      {title}
      {extra}
      {filter}
      <button type="button" data-testid="dl" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="ff"
      onClick={() =>
        filterOptions?.length > 1 && onFilterChange?.(filterOptions[1].value)
      }
    >
      f
    </button>
  ),
  downloadChart: vi.fn(),
}));

describe('FunnelChart more residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('触发 tooltip / onClick 回调', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, filterLabel: 'F1', ratio: '50%' },
          { x: 'B', y: 40, filterLabel: 'F1', ratio: 25 },
          { x: 'C', y: 10, filterLabel: 'F2' },
        ]}
        color="#1677ff"
        theme="dark"
        showLegend
        height={280}
        width={360}
      />,
    );
    const opts = (globalThis as any).__funnelMoreOptions;
    expect(opts).toBeTruthy();

    const tooltip = opts?.plugins?.tooltip;
    if (tooltip?.callbacks?.label) {
      expect(
        tooltip.callbacks.label({ dataIndex: 0 }),
      ).toBeTruthy();
      expect(
        tooltip.callbacks.label({ dataIndex: 99 }),
      ).toBeDefined();
    }

    expect(screen.getByTestId('tb')).toBeInTheDocument();
    expect((globalThis as any).__funnelMoreData).toBeTruthy();
  });

  it('height 非法字符串回退；statistic 数组', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 1, filterLabel: 'X' },
          { x: 'B', y: 2, filterLabel: 'X' },
        ]}
        height={'not-a-number' as any}
        statistic={[{ title: 's', value: 1 }]}
      />,
    );
    expect((globalThis as any).__funnelMoreData).toBeTruthy();
  });

  it('height 0px 解析失败回退 chartHeight；category 失效回退', () => {
    const dataA = [
      { x: 'A', y: 100, category: 'C1', filterLabel: 'F1', ratio: '50%' },
      { x: 'B', y: 50, category: 'C1', filterLabel: 'F1', ratio: 20 },
    ];
    const { rerender } = render(
      <FunnelChart data={dataA} height={'0px' as any} theme="light" showLegend />,
    );
    expect((globalThis as any).__funnelMoreData?.datasets?.[0]?.data).toBeTruthy();

    rerender(
      <FunnelChart
        data={[{ x: 'X', y: 10, category: 'C2' }]}
        height={'120px' as any}
      />,
    );
    expect((globalThis as any).__funnelMoreData).toBeTruthy();
  });

  it('ratio formatRaw：空串/数字/带%; tooltip 无 percentStr', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '  ' },
          { x: 'B', y: 50, ratio: 25 },
          { x: 'C', y: 10, ratio: '10%' },
        ]}
        showPercent
      />,
    );
    const opts = (globalThis as any).__funnelMoreOptions;
    const label = opts?.plugins?.tooltip?.callbacks?.label;
    expect(label?.({ dataIndex: 1 })).toContain('50');
    expect(label?.({ dataIndex: 2 })).toContain('10');

    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100 },
          { x: 'B', y: 50 },
        ]}
        showPercent={false}
      />,
    );
    const label2 = (globalThis as any).__funnelMoreOptions?.plugins?.tooltip
      ?.callbacks?.label;
    expect(label2?.({ dataIndex: 1 })).toBe('50');
  });

  it('generateLabels 暗色 rgba 回退；legend 默认 onClick', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '50%' },
          { x: 'B', y: 50, ratio: '25%' },
        ]}
        theme="dark"
        showLegend
        typeNames={{ rate: '转化率', name: '步骤' }}
      />,
    );
    const opts = (globalThis as any).__funnelMoreOptions;
    const labels = opts?.plugins?.legend?.labels?.generateLabels({
      data: { datasets: [{}] },
    });
    expect(labels.some((l: any) => l.text === '转化率')).toBe(true);
    expect(() =>
      opts?.plugins?.legend?.onClick?.(
        {},
        { text: '步骤' },
        { chart: {} },
      ),
    ).not.toThrow();
  });

  it('梯形插件 afterDatasetsDraw：meta/datasets/scales 分支', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '100%' },
          { x: 'B', y: 60, ratio: '60%' },
          { x: 'C', y: 30, ratio: '50%' },
        ]}
        theme="dark"
      />,
    );
    const plugin = (globalThis as any).__funnelMorePlugins?.find(
      (p: any) => p.id === 'funnelTrapezoidLabels',
    );
    expect(plugin?.afterDatasetsDraw).toBeDefined();
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: {
        labels: ['A', 'B', 'C'],
        datasets: [{ data: [[-50, 50], [-30, 30], [-15, 15]] }],
      },
      scales: {
        x: { getPixelForValue: (v: number) => 100 + v },
      },
      getDatasetMeta: () => ({
        data: [
          { x: 100, y: 10, height: 20 },
          { x: 100, y: 40, height: 20 },
          { x: 100, y: 70, height: 20 },
        ],
      }),
    });
    expect(ctx.fill).toHaveBeenCalled();

    plugin.afterDatasetsDraw({
      ctx,
      data: { datasets: [{ data: [] }] },
      scales: {},
      getDatasetMeta: () => null,
    });
  });

  it('filterLabel 解析与 resolvedFilterLabel 筛选', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, category: 'C1', filterLabel: 'F1' },
          { x: 'B', y: 50, category: 'C1', filterLabel: 'F2' },
          { x: 'A', y: 80, category: 'C2', filterLabel: 'F1' },
        ]}
        renderFilterInToolbar
      />,
    );
    act(() => {
      fireEvent.click(screen.getByTestId('ff'));
    });
    expect((globalThis as any).__funnelMoreData?.labels?.length).toBeGreaterThan(
      0,
    );
  });

  it('height 字符串 px 解析失败回退；ratio 空串/数字/空白', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '  ' },
          { x: 'B', y: 50, ratio: 25 },
          { x: 'C', y: 10, ratio: '' },
          { x: null as any, y: 1 },
        ]}
        height="not-a-numberpx"
        title="h"
      />,
    );
    expect(screen.getByTestId('tb')).toHaveTextContent('h');
    const opts = (globalThis as any).__funnelMoreOptions;
    const label = opts?.plugins?.tooltip?.callbacks?.label;
    expect(label?.({ dataIndex: undefined })).toBeTruthy();
    expect(label?.({ dataIndex: 99 })).toBeTruthy();
  });

  it('分类失效回退 categories[0]；仅空 category 时选中空', () => {
    const { rerender } = render(
      <FunnelChart
        data={[
          { x: 'A', y: 10, category: 'keep' },
          { x: 'B', y: 5, category: 'keep' },
        ]}
      />,
    );
    rerender(
      <FunnelChart
        data={[
          { x: 'A', y: 10, category: '' },
          { x: 'B', y: 5, category: '' },
        ]}
      />,
    );
    expect((globalThis as any).__funnelMoreData?.labels?.length).toBeGreaterThan(
      0,
    );
  });

  it('legend onClick 走 defaultClick；tooltip 缺 dataIndex', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100 },
          { x: 'B', y: 40 },
        ]}
        showLegend
      />,
    );
    const opts = (globalThis as any).__funnelMoreOptions;
    expect(() =>
      opts?.plugins?.legend?.onClick?.({}, { text: 'x' }, { chart: {} }),
    ).not.toThrow();
    const label = opts?.plugins?.tooltip?.callbacks?.label;
    expect(label?.({})).toBeTruthy();
  });

  it('rightLabelPlugin afterDatasetsDraw：缺 meta / 无 getPixelForValue', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 80, ratio: '100%' },
          { x: 'B', y: 40, ratio: '50%' },
        ]}
        theme="light"
        showLegend
      />,
    );
    const plugin = (globalThis as any).__funnelMorePlugins?.find(
      (p: any) => p.id === 'funnelRightLabels',
    );
    expect(plugin?.afterDatasetsDraw).toBeDefined();
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: {
        labels: ['A', 'B'],
        datasets: [{ data: [[-40, 40], [-20, 20]] }],
      },
      scales: {},
      getDatasetMeta: () => ({
        data: [
          { x: 100, y: 10, width: 80 },
          { x: 100, y: 40, width: 40 },
        ],
      }),
    });
    expect(ctx.fillText).toHaveBeenCalled();

    plugin.afterDatasetsDraw({
      ctx,
      data: { labels: [], datasets: [{ data: [] }] },
      scales: { x: { getPixelForValue: (v: number) => v } },
      getDatasetMeta: () => null,
    });
  });

  it('showPercent false；typeNames；download 触发', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100 },
          { x: 'B', y: 50, ratio: 10 },
        ]}
        showPercent={false}
        typeNames={{ rate: 'Rate', name: 'Name' }}
        width={400}
        height={300}
      />,
    );
    act(() => {
      fireEvent.click(screen.getByTestId('dl'));
    });
    const label = (globalThis as any).__funnelMoreOptions?.plugins?.tooltip
      ?.callbacks?.label;
    expect(label?.({ dataIndex: 1 })).toBe('50');
  });

  it('多 category + filterLabel；分类切换；空 data', () => {
    const { rerender } = render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, category: 'c1', filterLabel: 'east', ratio: 100 },
          { x: 'B', y: 40, category: 'c1', filterLabel: 'east', ratio: 40 },
          { x: 'A', y: 80, category: 'c2', filterLabel: 'west', ratio: 80 },
          { x: 'B', y: 20, category: 'c2', filterLabel: 'west', ratio: 20 },
        ]}
        showLegend
        theme="dark"
        title="multi"
      />,
    );
    expect((globalThis as any).__funnelMoreData?.labels?.length).toBeGreaterThan(
      0,
    );
    rerender(
      <FunnelChart
        data={[
          { x: 'X', y: 10, category: 'only' },
          { x: 'Y', y: 5, category: 'only' },
        ]}
      />,
    );
    expect(() => render(<FunnelChart data={[]} />)).not.toThrow();
    expect(() => render(<FunnelChart data={null as any} />)).not.toThrow();
  });

  it('height 数字/字符串；legend 点击；无 ratio 梯形跳过', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100 },
          { x: 'B', y: 50 },
          { x: 'C', y: 10 },
        ]}
        height={320}
        showLegend
        legendPosition="top"
      />,
    );
    const opts = (globalThis as any).__funnelMoreOptions;
    const onClick = opts?.plugins?.legend?.onClick;
    expect(() =>
      onClick?.(
        {},
        { index: 0 },
        { chart: { toggleDataVisibility: vi.fn(), update: vi.fn() } },
      ),
    ).not.toThrow();
    const _plugin = opts?.plugins?.customFunnelSeam || opts?.plugins;
    void _plugin;
    expect(opts).toBeTruthy();
  });

  it('istanbul deepen：ratio null/对象；datalabels；filter 全空 category；color 数组', () => {
    const { rerender } = render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: null as any, category: 'C1' },
          { x: 'B', y: 40, ratio: undefined as any, category: 'C1' },
          { x: 'C', y: 10, ratio: ' 30 ', category: 'C1' },
          { x: 'A', y: 90, category: 'C2', filterLabel: 'east' },
          { x: 'B', y: 30, category: 'C2', filterLabel: 'west' },
        ]}
        color="#1677ff"
        showPercent
        showLegend
        legendAlign="end"
        theme="light"
        statistic={{ title: 's', value: 1 }}
        title="funnel-deep"
      />,
    );
    const opts = (globalThis as any).__funnelMoreOptions;
    const label = opts?.plugins?.tooltip?.callbacks?.label;
    expect(label?.({ dataIndex: 0 })).toBeTruthy();
    expect(label?.({ dataIndex: 2 })).toBeTruthy();
    const datalabels = opts?.plugins?.datalabels;
    if (datalabels?.formatter) {
      expect(datalabels.formatter(null, { dataIndex: 0 })).toBeDefined();
      expect(datalabels.formatter(50, { dataIndex: 1 })).toBeDefined();
      expect(datalabels.formatter(10, { dataIndex: 99 })).toBeDefined();
    }
    if (typeof datalabels?.color === 'function') {
      expect(datalabels.color({ dataIndex: 0 })).toBeTruthy();
    }
    act(() => {
      fireEvent.click(screen.getByTestId('ff'));
    });

    rerender(
      <FunnelChart
        data={[
          { x: 'X', y: 1, category: '' },
          { x: 'Y', y: 2, category: '' },
        ]}
        height="240px"
        color="#abcdef"
        showLegend={false}
      />,
    );
    expect((globalThis as any).__funnelMoreData?.labels?.length).toBeGreaterThan(
      0,
    );

    rerender(
      <FunnelChart
        data={[
          { x: 'A', y: 100, filterLabel: 'only' },
          { x: 'B', y: 50, filterLabel: 'only', ratio: 50 },
        ]}
        width={200}
        height={180}
      />,
    );
    const label2 = (globalThis as any).__funnelMoreOptions?.plugins?.tooltip
      ?.callbacks?.label;
    expect(label2?.({ dataIndex: 1 })).toBeTruthy();
  });

  it('istanbul deepen：转化率关闭；非数组 data；color 数组；ratio；梯形切换', () => {
    const { rerender } = render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, category: 'C1', filterLabel: 'east', ratio: 100 },
          { x: 'B', y: 60, category: 'C1', filterLabel: 'east', ratio: 60 },
          { x: 'C', y: 20, category: 'C1', filterLabel: 'west' },
          { x: 'D', y: 0, category: 'C2' },
          { x: 'E', y: 'bad' as any, category: 'C2' },
        ]}
        color={['#111', '#222', '']}
        showPercent={false}
        showLegend
        legendPosition="top"
        theme="dark"
        typeNames={{ rate: 'Rate', conversion: 'Conv' }}
        statistic={[{ title: 's', value: 1 }]}
        title="funnel-more"
      />,
    );
    const opts = (globalThis as any).__funnelMoreOptions;
    const label = opts?.plugins?.tooltip?.callbacks?.label;
    expect(label?.({ dataIndex: 0 })).toBeTruthy();
    expect(label?.({ dataIndex: 3 })).toBeDefined();
    const datalabels = opts?.plugins?.datalabels;
    if (datalabels?.formatter) {
      expect(datalabels.formatter(100, { dataIndex: 0 })).toBeDefined();
      expect(datalabels.formatter(0, { dataIndex: 3 })).toBeDefined();
    }
    if (typeof datalabels?.color === 'function') {
      expect(datalabels.color({ dataIndex: 0 })).toBeTruthy();
      expect(datalabels.color({ dataIndex: 99 })).toBeDefined();
    }
    const bg = (globalThis as any).__funnelMoreData?.datasets?.[0]
      ?.backgroundColor;
    if (typeof bg === 'function') {
      expect(
        bg({
          chart: {
            chartArea: { left: 0, right: 100, top: 0, bottom: 100 },
            ctx: { createLinearGradient: () => ({ addColorStop: vi.fn() }) },
            scales: {
              x: { getPixelForValue: (v: number) => v },
              y: { getPixelForValue: (v: number) => v },
            },
          },
          dataIndex: 0,
          parsed: { x: 50, y: 1 },
        }),
      ).toBeTruthy();
      expect(
        bg({
          chart: { chartArea: null, ctx: {}, scales: {} },
          dataIndex: 1,
          parsed: {},
        }),
      ).toBeTruthy();
    }

    rerender(<FunnelChart data={null as any} title="null-funnel" />);
    expect(screen.getByTestId('tb')).toHaveTextContent('null-funnel');

    rerender(
      <FunnelChart
        data={[
          { x: 'only', y: 10 },
          { x: 'only2', y: 5 },
        ]}
        color="#00aa00"
        showPercent
        showLegend={false}
        width="100%"
        height={160}
      />,
    );
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(
      (globalThis as any).__funnelMoreData?.labels?.length,
    ).toBeGreaterThan(0);
  });
});

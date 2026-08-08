/**
 * FunnelChart index 补洞：SSR、filter 解析、bottomLayerMinWidth、legend/梯形插件。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FunnelChart from '../index';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => [{ text: '转化', datasetIndex: 0 }]),
          },
          onClick: undefined,
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
    (globalThis as any).__funnelDeepenData = data;
    (globalThis as any).__funnelDeepenOptions = options;
    (globalThis as any).__funnelDeepenPlugins = plugins;
    return <div data-testid="funnel-deepen-bar" />;
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'fd' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => <div data-testid="stat" />,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children, className, style }: any) => (
    <div data-testid="container" className={className} style={style}>
      {children}
    </div>
  ),
  ChartToolBar: ({ title, onDownload, filter, loading }: any) => (
    <div data-testid="tb" data-loading={loading}>
      {title}
      {filter}
      <button type="button" data-testid="dl" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  ChartFilter: ({
    filterOptions,
    onFilterChange,
    customOptions,
    onSelectionChange,
    selectedCustomSelection,
  }: any) => (
    <div data-testid="filter">
      <button
        type="button"
        data-testid="cat-filter"
        onClick={() => onFilterChange?.(filterOptions?.[1]?.value)}
      >
        cat
      </button>
      {customOptions?.map((o: any) => (
        <button
          key={o.key}
          type="button"
          data-testid={`fl-${o.key}`}
          onClick={() => onSelectionChange?.(o.key)}
        >
          {o.label}
          {selectedCustomSelection === o.key ? '*' : ''}
        </button>
      ))}
    </div>
  ),
  downloadChart: vi.fn(),
}));

describe('FunnelChart index deepen branches', () => {
  const origWindow = global.window;
  const origInnerWidth = window.innerWidth;
  const origDpr = window.devicePixelRatio;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
      writable: true,
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 2,
      writable: true,
    });
  });

  afterEach(() => {
    if (!global.window) {
      global.window = origWindow;
    }
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: origInnerWidth,
      writable: true,
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: origDpr,
      writable: true,
    });
  });

  it('bottomLayerMinWidth：等值 range=0；非法 >1；filterLabel 筛选', () => {
    const { rerender } = render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, category: 'C1', filterLabel: 'east', ratio: '50%' },
          { x: 'B', y: 100, category: 'C1', filterLabel: 'west', ratio: 25 },
          { x: 'A', y: 80, category: 'C2', filterLabel: 'east', ratio: 80 },
        ]}
        bottomLayerMinWidth={0.5}
        renderFilterInToolbar
        showLegend
        theme="light"
        typeNames={{ rate: 'Rate', name: 'Step' }}
        width={480}
        height={280}
        title="layer"
      />,
    );
    expect((globalThis as any).__funnelDeepenData?.datasets?.[0]?.data).toBeTruthy();

    act(() => {
      fireEvent.click(screen.getByTestId('cat-filter'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('fl-east'));
    });
    expect((globalThis as any).__funnelDeepenData?.labels?.length).toBeGreaterThan(
      0,
    );

    rerender(
      <FunnelChart
        data={[
          { x: 'A', y: 50, ratio: 50 },
          { x: 'B', y: 50, ratio: 25 },
        ]}
        bottomLayerMinWidth={1.5}
        height={'0px' as any}
        width="100%"
        loading
      />,
    );
    expect(screen.getByTestId('tb')).toHaveAttribute('data-loading', 'true');
  });

  it('ratio 非有限数；legend 转化率切换；tooltip 缺 dataIndex', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: Number.NaN as any },
          { x: 'B', y: 60, ratio: '30%' },
          { x: 'C', y: 20, ratio: '  ' },
        ]}
        showLegend
        showPercent
        theme="dark"
        legendPosition="top"
        legendAlign="center"
      />,
    );
    const opts = (globalThis as any).__funnelDeepenOptions;
    const gen = opts?.plugins?.legend?.labels?.generateLabels;
    const labels = gen?.({ data: { datasets: [{}] } });
    expect(Array.isArray(labels)).toBe(true);

    const onClick = opts?.plugins?.legend?.onClick;
    act(() => {
      onClick?.({}, { text: 'Step' }, { chart: {} });
    });
    act(() => {
      onClick?.({}, { text: 'Rate' }, { chart: {} });
    });

    const label = opts?.plugins?.tooltip?.callbacks?.label;
    expect(label?.({ dataIndex: undefined })).toBeTruthy();
    const title = opts?.plugins?.tooltip?.callbacks?.title;
    expect(title?.([])).toBe('');
    expect(title?.([{ label: 'A' }])).toBe('A');
  });

  it('梯形插件：非数组 raw、无 xScale、mobile seam、dark stroke', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 375,
      writable: true,
    });
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '100%' },
          { x: 'B', y: 50, ratio: '50%' },
          { x: 'C', y: 10, ratio: '20%' },
        ]}
        theme="dark"
        showLegend
      />,
    );
    const plugin = (globalThis as any).__funnelDeepenPlugins?.find(
      (p: any) => p.id === 'funnelTrapezoidLabels',
    );
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
    plugin?.afterDatasetsDraw({
      ctx,
      data: {
        labels: ['A', 'B', 'C'],
        datasets: [{ data: [[-50, 50], [-30, 30], [-10, 10]] }],
      },
      scales: {},
      getDatasetMeta: () => ({
        data: [
          { x: 50, y: 10, height: 20 },
          { x: 50, y: 40, height: 20 },
          { x: 50, y: 70, height: 20 },
        ],
      }),
    });
    expect(ctx.fill).toHaveBeenCalled();

    plugin?.afterDatasetsDraw({
      ctx,
      data: {
        labels: ['A', 'B'],
        datasets: [{ data: ['bad', [-25, 25]] }],
      },
      scales: { x: { getPixelForValue: (v: number) => v } },
      getDatasetMeta: () => ({
        data: [
          { x: 50, y: 10, height: 20 },
          { x: 50, y: 40, height: 20 },
        ],
      }),
    });

    plugin?.afterDatasetsDraw({
      ctx,
      data: { datasets: [{ data: [] }] },
      scales: { x: { getPixelForValue: (v: number) => v + 100 } },
      getDatasetMeta: () => null,
    });
  });

  it('rightLabelPlugin：非数组 raw；resize；分类失效回退空', () => {
    const { rerender } = render(
      <FunnelChart
        data={[
          { x: 'A', y: 80, category: 'c1' },
          { x: 'B', y: 40, category: 'c1' },
        ]}
        title="right"
      />,
    );
    const plugin = (globalThis as any).__funnelDeepenPlugins?.find(
      (p: any) => p.id === 'funnelRightLabels',
    );
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
    };
    plugin?.afterDatasetsDraw({
      ctx,
      data: {
        labels: ['A', 'B'],
        datasets: [{ data: [null, [-20, 20]] }],
      },
      scales: { x: { getPixelForValue: (v: number) => v } },
      getDatasetMeta: () => ({
        data: [
          { x: 10, y: 5, width: 20 },
          { x: 10, y: 15, width: 40 },
        ],
      }),
    });
    expect(ctx.fillText).toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    rerender(
      <FunnelChart
        data={[
          { x: 'X', y: 1, category: '' },
          { x: 'Y', y: 2, category: '' },
        ]}
      />,
    );
    rerender(
      <FunnelChart
        data={[{ x: 'solo', y: 5 }]}
        showLegend={false}
        showPercent={false}
      />,
    );
    fireEvent.click(screen.getAllByTestId('dl').at(-1)!);
    expect((globalThis as any).__funnelDeepenData).toBeTruthy();
  });

  it('filterLabel 清空 effect；无 category 显示全部；resolvedFilterLabel 真值臂', () => {
    const { rerender } = render(
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
      fireEvent.click(screen.getByTestId('fl-F1'));
    });
    rerender(
      <FunnelChart
        data={[
          { x: 'A', y: 10, filterLabel: 'only' },
          { x: 'B', y: 5, filterLabel: 'only' },
        ]}
      />,
    );
    expect((globalThis as any).__funnelDeepenData?.labels?.length).toBe(2);
  });
});

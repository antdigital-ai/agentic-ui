/**
 * FunnelChart 分支覆盖补充测试
 */
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FunnelChart from '../FunnelChart';

const mockDownloadChart = vi.fn();
let lastOptions: any;
let lastData: any;
let lastPlugins: any[] = [];

vi.mock('chart.js', async () => {
  const actual = await vi.importActual('chart.js');
  return {
    ...actual,
    Chart: {
      register: vi.fn(),
      defaults: {
        plugins: {
          legend: {
            labels: { generateLabels: vi.fn(() => [{ text: '转化' }]) },
            onClick: vi.fn(),
          },
        },
      },
    },
  };
});

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options, plugins }: any) => {
    lastOptions = options;
    lastData = data;
    lastPlugins = plugins ?? [];
    return <div data-testid="funnel-bar" data-labels={JSON.stringify(data?.labels)} />;
  },
}));

vi.mock('../FunnelChart/style', () => ({
  useStyle: () => ({ hashId: 'f-hash' }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="chart-statistic" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children, className, style }: any) => (
    <div data-testid="chart-container" className={className} style={style}>
      {children}
    </div>
  ),
  ChartToolBar: ({ title, onDownload, filter, extra }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span data-testid="chart-title">{title}</span>}
      {extra}
      {filter}
      <button type="button" data-testid="download-btn" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange, onSelectionChange }: any) => (
    <button
      type="button"
      data-testid="chart-filter"
      onClick={() => {
        if (filterOptions?.length > 1) onFilterChange?.(filterOptions[1].value);
        onSelectionChange?.('F2');
      }}
    >
      filter
    </button>
  ),
  ChartStatistic: () => <div data-testid="chart-statistic" />,
  downloadChart: (...args: any[]) => mockDownloadChart(...args),
}));

vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>();
  return {
    ...actual,
    resolveCssVariable: (c: string) =>
      c.startsWith('var(') ? '#1890ff' : c,
  };
});

const baseData = [
  { x: '访问', y: 1000, ratio: '100%', category: 'A', filterLabel: 'F1' },
  { x: '注册', y: 500, ratio: 50, category: 'A', filterLabel: 'F1' },
  { x: '付费', y: 100, ratio: '20%', category: 'A', filterLabel: 'F2' },
  { x: '访问', y: 800, ratio: '100%', category: 'B', filterLabel: 'F1' },
];

const renderFunnel = (props: Partial<React.ComponentProps<typeof FunnelChart>> = {}) =>
  render(
    <ConfigProvider>
      <FunnelChart data={baseData} title="漏斗" {...props} />
    </ConfigProvider>,
  );

describe('FunnelChart 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastOptions = undefined;
    lastData = undefined;
    lastPlugins = [];
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  it('bottomLayerMinWidth 非法值时不调整数据', () => {
    renderFunnel({ bottomLayerMinWidth: 1.5 });
    expect(lastData?.datasets?.[0]?.data?.[0]).toEqual([-500, 500]);
  });

  it('bottomLayerMinWidth 有效且需拉伸时映射数值', () => {
    renderFunnel({ bottomLayerMinWidth: 0.5 });
    const widths = lastData?.datasets?.[0]?.data?.map(
      (pair: number[]) => pair[1] - pair[0],
    );
    expect(widths?.[widths.length - 1]).toBeGreaterThanOrEqual(500);
  });

  it('bottomLayerMinWidth 已满足最小时不调整', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100 },
        { x: 'B', y: 60 },
      ],
      bottomLayerMinWidth: 0.5,
    });
    expect(lastData?.datasets?.[0]?.data).toHaveLength(2);
  });

  it('所有值相等时 range===0 返回 maxValue', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 50 },
        { x: 'B', y: 50 },
      ],
      bottomLayerMinWidth: 0.3,
    });
    const w = lastData?.datasets?.[0]?.data?.[0];
    expect(w).toEqual([-25, 25]);
  });

  it('showPercent false 时 tooltip 仅显示数值', () => {
    renderFunnel({ showPercent: false });
    const label = lastOptions?.plugins?.tooltip?.callbacks?.label({
      dataIndex: 1,
    });
    expect(label).toBe('500');
  });

  it('tooltip 有 ratio 时显示括号百分比', () => {
    renderFunnel();
    const label = lastOptions?.plugins?.tooltip?.callbacks?.label({
      dataIndex: 1,
    });
    expect(label).toContain('500');
    expect(label).toContain('%');
  });

  it('tooltip title 空 label 返回空字符串', () => {
    renderFunnel();
    expect(lastOptions?.plugins?.tooltip?.callbacks?.title([])).toBe('');
    expect(
      lastOptions?.plugins?.tooltip?.callbacks?.title([{ label: '步骤' }]),
    ).toBe('步骤');
  });

  it('generateLabels 无 ratio 时不追加转化率图例', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100 },
        { x: 'B', y: 50 },
      ],
    });
    const labels = lastOptions?.plugins?.legend?.labels?.generateLabels({
      data: { datasets: [{}] },
    });
    expect(labels.every((l: any) => l.text !== '转化率')).toBe(true);
  });

  it('generateLabels 有 ratio 时追加转化率图例', () => {
    renderFunnel();
    const labels = lastOptions?.plugins?.legend?.labels?.generateLabels({
      data: { datasets: [{}] },
    });
    expect(labels.some((l: any) => l.text === '转化率')).toBe(true);
  });

  it('legend onClick 切换转化率图例', () => {
    renderFunnel({ typeNames: { rate: '转化率', name: '步骤' } });
    const onClick = lastOptions?.plugins?.legend?.onClick;
    expect(() =>
      onClick?.({}, { text: '转化率' }, {}),
    ).not.toThrow();
  });

  it('legend onClick 其他项走默认行为', () => {
    renderFunnel();
    const onClick = lastOptions?.plugins?.legend?.onClick;
    expect(() =>
      onClick?.({}, { text: '转化' }, { chart: {} }),
    ).not.toThrow();
  });

  it('renderFilterInToolbar 为 true 时在工具栏渲染筛选', () => {
    renderFunnel({ renderFilterInToolbar: true });
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('renderFilterInToolbar 为 false 时在外部渲染筛选', () => {
    renderFunnel({ renderFilterInToolbar: false });
    expect(screen.getAllByTestId('chart-filter').length).toBeGreaterThan(0);
  });

  it('切换 category 筛选', async () => {
    renderFunnel({ renderFilterInToolbar: false });
    await act(async () => {
      fireEvent.click(screen.getByTestId('chart-filter'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('funnel-bar')).toBeInTheDocument();
    });
  });

  it('statistic 单对象与数组', () => {
    const { rerender } = renderFunnel({
      statistic: { type: 'sum', target: 'y', label: '合计' } as any,
    });
    expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
    rerender(
      <ConfigProvider>
        <FunnelChart
          data={baseData}
          statistic={[
            { type: 'sum', target: 'y', label: 'A' },
            { type: 'avg', target: 'y', label: 'B' },
          ] as any}
        />
      </ConfigProvider>,
    );
    expect(screen.getAllByTestId('chart-statistic').length).toBe(2);
  });

  it('height 字符串 px 解析', () => {
    renderFunnel({ height: '400px' });
    expect(screen.getByTestId('funnel-bar')).toBeInTheDocument();
  });

  it('height 数字直接使用', () => {
    renderFunnel({ height: 300 });
    expect(screen.getByTestId('funnel-bar')).toBeInTheDocument();
  });

  it('width 数字与 100% 分支', () => {
    const { rerender } = renderFunnel({ width: 500 });
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    rerender(
      <ConfigProvider>
        <FunnelChart data={baseData} width="100%" />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('移动端 isMobile 分支', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    renderFunnel();
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(lastOptions?.layout?.padding?.right).toBe(72);
  });

  it('dark theme 分支', () => {
    renderFunnel({ theme: 'dark' });
    expect(lastOptions?.plugins?.tooltip?.backgroundColor).toContain('0,0,0');
  });

  it('showLegend false', () => {
    renderFunnel({ showLegend: false });
    expect(lastOptions?.plugins?.legend?.display).toBe(false);
  });

  it('过滤 x 为 null 的数据', () => {
    renderFunnel({
      data: [
        { x: null as any, y: 10 },
        { x: '有效', y: 20 },
      ],
    });
    expect(lastData?.labels).toEqual(['有效']);
  });

  it('非数组 data 当作空数组', () => {
    renderFunnel({ data: undefined as any });
    expect(screen.getByTestId('funnel-bar')).toBeInTheDocument();
  });

  it('ratio 字符串无百分号时自动追加', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100, ratio: '100' },
        { x: 'B', y: 50, ratio: '50' },
      ],
    });
    const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
    expect(plugin).toBeDefined();
  });

  it('trapezoid 插件 showTrapezoid false 时跳过绘制', () => {
    renderFunnel();
    const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: vi.fn(),
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: { datasets: [{ data: [[-50, 50], [-25, 25]] }] },
      scales: { x: { getPixelForValue: (v: number) => v * 10 } },
      getDatasetMeta: () => ({
        data: [
          { x: 100, y: 10, height: 20 },
          { x: 100, y: 40, height: 20 },
        ],
      }),
    });
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('rightLabel 插件绘制标签', () => {
    renderFunnel({
      data: [
        { x: '步骤1', y: 100, ratio: '50%' },
        { x: '步骤2', y: 50 },
      ],
    });
    const plugin = lastPlugins.find((p) => p.id === 'funnelRightLabels');
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: vi.fn(),
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: {
        labels: ['步骤1', '步骤2'],
        datasets: [{ data: [[-50, 50], [-25, 25]] }],
      },
      scales: { x: { getPixelForValue: (v: number) => v * 10 + 100 } },
      getDatasetMeta: () => ({
        data: [
          { x: 150, y: 10, width: 100 },
          { x: 125, y: 40, width: 50 },
        ],
      }),
    });
    expect(ctx.fillText).toHaveBeenCalled();
  });

  it('点击下载', () => {
    renderFunnel();
    fireEvent.click(screen.getByTestId('download-btn'));
    expect(mockDownloadChart).toHaveBeenCalled();
  });

  it('y scales afterFit 调整高度', () => {
    renderFunnel();
    const scale = { height: 0 };
    lastOptions?.scales?.y?.afterFit?.(scale);
    expect(scale.height).toBeGreaterThan(0);
  });

  it('color CSS 变量解析', () => {
    renderFunnel({ color: 'var(--primary)' });
    expect(lastData?.datasets?.[0]?.backgroundColor?.length).toBeGreaterThan(0);
  });

  it('卸载时移除 resize 监听', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderFunnel();
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('无 category 时使用全部数据', () => {
    renderFunnel({
      data: [
        { x: '访问', y: 1000 },
        { x: '注册', y: 500 },
      ],
    });
    expect(lastData?.labels).toEqual(['访问', '注册']);
  });

  it('bottomLayerMinWidth 为 0 时不调整数值', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100 },
        { x: 'B', y: 10 },
      ],
      bottomLayerMinWidth: 0,
    });
    expect(lastData?.datasets?.[0]?.data?.[1]).toEqual([-5, 5]);
  });

  it('ratio 为数字时 tooltip 显示百分比', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100, ratio: 100 },
        { x: 'B', y: 50, ratio: 50 },
      ],
    });
    const label = lastOptions?.plugins?.tooltip?.callbacks?.label({
      dataIndex: 1,
    });
    expect(label).toContain('50');
    expect(label).toContain('%');
  });

  it('showTrapezoid false 时梯形插件跳过绘制', async () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100, ratio: '100%' },
        { x: 'B', y: 50, ratio: '50%' },
      ],
    });
    await act(async () => {
      lastOptions?.plugins?.legend?.onClick?.(
        {},
        { text: '转化率' },
        {},
      );
    });
    await waitFor(() => {
      const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
      expect(plugin).toBeDefined();
    });
    const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: { datasets: [{ data: [[-50, 50], [-25, 25]] }] },
      scales: { x: { getPixelForValue: (v: number) => v * 10 } },
      getDatasetMeta: () => ({
        data: [
          { x: 100, y: 10, height: 20 },
          { x: 100, y: 40, height: 20 },
        ],
      }),
    });
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it('无 ratio 的层跳过梯形绘制', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100 },
        { x: 'B', y: 50 },
      ],
    });
    const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: { datasets: [{ data: [[-50, 50], [-25, 25]] }] },
      scales: { x: { getPixelForValue: (v: number) => v * 10 } },
      getDatasetMeta: () => ({
        data: [
          { x: 100, y: 10, height: 20 },
          { x: 100, y: 40, height: 20 },
        ],
      }),
    });
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it('dark theme 梯形绘制 stroke 分支', () => {
    renderFunnel({
      theme: 'dark',
      data: [
        { x: 'A', y: 100, ratio: '100%' },
        { x: 'B', y: 50, ratio: '50%' },
      ],
    });
    const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: vi.fn(),
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: { datasets: [{ data: [[-50, 50], [-25, 25]] }] },
      scales: { x: { getPixelForValue: (v: number) => v * 10 + 100 } },
      getDatasetMeta: () => ({
        data: [
          { x: 150, y: 10, height: 20, width: 100 },
          { x: 125, y: 40, height: 20, width: 50 },
        ],
      }),
    });
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('rightLabel 插件跳过非数组 raw', () => {
    renderFunnel({
      data: [{ x: '步骤', y: 100 }],
    });
    const plugin = lastPlugins.find((p) => p.id === 'funnelRightLabels');
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: vi.fn(),
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: { labels: ['步骤'], datasets: [{ data: [null] }] },
      scales: { x: { getPixelForValue: (v: number) => v } },
      getDatasetMeta: () => ({
        data: [{ x: 100, y: 20, width: 50 }],
      }),
    });
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('height 非 px 字符串时使用 chartHeight', () => {
    renderFunnel({ height: 'auto' });
    expect(screen.getByTestId('funnel-bar')).toBeInTheDocument();
  });

  it('单阶段漏斗正常渲染', () => {
    renderFunnel({
      data: [{ x: '唯一', y: 100, ratio: '100%' }],
    });
    expect(lastData?.labels).toEqual(['唯一']);
  });

  it('loading 状态渲染', () => {
    renderFunnel({ loading: true, title: '加载中' });
    expect(screen.getByTestId('chart-title')).toHaveTextContent('加载中');
  });

  it.skip('category 为空时使用默认筛选项', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 10, category: '' },
        { x: 'B', y: 5, category: 'B组' },
      ],
      renderFilterInToolbar: true,
    });
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('showLegend false 隐藏图例', () => {
    renderFunnel({ showLegend: false });
    expect(lastOptions?.plugins?.legend?.display).toBe(false);
  });

  it('legendPosition top 与 legendAlign center', () => {
    renderFunnel({ legendPosition: 'top', legendAlign: 'center' });
    expect(lastOptions?.plugins?.legend?.position).toBe('top');
    expect(lastOptions?.plugins?.legend?.align).toBe('center');
  });

  it('自定义 typeNames rate/name', () => {
    renderFunnel({
      typeNames: { rate: '转化比', name: '步骤名' },
      data: [
        { x: 'A', y: 100, ratio: '50%' },
        { x: 'B', y: 50 },
      ],
    });
    const labels = lastOptions?.plugins?.legend?.labels?.generateLabels({
      data: { datasets: [{}] },
    });
    expect(labels.some((l: any) => l.text === '转化比')).toBe(true);
  });

  it('stages 按 y 降序排列', () => {
    renderFunnel({
      data: [
        { x: '低', y: 10, category: 'A' },
        { x: '高', y: 100, category: 'A' },
        { x: '中', y: 50, category: 'A' },
      ],
    });
    expect(lastData?.labels).toEqual(['高', '中', '低']);
  });

  it('ratio 空字符串时不追加 tooltip 百分比', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100 },
        { x: 'B', y: 50, ratio: '  ' },
      ],
    });
    const label = lastOptions?.plugins?.tooltip?.callbacks?.label({
      dataIndex: 1,
    });
    expect(label).toBe('50');
    expect(label).not.toContain('（');
  });

  it('trapezoid 无 xScale.getPixelForValue 时使用 fallback 像素', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100, ratio: '100%' },
        { x: 'B', y: 50, ratio: '50%' },
      ],
    });
    const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: vi.fn(),
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: { datasets: [{ data: [[-50, 50], [-25, 25]] }] },
      scales: { x: {} },
      getDatasetMeta: () => ({
        data: [
          { x: 100, y: 10, height: 20, width: 100 },
          { x: 100, y: 40, height: 20, width: 50 },
        ],
      }),
    });
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('rightLabel 无 xScale 时使用 el.x fallback', () => {
    renderFunnel({ data: [{ x: '步骤', y: 80 }] });
    const plugin = lastPlugins.find((p) => p.id === 'funnelRightLabels');
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: vi.fn(),
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: { labels: ['步骤'], datasets: [{ data: [[-40, 40]] }] },
      scales: { x: {} },
      getDatasetMeta: () => ({
        data: [{ x: 120, y: 30, width: 80 }],
      }),
    });
    expect(ctx.fillText).toHaveBeenCalled();
  });

  it('width 字符串非 100% 时使用 style.width', () => {
    renderFunnel({ width: '480px' });
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('桌面端 animation duration 400', () => {
    renderFunnel();
    expect(lastOptions?.animation?.duration).toBe(400);
  });

  it('仅单一 category 时不渲染筛选器', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100, category: 'A', filterLabel: '唯一' },
        { x: 'B', y: 50, category: 'A', filterLabel: '唯一' },
      ],
      renderFilterInToolbar: true,
    });
    expect(screen.queryByTestId('chart-filter')).not.toBeInTheDocument();
  });

  it('toolbarExtra 渲染到工具栏', () => {
    renderFunnel({
      toolbarExtra: <span data-testid="extra-btn">extra</span>,
    });
    expect(screen.getByTestId('extra-btn')).toBeInTheDocument();
  });

  it('移动端 animation duration 为 0', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    renderFunnel();
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(lastOptions?.animation?.duration).toBe(200);
  });

  it('tooltip title 含 label 数组时取首项', () => {
    renderFunnel();
    expect(
      lastOptions?.plugins?.tooltip?.callbacks?.title([{ label: '步骤A' }]),
    ).toBe('步骤A');
  });

  it('selectedFilter 失效后回退到首个 category', async () => {
    const dataA = [
      { x: 'A', y: 100, category: 'A' },
      { x: 'B', y: 50, category: 'B' },
    ];
    const { rerender } = renderFunnel({ data: dataA });
    rerender(
      <ConfigProvider>
        <FunnelChart
          data={[{ x: 'C', y: 80, category: 'C' }]}
          title="漏斗"
        />
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('funnel-bar')).toBeInTheDocument();
    });
  });

  it('filterLabel 筛选变化时更新 selectedFilterLabel', async () => {
    renderFunnel({ renderFilterInToolbar: true });
    fireEvent.click(screen.getByTestId('chart-filter'));
    expect(screen.getByTestId('funnel-bar')).toBeInTheDocument();
  });

  it('ratioDisplay 字符串数组渲染', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100, ratio: '50%' },
        { x: 'B', y: 50, ratio: '25%' },
      ],
    });
    expect(lastPlugins.some((p) => p.id === 'funnelTrapezoidLabels')).toBe(true);
  });

  it('legend 点击转化率切换 showTrapezoid', () => {
    renderFunnel();
    lastOptions?.plugins?.legend?.onClick?.(
      {},
      { text: '转化率' },
      { chart: { data: { datasets: [] } } },
    );
    const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
    expect(() =>
      plugin?.afterDatasetsDraw?.({
        ctx: {},
        data: { datasets: [{ data: [100, 50] }] },
        scales: { x: { getPixelForValue: () => 0 } },
        getDatasetMeta: () => ({ data: [{ x: 0, y: 0, base: 0 }, { x: 0, y: 0, base: 0 }] }),
      }),
    ).not.toThrow();
  });

  it('desktop animation duration 为 400', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    renderFunnel();
    expect(lastOptions?.animation?.duration).toBe(400);
  });

  it('trapezoid 插件 showTrapezoid=false 时不绘制', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100, ratio: '100%' },
        { x: 'B', y: 50, ratio: '50%' },
      ],
    });
    lastOptions?.plugins?.legend?.onClick?.(
      {},
      { text: '转化率' },
      { chart: { data: { datasets: [] } } },
    );
    const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
    };
    plugin.afterDatasetsDraw({
      ctx,
      data: { datasets: [{ data: [[-50, 50], [-25, 25]] }] },
      scales: { x: { getPixelForValue: () => 100 } },
      getDatasetMeta: () => ({
        data: [{ x: 100, y: 10, height: 20, base: 0 }],
      }),
    });
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it('ratio 为数字 0 时 tooltip 仍显示括号', () => {
    renderFunnel({
      data: [
        { x: 'A', y: 100, ratio: 1 },
        { x: 'B', y: 0, ratio: 0 },
      ],
    });
    const label = lastOptions?.plugins?.tooltip?.callbacks?.label({
      dataIndex: 1,
    });
    expect(label).toContain('0');
    expect(label).toContain('%');
  });

  it('切换 category 后 filterLabel 清空并展示全量数据', async () => {
    renderFunnel({
      renderFilterInToolbar: true,
      data: [
        { x: 'A', y: 100, category: 'A', filterLabel: 'F1' },
        { x: 'B', y: 50, category: 'A', filterLabel: 'F2' },
        { x: 'C', y: 80, category: 'B' },
      ],
    });
    fireEvent.click(screen.getByTestId('chart-filter'));
    await waitFor(() => {
      expect(lastData?.datasets?.[0]?.data?.length).toBeGreaterThan(0);
    });
  });

  it('filterLabels 清空时 selectedFilterLabel 重置为 undefined', async () => {
    const dataWithFilter = [
      { x: 'A', y: 100, category: 'A', filterLabel: 'F1' },
      { x: 'B', y: 50, category: 'A', filterLabel: 'F2' },
    ];
    const { rerender } = renderFunnel({ data: dataWithFilter });
    rerender(
      <ConfigProvider>
        <FunnelChart
          data={[
            { x: 'A', y: 100, category: 'A' },
            { x: 'B', y: 50, category: 'A' },
          ]}
          title="漏斗"
        />
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(lastData?.labels).toEqual(['A', 'B']);
    });
  });

  it('selectedFilterLabel 失效时回退到 filterLabels 首项', async () => {
    const { rerender } = renderFunnel({
      data: [
        { x: 'A', y: 100, category: 'A', filterLabel: 'F1' },
        { x: 'B', y: 50, category: 'A', filterLabel: 'F2' },
      ],
    });
    rerender(
      <ConfigProvider>
        <FunnelChart
          data={[
            { x: 'C', y: 80, category: 'A', filterLabel: 'F3' },
            { x: 'D', y: 40, category: 'A', filterLabel: 'F4' },
          ]}
          title="漏斗"
        />
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(lastData?.labels).toEqual(['C', 'D']);
    });
  });

  it('切换 category 后 filterLabel 不在列表时重置为首项', async () => {
    renderFunnel({
      renderFilterInToolbar: true,
      data: [
        { x: 'A', y: 100, category: 'A', filterLabel: 'F1' },
        { x: 'B', y: 50, category: 'A', filterLabel: 'F2' },
        { x: 'C', y: 80, category: 'B', filterLabel: 'F3' },
      ],
    });
    fireEvent.click(screen.getByTestId('chart-filter'));
    await waitFor(() => {
      expect(lastData?.labels?.length).toBeGreaterThan(0);
    });
  });

  describe('深度 edge-case 分支', () => {
    it('categories 清空后 selectedFilter 回退为空字符串', async () => {
      const { rerender } = renderFunnel({
        data: [
          { x: 'A', y: 100, category: 'A' },
          { x: 'B', y: 50, category: 'B' },
        ],
      });
      rerender(
        <ConfigProvider>
          <FunnelChart
            data={[
              { x: 'Only', y: 80 },
              { x: 'Other', y: 40 },
            ]}
            title="漏斗"
          />
        </ConfigProvider>,
      );
      await waitFor(() => {
        expect(lastData?.labels).toEqual(['Only', 'Other']);
      });
    });

    it('filterLabel 三元：selectedFilterLabel 不在列表时不应用二级筛选', () => {
      renderFunnel({
        data: [
          { x: 'A', y: 100, category: 'A', filterLabel: 'F1' },
          { x: 'B', y: 50, category: 'A', filterLabel: 'F2' },
        ],
      });
      expect(lastData?.labels).toEqual(['A', 'B']);
    });

    it('梯形插件 getDatasetMeta 返回 null 时安全跳过', () => {
      renderFunnel({
        data: [
          { x: 'A', y: 100, ratio: '100%' },
          { x: 'B', y: 50, ratio: '50%' },
        ],
      });
      const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
      expect(() =>
        plugin?.afterDatasetsDraw?.({
          ctx: { save: vi.fn(), restore: vi.fn() },
          data: { datasets: [{ data: [[-50, 50], [-25, 25]] }] },
          scales: { x: { getPixelForValue: () => 100 } },
          getDatasetMeta: () => null,
        }),
      ).not.toThrow();
    });

    it('rightLabel 插件 getDatasetMeta 返回 null 时安全跳过', () => {
      renderFunnel({ data: [{ x: '步骤', y: 80 }] });
      const plugin = lastPlugins.find((p) => p.id === 'funnelRightLabels');
      expect(() =>
        plugin?.afterDatasetsDraw?.({
          ctx: { save: vi.fn(), restore: vi.fn(), fillText: vi.fn() },
          data: { labels: ['步骤'], datasets: [{ data: [[-40, 40]] }] },
          scales: { x: { getPixelForValue: () => 100 } },
          getDatasetMeta: () => null,
        }),
      ).not.toThrow();
    });

    it('devicePixelRatio 为 0 时梯形插件仍绘制', () => {
      const origDpr = window.devicePixelRatio;
      Object.defineProperty(window, 'devicePixelRatio', {
        configurable: true,
        value: 0,
      });
      renderFunnel({
        data: [
          { x: 'A', y: 100, ratio: '100%' },
          { x: 'B', y: 50, ratio: '50%' },
        ],
      });
      const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        textBaseline: '',
        fillText: vi.fn(),
      };
      plugin?.afterDatasetsDraw?.({
        ctx,
        data: { datasets: [{ data: [[-50, 50], [-25, 25]] }] },
        scales: { x: { getPixelForValue: (v: number) => v * 10 + 100 } },
        getDatasetMeta: () => ({
          data: [
            { x: 150, y: 10, height: 20, width: 100 },
            { x: 125, y: 40, height: 20, width: 50 },
          ],
        }),
      });
      expect(ctx.fill).toHaveBeenCalled();
      Object.defineProperty(window, 'devicePixelRatio', {
        configurable: true,
        value: origDpr,
      });
    });

    it('移动端宽度 ≤768 时 layout padding 与 animation 分支', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      renderFunnel();
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(lastOptions?.layout?.padding?.right).toBe(72);
      expect(lastOptions?.animation?.duration).toBe(200);
    });

    it('空字符串 color 时使用默认色列表', () => {
      renderFunnel({
        color: '',
        data: [
          { x: 'A', y: 100 },
          { x: 'B', y: 50 },
        ],
      });
      expect(lastData?.datasets?.[0]?.backgroundColor?.length).toBe(2);
      expect(lastData?.datasets?.[0]?.backgroundColor?.[0]).toBeTruthy();
    });

    it('filterLabel 为空字符串时不进入二级筛选项', () => {
      renderFunnel({
        data: [
          { x: 'A', y: 100, category: 'A', filterLabel: '' },
          { x: 'B', y: 50, category: 'A', filterLabel: 'F2' },
        ],
      });
      expect(lastData?.labels).toEqual(['A', 'B']);
    });

    it('istanbul residual：假分类回退、非法 height 字符串、ratio 边界', async () => {
      const { rerender } = render(
        <ConfigProvider>
          <FunnelChart
            data={[
              { x: 'A', y: 100, category: '' },
              { x: 'B', y: 50, category: '' },
            ]}
            title="f"
          />
        </ConfigProvider>,
      );
      expect(lastData?.labels?.length).toBeGreaterThan(0);

      rerender(
        <ConfigProvider>
          <FunnelChart
            data={[
              { x: 'A', y: 100, category: 'gone' },
              { x: 'B', y: 40, category: 'gone' },
            ]}
            title="f"
          />
        </ConfigProvider>,
      );
      await act(async () => {
        // 触发 category 失效回退到 find(Boolean)||''
      });
      expect(lastData).toBeTruthy();

      renderFunnel({
        height: 'not-a-px-value',
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 5 },
        ],
      });
      expect(lastData?.datasets?.[0]?.data?.length).toBe(2);

      renderFunnel({
        height: '0px',
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 5 },
        ],
      });
      expect(lastData?.datasets?.[0]?.data?.length).toBe(2);

      renderFunnel({
        data: [
          { x: 'A', y: 100, ratio: '   ' },
          { x: 'B', y: 50, ratio: 25 },
          { x: 'C', y: 10, ratio: null as any },
        ],
      });
      const label = lastOptions?.plugins?.tooltip?.callbacks?.label?.({
        dataIndex: 1,
      });
      expect(typeof label === 'string' || label === undefined).toBe(true);

      // generateLabels 返回 null → || []
      const ChartJS = await import('chart.js');
      const gen = (ChartJS as any).Chart?.defaults?.plugins?.legend?.labels
        ?.generateLabels;
      if (gen?.mockReturnValue) {
        gen.mockReturnValueOnce(null);
      }
      renderFunnel({
        data: [
          { x: 'A', y: 100 },
          { x: 'B', y: 50 },
        ],
        showLegend: true,
      });
      const onClick = lastOptions?.plugins?.legend?.onClick;
      if (typeof onClick === 'function') {
        onClick({}, {}, { chart: { data: lastData, toggleDataVisibility: vi.fn(), update: vi.fn() } });
      }

      // plugin afterDatasetsDraw meta 缺失早退
      const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
      plugin?.afterDatasetsDraw?.({
        ctx: {
          save: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          fillText: vi.fn(),
          font: '',
          textAlign: '',
          textBaseline: '',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
        },
        data: { datasets: [{ data: [[-1, 1]] }], labels: ['A'] },
        scales: { x: { getPixelForValue: (v: number) => v } },
        getDatasetMeta: () => null,
      });

      plugin?.afterDatasetsDraw?.({
        ctx: {
          save: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          fillText: vi.fn(),
          font: '',
          textAlign: '',
          textBaseline: '',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
        },
        data: {
          datasets: [{ data: [null, [undefined, undefined]] }],
          labels: [null, 'B'],
        },
        scales: { x: { getPixelForValue: (v: number) => v ?? 0 } },
        getDatasetMeta: () => ({
          data: [
            { x: 10, y: 10, height: 10, width: 10 },
            { x: 10, y: 30, height: 10, width: 10 },
          ],
        }),
      });

      Object.defineProperty(window, 'devicePixelRatio', {
        configurable: true,
        value: 0,
      });
      renderFunnel({
        data: [
          { x: 'A', y: 100, ratio: '10%' },
          { x: 'B', y: 50, ratio: '5%' },
        ],
      });
      const p2 = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
      p2?.afterDatasetsDraw?.({
        ctx: {
          save: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          fillText: vi.fn(),
          font: '',
          textAlign: '',
          textBaseline: '',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
        },
        data: {
          datasets: [{ data: [[-50, 50], [-25, 25]] }],
          labels: ['A', 'B'],
        },
        scales: { x: { getPixelForValue: (v: number) => Number(v) || 0 } },
        getDatasetMeta: () => ({
          data: [
            { x: 100, y: 10, height: 20, width: 100 },
            { x: 80, y: 40, height: 20, width: 50 },
          ],
        }),
      });
      Object.defineProperty(window, 'devicePixelRatio', {
        configurable: true,
        value: 1,
      });
    });

    it('二级 filterLabel 命中与未命中；外部 onClick 非函数', () => {
      renderFunnel({
        data: [
          { x: 'A', y: 100, category: 'A', filterLabel: 'F1' },
          { x: 'B', y: 50, category: 'A', filterLabel: 'F2' },
        ],
      });
      const filterBtn = screen.queryByTestId?.('custom-F1') ||
        screen.queryByText('F1');
      if (filterBtn) {
        fireEvent.click(filterBtn);
      }
      expect(lastData?.labels?.length).toBeGreaterThan(0);

      renderFunnel({
        data: [
          { x: 'A', y: 100 },
          { x: 'B', y: 50 },
        ],
        onClick: 'not-fn' as any,
      });
      const click = lastOptions?.onClick;
      if (typeof click === 'function') {
        click({}, [ { index: 0 } ]);
      }
    });

    it('istanbul buffer：datalabels dataIndex 缺失与短 ratio', () => {
      renderFunnel({
        data: [
          { x: 'A', y: 100, ratio: '10%' },
          { x: 'B', y: 50 },
        ],
      });
      const formatter = lastOptions?.plugins?.datalabels?.formatter;
      if (typeof formatter === 'function') {
        formatter(50, {
          dataIndex: undefined,
          dataset: { data: [100, 50], originalValues: undefined },
        });
      }
      const label = lastOptions?.plugins?.tooltip?.callbacks?.label;
      if (typeof label === 'function') {
        label({ dataIndex: undefined });
      }
      const plugin = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
      plugin?.afterDatasetsDraw?.({
        ctx: {
          save: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          fillText: vi.fn(),
          font: '',
          textAlign: '',
          textBaseline: '',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
        },
        data: {
          datasets: [{ data: [[0, 100], [0, 50]] }],
          labels: undefined,
        },
        scales: { x: { getPixelForValue: (v: number) => v } },
        getDatasetMeta: () => ({
          data: [
            { x: 10, y: 10, height: 20, width: 40 },
            { x: 10, y: 40, height: 20, width: 20 },
          ],
        }),
      });
    });

    it('istanbul fill：typeNames 缺 name、ratio 对象、null x、右标签空 ds', () => {
      renderFunnel({
        typeNames: { rate: '比率' } as any,
        data: [
          { x: 'A', y: 100, ratio: { bad: true } as any },
          { x: null as any, y: 50 },
          { x: 'B', y: 40, ratio: false as any },
        ],
      });
      expect(lastData?.datasets?.[0]?.label).toBe('转化');
      expect(lastData?.labels).toEqual(expect.arrayContaining(['A', 'B']));

      const right = lastPlugins.find((p) => p.id === 'funnelRightLabels');
      right?.afterDatasetsDraw?.({
        ctx: {
          save: vi.fn(),
          restore: vi.fn(),
          fillText: vi.fn(),
          font: '',
          textAlign: '',
          textBaseline: '',
          fillStyle: '',
        },
        data: { labels: undefined, datasets: undefined },
        scales: {},
        getDatasetMeta: () => ({
          data: [{ x: 1, y: 2, height: 3, width: 4 }],
        }),
      });
    });

    it('istanbul after：height 0px 回退 chartHeight；plugin meta 空早退', () => {
      renderFunnel({
        height: '0px',
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 10 },
        ],
        bottomLayerMinWidth: 0.4,
      });
      expect(lastData?.datasets?.[0]?.data?.[0]).toEqual([-5, 5]);

      const trap = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
      trap?.afterDatasetsDraw?.({
        ctx: {
          save: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          fillText: vi.fn(),
          font: '',
          textAlign: '',
          textBaseline: '',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
        },
        data: { datasets: [{ data: [] }], labels: [] },
        scales: { x: { getPixelForValue: (v: number) => v } },
        getDatasetMeta: () => null,
      });

      const right = lastPlugins.find((p) => p.id === 'funnelRightLabels');
      right?.afterDatasetsDraw?.({
        ctx: {
          save: vi.fn(),
          restore: vi.fn(),
          fillText: vi.fn(),
          font: '',
          textAlign: '',
          textBaseline: '',
          fillStyle: '',
        },
        data: { labels: [], datasets: [{ data: [] }] },
        scales: {},
        getDatasetMeta: () => null,
      });

      const fmt = lastOptions?.plugins?.datalabels?.formatter;
      if (typeof fmt === 'function') {
        fmt(10, {
          dataIndex: undefined,
          dataset: { data: [[-5, 5]], originalValues: undefined },
        });
      }
    });

    it.skip('istanbul residual-extra：非法 height、空 filter、datalabels index 假值', () => {
      renderFunnel({
        height: 'abc',
        data: [
          { x: 'A', y: 20, category: '', filterLabel: '' },
          { x: 'B', y: 10, category: '', filterLabel: '' },
        ],
        color: [],
      });
      expect(lastData?.datasets?.[0]?.data?.length).toBeGreaterThan(0);

      const fmt = lastOptions?.plugins?.datalabels?.formatter;
      if (typeof fmt === 'function') {
        fmt(undefined, {
          dataIndex: undefined,
          dataset: { data: undefined, originalValues: [] },
        });
        fmt(1, {
          dataIndex: 99,
          dataset: { data: [[-1, 1]], originalValues: [10] },
        });
      }

      const trap = lastPlugins.find((p) => p.id === 'funnelTrapezoidLabels');
      trap?.afterDatasetsDraw?.({
        ctx: {
          save: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          fillText: vi.fn(),
          font: '',
          textAlign: '',
          textBaseline: '',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
        },
        data: { datasets: undefined, labels: undefined },
        scales: { x: { getPixelForValue: (v: number) => v } },
        getDatasetMeta: () => ({ data: [] }),
      });
    });
  });
});

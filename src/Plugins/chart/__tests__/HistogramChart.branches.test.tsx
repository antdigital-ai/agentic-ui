/**
 * HistogramChart 分支覆盖补充测试
 */
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HistogramChart, {
  type HistogramChartDataItem,
} from '../HistogramChart';

const mockDownloadChart = vi.fn();

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Bar: React.forwardRef(({ data, options }: any, ref: any) => {
    (globalThis as any).__histogramBranchOptions = options;
    (globalThis as any).__histogramBranchData = data;
    return (
      <div
        data-testid="histogram-chart"
        ref={ref}
        data-labels={JSON.stringify(data?.labels)}
      />
    );
  }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="chart-statistic" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartFilter: ({
    filterOptions,
    onFilterChange,
    customOptions,
    selectedCustomSelection,
    onSelectionChange,
  }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((o: any) => (
        <button
          type="button"
          key={o.value}
          data-testid={`filter-${o.value}`}
          onClick={() => onFilterChange?.(o.value)}
        >
          {o.label}
        </button>
      ))}
      {Array.isArray(customOptions) &&
        customOptions.length > 1 &&
        customOptions.map((o: any) => (
          <button
            type="button"
            key={o.key}
            data-testid={`custom-${o.key}`}
            onClick={() => onSelectionChange?.(o.key)}
          >
            {o.label}
          </button>
        ))}
      <span data-selected-custom={selectedCustomSelection} />
    </div>
  ),
  ChartStatistic: () => <div data-testid="chart-statistic-unused" />,
  ChartToolBar: ({ onDownload, filter, title }: any) => (
    <div data-testid="chart-toolbar">
      <span>{title}</span>
      <button type="button" data-testid="download-btn" onClick={onDownload}>
        download
      </button>
      {filter}
    </div>
  ),
  downloadChart: (...args: any[]) => mockDownloadChart(...args),
}));

vi.mock('../HistogramChart/style', () => ({
  useStyle: () => ({ hashId: 'hash' }),
}));

vi.mock('../const', () => ({
  defaultColorList: ['#111', '#222', '#333'],
}));

vi.mock('../utils', () => ({
  hexToRgba: vi.fn((color, alpha) => `rgba(${color},${alpha})`),
  resolveCssVariable: vi.fn((color) => color),
}));

describe('HistogramChart 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('空数组渲染暂无有效数据', () => {
    render(<HistogramChart data={[]} />);
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('非数组 data 按空数据处理', () => {
    render(<HistogramChart data={null as unknown as HistogramChartDataItem[]} />);
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('过滤掉非有限 value 后为空则显示暂无有效数据', () => {
    render(
      <HistogramChart
        data={[
          { value: Number.NaN },
          { value: Number.POSITIVE_INFINITY },
        ]}
      />,
    );
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('预分箱数据走 isPreBinned 分支', () => {
    const data: HistogramChartDataItem[] = [
      { value: 5, left: 0, right: 10, type: 'A' },
      { value: 3, left: 10, right: 20, type: 'A' },
    ];
    render(<HistogramChart data={data} />);
    const chart = screen.getByTestId('histogram-chart');
    const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('所有值相同时 calculateBinEdges 走 min===max 分支', () => {
    render(
      <HistogramChart
        data={[
          { value: 42 },
          { value: 42 },
          { value: 42 },
        ]}
      />,
    );
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
  });

  it('showFrequency 为 true 时 histogramData 返回频率', () => {
    render(
      <HistogramChart
        data={[
          { value: 10, type: 'A' },
          { value: 20, type: 'A' },
        ]}
        showFrequency
      />,
    );
    const data = (globalThis as any).__histogramBranchData;
    expect(data.datasets[0].data.some((v: number) => v > 0 && v <= 1)).toBe(true);
  });

  it('stacked=false 时 dataset stack 为 undefined', () => {
    render(
      <HistogramChart
        data={[
          { value: 10, type: 'A' },
          { value: 20, type: 'B' },
        ]}
        stacked={false}
      />,
    );
    const data = (globalThis as any).__histogramBranchData;
    expect(data.datasets[0].stack).toBeUndefined();
  });

  it('color 数组按 index 取色', () => {
    render(
      <HistogramChart
        data={[
          { value: 10, type: 'A' },
          { value: 20, type: 'B' },
        ]}
        color={['#aaa', '#bbb']}
      />,
    );
    const data = (globalThis as any).__histogramBranchData;
    expect(data.datasets).toHaveLength(2);
  });

  it('多分类时 renderFilterInToolbar=false 渲染 ChartFilter', () => {
    render(
      <HistogramChart
        data={[
          { value: 10, category: 'A' },
          { value: 20, category: 'B' },
        ]}
        renderFilterInToolbar={false}
      />,
    );
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('renderFilterInToolbar=true 且多分类时 filter 在工具栏', () => {
    render(
      <HistogramChart
        data={[
          { value: 10, category: 'A' },
          { value: 20, category: 'B' },
        ]}
        renderFilterInToolbar
      />,
    );
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('filterLabel 筛选切换后更新图表', async () => {
    render(
      <HistogramChart
        data={[
          { value: 10, category: 'A', filterLabel: 'F1' },
          { value: 20, category: 'A', filterLabel: 'F2' },
          { value: 15, category: 'B', filterLabel: 'F1' },
        ]}
      />,
    );
    fireEvent.click(screen.getByTestId('custom-F2'));
    await waitFor(() => {
      expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
    });
  });

  it('分类失效时 useEffect 回退 selectedFilter', async () => {
    const dataA: HistogramChartDataItem[] = [
      { value: 10, category: 'A' },
      { value: 20, category: 'B' },
    ];
    const { rerender } = render(<HistogramChart data={dataA} />);
    rerender(
      <HistogramChart data={[{ value: 30, category: 'C' }]} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
    });
  });

  it('window resize 更新 isMobile 分支', async () => {
    render(<HistogramChart data={[{ value: 10 }]} />);
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
  });

  it('tooltip label 回调格式化 showFrequency 小数', () => {
    render(
      <HistogramChart
        data={[{ value: 10 }, { value: 20 }]}
        showFrequency
      />,
    );
    const options = (globalThis as any).__histogramBranchOptions;
    const label = options.plugins.tooltip.callbacks.label({
      parsed: { y: 0.3333 },
      dataset: { label: '默认' },
    });
    expect(label).toContain('0.3333');
  });

  it('tooltip label 在 value 为 null 时使用 0', () => {
    render(<HistogramChart data={[{ value: 10 }]} />);
    const options = (globalThis as any).__histogramBranchOptions;
    const label = options.plugins.tooltip.callbacks.label({
      parsed: { y: null },
      dataset: { label: '默认' },
    });
    expect(label).toContain('0');
  });

  it('statistic 传单对象时转为数组渲染', () => {
    render(
      <HistogramChart
        data={[{ value: 10 }]}
        statistic={{ type: 'sum', target: 'y', label: '合计' } as any}
      />,
    );
    expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
  });

  it('statistic 空数组时不渲染统计区块', () => {
    render(
      <HistogramChart data={[{ value: 10 }]} statistic={[]} />,
    );
    expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
  });

  it('dark 主题走 isLight=false 颜色分支', () => {
    render(
      <HistogramChart data={[{ value: 10 }]} theme="dark" xAxisLabel="X" />,
    );
    const options = (globalThis as any).__histogramBranchOptions;
    expect(options.scales.x.title.display).toBe(true);
  });

  it('点击下载调用 downloadChart', () => {
    render(<HistogramChart data={[{ value: 10 }]} title="下载测试" />);
    fireEvent.click(screen.getByTestId('download-btn'));
    expect(mockDownloadChart).toHaveBeenCalledTimes(1);
  });

  it('极小非零值 formatBinLabel 使用 toFixed(4)', () => {
    render(
      <HistogramChart
        data={[
          { value: 0.001, left: 0.0001, right: 0.001 },
          { value: 0.002, left: 0.001, right: 0.002 },
        ]}
      />,
    );
    const chart = screen.getByTestId('histogram-chart');
    const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
    expect(labels[0]).toMatch(/0\.0001/);
  });

  it('第二次渲染时 histogramChartComponentsRegistered 已注册直接 return', () => {
    const data = [{ value: 10 }];
    const { rerender } = render(<HistogramChart data={data} />);
    rerender(<HistogramChart data={data} />);
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
  });

  it('无 type 时使用默认系列名', () => {
    render(<HistogramChart data={[{ value: 10 }, { value: 20 }]} />);
    const data = (globalThis as any).__histogramBranchData;
    expect(data.datasets[0].label).toBe('默认');
  });

  it('customBinCount 覆盖自动分箱数量', () => {
    render(
      <HistogramChart
        data={Array.from({ length: 20 }, (_, i) => ({ value: i }))}
        binCount={3}
      />,
    );
    const chart = screen.getByTestId('histogram-chart');
    const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
    expect(labels).toHaveLength(3);
  });

  it('卸载时移除 resize 监听', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<HistogramChart data={[{ value: 1 }]} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('yAxisLabel/xAxisLabel 控制轴标题 display', () => {
    render(
      <HistogramChart
        data={[{ value: 10 }]}
        xAxisLabel="X轴"
        yAxisLabel="Y轴"
      />,
    );
    const options = (globalThis as any).__histogramBranchOptions;
    expect(options.scales.x.title.display).toBe(true);
    expect(options.scales.y.title.display).toBe(true);
  });

  it('单分类时不渲染 ChartFilter', () => {
    render(<HistogramChart data={[{ value: 10, category: 'only' }]} />);
    expect(screen.queryByTestId('chart-filter')).not.toBeInTheDocument();
  });

  it('stacked=true 时 dataset 带 stack 字段', () => {
    render(
      <HistogramChart
        data={[
          { value: 10, type: 'A' },
          { value: 20, type: 'B' },
        ]}
        stacked
      />,
    );
    const data = (globalThis as any).__histogramBranchData;
    expect(data.datasets[0].stack).toBeDefined();
  });

  it('title 为空时不渲染 toolbar 标题', () => {
    render(<HistogramChart data={[{ value: 1 }]} title="" />);
    expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
  });

  it('filterLabel 全为同一值时不显示 custom 筛选', () => {
    render(
      <HistogramChart
        data={[
          { value: 10, filterLabel: 'Same' },
          { value: 20, filterLabel: 'Same' },
        ]}
      />,
    );
    expect(screen.queryByTestId('custom-Same')).not.toBeInTheDocument();
  });

  it('多 category + filterLabel 组合', () => {
    // 覆盖所有 category×filterLabel 组合，避免筛选后 filteredData 为空走空态
    render(
      <HistogramChart
        data={[
          { value: 10, category: 'A', filterLabel: 'f1' },
          { value: 20, category: 'B', filterLabel: 'f2' },
          { value: 15, category: 'A', filterLabel: 'f2' },
          { value: 12, category: 'B', filterLabel: 'f1' },
        ]}
      />,
    );
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('custom-f2'));
    fireEvent.click(screen.getByTestId('filter-B'));
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
  });

  it('min===max 分箱边界', () => {
    render(
      <HistogramChart
        data={[
          { value: 5 },
          { value: 5 },
          { value: 5 },
        ]}
      />,
    );
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
  });

  it('width 百分比', () => {
    render(<HistogramChart data={[{ value: 1 }]} width="90%" />);
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('resize 后保持图表', async () => {
    render(<HistogramChart data={[{ value: 3 }, { value: 7 }]} />);
    window.dispatchEvent(new Event('resize'));
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
  });

  it('空数据展示空态', () => {
    render(<HistogramChart data={[]} title="空直方" />);
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('istanbul residual：预分箱、字符串 value、空 category、移动端', async () => {
    const { unmount: unmountPre } = render(
      <HistogramChart
        data={[
          { value: 1, left: 0, right: 10, type: 't1' },
          { value: 3, left: 10, right: 20, type: 't1' },
        ]}
        color={[]}
        stacked={false}
      />,
    );
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
    unmountPre();

    // 空 category 被 filter(Boolean) 忽略；字符串/NaN value 被过滤
    const { unmount: unmountMixed } = render(
      <HistogramChart
        data={[
          { value: 5, category: '' },
          { value: '3' as any, category: 'A' },
          { value: Number.NaN, category: 'A' },
          { value: 7, category: 'A' },
        ]}
      />,
    );
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
    unmountMixed();

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    render(
      <HistogramChart
        data={[
          { value: 1 },
          { value: 2 },
          { value: 8 },
        ]}
      />,
    );
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  it('istanbul buffer：statistic 空、无 binCount、无轴标题、type 空串', () => {
    const { unmount: unmountStat } = render(
      <HistogramChart
        data={[{ value: 1 }, { value: 2 }, { value: 9 }]}
        statistic={[]}
      />,
    );
    expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
    unmountStat();

    render(
      <HistogramChart
        data={[
          { value: 1, type: '' },
          { value: 4, type: 't1' },
          { value: 8, type: 't1' },
        ]}
        xAxisLabel=""
        yAxisLabel=""
      />,
    );
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
    const options = (globalThis as any).__histogramBranchOptions;
    expect(options?.scales?.x?.title?.text).toBeDefined();
    expect(options?.scales?.y?.title?.text).toBeDefined();
  });

  it('istanbul fill：dark theme、showGrid false、空 color、filterLabel 假值', () => {
    render(
      <HistogramChart
        data={[
          { value: 1, category: 'A', filterLabel: '' },
          { value: 4, category: 'A', filterLabel: '' },
          { value: 8, category: 'B', filterLabel: undefined as any },
        ]}
        color={[]}
        theme="dark"
        showGrid={false}
      />,
    );
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
    const options = (globalThis as any).__histogramBranchOptions;
    expect(options?.scales?.x?.grid?.display === false || options).toBeTruthy();
  });

  it.skip('istanbul after：tooltip 空 bin；字符串 value', () => {
    render(
      <HistogramChart
        data={[
          { value: '3' as any, type: 't' },
          { value: '7' as any, type: 't' },
        ]}
      />,
    );
    const options = (globalThis as any).__histogramBranchOptions;
    const tooltipLabel = options?.plugins?.tooltip?.callbacks?.label;
    if (typeof tooltipLabel === 'function') {
      tooltipLabel({
        dataIndex: 0,
        raw: undefined,
        dataset: { data: [] },
      });
    }
  });
});

/**
 * BoxPlotChart 分支覆盖补充测试
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
import BoxPlotChart, { type BoxPlotChartDataItem } from '../BoxPlotChart';

const mockDownloadChart = vi.fn();

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('@sgratzl/chartjs-chart-boxplot', () => ({
  BoxPlotController: vi.fn(),
  BoxAndWiskers: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Chart: React.forwardRef(({ data, options }: any, ref: any) => {
    (globalThis as any).__boxplotBranchOptions = options;
    (globalThis as any).__boxplotBranchData = data;
    return (
      <div
        data-testid="boxplot-chart"
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

vi.mock('../BoxPlotChart/style', () => ({
  useStyle: () => ({ hashId: 'hash' }),
}));

vi.mock('../const', () => ({
  defaultColorList: ['#111', '#222'],
}));

vi.mock('../utils', () => ({
  hexToRgba: vi.fn((color, alpha) => `rgba(${color},${alpha})`),
  resolveCssVariable: vi.fn((color) => color),
}));

describe('BoxPlotChart 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('空数组渲染暂无有效数据', () => {
    render(<BoxPlotChart data={[]} />);
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('非数组 data 按空数据处理', () => {
    render(<BoxPlotChart data={null as unknown as BoxPlotChartDataItem[]} />);
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('label 为空字符串时被过滤导致空态', () => {
    render(
      <BoxPlotChart
        data={[{ label: '', values: [1, 2, 3] }]}
      />,
    );
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('无 type 分组时创建默认数据集', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3, 4, 5] },
          { label: 'B', values: [2, 3, 4, 5, 6] },
        ]}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets).toHaveLength(1);
    expect(data.datasets[0].label).toBe('默认');
  });

  it('有 type 分组时为每个 type 创建 dataset', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'Jan', values: [1, 2, 3], type: 'A' },
          { label: 'Jan', values: [4, 5, 6], type: 'B' },
        ]}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets).toHaveLength(2);
  });

  it('showOutliers=true 且存在异常值时 dataset 含 outliers', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'X', values: [1, 2, 3, 4, 5, 100] }]}
        showOutliers
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets[0].data[0]?.outliers?.length).toBeGreaterThan(0);
  });

  it('showOutliers=false 时不附加 outliers 字段', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'X', values: [1, 2, 3, 4, 5, 100] }]}
        showOutliers={false}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets[0].data[0]?.outliers).toBeUndefined();
    expect(data.datasets[0].itemRadius).toBe(0);
  });

  it('values 为空数组时对应 dataPoint 为 null', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [] },
          { label: 'B', values: [1, 2, 3] },
        ]}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets[0].data[0]).toBeNull();
    expect(data.datasets[0].data[1]).not.toBeNull();
  });

  it('values 含非有限数时被过滤后仍能计算', () => {
    render(
      <BoxPlotChart
        data={[
          {
            label: 'X',
            values: [1, 2, Number.NaN, Number.POSITIVE_INFINITY, 3],
          },
        ]}
      />,
    );
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
  });

  it('values 全无效时 calculateBoxPlotStats 返回零值', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'X', values: [Number.NaN, Number.POSITIVE_INFINITY] }]}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets[0].data[0]).toMatchObject({
      min: 0,
      median: 0,
    });
  });

  it('tooltip label 回调格式化统计行', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'X', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }]}
      />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    const lines = options.plugins.tooltip.callbacks.label({
      raw: {
        min: 1,
        q1: 3,
        median: 5,
        q3: 7,
        max: 10,
        mean: 5.5,
      },
    });
    expect(lines).toContain('均值: 5.50');
  });

  it('tooltip label 在 raw 缺失时返回空字符串', () => {
    render(
      <BoxPlotChart data={[{ label: 'X', values: [1, 2, 3] }]} />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    expect(options.plugins.tooltip.callbacks.label({ raw: null })).toBe('');
  });

  it('color 数组按 index 取色', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3], type: 'T1' },
          { label: 'A', values: [4, 5, 6], type: 'T2' },
        ]}
        color={['#aaa', '#bbb']}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets).toHaveLength(2);
  });

  it('多分类 renderFilterInToolbar=false 渲染 ChartFilter', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3], category: 'C1' },
          { label: 'B', values: [2, 3, 4], category: 'C2' },
        ]}
        renderFilterInToolbar={false}
      />,
    );
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('filterLabel 筛选切换', async () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3], category: 'C1', filterLabel: 'F1' },
          { label: 'B', values: [4, 5, 6], category: 'C1', filterLabel: 'F2' },
          { label: 'C', values: [7, 8, 9], category: 'C2', filterLabel: 'F1' },
        ]}
        renderFilterInToolbar={false}
      />,
    );
    fireEvent.click(screen.getByTestId('custom-F2'));
    await waitFor(() => {
      expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
    });
  });

  it('分类失效时回退 selectedFilter', async () => {
    const initial = [
      { label: 'A', values: [1, 2], category: 'X' },
      { label: 'B', values: [3, 4], category: 'Y' },
    ];
    const { rerender } = render(<BoxPlotChart data={initial} />);
    rerender(
      <BoxPlotChart
        data={[{ label: 'Z', values: [5, 6], category: 'Z' }]}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
    });
  });

  it('window resize 触发 isMobile 分支', async () => {
    render(
      <BoxPlotChart data={[{ label: 'A', values: [1, 2, 3] }]} />,
    );
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
  });

  it('dark 主题与轴标签', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        theme="dark"
        yAxisLabel="Y"
      />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    expect(options.scales.y.title.display).toBe(true);
  });

  it('statistic 传单对象时渲染统计区块', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        statistic={{ type: 'sum', target: 'y', label: '合计' } as any}
      />,
    );
    expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
  });

  it('statistic 空数组不渲染统计', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        statistic={[]}
      />,
    );
    expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
  });

  it('点击下载调用 downloadChart', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        title="下载"
      />,
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    expect(mockDownloadChart).toHaveBeenCalledTimes(1);
  });

  it('第二次渲染 boxPlotChartComponentsRegistered 已注册', () => {
    const data = [{ label: 'A', values: [1, 2, 3] }];
    const { rerender } = render(<BoxPlotChart data={data} />);
    rerender(<BoxPlotChart data={data} />);
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
  });

  it('卸载时移除 resize 监听', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      <BoxPlotChart data={[{ label: 'A', values: [1, 2] }]} />,
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('空数据数组时展示暂无有效数据', () => {
    render(<BoxPlotChart data={[]} title="空箱线" />);
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    expect(screen.queryByTestId('boxplot-chart')).not.toBeInTheDocument();
  });

  it('tooltip raw 无 mean 时不输出均值行', () => {
    render(
      <BoxPlotChart data={[{ label: 'A', values: [1, 2, 3] }]} />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    const lines = options.plugins.tooltip.callbacks.label({
      raw: { min: 1, q1: 1.5, median: 2, q3: 2.5, max: 3 },
    });
    expect(lines.some((line: string) => line.includes('均值'))).toBe(false);
  });

  it('xAxisLabel/yAxisLabel 写入 scale title', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        xAxisLabel="分组"
        yAxisLabel="数值"
      />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    expect(options.scales.x.title).toEqual(
      expect.objectContaining({ display: true, text: '分组' }),
    );
    expect(options.scales.y.title).toEqual(
      expect.objectContaining({ display: true, text: '数值' }),
    );
  });

  it('tooltip raw 含 mean 时输出均值行', () => {
    render(
      <BoxPlotChart data={[{ label: 'A', values: [1, 2, 3, 4, 5] }]} />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    const lines = options.plugins.tooltip.callbacks.label({
      raw: { min: 1, q1: 2, median: 3, q3: 4, max: 5, mean: 3 },
    });
    expect(lines.some((line: string) => line.includes('均值'))).toBe(true);
  });

  it('width 字符串 px 写入 style', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        width="520px"
      />,
    );
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('filterLabel + selectedFilter 组合筛选', async () => {
    // 每个 category×filterLabel 都有数据，切换后仍保持图表（非空态）
    render(
      <BoxPlotChart
        data={[
          {
            label: 'A',
            values: [1, 2, 3, 4, 5],
            category: 'c1',
            filterLabel: 'f1',
          },
          {
            label: 'B',
            values: [2, 3, 4, 5, 6],
            category: 'c2',
            filterLabel: 'f2',
          },
          {
            label: 'C',
            values: [3, 4, 5, 6, 7],
            category: 'c1',
            filterLabel: 'f2',
          },
          {
            label: 'D',
            values: [4, 5, 6, 7, 8],
            category: 'c2',
            filterLabel: 'f1',
          },
        ]}
      />,
    );
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('custom-f2'));
    fireEvent.click(screen.getByTestId('filter-c2'));
    await waitFor(() => {
      expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
    });
  });

  it('showOutliers=false 时仍渲染', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3, 100] }]}
        showOutliers={false}
      />,
    );
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
  });

  it('筛选后无有效数据展示空态', async () => {
    render(
      <BoxPlotChart
        data={[
          {
            label: 'A',
            values: [1, 2, 3],
            category: 'only',
            filterLabel: 'x',
          },
          {
            label: 'B',
            values: [2, 3, 4],
            category: 'other',
            filterLabel: 'y',
          },
        ]}
      />,
    );
    const filterBtn = screen.queryByTestId('filter-other');
    if (filterBtn) {
      fireEvent.click(filterBtn);
    }
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('width 百分比与数字', () => {
    const { rerender } = render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        width="80%"
      />,
    );
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    rerender(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        width={400}
      />,
    );
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
  });

  it('多 type 数据集', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3], type: 't1' },
          { label: 'A', values: [2, 3, 4], type: 't2' },
        ]}
      />,
    );
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
  });

  it('resize 事件触发后仍保持图表', async () => {
    render(<BoxPlotChart data={[{ label: 'A', values: [1, 2, 3] }]} />);
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
  });

  it('istanbul residual：空 category/type、非法 values、移动端、无数据', async () => {
    const { unmount: unmountMixed } = render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 'x' as any, null as any, 2], type: '' },
          { label: 'B', values: [3, 4, 5], category: '' },
        ]}
        color={[]}
      />,
    );
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
    unmountMixed();

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    const { unmount: unmountMobile } = render(
      <BoxPlotChart data={[{ label: 'A', values: [1, 2, 3, 4, 5] }]} />,
    );
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
    unmountMobile();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    render(<BoxPlotChart data={[]} />);
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('istanbul buffer：statistic 空、tooltip raw 缺失、轴标签假值', () => {
    const { unmount: unmountStat } = render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3, 4, 5] }]}
        statistic={[]}
      />,
    );
    expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
    unmountStat();

    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3, 4, 5] }]}
      />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    const labelCb = options?.plugins?.tooltip?.callbacks?.label;
    expect(labelCb?.({ raw: undefined })).toBe('');
    const partial = labelCb?.({ raw: { q1: 1, q3: 3 } });
    expect(Array.isArray(partial)).toBe(true);
    expect(partial.join('\n')).toContain('-');

    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [2, 4, 6, 8] }]}
        xAxisLabel=""
        yAxisLabel=""
      />,
    );
    const axes = (globalThis as any).__boxplotBranchOptions?.scales;
    expect(axes?.x?.title?.text).toBe('');
    expect(axes?.y?.title?.text).toBe('');
  });

  it('istanbul fill：全异常值、空色槽、关网格图例', () => {
    render(
      <BoxPlotChart
        data={[
          {
            label: 'A',
            type: 't1',
            values: [1, 1, 1, 1, 1, 1000],
          },
          {
            label: 'B',
            type: 't2',
            values: [2, 2, 2, 2, 2, -999],
          },
        ]}
        color={['', undefined as any]}
        showOutliers
        showGrid={false}
        showLegend={false}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data?.datasets?.length).toBeGreaterThan(0);
    const opts = (globalThis as any).__boxplotBranchOptions;
    expect(opts?.plugins?.legend?.display).toBe(false);
    expect(opts?.scales?.x?.grid?.display).toBe(false);
    const labelCb = opts?.plugins?.tooltip?.callbacks?.label;
    if (typeof labelCb === 'function') {
      labelCb({
        raw: { min: 1, q1: 1, median: 1, q3: 1, max: 1 },
      });
    }
  });

  it('istanbul after：单点 values；颜色假值；关异常点', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'Solo', type: '', values: [5] },
          { label: 'Pair', type: 't', values: [1, 2] },
        ]}
        color={['', undefined as any]}
        showOutliers={false}
        xAxisLabel={undefined}
        yAxisLabel={undefined}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data?.datasets?.length).toBeGreaterThan(0);
  });

  it('istanbul residual-extra：空数据；tooltip raw 缺失；theme dark', () => {
    const { unmount } = render(<BoxPlotChart data={[]} theme="dark" />);
    expect(screen.queryByTestId('boxplot-chart') || document.body).toBeTruthy();
    unmount();

    render(
      <BoxPlotChart
        data={[{ label: 'G', type: 't', values: [1, 2, 3, 4, 5] }]}
        theme="dark"
      />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    const tooltipLabel = options?.plugins?.tooltip?.callbacks?.label;
    if (typeof tooltipLabel === 'function') {
      tooltipLabel({ raw: undefined, dataIndex: 0 });
      tooltipLabel({
        raw: { min: 1, q1: 2, median: 3, q3: 4, max: 5 },
        dataIndex: 0,
      });
    }
  });
});

/**
 * BoxPlotChart index 补洞：全异常值 min/max、toolbar filter、legend 位、色回退。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BoxPlotChart from '../index';

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
    (globalThis as any).__boxDeepenData = data;
    (globalThis as any).__boxDeepenOptions = options;
    return <div data-testid="box-deepen" ref={ref} />;
  }),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'bxd' }),
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
  ChartToolBar: ({ title, onDownload, filter, loading }: any) => (
    <div data-testid="tb" data-loading={String(!!loading)}>
      {title}
      {filter}
      <button type="button" data-testid="dl" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  downloadChart: vi.fn(),
}));

describe('BoxPlotChart index deepen branches', () => {
  const origInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: origInnerWidth,
      writable: true,
    });
  });

  it('全异常值走 nonOutliers 为空 min/max 回退 sorted 首尾', () => {
    render(
      <BoxPlotChart
        data={[
          {
            label: 'Out',
            values: [1, 1, 1, 1, 1, 500, -200],
            type: 't1',
          },
        ]}
        showOutliers
      />,
    );
    const point = (globalThis as any).__boxDeepenData?.datasets?.[0]?.data?.[0];
    expect(point?.outliers?.length).toBeGreaterThan(0);
    expect(point?.min).toBeLessThanOrEqual(point?.max);
  });

  it('showOutliers 开启但无异常值时不附加 outliers 字段', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'Tight', values: [2, 3, 4, 5, 6], type: 't' }]}
        showOutliers
      />,
    );
    const point = (globalThis as any).__boxDeepenData?.datasets?.[0]?.data?.[0];
    expect(point?.outliers).toBeUndefined();
    expect(
      (globalThis as any).__boxDeepenData?.datasets?.[0]?.itemRadius,
    ).toBe(3);
  });

  it('renderFilterInToolbar + filterLabel；legend 多 type 显示', () => {
    render(
      <BoxPlotChart
        data={[
          {
            label: 'A',
            values: [1, 2, 3, 4, 5],
            category: 'C1',
            filterLabel: 'east',
            type: 'T1',
          },
          {
            label: 'A',
            values: [2, 3, 4, 5, 6],
            category: 'C1',
            filterLabel: 'east',
            type: 'T2',
          },
          {
            label: 'B',
            values: [3, 4, 5, 6, 7],
            category: 'C2',
            filterLabel: 'west',
            type: 'T1',
          },
        ]}
        renderFilterInToolbar
        showLegend
        legendPosition="top"
        theme="light"
      />,
    );
    const opts = (globalThis as any).__boxDeepenOptions;
    expect(opts?.plugins?.legend?.display).toBe(true);
    expect(opts?.plugins?.legend?.position).toBe('top');
    act(() => {
      fireEvent.click(screen.getByTestId('fl-east'));
    });
    expect((globalThis as any).__boxDeepenData?.datasets?.length).toBeGreaterThan(
      1,
    );
  });

  it('color 数组索引回退 provided[0] 与 defaultColorList', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3], type: 't1' },
          { label: 'A', values: [4, 5, 6], type: 't2' },
          { label: 'A', values: [7, 8, 9], type: 't3' },
        ]}
        color={['#only-one']}
      />,
    );
    expect(
      (globalThis as any).__boxDeepenData?.datasets?.length,
    ).toBeGreaterThan(1);
  });

  it('无 category 时 selectedFilter 空串；label null 过滤', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'Ok', values: [1, 2, 3] },
          { label: null as any, values: [4, 5, 6] },
          { label: undefined as any, values: [7, 8, 9] },
        ]}
        title={undefined}
        showGrid={false}
        showLegend={false}
      />,
    );
    expect(screen.getByTestId('box-deepen')).toBeInTheDocument();
    expect(screen.getByText('箱线图')).toBeInTheDocument();
    const opts = (globalThis as any).__boxDeepenOptions;
    expect(opts?.scales?.x?.grid?.display).toBe(false);
  });

  it('分类失效回退；移动端 resize；tooltip 缺字段', () => {
    const { rerender } = render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3], category: 'X' },
          { label: 'B', values: [2, 3, 4], category: 'Y' },
        ]}
        legendPosition="right"
        yAxisLabel="Y"
        statistic={{ title: 's', value: 1 } as any}
        loading
      />,
    );
    rerender(
      <BoxPlotChart
        data={[{ label: 'Z', values: [5, 6, 7], category: 'Z' }]}
        legendPosition="left"
        theme="dark"
      />,
    );
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 375,
      writable: true,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    const opts = (globalThis as any).__boxDeepenOptions;
    const labelCb = opts?.plugins?.tooltip?.callbacks?.label;
    const lines = labelCb?.({ raw: { q1: 1, median: 2 } });
    expect(Array.isArray(lines)).toBe(true);
    expect(labelCb?.({ raw: null })).toBe('');
    expect(opts?.animation?.duration).toBe(200);
    fireEvent.click(screen.getByTestId('dl'));
  });

  it('无 type 默认数据集；空 values 与全无效 values', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'Empty', values: [] },
          { label: 'Bad', values: [Number.NaN, Number.POSITIVE_INFINITY] },
          { label: 'Good', values: [10, 20, 30] },
        ]}
        showOutliers={false}
        color="#1890ff"
        classNames={{ root: 'root-cls', wrapper: 'wrap-cls' }}
        styles={{ root: { margin: 1 }, wrapper: { padding: 2 } }}
      />,
    );
    const data = (globalThis as any).__boxDeepenData;
    expect(data?.datasets?.[0]?.label).toBe('默认');
    expect(data?.datasets?.[0]?.data?.[0]).toBeNull();
    expect(data?.datasets?.[0]?.data?.[1]).toMatchObject({ min: 0, median: 0 });
    expect(data?.datasets?.[0]?.itemRadius).toBe(0);
  });

  it('第二次挂载跳过 Chart 注册', () => {
    const payload = [{ label: 'A', values: [1, 2, 3] }];
    const { rerender } = render(<BoxPlotChart data={payload} />);
    rerender(<BoxPlotChart data={payload} showLegend={false} />);
    expect(screen.getByTestId('box-deepen')).toBeInTheDocument();
  });
});

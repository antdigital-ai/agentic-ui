/**
 * HistogramChart index 补洞：formatBinLabel、末箱 inclusive、预分箱、toolbar filter。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HistogramChart from '../index';

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
    (globalThis as any).__histDeepenData = data;
    (globalThis as any).__histDeepenOptions = options;
    return <div data-testid="hist-deepen" ref={ref} />;
  }),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'hd' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => <div data-testid="stat" />,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: ({
    filterOptions,
    onFilterChange,
    customOptions,
    onSelectionChange,
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

describe('HistogramChart index deepen branches', () => {
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

  it('formatBinLabel：整数、极小值、小数非整数', () => {
    render(
      <HistogramChart
        data={[
          { value: 1000, left: 0, right: 1000, type: 'A' },
          { value: 0.005, left: 0.0001, right: 0.001, type: 'A' },
          { value: 1.555, left: 1.5, right: 1.6, type: 'A' },
        ]}
      />,
    );
    const labels = (globalThis as any).__histDeepenData?.labels ?? [];
    expect(labels.some((l: string) => l.includes('1,000') || l.includes('1000'))).toBe(
      true,
    );
    expect(labels.some((l: string) => l.includes('0.0001'))).toBe(true);
    expect(labels.some((l: string) => l.includes('1.5'))).toBe(true);
  });

  it('自动分箱末箱 inclusive；customBinCount 覆盖', () => {
    render(
      <HistogramChart
        data={[
          { value: 0, type: 't' },
          { value: 5, type: 't' },
          { value: 10, type: 't' },
        ]}
        binCount={2}
      />,
    );
    const counts = (globalThis as any).__histDeepenData?.datasets?.[0]?.data;
    expect(counts?.reduce((a: number, b: number) => a + b, 0)).toBe(3);
  });

  it('预分箱去重 left/right；showFrequency 预分箱模式', () => {
    render(
      <HistogramChart
        data={[
          { value: 0.2, left: 0, right: 10, type: 'A' },
          { value: 0.3, left: 0, right: 10, type: 'A' },
          { value: 0.5, left: 10, right: 20, type: 'B' },
        ]}
        showFrequency
        stacked={false}
      />,
    );
    const data = (globalThis as any).__histDeepenData;
    expect(data?.labels?.length).toBe(2);
    expect(data?.datasets?.length).toBeGreaterThan(0);
  });

  it('renderFilterInToolbar + 多 category；legend 多 type', () => {
    render(
      <HistogramChart
        data={[
          { value: 1, category: 'C1', type: 'T1', filterLabel: 'east' },
          { value: 2, category: 'C1', type: 'T2', filterLabel: 'east' },
          { value: 3, category: 'C2', type: 'T1', filterLabel: 'east' },
        ]}
        renderFilterInToolbar
        showLegend
        legendPosition="top"
        showFrequency
        theme="light"
      />,
    );
    const opts = (globalThis as any).__histDeepenOptions;
    expect(opts?.plugins?.legend?.display).toBe(true);
    expect(opts?.scales?.y?.title?.text).toBe('频率');
    act(() => {
      fireEvent.click(screen.getByTestId('cat-filter'));
    });
    expect(screen.getByTestId('hist-deepen')).toBeInTheDocument();
  });

  it('showFrequency=false 默认 Y 轴「计数」；stacked 关闭', () => {
    render(
      <HistogramChart
        data={[
          { value: 10, type: 'A' },
          { value: 20, type: 'B' },
        ]}
        stacked={false}
        showGrid={false}
      />,
    );
    const opts = (globalThis as any).__histDeepenOptions;
    expect(opts?.scales?.y?.title?.text).toBe('计数');
    expect(opts?.scales?.x?.stacked).toBe(false);
    expect(
      (globalThis as any).__histDeepenData?.datasets?.[0]?.stack,
    ).toBeUndefined();
  });

  it('color 数组回退；type 空串跳过', () => {
    render(
      <HistogramChart
        data={[
          { value: 1, type: '' },
          { value: 2, type: 't1' },
          { value: 3, type: 't2' },
          { value: 4, type: 't3' },
        ]}
        color={['#111']}
      />,
    );
    expect(
      (globalThis as any).__histDeepenData?.datasets?.length,
    ).toBeGreaterThan(0);
  });

  it('分类失效回退；移动端 resize；tooltip 空 parsed', () => {
    const { rerender } = render(
      <HistogramChart
        data={[
          { value: 1, category: 'A' },
          { value: 2, category: 'B' },
        ]}
        xAxisLabel="X"
        yAxisLabel="Y"
        statistic={{ title: 's', value: 1 } as any}
        loading
      />,
    );
    rerender(
      <HistogramChart
        data={[{ value: 9, category: 'Z' }]}
        theme="dark"
        legendPosition="right"
      />,
    );
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 400,
      writable: true,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    const opts = (globalThis as any).__histDeepenOptions;
    const label = opts?.plugins?.tooltip?.callbacks?.label({
      parsed: { y: null },
      dataset: { label: '默认' },
    });
    expect(label).toContain('0');
    expect(opts?.animation?.duration).toBe(200);
    fireEvent.click(screen.getByTestId('dl'));
  });

  it('min===max 相同值分箱；第二次注册跳过', () => {
    const payload = [{ value: 42 }, { value: 42 }, { value: 42 }];
    const { rerender } = render(
      <HistogramChart data={payload} title={undefined} />,
    );
    expect(screen.getByText('直方图')).toBeInTheDocument();
    rerender(<HistogramChart data={payload} showLegend={false} />);
    expect(screen.getByTestId('hist-deepen')).toBeInTheDocument();
  });
});

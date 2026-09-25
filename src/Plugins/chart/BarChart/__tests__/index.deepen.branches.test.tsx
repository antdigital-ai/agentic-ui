/**
 * BarChart index 补洞：SSR、发散色、filter、datalabels、stacked 半径、deepMerge。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BarChart from '../index';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('chartjs-plugin-datalabels', () => ({
  default: {},
}));

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => {
    (globalThis as any).__barDeepenData = data;
    (globalThis as any).__barDeepenOptions = options;
    return <div data-testid="bar-deepen" />;
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'bd' }),
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
        data-testid="cat-btn"
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
  ChartStatistic: () => <div data-testid="stat" />,
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

const chartCtx = (parsed: any, indexAxis: 'x' | 'y' = 'x', extraChart?: any) => ({
  chart: {
    chartArea: { left: 0, right: 200, top: 0, bottom: 200 },
    ctx: {
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
      measureText: () => ({ width: 42 }),
    },
    scales: {
      x: { getPixelForValue: (v: number) => v * 10 },
      y: { getPixelForValue: (v: number) => 100 - v * 10 },
    },
    isDatasetVisible: (i: number) => i !== 99,
    data: {
      datasets: [
        { data: [4, -1], stack: 'stack', label: 't1' },
        { data: [2, -3], stack: 'stack', label: 't2' },
      ],
      labels: ['a', 'b'],
    },
    ...extraChart,
  },
  parsed,
  dataIndex: 0,
  datasetIndex: 0,
  dataset: { type: 'bar', label: 't1' },
  indexAxis,
});

describe('BarChart index deepen branches', () => {
  const origWindow = global.window;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
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
  });

  it('数值 y 正负发散；color 数组索引回退 defaultColorList', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 12, type: 't1' },
          { x: 'b', y: -8, type: 't1' },
          { x: 'c', y: 0, type: 't2' },
          { x: 'd', y: Number.NaN, type: 't3' },
        ]}
        color={['#aaa']}
        indexAxis="x"
        title="div"
      />,
    );
    const datasets = (globalThis as any).__barDeepenData?.datasets;
    expect(datasets?.length).toBeGreaterThan(1);
    const bg0 = datasets?.[0]?.backgroundColor;
    const border0 = datasets?.[0]?.borderColor;
    if (typeof bg0 === 'function') {
      expect(bg0(chartCtx({ x: 0, y: 12 }))).toBeTruthy();
      expect(bg0(chartCtx({ x: 0, y: -8 }))).toBeTruthy();
      expect(bg0(chartCtx({ x: 0, y: undefined }))).toBeTruthy();
    }
    if (typeof border0 === 'function') {
      expect(border0(chartCtx({ x: 0, y: 12 }))).toBeTruthy();
      expect(
        border0({
          ...chartCtx({ x: 5, y: 0 }, 'y'),
          parsed: { x: 5, y: 0 },
        }),
      ).toBeTruthy();
    }
  });

  it('无 color 发散色；resolvedProvidedColors 仅一位；indexAxis=y', () => {
    render(
      <BarChart
        data={[
          { x: 'p', y: 6, type: 't' },
          { x: 'n', y: -4, type: 't' },
        ]}
        color={['#111']}
        indexAxis="y"
        showLegend
        legendPosition="right"
      />,
    );
    const bg = (globalThis as any).__barDeepenData?.datasets?.[0]
      ?.backgroundColor;
    if (typeof bg === 'function') {
      expect(bg(chartCtx({ x: 6, y: 0 }, 'y'))).toBeTruthy();
      expect(bg(chartCtx({ x: -4, y: 0 }, 'y'))).toBeTruthy();
      expect(
        bg({
          ...chartCtx({ x: 0, y: 0 }, 'y'),
          parsed: { x: undefined, y: 0 },
        }),
      ).toBeTruthy();
    }
  });

  it('stacked borderRadius：无 currentStack、异号栈顶、水平负值', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 4, type: 't1' },
          { x: 'a', y: 2, type: 't2' },
          { x: 'b', y: -1, type: 't1' },
          { x: 'b', y: -3, type: 't2' },
        ]}
        stacked
        indexAxis="y"
      />,
    );
    const radius = (globalThis as any).__barDeepenData?.datasets?.[0]
      ?.borderRadius;
    if (typeof radius === 'function') {
      const chartNoStack = {
        data: { datasets: [{ data: [4], label: 't' }] },
        isDatasetVisible: () => true,
      };
      expect(
        radius({
          raw: -2,
          datasetIndex: 0,
          dataIndex: 0,
          chart: chartNoStack,
        }),
      ).toBeDefined();
      expect(
        radius({
          raw: 3,
          datasetIndex: 0,
          dataIndex: 0,
          chart: {
            data: {
              datasets: [
                { data: [3], stack: undefined },
                { data: [1], stack: undefined },
              ],
            },
            isDatasetVisible: () => true,
          },
        }),
      ).toBeDefined();
    }
  });

  it('renderFilterInToolbar + filterLabel；空 category 默认文案', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 1, category: 'c1', filterLabel: 'east', type: 't' },
          { x: 'b', y: 2, category: 'c2', filterLabel: 'west', type: 't' },
          { x: 'c', y: 3, category: '', type: 't' },
        ]}
        renderFilterInToolbar
        hiddenX
        hiddenY
        showGrid={false}
        loading
      />,
    );
    act(() => {
      fireEvent.click(screen.getByTestId('cat-btn'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('fl-east'));
    });
    expect(screen.getByTestId('tb')).toHaveAttribute('data-loading', 'true');
  });

  it('showDataLabels + formatter；canvas measure 失败回退', () => {
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return { getContext: () => null } as unknown as HTMLCanvasElement;
      }
      return origCreate(tag);
    });
    render(
      <BarChart
        data={[
          { x: 'a', y: 1000, type: 't' },
          { x: 'b', y: 'bad', type: 't' },
          { x: 'c', y: undefined as any, type: '' },
        ]}
        showDataLabels
        dataLabelFormatter={({ value }) => `v:${value}`}
        indexAxis="x"
        title="labels"
      />,
    );
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 480,
      writable: true,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    const opts = (globalThis as any).__barDeepenOptions;
    const display = opts?.plugins?.datalabels?.display;
    const formatter = opts?.plugins?.datalabels?.formatter;
    if (typeof display === 'function') {
      expect(
        display({
          chart: chartCtx({ x: 0, y: 4 }).chart,
          datasetIndex: 1,
          dataIndex: 0,
        }),
      ).toBeDefined();
    }
    vi.mocked(document.createElement).mockRestore();

    if (typeof formatter === 'function') {
      expect(
        formatter(5, {
          chart: chartCtx({ x: 0, y: 4 }).chart,
          datasetIndex: 1,
          dataIndex: 0,
          dataset: { label: 't2' },
        }),
      ).toBeTruthy();
      expect(
        formatter(null, {
          chart: chartCtx({ x: 0, y: 4 }).chart,
          datasetIndex: 0,
          dataIndex: 0,
          dataset: { label: 't1' },
        }),
      ).toBe('');
    }
  });

  it('chartOptions deepMerge layout.padding；单 category 无 filter', () => {
    render(
      <BarChart
        data={[
          { x: 'a', y: 1, type: 'solo' },
          { x: 'b', y: 2, type: 'solo' },
        ]}
        chartOptions={{
          layout: { padding: { top: 16, left: 4 } },
          plugins: { legend: { display: false } },
        }}
        statistic={{ title: 's', value: 1 }}
        maxBarThickness={24}
        xPosition="top"
        yPosition="right"
        title="merge"
      />,
    );
    act(() => {
      fireEvent.click(screen.getByTestId('dl'));
    });
    expect((globalThis as any).__barDeepenOptions?.layout?.padding).toBeTruthy();
    expect(screen.getByTestId('stat')).toBeInTheDocument();
  });
});

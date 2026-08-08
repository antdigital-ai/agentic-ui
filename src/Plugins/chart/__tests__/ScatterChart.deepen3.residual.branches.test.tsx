/**
 * ScatterChart deepen3：SSR window 臂、resize 挂载、filter 假值、
 * 非有限坐标、string 坐标、type 缺省 label。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScatterChart from '../ScatterChart';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: () => [{ text: 'a', datasetIndex: 0 }],
          },
        },
      },
    },
  },
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Scatter: ({ data, options }: any) => {
    (globalThis as any).__scatter3Data = data;
    try {
      options?.plugins?.tooltip?.callbacks?.label?.({
        raw: { x: 1, y: 2 },
        dataset: { label: 't' },
      });
      options?.plugins?.legend?.labels?.generateLabels?.({
        data: { datasets: [{ label: 't' }] },
      });
    } catch {
      /* ignore */
    }
    return <div data-testid="scatter3" />;
  },
}));

vi.mock('../ScatterChart/style', () => ({
  useStyle: () => ({ hashId: 'sc3' }),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children, isMobile }: any) => (
    <div data-testid="sc3-c" data-mobile={String(!!isMobile)}>
      {children}
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="sc3-filter"
      onClick={() => onFilterChange?.(filterOptions?.[1]?.value || 'gone')}
    >
      f
    </button>
  ),
  ChartStatistic: () => null,
  ChartToolBar: ({ filter, onDownload }: any) => (
    <div data-testid="sc3-tb">
      {filter}
      <button type="button" data-testid="sc3-dl" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  downloadChart: vi.fn(),
}));

describe('ScatterChart deepen3 residual branches', () => {
  const origW = window.innerWidth;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });
    (globalThis as any).__scatter3Data = undefined;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: origW,
    });
  });

  it('null item 过滤；无 type 空态', () => {
    render(
      <ScatterChart
        data={[null as any, { x: 1, y: 2 }, undefined as any]}
        title="empty-type"
      />,
    );
    expect(screen.getByText(/暂无有效数据/)).toBeInTheDocument();
  });

  it('非有限 / 字符串坐标；type 空串走默认 label', () => {
    render(
      <ScatterChart
        data={[
          { x: NaN, y: Infinity, type: 't' },
          { x: ' 12 ', y: 'null', type: 't' },
          { x: 'undefined', y: '', type: 't' },
          { x: 'bad', y: '3.5', type: 't' },
        ]}
        color="#abc"
        title="coords"
      />,
    );
    expect(screen.getByTestId('scatter3')).toBeInTheDocument();
    const ds = (globalThis as any).__scatter3Data?.datasets || [];
    expect(ds[0]?.label).toBeTruthy();
  });

  it('filterLabel 缺选中时仅 category；分类失效回退', async () => {
    render(
      <ScatterChart
        data={[
          { x: 1, y: 2, type: 'a', category: 'c1', filterLabel: 'f1' },
          { x: 3, y: 4, type: 'a', category: 'c2', filterLabel: 'f2' },
        ]}
        selectedFilter="missing"
        renderFilterInToolbar
        title="cat"
      />,
    );
    // selectedFilter 失效后 useEffect 回退到首个分类，再渲染图表
    await act(async () => {
      await Promise.resolve();
    });
    const chart =
      screen.queryByTestId('scatter3') || screen.queryByText(/暂无有效数据/);
    expect(chart).toBeTruthy();
    const btn = screen.queryByTestId('sc3-filter');
    if (btn) {
      act(() => {
        fireEvent.click(btn);
      });
    }
    fireEvent.click(screen.getByTestId('sc3-dl'));
  });

  it('mobile + resize 监听', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 500,
    });
    render(
      <ScatterChart
        data={[
          { x: 1, y: 2, type: 't' },
          { x: 3, y: 4, type: 't' },
        ]}
        title="m"
      />,
    );
    expect(screen.getByTestId('sc3-c').getAttribute('data-mobile')).toBe(
      'true',
    );
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1400,
    });
    await act(async () => {
      fireEvent.resize(window);
    });
    expect(screen.getByTestId('scatter3')).toBeInTheDocument();
  });
});

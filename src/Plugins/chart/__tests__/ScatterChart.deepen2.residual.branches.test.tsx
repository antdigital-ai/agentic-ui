/**
 * ScatterChart deepen2：SSR window 分支、分类回退、mobile、type 缺省配色。
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
    (globalThis as any).__scatter2Data = data;
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
    return <div data-testid="scatter2" />;
  },
}));

vi.mock('../ScatterChart/style', () => ({
  useStyle: () => ({ hashId: 'sc2' }),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children, isMobile }: any) => (
    <div data-testid="sc2-c" data-mobile={String(!!isMobile)}>
      {children}
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="sc2-filter"
      onClick={() => onFilterChange?.(filterOptions?.[0]?.value || '')}
    >
      f
    </button>
  ),
  ChartStatistic: () => null,
  ChartToolBar: ({ filter, onDownload }: any) => (
    <div data-testid="sc2-tb">
      {filter}
      <button type="button" data-testid="sc2-dl" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  downloadChart: vi.fn(),
}));

describe('ScatterChart deepen2 residual branches', () => {
  const origW = window.innerWidth;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });
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

  it('mobile + resize', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 400,
    });
    render(
      <ScatterChart
        data={[
          { x: 1, y: 2, type: 't' },
          { x: 3, y: 4, type: 't' },
        ]}
        title="m"
        renderFilterInToolbar
      />,
    );
    expect(screen.getByTestId('sc2-c').getAttribute('data-mobile')).toBe(
      'true',
    );
    expect(screen.getByTestId('scatter2')).toBeInTheDocument();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1400,
    });
    await act(async () => {
      fireEvent.resize(window);
    });
  });

  it('分类失效回退；color 数组；下载', () => {
    render(
      <ScatterChart
        data={[
          { x: 1, y: 2, type: 'a', category: 'c1' },
          { x: 2, y: 3, type: 'b', category: 'c2' },
        ]}
        color={['#111']}
        selectedFilter="gone"
        title="cat"
        renderFilterInToolbar
      />,
    );
    const btn = screen.queryByTestId('sc2-filter');
    if (btn) fireEvent.click(btn);
    fireEvent.click(screen.getByTestId('sc2-dl'));
    expect(screen.getByTestId('scatter2')).toBeInTheDocument();
  });

  it('dark theme + filterLabel 双筛', () => {
    render(
      <ScatterChart
        data={[
          {
            x: 1,
            y: 2,
            type: 'a',
            category: 'c1',
            filterLabel: 'f1',
          },
          {
            x: 2,
            y: 3,
            type: 'a',
            category: 'c1',
            filterLabel: 'f2',
          },
        ]}
        theme="dark"
        title="fl"
      />,
    );
    expect(screen.getByTestId('scatter2')).toBeInTheDocument();
  });
});

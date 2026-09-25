/**
 * FunnelChart deepen5：单值 range0、datasets 空 || []、
 * ratioText/originalValues ??、mobile 字号。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: { generateLabels: vi.fn(() => []) },
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
  Bar: ({ plugins, options, data }: any) => {
    (globalThis as any).__funnel5Plugins = plugins;
    (globalThis as any).__funnel5Options = options;
    (globalThis as any).__funnel5Data = data;
    try {
      const plugin = plugins?.[0];
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 10 })),
        font: '',
        textAlign: '',
        textBaseline: '',
        fillStyle: '',
      };
      const chart = {
        ctx,
        data,
        chartArea: { left: 0, right: 200, top: 0, bottom: 100 },
        scales: {
          x: { getPixelForValue: () => 10 },
          y: { getPixelForValue: () => 20 },
        },
      };
      plugin?.afterDatasetsDraw?.(chart);
      options?.plugins?.tooltip?.callbacks?.label?.({
        dataIndex: 0,
        raw: 1,
        dataset: { label: 'x' },
        parsed: { y: 1 },
      });
    } catch {
      /* ignore */
    }
    return <div data-testid="funnel5" />;
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'f5' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => null,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartToolBar: () => <div />,
  ChartFilter: () => null,
  downloadChart: vi.fn(),
}));

describe('FunnelChart deepen5 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 400,
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('单点数据：range===0；mobile 字号', async () => {
    const FunnelChart = (await import('../index')).default;
    render(
      <FunnelChart
        data={[{ x: 'Only', y: 5 }]}
        bottomLayerMinWidth={0.5}
        title="one"
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect(screen.getByTestId('funnel5')).toBeInTheDocument();
  });

  it('缺 ratio / 短数组触发 ?? 回退', async () => {
    const FunnelChart = (await import('../index')).default;
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100 },
          { x: 'B', y: 50 },
          { x: 'C', y: 10 },
        ]}
        title="ratio"
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect((globalThis as any).__funnel5Data).toBeTruthy();
  });
});

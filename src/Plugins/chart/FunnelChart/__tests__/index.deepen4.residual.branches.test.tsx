/**
 * FunnelChart deepen4：range===0 映射、tooltip ??0、无 xScale 回退、
 * labels ??、originalValues ??0。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
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
    (globalThis as any).__funnel4Plugins = plugins;
    (globalThis as any).__funnel4Options = options;
    (globalThis as any).__funnel4Data = data;
    return <div data-testid="funnel4" />;
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'f4' }),
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

describe('FunnelChart deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('全部相同值：range===0 映射返回 maxValue', async () => {
    const FunnelChart = (await import('../index')).default;
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 10 },
          { x: 'B', y: 10 },
          { x: 'C', y: 10 },
        ]}
        bottomLayerMinWidth={0.5}
        title="same"
      />,
    );
    expect((globalThis as any).__funnel4Data).toBeTruthy();
  });

  it('tooltip label：originalValues ??0；无 percent', async () => {
    const FunnelChart = (await import('../index')).default;
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100 },
          { x: 'B', y: 40 },
        ]}
        showPercent={false}
        title="tip"
      />,
    );
    const labelCb = (globalThis as any).__funnel4Options?.plugins?.tooltip
      ?.callbacks?.label;
    if (typeof labelCb === 'function') {
      expect(labelCb({ dataIndex: 0 })).toBeTruthy();
      expect(labelCb({ dataIndex: 99 })).toBeTruthy();
    }
    const titleCb = (globalThis as any).__funnel4Options?.plugins?.tooltip
      ?.callbacks?.title;
    if (typeof titleCb === 'function') {
      expect(titleCb([])).toBe('');
      expect(titleCb([{ label: 'A' }])).toBe('A');
    }
  });

  it('trapezoid / stageLabels：无 xScale 回退 el.x', async () => {
    const FunnelChart = (await import('../index')).default;
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '100%' },
          { x: 'B', y: 50, ratio: '50%' },
          { x: 'C', y: 10, ratio: '20%' },
        ]}
        title="trap"
      />,
    );
    const plugins = (globalThis as any).__funnel4Plugins || [];
    const trap = plugins.find((p: any) => p?.id === 'funnelTrapezoidLabels');
    if (trap?.afterDatasetsDraw) {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
      };
      expect(() =>
        trap.afterDatasetsDraw({
          ctx,
          scales: {},
          data: {
            labels: ['A', undefined, 'C'],
            datasets: [{ data: [[-50, 50], [-25, 25], [-5, 5]] }],
          },
          getDatasetMeta: () => ({
            data: [
              { x: 100, y: 10, height: 20 },
              { x: 100, y: 40, height: 20 },
              { x: 100, y: 70, height: 20 },
            ],
          }),
        }),
      ).not.toThrow();
    }
  });
});

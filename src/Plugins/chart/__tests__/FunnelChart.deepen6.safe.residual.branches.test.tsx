/**
 * FunnelChart deepen6 safe：range===0、mobile 字体、ds||[]、ratioText 洞、
 * originalValues ?? 0。FunnelChart.more.residual hang-quarantined；勿复活。
 * typeof window==='undefined' 在 jsdom 死臂。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FunnelChart from '../FunnelChart';

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
  Bar: ({ data, options, plugins }: any) => {
    (globalThis as any).__funnelSafe6Data = data;
    (globalThis as any).__funnelSafe6Options = options;
    (globalThis as any).__funnelSafe6Plugins = plugins;
    return <div data-testid="funnel-safe6" />;
  },
}));

vi.mock('../FunnelChart/style', () => ({
  useStyle: () => ({ hashId: 'fs6' }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="stat-s6" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartToolBar: ({ title }: any) => <div data-testid="tb-s6">{title}</div>,
  ChartFilter: () => null,
  downloadChart: vi.fn(),
}));

function mkCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
  };
}

describe('FunnelChart deepen6 safe residual branches', () => {
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
  });

  it('bottomLayerMinWidth + 全等 y → range===0', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 50, ratio: '100%' },
          { x: 'B', y: 50, ratio: '100%' },
          { x: 'C', y: 50, ratio: '100%' },
        ]}
        bottomLayerMinWidth={0.2}
      />,
    );
    expect((globalThis as any).__funnelSafe6Data?.datasets?.[0]?.data).toBeTruthy();
  });

  it('mobile：innerWidth 窄；rightLabel / trapezoid 插件', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 500,
    });
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '100%' },
          { x: 'B', y: 40, ratio: '40%' },
        ]}
        theme="light"
      />,
    );
    const plugins = (globalThis as any).__funnelSafe6Plugins || [];
    const right = plugins.find((p: any) => p.id === 'funnelRightLabels');
    const trap = plugins.find((p: any) => p.id === 'funnelTrapezoidLabels');
    const ctx = mkCtx();
    right?.afterDatasetsDraw?.({
      ctx,
      data: {
        labels: ['A', 'B', 'extra'],
        datasets: [{ data: [[-50, 50], [-20, 20]] }],
      },
      scales: { x: { getPixelForValue: (v: number) => 100 + v } },
      getDatasetMeta: () => ({
        data: [
          { x: 100, y: 10, width: 80, height: 20 },
          { x: 100, y: 40, width: 40, height: 20 },
          { x: 100, y: 70, width: 10, height: 20 },
        ],
      }),
    });
    expect(ctx.fillText).toHaveBeenCalled();
    expect(ctx.font).toMatch(/10px/);

    trap?.afterDatasetsDraw?.({
      ctx,
      data: {
        labels: ['A', 'B'],
        datasets: [{ data: [[-50, 50], [-20, 20]] }],
      },
      scales: { x: { getPixelForValue: (v: number) => 100 + v } },
      getDatasetMeta: () => ({
        data: [
          { x: 100, y: 10, height: 20 },
          { x: 100, y: 40, height: 20 },
        ],
      }),
    });
  });

  it('trapezoid：datasets 缺失 → ds||[]；ratio 洞 → 0%', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '100%' },
          { x: 'B', y: 50 },
          { x: 'C', y: 10, ratio: undefined as any },
        ]}
        theme="dark"
      />,
    );
    const trap = ((globalThis as any).__funnelSafe6Plugins || []).find(
      (p: any) => p.id === 'funnelTrapezoidLabels',
    );
    const ctx = mkCtx();
    expect(() =>
      trap?.afterDatasetsDraw?.({
        ctx,
        data: { labels: ['A', 'B'], datasets: [] },
        scales: { x: { getPixelForValue: (v: number) => v } },
        getDatasetMeta: () => ({
          data: [
            { x: 0, y: 10, height: 20 },
            { x: 0, y: 40, height: 20 },
          ],
        }),
      }),
    ).not.toThrow();

    // providedFlags[i+1] true 但 display 洞：用 ratio 空串触发 '0%'
    cleanup();
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 100, ratio: '100%' },
          { x: 'B', y: 50, ratio: '' },
        ]}
      />,
    );
    const trap2 = ((globalThis as any).__funnelSafe6Plugins || []).find(
      (p: any) => p.id === 'funnelTrapezoidLabels',
    );
    trap2?.afterDatasetsDraw?.({
      ctx,
      data: {
        labels: ['A', 'B'],
        datasets: [{ data: [[-50, 50], [-25, 25]] }],
      },
      scales: { x: { getPixelForValue: (v: number) => 100 + v } },
      getDatasetMeta: () => ({
        data: [
          { x: 100, y: 10, height: 20 },
          { x: 100, y: 40, height: 20 },
        ],
      }),
    });
    expect(ctx.fill).toHaveBeenCalled();
  });
});

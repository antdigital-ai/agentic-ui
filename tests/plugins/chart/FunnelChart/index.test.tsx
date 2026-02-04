import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let FunnelChart: React.FC<any>;

beforeEach(async () => {
  try {
    const mod = await import('../../../../src/Plugins/chart/FunnelChart/index');
    FunnelChart = mod.default;
  } catch (e) {
    const mod = await import('../../../../src/Plugins/chart/FunnelChart/');
    FunnelChart = mod.default;
  }
});

vi.mock('chart.js', async () => {
  const actual = await vi.importActual('chart.js');
  return {
    ...actual,
    Chart: { register: vi.fn() },
  };
});

vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

// Mock style hook to avoid depending on antd context internals in tests
vi.mock('../../../../src/Plugins/chart/FunnelChart/style', () => ({
  useStyle: () => ({ wrapSSR: (node: any) => node, hashId: 'test-hash' }),
}));

vi.mock('../../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartToolBar: ({ title, onDownload, extra }: any) => (
    <div data-testid="chart-toolbar">
      {title && <div data-testid="chart-title">{title}</div>}
      {extra && <div data-testid="toolbar-extra">{extra}</div>}
      <button type="button" onClick={onDownload} data-testid="download-button">
        D
      </button>
    </div>
  ),
  ChartFilter: () => <div data-testid="chart-filter" />,
  ChartStatistic: () => <div data-testid="chart-statistic" />,
  downloadChart: vi.fn(),
}));

vi.mock('../../../../src/Plugins/chart/utils', () => ({
  findDataPointByXValue: (data: any[], x: any) =>
    data.find((d) => String(d.x) === String(x)),
  isXValueEqual: (a: any, b: any) => String(a) === String(b),
  toNumber: (v: any, d: number) => {
    if (typeof v === 'number') return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  },
  hexToRgba: (color: string, alpha: number) => {
    if (color.startsWith('#')) {
      return `rgba(0, 0, 0, ${alpha})`;
    }
    return color;
  },
  resolveCssVariable: (cssVar: string) => {
    if (cssVar.startsWith('var(')) {
      return '#1890ff';
    }
    return cssVar;
  },
}));

describe('FunnelChart', () => {
  it('应该渲染并触发样式与图表渲染逻辑', () => {
    const data = [
      { x: 'A', y: 100, ratio: '100%' },
      { x: 'B', y: 50, ratio: '50%' },
      { x: 'C', y: 25 },
    ];

    render(
      <ConfigProvider>
        <FunnelChart data={data} bottomLayerMinWidth={0.5} title="测试漏斗" />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-title')).toHaveTextContent('测试漏斗');
  });
});

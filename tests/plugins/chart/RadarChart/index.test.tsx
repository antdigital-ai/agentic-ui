import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let RadarChart: React.FC<any>;

beforeEach(async () => {
  try {
    const mod = await import('../../../../src/Plugins/chart/RadarChart/index');
    RadarChart = mod.default;
  } catch (e) {
    const mod = await import('../../../../src/Plugins/chart/RadarChart/');
    RadarChart = mod.default;
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
  Radar: () => <div data-testid="radar-chart">Radar Chart</div>,
}));

vi.mock('../../../../src/Plugins/chart/RadarChart/style', () => ({
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

describe('RadarChart', () => {
  it('空数据时应渲染暂无有效数据信息', () => {
    render(
      <ConfigProvider>
        <RadarChart data={[]} />
      </ConfigProvider>,
    );

    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });
});

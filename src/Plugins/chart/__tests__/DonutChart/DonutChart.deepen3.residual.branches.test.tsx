/**
 * DonutChart deepen3：单色 data、statistic 数组/对象、mobile、空 data。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockChartInstances: any[] = [];
const downloadChart = vi.fn();

vi.mock('react-chartjs-2', () => ({
  Doughnut: React.forwardRef(({ data, options }: any, ref: any) => {
    React.useEffect(() => {
      if (ref) {
        const mockInstance = {
          canvas: document.createElement('canvas'),
          toBase64Image: vi.fn(() => 'data:image/png;base64,d3'),
          getDatasetMeta: vi.fn(() => ({ data: [] })),
          width: 200,
          height: 200,
          data,
        };
        mockChartInstances.push(mockInstance);
        if (typeof ref === 'function') ref(mockInstance);
        else if (ref && typeof ref === 'object') ref.current = mockInstance;
      }
    }, [ref]);
    try {
      options?.plugins?.tooltip?.callbacks?.label?.({ label: 'A', raw: 1 });
    } catch {
      /* ignore */
    }
    return <div data-testid="doughnut-d3">Chart</div>;
  }),
}));

vi.mock('../../utils', () => ({
  resolveCssVariable: vi.fn((c) => c),
}));

const mockUseMobile = vi.fn(() => ({ isMobile: false, windowWidth: 1920 }));
vi.mock('../../DonutChart/hooks', () => ({
  useMobile: () => mockUseMobile(),
  useFilterLabels: (data: any) => ({
    filterLabels: [],
    filteredDataByFilterLabel: data,
    selectedFilterLabel: null,
    setSelectedFilterLabel: vi.fn(),
  }),
  useAutoCategory: () => ({
    autoCategoryData: null,
    internalSelectedCategory: null,
    setInternalSelectedCategory: vi.fn(),
    selectedCategory: null,
  }),
  useResponsiveDimensions: () => ({
    width: 200,
    height: 200,
    chartWidth: 200,
    chartHeight: 200,
  }),
}));

vi.mock('../../env', () => ({
  isWindowDefined: vi.fn(() => true),
}));

vi.mock('../../DonutChart/Legend', () => ({
  default: () => <div data-testid="legend-d3" />,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container-d3">{children}</div>
  ),
  ChartFilter: () => null,
  ChartStatistic: ({ configs }: any) => (
    <div data-testid="stat-d3">{configs?.length ?? 0}</div>
  ),
  ChartToolBar: ({ onDownload, title }: any) => (
    <div data-testid="chart-toolbar-d3">
      {title}
      <button type="button" onClick={onDownload}>
        Download
      </button>
    </div>
  ),
  downloadChart: (...args: unknown[]) => downloadChart(...args),
}));

import DonutChart from '../../DonutChart';

describe('DonutChart deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockChartInstances.length = 0;
    downloadChart.mockClear();
    mockUseMobile.mockReturnValue({ isMobile: false, windowWidth: 1920 });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('单值 pie；statistic 对象与数组', () => {
    render(
      <ConfigProvider>
        <DonutChart
          title="One"
          data={[{ label: 'Only', value: 100 }]}
          statistic={{ title: 't', value: 100 }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('doughnut-d3')).toBeInTheDocument();
    expect(screen.getByTestId('stat-d3')).toBeInTheDocument();

    cleanup();
    render(
      <ConfigProvider>
        <DonutChart
          title="Arr"
          data={[
            { label: 'A', value: 30 },
            { label: 'B', value: 70 },
          ]}
          statistic={[
            { title: 't1', value: 30 },
            { title: 't2', value: 70 },
          ]}
        />
      </ConfigProvider>,
    );
    expect(screen.getAllByTestId('stat-d3').length).toBeGreaterThan(0);
  });

  it('mobile + download；空 data 安全', () => {
    mockUseMobile.mockReturnValue({ isMobile: true, windowWidth: 375 });
    render(
      <ConfigProvider>
        <DonutChart title="M" data={[]} />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByText('Download'));
    expect(downloadChart).toHaveBeenCalled();
  });
});

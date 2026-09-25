/**
 * DonutChart deepen：空实例下载、多图 catch、dark mobile spacing、datalabels/tooltip。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockChartInstances: any[] = [];
const downloadChart = vi.fn();

vi.mock('react-chartjs-2', () => ({
  Doughnut: React.forwardRef(
    ({ data, options, plugins }: any, ref: any) => {
      React.useEffect(() => {
        if (ref) {
          const canvas = (globalThis as any).__donutChartMockNoCanvas
            ? null
            : document.createElement('canvas');
          const mockInstance = {
            canvas,
            toBase64Image: vi.fn(() => 'data:image/png;base64,test'),
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
        options?.plugins?.tooltip?.callbacks?.label?.({
          label: 'T',
          raw: NaN,
        });
        options?.plugins?.tooltip?.callbacks?.label?.({
          label: 'T',
          raw: Infinity,
        });
        const dl = options?.plugins?.datalabels;
        if (dl?.display) {
          dl.display({
            dataset: { data: ['10'] },
            dataIndex: 0,
          });
          dl.display({
            dataset: { data: [0] },
            dataIndex: 0,
          });
        }
        if (dl?.formatter) {
          dl.formatter(10, {
            chart: { data: { labels: ['A'] } },
            dataIndex: 0,
          });
          dl.formatter(10, {
            chart: { data: { labels: [null] } },
            dataIndex: 0,
          });
        }
        plugins?.forEach((p: any) => {
          p?.beforeDraw?.({
            chartArea: { width: 100, height: 100, left: 0, top: 0 },
            ctx: {
              save: vi.fn(),
              restore: vi.fn(),
              beginPath: vi.fn(),
              arc: vi.fn(),
              fill: vi.fn(),
              fillText: vi.fn(),
              measureText: () => ({ width: 10 }),
            },
            data: { datasets: [{ data: [1] }] },
          } as any);
        });
      } catch {
        /* ignore callback probe errors */
      }

      return <div data-testid="doughnut-chart">Chart</div>;
    },
  ),
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
  default: () => <div data-testid="legend" />,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartFilter: () => null,
  ChartStatistic: () => null,
  ChartToolBar: ({ onDownload }: any) => (
    <div data-testid="chart-toolbar">
      <button type="button" onClick={onDownload}>
        Download
      </button>
    </div>
  ),
  downloadChart: (...args: unknown[]) => downloadChart(...args),
}));

import DonutChart from '../../DonutChart';

describe('DonutChart deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockChartInstances.length = 0;
    downloadChart.mockClear();
    (globalThis as any).__donutChartMockNoCanvas = false;
    mockUseMobile.mockReturnValue({ isMobile: false, windowWidth: 1920 });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 canvas：download 走 instances[0]??null', () => {
    (globalThis as any).__donutChartMockNoCanvas = true;
    render(
      <ConfigProvider>
        <DonutChart
          title="Donut"
          data={[
            { label: 'A', value: 30 },
            { label: 'B', value: 70 },
          ]}
          showDataLabels
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByText('Download'));
    expect(downloadChart).toHaveBeenCalled();
  });

  it('dark + mobile + 多值：spacing 分支；datalabels/tooltip 探测', () => {
    mockUseMobile.mockReturnValue({ isMobile: true, windowWidth: 375 });
    render(
      <ConfigProvider>
        <DonutChart
          title="Donut"
          data={[
            { label: 'A', value: 30 },
            { label: 'B', value: 70 },
          ]}
          theme="dark"
          showDataLabels
          chartStyle="donut"
        />
      </ConfigProvider>,
    );
    expect(screen.getAllByTestId('doughnut-chart').length).toBeGreaterThan(0);
  });

  it('多 configs 下载：toDataURL 抛错走 catch fallback', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockImplementation(() => {
        throw new Error('todata-fail');
      });
    render(
      <ConfigProvider>
        <DonutChart
          title="Multi"
          data={[
            { label: 'A', value: 1 },
            { label: 'B', value: 2 },
          ]}
          configs={[{ showLegend: true }, { showLegend: true }]}
        />
      </ConfigProvider>,
    );
    expect(mockChartInstances.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(screen.getByText('Download'));
    expect(downloadChart).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('单值 + dark：中心插件 total||1 / 暗色背景弧', () => {
    mockUseMobile.mockReturnValue({ isMobile: false, windowWidth: 1200 });
    render(
      <ConfigProvider>
        <DonutChart
          title="Solo"
          data={[{ label: 'Solo', value: '50' as any }]}
          theme="dark"
          chartStyle="donut"
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
  });
});


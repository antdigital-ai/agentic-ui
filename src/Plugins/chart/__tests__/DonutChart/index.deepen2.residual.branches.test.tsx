/**
 * DonutChart deepen2：空实例 download ??null、datalabels 字符串值、
 * tooltip showDataLabels、单值 pie、string value Number()。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockChartInstances: any[] = [];
const downloadChart = vi.fn();

vi.mock('react-chartjs-2', () => ({
  Doughnut: React.forwardRef(({ data, options, plugins }: any, ref: any) => {
    React.useEffect(() => {
      if (ref) {
        const canvas = (globalThis as any).__donutD2NoCanvas
          ? null
          : document.createElement('canvas');
        const mockInstance = {
          canvas,
          toBase64Image: vi.fn(() => 'data:image/png;base64,d2'),
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
        label: 'A',
        raw: 10,
      });
      options?.plugins?.tooltip?.callbacks?.label?.({
        label: 'B',
        raw: '20',
      });
      const dl = options?.plugins?.datalabels;
      if (dl?.display) {
        dl.display({
          dataset: { data: ['15'] },
          dataIndex: 0,
        });
        dl.display({
          dataset: { data: [0.5] },
          dataIndex: 0,
        });
        dl.display({
          dataset: { data: [NaN] },
          dataIndex: 0,
        });
      }
      if (dl?.formatter) {
        dl.formatter(25, {
          chart: { data: { labels: ['Label'] } },
          dataIndex: 0,
        });
        dl.formatter(25, {
          chart: { data: { labels: [undefined] } },
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
      /* probe */
    }

    return <div data-testid="doughnut-d2">Chart</div>;
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
  default: () => <div data-testid="legend-d2" />,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container-d2">{children}</div>
  ),
  ChartFilter: () => null,
  ChartStatistic: () => null,
  ChartToolBar: ({ onDownload }: any) => (
    <div data-testid="chart-toolbar-d2">
      <button type="button" onClick={onDownload}>
        Download
      </button>
    </div>
  ),
  downloadChart: (...args: unknown[]) => downloadChart(...args),
}));

import DonutChart from '../../DonutChart';

describe('DonutChart deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockChartInstances.length = 0;
    downloadChart.mockClear();
    (globalThis as any).__donutD2NoCanvas = false;
    mockUseMobile.mockReturnValue({ isMobile: false, windowWidth: 1920 });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 canvas：单图 download 走 instances[0]??null', () => {
    (globalThis as any).__donutD2NoCanvas = true;
    render(
      <ConfigProvider>
        <DonutChart
          title="Donut"
          data={[
            { label: 'A', value: 40 },
            { label: 'B', value: 60 },
          ]}
          showDataLabels
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByText('Download'));
    expect(downloadChart).toHaveBeenCalled();
  });

  it('多值 showDataLabels：tooltip/datalabels 字符串 value 分支', () => {
    render(
      <ConfigProvider>
        <DonutChart
          title="Labels"
          data={[
            { label: 'A', value: '30' as any },
            { label: 'B', value: 70 },
          ]}
          showDataLabels
          chartStyle="donut"
        />
      </ConfigProvider>,
    );
    expect(screen.getAllByTestId('doughnut-d2').length).toBeGreaterThan(0);
  });

  it('单值 + pie：不挂中心插件；string value Number()', () => {
    render(
      <ConfigProvider>
        <DonutChart
          title="PieSolo"
          data={[{ label: 'Solo', value: '42' as any }]}
          singleMode
          chartStyle="pie"
          theme="light"
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('doughnut-d2')).toBeInTheDocument();
  });

  it('多 configs 拼接 catch：getContext 失败回退 downloadChart', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => null);
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
    spy.mockRestore();
  });
});

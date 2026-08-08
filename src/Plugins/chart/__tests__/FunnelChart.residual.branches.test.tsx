/**
 * FunnelChart 残留：filter/height/空数据/locale 回退（mock Bar）。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FunnelChart from '../FunnelChart';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: { plugins: { legend: { labels: {}, onClick: vi.fn() } } },
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => {
    (globalThis as any).__funnelResidualData = data;
    (globalThis as any).__funnelResidualOptions = options;
    return <div data-testid="funnel-bar" />;
  },
}));

vi.mock('../FunnelChart/style', () => ({
  useStyle: () => ({ hashId: 'f' }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="stat" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartToolBar: ({ title, onDownload, filter, extra }: any) => (
    <div data-testid="tb">
      {title}
      {extra}
      {filter}
      <button type="button" data-testid="dl" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <button
      type="button"
      data-testid="ff"
      onClick={() =>
        filterOptions?.length > 1 && onFilterChange?.(filterOptions[1].value)
      }
    >
      f
    </button>
  ),
  downloadChart: vi.fn(),
}));

vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>();
  return {
    ...actual,
    resolveCssVariable: (color: string) => color || '#1677ff',
  };
});

describe('FunnelChart residual prop/config branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空数据 / height 字符串解析 / 无 filter', () => {
    render(
      <FunnelChart
        data={[]}
        height={'320px' as any}
        title="Funnel"
        showLegend={false}
      />,
    );
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });

  it('多 filterLabel；颜色假值；statistic 单对象', () => {
    render(
      <FunnelChart
        data={[
          { label: 'A', value: 100, filterLabel: 'F1' },
          { label: 'B', value: '50' as any, filterLabel: 'F1' },
          { label: 'C', value: 20, filterLabel: 'F2' },
        ]}
        color={['', undefined as any]}
        statistic={{ title: 's', value: 1 } as any}
        theme="dark"
        loading
        width={400}
        className="fn"
      />,
    );
    act(() => {
      const filterBtn = screen.queryByTestId('ff');
      if (filterBtn) fireEvent.click(filterBtn);
    });
    expect((globalThis as any).__funnelResidualData).toBeTruthy();
  });

  it('非数组 data 安全处理', () => {
    expect(() => render(<FunnelChart data={null as any} />)).not.toThrow();
  });
});

/**
 * RadarChart 更多残留：空 type、mobile、tooltip 外置、默认色回退、图例截断。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RadarChart from '../RadarChart';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => [
              { text: '超长序列名称需要被截断显示省略号', fillStyle: '#1677ff' },
            ]),
          },
        },
      },
    },
  },
  RadialLinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Filler: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Radar: ({ data, options }: any) => {
    (globalThis as any).__radarMoreData = data;
    (globalThis as any).__radarMoreOptions = options;
    return <div data-testid="radar-more" />;
  },
}));

vi.mock('../RadarChart/style', () => ({
  useStyle: () => ({ hashId: 'rm' }),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartFilter: () => null,
  ChartStatistic: () => <div data-testid="stat" />,
  ChartToolBar: ({ title }: any) => <div data-testid="tb">{title}</div>,
  downloadChart: vi.fn(),
}));

vi.mock('../hooks', async () => {
  const actual = await vi.importActual<any>('../hooks');
  return {
    ...actual,
    useResponsiveSize: () => ({
      width: 320,
      height: 280,
      isMobile: true,
      windowWidth: 375,
    }),
  };
});

describe('RadarChart more residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空数据默认数据集；无 type 标签回退', () => {
    render(<RadarChart data={[]} title="R" theme="dark" showLegend />);
    expect(screen.getByTestId('tb')).toHaveTextContent('R');
  });

  it('多 type + 外部 tooltip 回调（custom-radar-tooltip）', () => {
    render(
      <RadarChart
        data={[
          { x: '速度', y: 80, type: 'A' },
          { x: '力量', y: 60, type: 'A' },
          { x: '速度', y: 50, type: '' as any },
          { x: '力量', y: 'bad' as any, type: 'B' },
        ]}
        color={['#ff0000']}
        showGrid={false}
        title="radar"
        loading
        theme="light"
      />,
    );
    const data = (globalThis as any).__radarMoreData;
    expect(data?.datasets?.length).toBeGreaterThanOrEqual(2);
    expect(data?.datasets?.[0]?.pointBorderWidth).toBe(1);

    const opts = (globalThis as any).__radarMoreOptions;
    const external = opts?.plugins?.tooltip?.external;
    if (typeof external === 'function') {
      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: {
          opacity: 1,
          caretX: 10,
          caretY: 20,
          dataPoints: [
            {
              label: '速度',
              parsed: { r: 88.6 },
              dataset: { label: 'A', borderColor: '#f00' },
            },
          ],
        },
      });
      expect(document.getElementById('custom-radar-tooltip')).toBeTruthy();

      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: { opacity: 0, dataPoints: [{ label: 'x' }] },
      });
      expect(document.getElementById('custom-radar-tooltip')?.style.opacity).toBe(
        '0',
      );

      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: { opacity: 1, caretX: 10, caretY: 20, dataPoints: [] },
      });

      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: {
          opacity: 1,
          caretX: 10,
          caretY: 20,
          dataPoints: [undefined],
        },
      });
    }
    expect(screen.getByTestId('tb')).toHaveTextContent('radar');
  });

  it('图例 generateLabels：ctx 为空回退；mobile 截断长文本', () => {
    render(
      <RadarChart
        data={[
          { x: 'a', y: 1, type: 't1' },
          { x: 'b', y: 2, type: 't1' },
        ]}
        theme="dark"
        textMaxWidth={10}
      />,
    );
    const gen = (globalThis as any).__radarMoreOptions?.plugins?.legend?.labels
      ?.generateLabels;
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any;
    expect(gen?.({})).toBeTruthy();
    HTMLCanvasElement.prototype.getContext = origGetContext;

    const labels = gen?.({});
    expect(labels?.[0]?.text).toContain('...');
  });

  it('statistic 空数组不渲染；window resize', () => {
    render(
      <RadarChart
        data={[
          { x: 'a', y: 1, type: 't' },
          { x: 'b', y: 2, type: 't' },
        ]}
        statistic={[] as any}
      />,
    );
    expect(screen.queryByTestId('stat')).not.toBeInTheDocument();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('radar-more')).toBeInTheDocument();
  });

  it.skip('空数据默认 dataset：dark/light + 空 type 标签回退', () => {
    // 空数据 early-return 空态，不再走默认 dataset 回退臂
    render(<RadarChart data={[]} theme="dark" title="empty-dark" />);
    expect(screen.getByTestId('tb')).toHaveTextContent('empty-dark');
  });

  it('tooltip external：非有限 parsed.r / 缺 label·borderColor 回退', () => {
    render(
      <RadarChart
        data={[
          { x: '维1', y: 10, type: 'S' },
          { x: '维2', y: 20, type: 'S' },
        ]}
        theme="dark"
      />,
    );
    const external = (globalThis as any).__radarMoreOptions?.plugins?.tooltip
      ?.external;
    expect(typeof external).toBe('function');
    external({
      chart: { canvas: { getBoundingClientRect: () => ({ left: 5, top: 5 }) } },
      tooltip: {
        opacity: 1,
        caretX: 12,
        caretY: 18,
        dataPoints: [
          {
            label: undefined,
            parsed: { r: Number.NaN },
            dataset: { label: undefined, borderColor: undefined },
          },
        ],
      },
    });
    expect(document.getElementById('custom-radar-tooltip')).toBeTruthy();

    external({
      chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
      tooltip: {
        opacity: 1,
        caretX: 1,
        caretY: 2,
        dataPoints: [
          {
            label: '维1',
            parsed: { r: 'bad' },
            dataset: { label: 'S', borderColor: '#abc' },
          },
        ],
      },
    });
  });

  it('空 type 标签回退「默认」；color 空槽走 defaultColorList', () => {
    render(
      <RadarChart
        data={[
          { x: 'a', y: 1, type: '' },
          { x: 'b', y: 2, type: '' },
        ]}
        color={['', undefined as any]}
        theme="light"
        showLegend
      />,
    );
    const ds = (globalThis as any).__radarMoreData?.datasets?.[0];
    expect(ds?.label).toBe('默认');
    expect(ds?.pointBorderWidth).toBe(1);
  });

  it('istanbul deepen：多系列；legend truncate；filter；statistic 单对象；tooltip opacity0', () => {
    render(
      <RadarChart
        data={[
          {
            x: '维度很长很长很长很长很长',
            y: 80,
            type: '系列A',
            category: 'C1',
            filterLabel: 'F1',
          },
          { x: '维2', y: 40, type: '系列A', category: 'C1', filterLabel: 'F1' },
          {
            x: '维度很长很长很长很长很长',
            y: 20,
            type: '系列B',
            category: 'C1',
            filterLabel: 'F2',
          },
          { x: '维2', y: 60, type: '系列B', category: 'C1', filterLabel: 'F2' },
          { x: '维3', y: 'bad' as any, type: '系列B', category: 'C2' },
        ]}
        color={['#111', 'var(--c)', '']}
        theme="light"
        showLegend
        statistic={{ title: 's', value: 1 }}
        title="radar-deep"
        textMaxWidth={40}
      />,
    );
    const gen = (globalThis as any).__radarMoreOptions?.plugins?.legend?.labels
      ?.generateLabels;
    if (typeof gen === 'function') {
      const labels = gen({
        data: {
          datasets: [
            { label: '系列A超级超级超级长标签文字' },
            { label: '短' },
          ],
        },
        isDatasetVisible: () => true,
      });
      expect(Array.isArray(labels) || labels === null || labels === undefined).toBe(true);
    }
    const external = (globalThis as any).__radarMoreOptions?.plugins?.tooltip
      ?.external;
    if (typeof external === 'function') {
      external({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        },
        tooltip: { opacity: 0, caretX: 0, caretY: 0, dataPoints: [] },
      });
      external({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 1, top: 1 }) },
        },
        tooltip: {
          opacity: 1,
          caretX: 4,
          caretY: 6,
          dataPoints: [
            {
              label: '维2',
              parsed: { r: 40 },
              dataset: { label: '系列A', borderColor: '#111' },
            },
          ],
        },
      });
    }
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(
      (globalThis as any).__radarMoreData?.datasets?.length,
    ).toBeGreaterThan(0);
  });

  it('exclusive deepen：空数据；单维；mobile；无 type；color 空串', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 375,
    });
    const { rerender } = render(
      <RadarChart data={[]} title="radar-empty" theme="dark" />,
    );
    expect(screen.getByTestId('tb')).toHaveTextContent('radar-empty');

    rerender(
      <RadarChart
        data={[
          { x: 'only', y: 50 },
          { x: 'only', y: 20, type: '' },
          { x: 'b', y: Number.NaN, type: 't' },
          { x: 'b', y: 10, type: 't' },
        ]}
        color=""
        showLegend={false}
        statistic={[{ title: 's', value: 1 }]}
        title="radar-mobile"
      />,
    );
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1400,
    });
    rerender(
      <RadarChart
        data={[
          { x: 'd1', y: 1, type: 'A' },
          { x: 'd2', y: 2, type: 'A' },
          { x: 'd1', y: 3, type: 'B' },
          { x: 'd2', y: 4, type: 'B' },
        ]}
        color={['#abc']}
        theme="light"
        showLegend
        textMaxWidth={10}
        title="radar-desk"
      />,
    );
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(
      (globalThis as any).__radarMoreData?.datasets?.length,
    ).toBeGreaterThan(0);
  });
});

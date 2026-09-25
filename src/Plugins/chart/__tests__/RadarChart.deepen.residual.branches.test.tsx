/**
 * RadarChart deepen residual：注册幂等、空态、mobile/desktop、toolbar 下载、
 * filter 内外、statistic、legend 截断、tooltip external 全路径、dark/light。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const registerSpy = vi.fn();
const downloadChartMock = vi.fn();

vi.mock('chart.js', () => ({
  Chart: {
    register: (...args: unknown[]) => registerSpy(...args),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => [
              {
                text: '超长序列名称ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                fillStyle: '#1677ff',
              },
              { text: '短', fillStyle: '#52c41a' },
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
  Radar: React.forwardRef(({ data, options }: any, ref: any) => {
    (globalThis as any).__radarDeepenData = data;
    (globalThis as any).__radarDeepenOptions = options;
    if (ref) {
      if (typeof ref === 'function') {
        ref({ canvas: document.createElement('canvas') });
      } else {
        ref.current = { canvas: document.createElement('canvas') };
      }
    }
    return <div data-testid="radar-deepen" />;
  }),
}));

vi.mock('../RadarChart/style', () => ({
  useStyle: () => ({ hashId: 'rd' }),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children, className, style, isMobile }: any) => (
    <div
      data-testid="radar-container"
      data-mobile={String(!!isMobile)}
      className={className}
      style={style}
    >
      {children}
    </div>
  ),
  ChartFilter: (props: any) => (
    <button
      type="button"
      data-testid="radar-filter"
      data-variant={props.variant || 'default'}
      onClick={() => {
        props.onFilterChange?.('C1');
        props.onSelectionChange?.('F1');
      }}
    >
      filter
    </button>
  ),
  ChartStatistic: ({ title }: any) => (
    <div data-testid="radar-stat">{title}</div>
  ),
  ChartToolBar: ({ title, onDownload, filter, loading, extra }: any) => (
    <div data-testid="radar-tb" data-loading={String(!!loading)}>
      <span>{title}</span>
      {extra}
      {filter}
      <button type="button" data-testid="radar-dl" onClick={() => onDownload?.()}>
        dl
      </button>
    </div>
  ),
  downloadChart: (...args: unknown[]) => downloadChartMock(...args),
}));

vi.mock('../ChartStatistic', () => ({
  default: ({ title }: any) => <div data-testid="radar-stat">{title}</div>,
}));

import RadarChart from '../RadarChart';

const SAMPLE = [
  { x: '速度', y: 80, type: '系列A', category: 'C1', filterLabel: 'F1' },
  { x: '力量', y: 60, type: '系列A', category: 'C1', filterLabel: 'F1' },
  { x: '速度', y: 50, type: '系列B', category: 'C1', filterLabel: 'F2' },
  { x: '力量', y: 40, type: '系列B', category: 'C1', filterLabel: 'F2' },
];

describe('RadarChart deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
    downloadChartMock.mockClear();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });
  });

  afterEach(() => {
    cleanup();
    const tip = document.getElementById('custom-radar-tooltip');
    if (tip?.parentNode) tip.parentNode.removeChild(tip);
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 data / 无有效 x / 无 type：空态 + 默认标题', () => {
    const { rerender } = render(<RadarChart data={[]} theme="dark" />);
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    expect(screen.getByTestId('radar-tb')).toHaveTextContent('雷达图');

    rerender(
      <RadarChart
        data={[{ x: '', y: 1, type: 'A' } as any]}
        title="empty-x"
        classNames={{ root: 'root-cls' }}
        styles={{ root: { border: '1px solid red' } }}
        className="outer"
      />,
    );
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();

    rerender(
      <RadarChart
        data={[
          { x: 'a', y: null as any, type: 'A' },
          { x: 'b', y: undefined as any },
        ]}
        title="no-y"
      />,
    );
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('desktop light：color 字符串、statistic 对象、下载成功', () => {
    render(
      <RadarChart
        data={SAMPLE}
        color="#ff6600"
        theme="light"
        title="desk"
        statistic={{ title: 'avg', value: 50 }}
        toolbarExtra={<span data-testid="extra">ex</span>}
        dataTime="2024"
        loading
        textMaxWidth={80}
      />,
    );
    expect(screen.getByTestId('radar-deepen')).toBeInTheDocument();
    expect(screen.getByTestId('radar-stat')).toHaveTextContent('avg');
    expect(screen.getByTestId('extra')).toBeInTheDocument();
    expect(screen.getByTestId('radar-tb')).toHaveAttribute(
      'data-loading',
      'true',
    );

    const ds = (globalThis as any).__radarDeepenData?.datasets?.[0];
    expect(ds?.pointBorderWidth).toBe(1);
    expect(ds?.pointBorderColor).toBe('#fff');
    expect(ds?.borderWidth).toBe(2);

    fireEvent.click(screen.getByTestId('radar-dl'));
    expect(downloadChartMock).toHaveBeenCalled();
  });

  it('mobile dark：resize、color 数组、legend 截断、ticks callback', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 375,
    });
    render(
      <RadarChart
        data={SAMPLE}
        color={['#111', '#222']}
        theme="dark"
        textMaxWidth={20}
        statistic={[{ title: 's1', value: 1 }, { title: 's2', value: 2 }]}
      />,
    );
    expect(screen.getByTestId('radar-container')).toHaveAttribute(
      'data-mobile',
      'true',
    );
    const ds = (globalThis as any).__radarDeepenData?.datasets?.[0];
    expect(ds?.pointBorderWidth).toBe(0);
    expect(ds?.borderWidth).toBe(1.5);
    expect(ds?.pointRadius).toBe(3);

    const opts = (globalThis as any).__radarDeepenOptions;
    expect(opts?.plugins?.legend?.position).toBe('bottom');
    expect(opts?.scales?.r?.ticks?.callback?.(25)).toBe(25);

    const gen = opts?.plugins?.legend?.labels?.generateLabels;
    expect(typeof gen).toBe('function');
    const labels = gen?.({});
    expect(labels?.[0]?.text).toContain('...');
    expect(Array.isArray(labels)).toBe(true);

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        writable: true,
        value: 1400,
      });
      window.dispatchEvent(new Event('resize'));
    });
  });

  it('renderFilterInToolbar + ChartFilter compact；外部 filter 变更', () => {
    const { rerender } = render(
      <RadarChart data={SAMPLE} renderFilterInToolbar theme="light" />,
    );
    expect(screen.getByTestId('radar-filter')).toHaveAttribute(
      'data-variant',
      'compact',
    );
    fireEvent.click(screen.getByTestId('radar-filter'));

    rerender(<RadarChart data={SAMPLE} renderFilterInToolbar={false} />);
    expect(screen.getByTestId('radar-filter')).toHaveAttribute(
      'data-variant',
      'default',
    );
    fireEvent.click(screen.getByTestId('radar-filter'));
  });

  it('tooltip external：创建/隐藏/空 dataPoints/非有限 r/catch', () => {
    render(<RadarChart data={SAMPLE} theme="dark" />);
    const external = (globalThis as any).__radarDeepenOptions?.plugins?.tooltip
      ?.external;
    expect(typeof external).toBe('function');

    const chart = {
      canvas: { getBoundingClientRect: () => ({ left: 10, top: 20 }) },
    };

    external({
      chart,
      tooltip: { opacity: 1, caretX: 5, caretY: 6, dataPoints: [] },
    });

    external({
      chart,
      tooltip: {
        opacity: 1,
        caretX: 5,
        caretY: 6,
        dataPoints: [undefined],
      },
    });

    external({
      chart,
      tooltip: {
        opacity: 1,
        caretX: 8,
        caretY: 9,
        dataPoints: [
          {
            label: '速度',
            parsed: { r: 88.66 },
            dataset: { label: '系列A', borderColor: '#abc' },
          },
        ],
      },
    });
    expect(document.getElementById('custom-radar-tooltip')).toBeTruthy();

    external({
      chart,
      tooltip: {
        opacity: 1,
        caretX: 1,
        caretY: 2,
        dataPoints: [
          {
            label: undefined,
            parsed: { r: Number.NaN },
            dataset: { label: undefined, borderColor: undefined },
          },
        ],
      },
    });

    const badParsed = {
      get r() {
        throw new Error('boom');
      },
    };
    external({
      chart,
      tooltip: {
        opacity: 1,
        caretX: 1,
        caretY: 2,
        dataPoints: [
          {
            label: 'x',
            parsed: badParsed,
            dataset: { label: 'L', borderColor: '#000' },
          },
        ],
      },
    });

    external({
      chart,
      tooltip: { opacity: 0, caretX: 0, caretY: 0, dataPoints: [{}] },
    });
    expect(document.getElementById('custom-radar-tooltip')?.style.opacity).toBe(
      '0',
    );
  });

  it('legend generateLabels：getContext null 回退 original', () => {
    render(<RadarChart data={SAMPLE} textMaxWidth={10} />);
    const gen = (globalThis as any).__radarDeepenOptions?.plugins?.legend
      ?.labels?.generateLabels;
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any;
    expect(gen?.({})).toBeTruthy();
    HTMLCanvasElement.prototype.getContext = orig;
  });

  it('下载失败 catch；color 空串走 defaultColorList；无 title', () => {
    downloadChartMock.mockImplementationOnce(() => {
      throw new Error('dl fail');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <RadarChart
        data={[
          { x: 'a', y: 1, type: 'T' },
          { x: 'b', y: 2, type: 'T' },
        ]}
        color=""
        theme="light"
      />,
    );
    fireEvent.click(screen.getByTestId('radar-dl'));
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    expect(screen.getByTestId('radar-tb')).toHaveTextContent('雷达图');
  });

  it('卸载时清理 custom-radar-tooltip', () => {
    const { unmount } = render(<RadarChart data={SAMPLE} theme="light" />);
    const external = (globalThis as any).__radarDeepenOptions?.plugins?.tooltip
      ?.external;
    external?.({
      chart: {
        canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
      },
      tooltip: {
        opacity: 1,
        caretX: 1,
        caretY: 1,
        dataPoints: [
          {
            label: '速度',
            parsed: { r: 1 },
            dataset: { label: '系列A', borderColor: '#f00' },
          },
        ],
      },
    });
    expect(document.getElementById('custom-radar-tooltip')).toBeTruthy();
    unmount();
    expect(document.getElementById('custom-radar-tooltip')).toBeNull();
  });
});

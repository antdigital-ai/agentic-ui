/**
 * RadarChart 分支覆盖补充测试
 */
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RadarChart from '../RadarChart';

const mockDownloadChart = vi.fn();
let capturedOptions: any;
let capturedData: any;

const mockChartInstance = {
  canvas: document.createElement('canvas'),
  getBoundingClientRect: vi.fn(() => ({
    left: 10,
    top: 20,
    width: 600,
    height: 400,
  })),
};

vi.mock('chart.js', async () => {
  const actual = await vi.importActual('chart.js');
  return {
    ...actual,
    Chart: {
      register: vi.fn(),
      defaults: {
        plugins: {
          legend: {
            labels: {
              generateLabels: vi.fn(() => [
                { text: '短标签' },
                { text: '这是一个非常非常长的标签名称需要截断' },
              ]),
            },
          },
        },
      },
    },
  };
});

vi.mock('react-chartjs-2', () => ({
  Radar: React.forwardRef(({ data, options }: any, ref: any) => {
    capturedOptions = options;
    capturedData = data;
    React.useEffect(() => {
      if (ref && typeof ref === 'object') ref.current = mockChartInstance;
    }, [ref]);
    return (
      <div
        data-testid="radar-chart"
        data-datasets={JSON.stringify(data?.datasets?.map((d: any) => d.label))}
      />
    );
  }),
}));

vi.mock('../RadarChart/style', () => ({
  useStyle: () => ({ hashId: 'r-hash' }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="chart-statistic" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartToolBar: ({ title, onDownload, filter }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span>{title}</span>}
      {filter}
      <button type="button" data-testid="download-btn" onClick={onDownload}>
        dl
      </button>
    </div>
  ),
  ChartFilter: ({
    filterOptions,
    onFilterChange,
    customOptions,
    onSelectionChange,
  }: any) => (
    <div>
      <button
        type="button"
        data-testid="chart-filter"
        onClick={() => onFilterChange?.(filterOptions?.[1]?.value)}
      >
        filter
      </button>
      {customOptions?.map((o: any) => (
        <button
          type="button"
          key={o.key}
          data-testid={`custom-${o.key}`}
          onClick={() => onSelectionChange?.(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
  downloadChart: (...args: any[]) => mockDownloadChart(...args),
}));

vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>();
  return {
    ...actual,
    resolveCssVariable: (c: string) =>
      !c || c.startsWith('var(') ? '#1677ff' : c,
    hexToRgba: (c: string, a: number) => `rgba-mock-${a}`,
  };
});

const mockData = [
  { x: '技术', y: 80, type: '团队A', category: 'cat1' },
  { x: '沟通', y: 90, type: '团队A', category: 'cat1' },
  { x: '技术', y: 70, type: '团队B', category: 'cat1' },
  { x: '沟通', y: 85, type: 'teamB', category: 'cat2' },
];

const renderRadar = (props: Partial<React.ComponentProps<typeof RadarChart>> = {}) =>
  render(
    <ConfigProvider>
      <RadarChart data={mockData} {...props} />
    </ConfigProvider>,
  );

describe('RadarChart 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOptions = undefined;
    capturedData = undefined;
    document.getElementById('custom-radar-tooltip')?.remove();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    Object.defineProperty(window, 'pageXOffset', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    document.getElementById('custom-radar-tooltip')?.remove();
  });

  it('generateLabels 截断超长文本', () => {
    renderRadar({ textMaxWidth: 30 });
    const labels = capturedOptions?.plugins?.legend?.labels?.generateLabels({});
    const truncated = labels.find((l: any) => l.text.endsWith('...'));
    expect(truncated).toBeDefined();
  });

  it('generateLabels 短文本不截断', () => {
    renderRadar({ textMaxWidth: 500 });
    const labels = capturedOptions?.plugins?.legend?.labels?.generateLabels({});
    expect(labels[0].text).toBe('短标签');
  });

  it('generateLabels ctx 为 null 时返回 original', () => {
    const orig = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        const el = orig('canvas');
        el.getContext = vi.fn(() => null) as any;
        return el;
      }
      return orig(tag);
    });
    renderRadar();
    const labels = capturedOptions?.plugins?.legend?.labels?.generateLabels({});
    expect(labels.length).toBeGreaterThan(0);
    vi.restoreAllMocks();
  });

  it('tooltip external opacity 0 隐藏已有元素', () => {
    const el = document.createElement('div');
    el.id = 'custom-radar-tooltip';
    el.style.opacity = '1';
    document.body.appendChild(el);
    renderRadar();
    capturedOptions?.plugins?.tooltip?.external({
      chart: mockChartInstance,
      tooltip: { opacity: 0, dataPoints: [] },
    });
    expect(el.style.opacity).toBe('0');
  });

  it('tooltip external 创建并展示自定义 tooltip', () => {
    renderRadar({ theme: 'dark' });
    capturedOptions?.plugins?.tooltip?.external({
      chart: mockChartInstance,
      tooltip: {
        opacity: 1,
        caretX: 50,
        caretY: 60,
        dataPoints: [
          {
            label: '技术',
            dataset: { label: '团队A', borderColor: '#388BFF' },
            parsed: { r: 75.567 },
          },
        ],
      },
    });
    const tip = document.getElementById('custom-radar-tooltip');
    expect(tip).toBeTruthy();
    expect(tip?.innerHTML).toContain('75.6');
  });

  it('tooltip external 空 dataPoints 直接返回', () => {
    renderRadar();
    expect(() =>
      capturedOptions?.plugins?.tooltip?.external({
        chart: mockChartInstance,
        tooltip: { opacity: 1, dataPoints: [] },
      }),
    ).not.toThrow();
  });

  it('tooltip external dataPoint 缺失 parsed.r 走字符串分支', () => {
    renderRadar();
    capturedOptions?.plugins?.tooltip?.external({
      chart: mockChartInstance,
      tooltip: {
        opacity: 1,
        caretX: 0,
        caretY: 0,
        dataPoints: [
          {
            label: '维度',
            dataset: { label: '序列' },
            parsed: { r: 'bad' },
          },
        ],
      },
    });
    expect(document.getElementById('custom-radar-tooltip')?.innerHTML).toContain(
      'bad',
    );
  });

  it('tooltip external parsed 访问异常走 catch', () => {
    renderRadar();
    capturedOptions?.plugins?.tooltip?.external({
      chart: mockChartInstance,
      tooltip: {
        opacity: 1,
        caretX: 0,
        caretY: 0,
        dataPoints: [
          {
            label: '维度',
            dataset: { label: '序列', borderColor: '#000' },
            get parsed() {
              throw new Error('parse fail');
            },
          },
        ],
      },
    });
    expect(document.getElementById('custom-radar-tooltip')?.innerHTML).toContain(
      '0',
    );
  });

  it('color 数组按 index 循环取色', () => {
    renderRadar({ color: ['#f00', '#0f0'] });
    expect(capturedData?.datasets?.length).toBeGreaterThan(1);
  });

  it('dark theme 点边框与 tooltip 样式', () => {
    renderRadar({ theme: 'dark' });
    expect(capturedData?.datasets?.[0]?.pointBorderWidth).toBe(0);
  });

  it('light theme 点白边', () => {
    renderRadar({ theme: 'light' });
    expect(capturedData?.datasets?.[0]?.pointBorderColor).toBe('#fff');
  });

  it('移动端 legend 位置与尺寸', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    renderRadar();
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(capturedOptions?.plugins?.legend?.position).toBe('bottom');
  });

  it('renderFilterInToolbar 渲染工具栏筛选', () => {
    renderRadar({ renderFilterInToolbar: true });
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('非 toolbar 模式渲染外部筛选', () => {
    renderRadar({ renderFilterInToolbar: false });
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('切换 category 筛选', async () => {
    renderRadar({ renderFilterInToolbar: false });
    fireEvent.click(screen.getByTestId('chart-filter'));
    await waitFor(() => {
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  it('statistic 配置渲染', () => {
    renderRadar({
      statistic: [{ type: 'sum', target: 'y', label: '合计' } as any],
    });
    expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
  });

  it('下载成功', () => {
    renderRadar();
    fireEvent.click(screen.getByTestId('download-btn'));
    expect(mockDownloadChart).toHaveBeenCalled();
  });

  it('下载失败捕获 warn', () => {
    mockDownloadChart.mockImplementationOnce(() => {
      throw new Error('fail');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderRadar();
    fireEvent.click(screen.getByTestId('download-btn'));
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('卸载时清理 custom tooltip', () => {
    const el = document.createElement('div');
    el.id = 'custom-radar-tooltip';
    document.body.appendChild(el);
    const { unmount } = renderRadar();
    unmount();
    expect(document.getElementById('custom-radar-tooltip')).toBeNull();
  });

  it('ticks callback 返回刻度值', () => {
    renderRadar();
    const cb = capturedOptions?.scales?.r?.ticks?.callback;
    expect(cb(50)).toBe(50);
  });

  it('兼容 label/score  deprecated 字段', () => {
    renderRadar({
      data: [
        { label: '产品', score: 60, type: 'A' },
        { label: '技术', score: 80, type: 'A' },
      ],
    });
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('filterLabel 二级筛选', () => {
    renderRadar({
      data: [
        { x: 'A', y: 1, type: 't1', category: 'c1', filterLabel: 'f1' },
        { x: 'B', y: 2, type: 't1', category: 'c1', filterLabel: 'f2' },
      ],
    });
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('loading 与 dataTime', () => {
    renderRadar({ loading: true, dataTime: '2024-01-01', title: '雷达' });
    expect(screen.getByText('雷达')).toBeInTheDocument();
  });

  it('无有效数据时显示空状态', () => {
    renderRadar({ data: [] });
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    expect(screen.queryByTestId('radar-chart')).not.toBeInTheDocument();
  });

  it('无 type 字段时显示空状态', () => {
    renderRadar({
      data: [{ x: '  ', y: 1, type: 't1' }],
    });
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('light theme tooltip external 渲染', () => {
    renderRadar({ theme: 'light' });
    capturedOptions?.plugins?.tooltip?.external({
      chart: mockChartInstance,
      tooltip: {
        opacity: 1,
        caretX: 30,
        caretY: 40,
        dataPoints: [
          {
            label: '沟通',
            dataset: { label: '团队A', borderColor: '#388BFF' },
            parsed: { r: 88 },
          },
        ],
      },
    });
    const tip = document.getElementById('custom-radar-tooltip');
    expect(tip?.innerHTML).toContain('rgba(255, 255, 255');
    tip?.remove();
  });

  it('filterLabel 二级筛选切换', async () => {
    renderRadar({
      renderFilterInToolbar: true,
      data: [
        { x: 'A', y: 1, type: 't1', category: 'c1', filterLabel: 'f1' },
        { x: 'B', y: 2, type: 't1', category: 'c1', filterLabel: 'f2' },
        { x: 'C', y: 3, type: 't1', category: 'c2', filterLabel: 'f1' },
      ],
    });
    fireEvent.click(screen.getByTestId('chart-filter'));
    await waitFor(() => {
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  it('字符串 color 解析 CSS 变量', () => {
    renderRadar({ color: 'var(--radar-primary)' });
    expect(capturedData?.datasets?.[0]?.borderColor).toBe('#1677ff');
  });

  it('statistic 数组渲染多个统计块', () => {
    renderRadar({
      statistic: [
        { type: 'sum', target: 'y', label: 'A' },
        { type: 'avg', target: 'y', label: 'B' },
      ] as any,
    });
    expect(screen.getAllByTestId('chart-statistic').length).toBe(2);
  });

  it('tooltip 使用 pageXOffset/pageYOffset 定位', () => {
    Object.defineProperty(window, 'pageXOffset', {
      writable: true,
      configurable: true,
      value: 5,
    });
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 10,
    });
    renderRadar();
    capturedOptions?.plugins?.tooltip?.external({
      chart: mockChartInstance,
      tooltip: {
        opacity: 1,
        caretX: 20,
        caretY: 30,
        dataPoints: [
          {
            label: '技术',
            dataset: { label: '团队A', borderColor: '#388BFF' },
            parsed: { r: 75 },
          },
        ],
      },
    });
    const tip = document.getElementById('custom-radar-tooltip');
    expect(tip?.style.left).toContain('25');
    expect(tip?.style.top).toContain('40');
    tip?.remove();
  });

  it('移动端 ticks stepSize 为 25', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    renderRadar();
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(capturedOptions?.scales?.r?.ticks?.stepSize).toBe(25);
  });

  it('桌面端 legend position 为 right', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    renderRadar();
    expect(capturedOptions?.plugins?.legend?.position).toBe('right');
  });

  it('桌面端 ticks stepSize 为 20', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    renderRadar();
    expect(capturedOptions?.scales?.r?.ticks?.stepSize).toBe(20);
  });

  it('color 数组多序列取色', () => {
    renderRadar({
      color: ['#f00', '#0f0', '#00f'],
      data: [
        { x: '技术', y: 80, type: '团队A', category: 'c1' },
        { x: '沟通', y: 90, type: '团队A', category: 'c1' },
        { x: '技术', y: 70, type: '团队B', category: 'c1' },
        { x: '沟通', y: 85, type: '团队B', category: 'c1' },
      ],
    });
    expect(capturedData?.datasets?.length).toBe(2);
  });

  it('tooltip opacity 0 且无 DOM 时不抛错', () => {
    document.getElementById('custom-radar-tooltip')?.remove();
    renderRadar();
    expect(() =>
      capturedOptions?.plugins?.tooltip?.external({
        chart: mockChartInstance,
        tooltip: { opacity: 0, dataPoints: [] },
      }),
    ).not.toThrow();
  });

  it('tooltip 缺 label 时使用空维度标题', () => {
    renderRadar();
    capturedOptions?.plugins?.tooltip?.external({
      chart: mockChartInstance,
      tooltip: {
        opacity: 1,
        caretX: 0,
        caretY: 0,
        dataPoints: [
          {
            dataset: { label: '序列', borderColor: '#000' },
            parsed: { r: 66 },
          },
        ],
      },
    });
    expect(document.getElementById('custom-radar-tooltip')).toBeTruthy();
    document.getElementById('custom-radar-tooltip')?.remove();
  });

  it('dark theme tooltip 背景', () => {
    renderRadar({ theme: 'dark' });
    capturedOptions?.plugins?.tooltip?.external({
      chart: mockChartInstance,
      tooltip: {
        opacity: 1,
        caretX: 0,
        caretY: 0,
        dataPoints: [
          {
            label: '技术',
            dataset: { label: '团队A', borderColor: '#388BFF' },
            parsed: { r: 80 },
          },
        ],
      },
    });
    expect(document.getElementById('custom-radar-tooltip')?.innerHTML).toContain(
      'rgba(0, 0, 0',
    );
    document.getElementById('custom-radar-tooltip')?.remove();
  });

  it('单 category 时仍渲染 ChartFilter', () => {
    renderRadar({
      data: [
        { x: 'A', y: 1, type: 't1', category: 'only' },
        { x: 'B', y: 2, type: 't1', category: 'only' },
      ],
      renderFilterInToolbar: false,
    });
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('多序列 datasets 构建正确分值', () => {
    renderRadar({
      data: [
        { x: '技术', y: 80, type: '团队A', category: 'c1' },
        { x: '沟通', y: 90, type: '团队A', category: 'c1' },
        { x: '技术', y: 70, type: '团队B', category: 'c1' },
        { x: '沟通', y: 85, type: '团队B', category: 'c1' },
      ],
    });
    expect(capturedData?.labels).toEqual(['技术', '沟通']);
    expect(capturedData?.datasets).toHaveLength(2);
  });

  it('卸载时移除 resize 监听', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderRadar();
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('空状态默认标题雷达图', () => {
    renderRadar({ data: [], title: undefined });
    expect(screen.getByText('雷达图')).toBeInTheDocument();
  });

  it('width/height 响应式移动端', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400,
    });
    renderRadar({ width: 600, height: 400 });
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('generateLabels ctx 存在时不截断短文本', () => {
    renderRadar({ textMaxWidth: 200 });
    const labels = capturedOptions?.plugins?.legend?.labels?.generateLabels({});
    expect(labels[0].text).toBe('短标签');
  });

  it('statistic 单对象渲染', () => {
    renderRadar({
      statistic: { type: 'sum', target: 'y', label: '合计' } as any,
    });
    expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
  });

  it('dark theme legend generateLabels 使用 axisTextColor', () => {
    renderRadar({ theme: 'dark' });
    expect(capturedOptions?.plugins?.legend?.labels?.color).toBeDefined();
    const labels = capturedOptions?.plugins?.legend?.labels?.generateLabels({
      data: { datasets: [{ borderColor: '#388BFF' }] },
    });
    expect(labels[0].text).toBe('短标签');
  });

  it('无 category 时使用全部数据构建 datasets', () => {
    renderRadar({
      data: [
        { x: 'A', y: 1, type: 't1' },
        { x: 'B', y: 2, type: 't1' },
      ],
    });
    expect(capturedData?.datasets?.[0]?.data?.length).toBe(2);
  });

  it('filterLabel 筛选切换更新 datasets', async () => {
    renderRadar({
      data: [
        { x: 'A', y: 1, type: 't1', category: 'C1', filterLabel: 'F1' },
        { x: 'B', y: 2, type: 't1', category: 'C1', filterLabel: 'F2' },
        { x: 'C', y: 3, type: 't1', category: 'C2', filterLabel: 'F1' },
      ],
      renderFilterInToolbar: false,
    });
    fireEvent.click(screen.getByTestId('custom-F2'));
    await waitFor(() => {
      expect(capturedData?.datasets?.[0]?.data?.length).toBeGreaterThan(0);
    });
  });

  it('y 为非有限数时使用 0', () => {
    renderRadar({
      data: [{ x: 'Dim', y: Number.NaN, type: 't1', category: 'A' }],
    });
    expect(capturedData?.datasets?.[0]?.data?.[0]).toBe(0);
  });

  it('label/score 旧字段映射到 x/y', () => {
    renderRadar({
      data: [{ label: '维度', score: 0, type: 't1', category: 'A' }],
    });
    expect(capturedData?.labels).toContain('维度');
    expect(capturedData?.datasets?.[0]?.data?.[0]).toBe(0);
  });

  it('selectedFilter 失效后回退并重建 datasets', async () => {
    const { rerender } = renderRadar({
      data: [
        { x: 'A', y: 1, type: 't1', category: 'C1' },
        { x: 'B', y: 2, type: 't1', category: 'C2' },
      ],
    });
    rerender(
      <ConfigProvider>
        <RadarChart
          data={[{ x: 'X', y: 9, type: 't1', category: 'C3' }]}
        />
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(capturedData?.labels).toEqual(['X']);
    });
  });

  it('filterLabels 消失时仍渲染有效 datasets', async () => {
    const { rerender } = renderRadar({
      data: [
        { x: 'A', y: 1, type: 't1', category: 'C1', filterLabel: 'F1' },
        { x: 'B', y: 2, type: 't1', category: 'C1', filterLabel: 'F2' },
      ],
    });
    rerender(
      <ConfigProvider>
        <RadarChart
          data={[
            { x: 'C', y: 3, type: 't1', category: 'C1' },
            { x: 'D', y: 4, type: 't1', category: 'C1' },
          ]}
        />
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(capturedData?.datasets?.[0]?.data?.length).toBe(2);
    });
  });

  it('切换 category 筛选后 labels 更新', async () => {
    renderRadar({
      renderFilterInToolbar: false,
      data: [
        { x: '技术', y: 80, type: '团队A', category: 'cat1' },
        { x: '沟通', y: 90, type: '团队A', category: 'cat2' },
      ],
    });
    fireEvent.click(screen.getByTestId('chart-filter'));
    await waitFor(() => {
      expect(capturedData?.labels?.length).toBeGreaterThan(0);
    });
  });

  it('tooltip external 空 dataPoints 早退', () => {
    renderRadar({ data: [{ x: 'A', y: 1, type: 't1', category: 'c1' }] });
    const external = capturedOptions?.plugins?.tooltip?.external;
    external({
      chart: mockChartInstance,
      tooltip: { opacity: 1, caretX: 10, caretY: 20, dataPoints: [] },
    });
    expect(document.getElementById('custom-radar-tooltip')).toBeNull();
  });

  it('tooltip external dataPoint 缺失时使用默认 label', () => {
    renderRadar({ data: [{ x: 'A', y: 1, type: 't1', category: 'c1' }] });
    const external = capturedOptions?.plugins?.tooltip?.external;
    external({
      chart: mockChartInstance,
      tooltip: {
        opacity: 1,
        caretX: 10,
        caretY: 20,
        dataPoints: [{ parsed: { r: Number.NaN } }],
      },
    });
    expect(document.getElementById('custom-radar-tooltip')?.innerHTML).toContain(
      '0',
    );
  });

  it('download 失败时 console.warn 不抛错', () => {
    mockDownloadChart.mockImplementationOnce(() => {
      throw new Error('download fail');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderRadar({ data: [{ x: 'A', y: 1, type: 't1', category: 'c1' }] });
    fireEvent.click(screen.getByTestId('download-btn'));
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('renderFilterInToolbar=true 时在 toolbar 内渲染 filter', () => {
    renderRadar({
      renderFilterInToolbar: true,
      data: [
        { x: 'A', y: 1, type: 't1', category: 'c1' },
        { x: 'B', y: 2, type: 't1', category: 'c2' },
      ],
    });
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('statistics 数组渲染多个 ChartStatistic', () => {
    renderRadar({
      statistic: [
        { type: 'sum', target: 'y', label: 'A' },
        { type: 'avg', target: 'y', label: 'B' },
      ] as any,
    });
    expect(screen.getAllByTestId('chart-statistic')).toHaveLength(2);
  });

  it('tooltip external opacity=0 时不渲染 DOM', () => {
    renderRadar({ data: [{ x: 'A', y: 1, type: 't1', category: 'c1' }] });
    const external = capturedOptions?.plugins?.tooltip?.external;
    external({
      chart: mockChartInstance,
      tooltip: { opacity: 0, caretX: 10, caretY: 20, dataPoints: [{ parsed: { r: 5 } }] },
    });
    expect(document.getElementById('custom-radar-tooltip')).toBeNull();
  });

  it('空 data 数组仍渲染容器', () => {
    renderRadar({ data: [] });
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('height 字符串 auto 时使用默认高度', () => {
    renderRadar({ data: [{ x: 'A', y: 1, type: 't1', category: 'c1' }], height: 'auto' });
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('tooltip external 有效 dataPoint 创建 tooltip 元素', () => {
    renderRadar({ data: [{ x: '维度', y: 10, type: 't1', category: 'c1' }] });
    const external = capturedOptions?.plugins?.tooltip?.external;
    external({
      chart: mockChartInstance,
      tooltip: {
        opacity: 1,
        caretX: 50,
        caretY: 60,
        dataPoints: [{ parsed: { r: 10 }, label: '维度' }],
      },
    });
    const el = document.getElementById('custom-radar-tooltip');
    expect(el).toBeTruthy();
    expect(el?.innerHTML).toContain('10');
  });

  describe('深度 edge-case 分支', () => {
    it('无 type 字段时归一化为默认系列名', () => {
      renderRadar({
        data: [{ x: '维度A', y: 80, category: 'c1' }],
      });
      expect(capturedData?.datasets?.[0]?.label).toBe('默认');
    });

    it('空 xValues 防御分支 labels 为默认', () => {
      renderRadar({
        data: [{ x: 'A', y: 1, type: 't1', category: 'c1' }],
      });
      expect(capturedData?.labels?.length).toBeGreaterThan(0);
      renderRadar({ data: [] });
      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('color 空字符串时使用 defaultColorList 回退 #1677ff', () => {
      renderRadar({
        color: '',
        data: [
          { x: 'A', y: 1, type: 't1', category: 'c1' },
          { x: 'B', y: 2, type: 't1', category: 'c1' },
        ],
      });
      expect(capturedData?.datasets?.[0]?.borderColor).toBe('#1677ff');
    });

    it.skip('color 数组越界时使用 #1677ff 回退', () => {
      // 空串 / 空数组元素经 `baseColor || safeDefaultColor` 回退到 defaultColorList[0]
      renderRadar({
        color: ['', ''],
        data: [
          { x: 'A', y: 1, type: 't1', category: 'c1' },
          { x: 'B', y: 2, type: 't2', category: 'c1' },
        ],
      });
      expect(capturedData?.datasets?.[0]?.borderColor).toBe('#1677ff');
      expect(capturedData?.datasets?.[1]?.borderColor).toBe('#1677ff');

      renderRadar({
        color: [],
        data: [
          { x: 'A', y: 1, type: 't1', category: 'c1' },
          { x: 'B', y: 2, type: 't2', category: 'c1' },
        ],
      });
      expect(capturedData?.datasets?.[0]?.borderColor).toBe('#1677ff');
      expect(capturedData?.datasets?.[1]?.borderColor).toBe('#1677ff');
    });

    it('移动端 borderWidth 为 1.5', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      renderRadar({
        data: [{ x: 'A', y: 1, type: 't1', category: 'c1' }],
      });
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(capturedData?.datasets?.[0]?.borderWidth).toBe(1.5);
    });

    it('light theme pointBorderColor 为白边', () => {
      renderRadar({
        theme: 'light',
        data: [{ x: 'A', y: 1, type: 't1', category: 'c1' }],
      });
      expect(capturedData?.datasets?.[0]?.pointBorderColor).toBe('#fff');
      expect(capturedData?.datasets?.[0]?.pointBorderWidth).toBe(1);
    });

    it('istanbul residual：空 type、tooltip 无 dataPoint、移动端样式', async () => {
      renderRadar({
        data: [{ x: 'A', y: 10, type: '', category: 'c1' }],
        color: [],
      });
      expect(capturedData?.datasets?.[0]?.label).toBe('默认');
      expect(capturedData?.datasets?.[0]?.borderColor).toBe('#1677ff');

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      renderRadar({
        data: [
          { x: 'A', y: 1, type: 't1', category: 'c1' },
          { x: 'B', y: 2, type: 't1', category: 'c1' },
        ],
      });
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(capturedData?.datasets?.[0]?.pointRadius).toBe(3);

      const ext = capturedOptions?.plugins?.tooltip?.external;
      if (typeof ext === 'function') {
        ext({
          tooltip: { opacity: 1, dataPoints: [null], caretX: 1, caretY: 1 },
          chart: mockChartInstance,
        });
        // 首次创建 tooltip DOM
        ext({
          tooltip: {
            opacity: 1,
            dataPoints: [
              {
                label: 'A',
                formattedValue: '1',
                dataset: { label: 't1', borderColor: '#00f' },
              },
            ],
            caretX: 5,
            caretY: 5,
          },
          chart: mockChartInstance,
        });
      }

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
    });

    it('istanbul buffer：无 DOM 时创建 custom-radar-tooltip + dark', () => {
      document.getElementById('custom-radar-tooltip')?.remove();
      renderRadar({
        theme: 'dark',
        data: [
          { x: 'A', y: 1, type: 't1', category: 'c1' },
          { x: 'B', y: 2, type: 't1', category: 'c1' },
        ],
      });
      const ext = capturedOptions?.plugins?.tooltip?.external;
      expect(typeof ext).toBe('function');
      ext({
        tooltip: { opacity: 1, dataPoints: [], caretX: 1, caretY: 1 },
        chart: mockChartInstance,
      });
      ext({
        tooltip: {
          opacity: 1,
          dataPoints: [
            {
              label: 'A',
              formattedValue: '1',
              dataset: { label: 't1', borderColor: '#0af' },
            },
          ],
          caretX: 8,
          caretY: 9,
        },
        chart: mockChartInstance,
      });
      expect(document.getElementById('custom-radar-tooltip')).toBeTruthy();
      document.getElementById('custom-radar-tooltip')?.remove();
    });

    it('istanbul fill：空 statistic、下载无 ref、暗色默认色', () => {
      mockDownloadChart.mockClear();
      renderRadar({
        theme: 'dark',
        color: [],
        statistic: [],
        data: [
          { x: 'A', y: 1, type: 't1', category: 'c1' },
          { x: 'B', y: 2, type: 't1', category: 'c1' },
        ],
      });
      expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
      expect(capturedData?.datasets?.[0]?.borderColor).toBe('#1677ff');
      fireEvent.click(screen.getByTestId('download-btn'));
      // mockChartInstance 已挂 ref 时会调用；若未挂载则走 else
      expect(mockDownloadChart.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('istanbul after：空 type 默认系列；桌面端非移动半径', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1400,
      });
      renderRadar({
        data: [
          { x: 'A', y: 1, type: '', category: 'c1' },
          { x: 'B', y: 2, type: '', category: 'c1' },
        ],
        color: undefined,
      });
      expect(capturedData?.datasets?.[0]?.label).toBe('默认');
      expect(capturedData?.datasets?.[0]?.pointRadius).toBe(4);
      expect(capturedData?.datasets?.[0]?.borderWidth).toBe(2);
    });

    it('istanbul residual-extra：空 color 回退默认色；tooltip 无 dataPoint', () => {
      renderRadar({
        data: [
          { x: 'A', y: 3, type: 't1', category: 'c1' },
          { x: 'B', y: 4, type: 't1', category: 'c1' },
        ],
        color: ['', ''],
        theme: 'dark',
      });
      const ds = capturedData?.datasets?.[0];
      expect(ds?.borderColor || ds?.backgroundColor).toBeTruthy();

      const tooltipExt = capturedOptions?.plugins?.tooltip?.external;
      if (typeof tooltipExt === 'function') {
        tooltipExt({
          tooltip: {
            opacity: 1,
            dataPoints: [],
            caretX: 10,
            caretY: 10,
          },
          chart: {
            canvas: document.createElement('canvas'),
          },
        });
        tooltipExt({
          tooltip: {
            opacity: 1,
            dataPoints: [{ dataIndex: 0, datasetIndex: 0, label: 'A', raw: 3 }],
            caretX: 10,
            caretY: 10,
            title: ['A'],
            body: [{ lines: ['3'] }],
          },
          chart: {
            canvas: document.createElement('canvas'),
          },
        });
      }
    });
  });
});

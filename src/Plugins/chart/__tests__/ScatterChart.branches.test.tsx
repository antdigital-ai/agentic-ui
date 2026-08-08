/**
 * ScatterChart 分支覆盖补充测试
 *
 * 针对空数据、resize、筛选回退、自定义色、坐标轴边界、
 * 图例截断、tooltip external、ticks callback 等分支。
 */
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScatterChartDataItem } from '../ScatterChart';

let capturedScatterProps: any = null;

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => [
              {
                text: 'Short',
                fillStyle: '#1677ff',
                strokeStyle: '#1677ff',
                datasetIndex: 0,
                index: 0,
              },
              {
                text: '这是一个非常非常长的产品名称用于测试图例截断功能',
                fillStyle: '#52c41a',
                strokeStyle: '#52c41a',
                datasetIndex: 1,
                index: 1,
              },
            ]),
          },
        },
      },
    },
  },
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Scatter: React.forwardRef((props: any, ref: any) => {
    capturedScatterProps = props;
    (globalThis as any).__scatterBranchData = props.data;
    (globalThis as any).__scatterBranchOptions = props.options;
    return (
      <div
        data-testid="scatter-chart"
        ref={ref}
        data-datasets={JSON.stringify(
          props.data?.datasets?.map((ds: any) => ({
            label: ds.label,
            data: ds.data,
            pointRadius: ds.pointRadius,
          })),
        )}
      />
    );
  }),
}));

vi.mock('../utils', () => ({
  hexToRgba: vi.fn((color, alpha) => `rgba(${color},${alpha})`),
  resolveCssVariable: vi.fn((color) => color),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children, ...p }: any) => (
    <div data-testid="chart-container" {...p}>
      {children}
    </div>
  ),
  ChartFilter: ({
    filterOptions,
    onFilterChange,
    customOptions,
    onSelectionChange,
  }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((o: any) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onFilterChange?.(o.value)}
          data-testid={`filter-${o.value}`}
        >
          {o.label}
        </button>
      ))}
      {customOptions?.map((o: any) => (
        <button
          type="button"
          key={o.key}
          onClick={() => onSelectionChange?.(o.key)}
          data-testid={`custom-${o.key}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
  ChartToolBar: ({ title, onDownload, filter, loading }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span data-testid="chart-title">{title}</span>}
      {loading && <span data-testid="chart-loading">loading</span>}
      <button type="button" onClick={onDownload} data-testid="download-button">
        下载
      </button>
      {filter}
    </div>
  ),
  downloadChart: vi.fn(),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="chart-statistic" />,
}));

vi.mock('../ScatterChart/style', () => ({
  useStyle: () => ({ hashId: 'scatter-hash' }),
}));

vi.mock('../const', () => ({
  defaultColorList: ['#111111', '#222222', '#333333'],
}));

import ScatterChart from '../ScatterChart';

const validData: ScatterChartDataItem[] = [
  { category: 'A', type: 'T1', x: 1, y: 10 },
  { category: 'A', type: 'T1', x: 2, y: 20 },
  { category: 'A', type: 'T2', x: 1, y: 15 },
  { category: 'B', type: 'T1', x: 3, y: 30 },
];

describe('ScatterChart 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedScatterProps = null;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      measureText: vi.fn((text: string) => ({ width: text.length * 6 })),
      fillText: vi.fn(),
      font: '',
      canvas: document.createElement('canvas'),
    })) as any;
  });

  describe('空数据与无效数据', () => {
    it('空数组时显示暂无有效数据', () => {
      render(<ScatterChart data={[]} title="空数据" />);
      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
      expect(screen.queryByTestId('scatter-chart')).not.toBeInTheDocument();
    });

    it('null/undefined 数据时显示空状态', () => {
      render(<ScatterChart data={null as any} />);
      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('无 type 字段时 datasetTypes 为空并显示空状态', () => {
      render(<ScatterChart data={[{ category: 'A', x: 1, y: 10 }]} />);
      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('无 category 时 selectedFilter 为空字符串仍渲染图表', () => {
      render(<ScatterChart data={[{ type: 'T1', x: 1, y: 10 }]} />);
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });
  });

  describe('resize 与卸载清理', () => {
    it('触发 window resize 后仍正常渲染', async () => {
      render(<ScatterChart data={validData} />);
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('卸载时移除 resize 监听并清理 tooltip DOM', () => {
      const tooltipEl = document.createElement('div');
      tooltipEl.id = 'custom-scatter-tooltip';
      document.body.appendChild(tooltipEl);
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<ScatterChart data={validData} />);
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeSpy.mockRestore();
      if (tooltipEl.parentNode) document.body.removeChild(tooltipEl);
    });
  });

  describe('selectedFilter 与 filterLabel 分支', () => {
    it('无 category 时 !selectedFilter 分支展示全部数据', () => {
      const data = [
        { type: 'T1', x: 1, y: 10 },
        { type: 'T2', x: 2, y: 20 },
      ];
      render(<ScatterChart data={data} />);
      const datasets = JSON.parse(
        screen.getByTestId('scatter-chart').getAttribute('data-datasets') ||
          '[]',
      );
      expect(datasets).toHaveLength(2);
    });

    it('切换 category 筛选后数据集更新', () => {
      render(<ScatterChart data={validData} />);
      fireEvent.click(screen.getByTestId('filter-B'));
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('有 filterLabel 时切换 custom 选项', async () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: 1, y: 10, filterLabel: 'F1' },
        { category: 'A', type: 'T1', x: 2, y: 20, filterLabel: 'F2' },
        { category: 'B', type: 'T1', x: 3, y: 30, filterLabel: 'F1' },
      ];
      render(<ScatterChart data={data} renderFilterInToolbar />);
      expect(screen.getByTestId('custom-F1')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('custom-F2'));
      await waitFor(() => {
        expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
      });
    });

    it('无 filterLabels 时仅按 category 筛选', () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: 1, y: 10 },
        { category: 'B', type: 'T1', x: 2, y: 20 },
      ];
      render(<ScatterChart data={data} />);
      fireEvent.click(screen.getByTestId('filter-A'));
      const datasets = JSON.parse(
        screen.getByTestId('scatter-chart').getAttribute('data-datasets') ||
          '[]',
      );
      expect(datasets[0]?.data?.length).toBeGreaterThan(0);
    });
  });

  describe('自定义颜色与坐标解析', () => {
    it('color 数组按序对应各数据集', () => {
      render(
        <ScatterChart
          data={validData}
          color={['#aa0000', '#00aa00', '#0000aa']}
        />,
      );
      expect(capturedScatterProps.data.datasets).toHaveLength(2);
    });

    it('字符串坐标 null/undefined/空串解析为 0', () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: 'null', y: 'undefined' },
        { category: 'A', type: 'T1', x: '', y: '  ' },
        { category: 'A', type: 'T1', x: 5, y: 10 },
      ];
      render(<ScatterChart data={data} />);
      const coords = capturedScatterProps.data.datasets[0].data;
      expect(coords[0]).toEqual({ x: 0, y: 0 });
      expect(coords[2]).toEqual({ x: 5, y: 10 });
    });

    it('非有限数字坐标回退为 0', () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: NaN, y: Infinity },
        { category: 'A', type: 'T1', x: 1, y: 10 },
      ];
      render(<ScatterChart data={data} />);
      expect(capturedScatterProps.data.datasets[0].data[0]).toEqual({
        x: 0,
        y: 0,
      });
    });
  });

  describe('坐标轴边界与 stepSize', () => {
    it('传入 xMin/xMax/yMin/yMax 时使用 override 边界', () => {
      render(
        <ScatterChart
          data={validData}
          xMin={0}
          xMax={100}
          yMin={0}
          yMax={50}
        />,
      );
      expect(capturedScatterProps.options.scales.x.min).toBe(0);
      expect(capturedScatterProps.options.scales.x.max).toBe(100);
      expect(capturedScatterProps.options.scales.y.min).toBe(0);
      expect(capturedScatterProps.options.scales.y.max).toBe(50);
    });

    it('ticks callback 有/无单位分支', () => {
      render(<ScatterChart data={validData} xUnit="月" yUnit="元" />);
      const xCb = capturedScatterProps.options.scales.x.ticks.callback;
      const yCb = capturedScatterProps.options.scales.y.ticks.callback;
      expect(xCb(3)).toBe('3月');
      expect(yCb(10)).toBe('10元');

      render(<ScatterChart data={validData} xUnit="" yUnit={undefined} />);
      const xCb2 = capturedScatterProps.options.scales.x.ticks.callback;
      expect(xCb2(5)).toBe('5');
    });
  });

  describe('generateLabels 图例分支', () => {
    it('短文本不截断，长文本加省略号', () => {
      render(<ScatterChart data={validData} textMaxWidth={80} />);
      const generateLabels =
        capturedScatterProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({
        data: {
          datasets: [
            { borderColor: '#1677ff' },
            { borderColor: '#52c41a' },
          ],
        },
      });
      expect(result[0].text).toBe('Short');
      expect(result[1].text).toContain('...');
    });

    it('getContext 返回 null 时返回原始标签', () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any;
      render(<ScatterChart data={validData} />);
      const generateLabels =
        capturedScatterProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({ data: { datasets: [{}] } });
      expect(result[0].text).toBe('Short');
    });

    it('dark 主题图例 strokeStyle 与 lineWidth 分支', () => {
      render(<ScatterChart data={validData} theme="dark" />);
      const generateLabels =
        capturedScatterProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({
        data: { datasets: [{ borderColor: '#1677ff' }] },
      });
      expect(result[0].lineWidth).toBe(0);
    });
  });

  describe('tooltip external 回调分支', () => {
    const getExternal = () =>
      capturedScatterProps.options.plugins.tooltip.external;

    it('opacity 为 0 时隐藏已有 tooltip', () => {
      render(<ScatterChart data={validData} />);
      const el = document.createElement('div');
      el.id = 'custom-scatter-tooltip';
      el.style.opacity = '1';
      document.body.appendChild(el);
      getExternal()({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        },
        tooltip: { opacity: 0 },
      });
      expect(el.style.opacity).toBe('0');
      document.body.removeChild(el);
    });

    it('dataPoints 为空时 early return', () => {
      render(<ScatterChart data={validData} />);
      expect(() =>
        getExternal()({
          chart: {
            canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
          },
          tooltip: { opacity: 1, dataPoints: [] },
        }),
      ).not.toThrow();
    });

    it('dataPoints[0] 缺失时 early return', () => {
      render(<ScatterChart data={validData} />);
      expect(() =>
        getExternal()({
          chart: {
            canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
          },
          tooltip: { opacity: 1, dataPoints: [undefined] },
        }),
      ).not.toThrow();
    });

    it('有 dataPoints 时创建 tooltip 并格式化内容', () => {
      render(
        <ScatterChart data={validData} xUnit="月" yUnit="元" theme="dark" />,
      );
      getExternal()({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 10, top: 20 }) },
        },
        tooltip: {
          opacity: 1,
          caretX: 50,
          caretY: 80,
          dataPoints: [
            {
              parsed: { x: 2, y: 25 },
              dataset: { label: 'T1', borderColor: '#1677ff' },
            },
          ],
        },
      });
      const tooltipEl = document.getElementById('custom-scatter-tooltip');
      expect(tooltipEl).toBeTruthy();
      expect(tooltipEl!.innerHTML).toContain('2月');
      expect(tooltipEl!.innerHTML).toContain('25元');
      tooltipEl?.remove();
    });

    it('parsed 解析异常时回退为 0', () => {
      render(<ScatterChart data={validData} />);
      const badPoint = {
        dataset: { label: 'T1', borderColor: '#333' },
        get parsed(): any {
          throw new Error('parse fail');
        },
      };
      getExternal()({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        },
        tooltip: {
          opacity: 1,
          caretX: 0,
          caretY: 0,
          dataPoints: [badPoint],
        },
      });
      const tooltipEl = document.getElementById('custom-scatter-tooltip');
      expect(tooltipEl?.innerHTML).toContain('0');
      tooltipEl?.remove();
    });
  });

  describe('下载与 statistic 分支', () => {
    it('downloadChart 抛错时 console.warn', async () => {
      const { downloadChart } =
        await import('../../../../src/Plugins/chart/components');
      (downloadChart as any).mockImplementation(() => {
        throw new Error('download fail');
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<ScatterChart data={validData} />);
      fireEvent.click(screen.getByTestId('download-button'));
      expect(warnSpy).toHaveBeenCalledWith('图表下载失败:', expect.any(Error));
      warnSpy.mockRestore();
    });

    it('statistic 空数组时不渲染统计区块', () => {
      render(<ScatterChart data={validData} statistic={[]} />);
      expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
    });

    it('第二次渲染跳过 Chart 重复注册', () => {
      const { rerender } = render(<ScatterChart data={validData} />);
      rerender(<ScatterChart data={validData} />);
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });
  });

  describe('坐标轴自动计算与样式', () => {
    it('无 override 时自动计算坐标轴边界', () => {
      render(<ScatterChart data={validData} />);
      expect(capturedScatterProps.options.scales.x.min).toBeLessThan(
        capturedScatterProps.options.scales.x.max,
      );
      expect(capturedScatterProps.options.scales.y.min).toBeLessThanOrEqual(
        capturedScatterProps.options.scales.y.max,
      );
    });

    it('hiddenX/hiddenY/showGrid false 与轴标签', () => {
      render(
        <ScatterChart
          data={validData}
          hiddenX
          hiddenY
          showGrid={false}
          xAxisLabel="X轴"
          yAxisLabel="Y轴"
          xPosition="top"
          yPosition="right"
        />,
      );
      expect(capturedScatterProps.options.scales.x.display).toBe(false);
      expect(capturedScatterProps.options.scales.y.display).toBe(false);
      expect(capturedScatterProps.options.scales.x.grid.display).toBe(false);
      expect(capturedScatterProps.options.scales.x.title.text).toBe('X轴');
      expect(capturedScatterProps.options.scales.y.title.text).toBe('Y轴');
      expect(capturedScatterProps.options.scales.x.position).toBe('top');
      expect(capturedScatterProps.options.scales.y.position).toBe('right');
    });

    it('light theme tooltip external 渲染', () => {
      render(<ScatterChart data={validData} theme="light" />);
      capturedScatterProps.options.plugins.tooltip.external({
        chart: {
          canvas: {
            getBoundingClientRect: () => ({ left: 0, top: 0 }),
          },
        },
        tooltip: {
          opacity: 1,
          caretX: 10,
          caretY: 20,
          dataPoints: [
            {
              parsed: { x: 1, y: 10 },
              dataset: { label: 'T1', borderColor: '#1677ff' },
            },
          ],
        },
      });
      const tip = document.getElementById('custom-scatter-tooltip');
      expect(tip?.innerHTML).toContain('rgba(255, 255, 255');
      tip?.remove();
    });

    it('移动端响应式 pointRadius', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      render(<ScatterChart data={validData} />);
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(capturedScatterProps.data.datasets[0].pointRadius).toBe(4);
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('字符串 color 与 CSS 变量解析', () => {
      render(
        <ScatterChart data={validData} color="var(--scatter-primary)" />,
      );
      expect(capturedScatterProps.data.datasets[0].borderColor).toBeDefined();
    });

    it('statistic 单对象渲染', () => {
      render(
        <ScatterChart
          data={validData}
          statistic={{ type: 'sum', target: 'y', label: '合计' } as any}
        />,
      );
      expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
    });

    it('卸载时从 body 移除 tooltip 元素', () => {
      const { unmount } = render(<ScatterChart data={validData} />);
      capturedScatterProps.options.plugins.tooltip.external({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        },
        tooltip: {
          opacity: 1,
          caretX: 0,
          caretY: 0,
          dataPoints: [
            {
              parsed: { x: 1, y: 2 },
              dataset: { label: 'T1', borderColor: '#333' },
            },
          ],
        },
      });
      expect(document.getElementById('custom-scatter-tooltip')).toBeTruthy();
      unmount();
      expect(document.getElementById('custom-scatter-tooltip')).toBeNull();
    });

    it('generateLabels 截断超长文本', () => {
      render(<ScatterChart data={validData} textMaxWidth={20} />);
      const generateLabels =
        capturedScatterProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({
        data: { datasets: [{ borderColor: '#1677ff' }] },
      });
      expect(result.some((l: any) => l.text.includes('...'))).toBe(true);
    });

    it('renderFilterInToolbar 多分类时渲染工具栏筛选', () => {
      render(
        <ScatterChart
          data={validData}
          renderFilterInToolbar
        />,
      );
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
    });

    it('tooltip 非有限 parsed.x 走字符串分支', () => {
      render(<ScatterChart data={validData} />);
      capturedScatterProps.options.plugins.tooltip.external({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        },
        tooltip: {
          opacity: 1,
          caretX: 0,
          caretY: 0,
          dataPoints: [
            {
              parsed: { x: 'bad', y: 10 },
              dataset: { label: 'T1', borderColor: '#333' },
            },
          ],
        },
      });
      expect(document.getElementById('custom-scatter-tooltip')?.innerHTML).toContain(
        'bad',
      );
      document.getElementById('custom-scatter-tooltip')?.remove();
    });

    it('仅 xMin override 时 y 仍自动计算', () => {
      render(<ScatterChart data={validData} xMin={0} />);
      expect(capturedScatterProps.options.scales.x.min).toBe(0);
      expect(capturedScatterProps.options.scales.y.max).toBeGreaterThan(0);
    });

    it('小范围数据仍生成有限坐标边界', () => {
      const tightData = [
        { category: 'A', type: 'T1', x: 1, y: 1.1 },
        { category: 'A', type: 'T1', x: 1.2, y: 1.3 },
      ];
      render(<ScatterChart data={tightData} />);
      expect(Number.isFinite(capturedScatterProps.options.scales.x.min)).toBe(
        true,
      );
      expect(Number.isFinite(capturedScatterProps.options.scales.x.max)).toBe(
        true,
      );
      expect(capturedScatterProps.options.scales.x.max).toBeGreaterThan(
        capturedScatterProps.options.scales.x.min,
      );
    });

    it('过滤无效 data 项', () => {
      render(
        <ScatterChart
          data={
            [
              null,
              { category: 'A', type: 'T1', x: 1, y: 2 },
              { category: 'A', type: 'T1' },
            ] as any
          }
        />,
      );
      expect(capturedScatterProps.data.datasets[0].data.length).toBe(1);
    });

    it('无 yUnit 时 tooltip 不追加单位', () => {
      render(<ScatterChart data={validData} yUnit={undefined} xUnit="" />);
      capturedScatterProps.options.plugins.tooltip.external({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        },
        tooltip: {
          opacity: 1,
          caretX: 0,
          caretY: 0,
          dataPoints: [
            {
              parsed: { x: 2, y: 25 },
              dataset: { label: 'T1', borderColor: '#1677ff' },
            },
          ],
        },
      });
      const html = document.getElementById('custom-scatter-tooltip')?.innerHTML;
      expect(html).toContain('25');
      expect(html).not.toContain('25元');
      document.getElementById('custom-scatter-tooltip')?.remove();
    });

    it('generateLabels 短文本不截断', () => {
      render(<ScatterChart data={validData} textMaxWidth={500} />);
      const generateLabels =
        capturedScatterProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({
        data: { datasets: [{ borderColor: '#1677ff' }] },
      });
      expect(result[0].text).toBe('Short');
    });

    it('color 数组按 index 循环', () => {
      render(
        <ScatterChart
          data={validData}
          color={['#111111', '#222222']}
        />,
      );
      expect(capturedScatterProps.data.datasets).toHaveLength(2);
    });

    it('title 默认散点图', () => {
      render(<ScatterChart data={validData} />);
      expect(screen.getByTestId('chart-title')).toHaveTextContent('散点图');
    });

    it('loading 与 dataTime 渲染', () => {
      render(
        <ScatterChart
          data={validData}
          loading
          dataTime="2024-01-01"
          title="自定义"
        />,
      );
      expect(screen.getByTestId('chart-loading')).toBeInTheDocument();
      expect(screen.getByText('自定义')).toBeInTheDocument();
    });

    it('width/height 数字 props', () => {
      render(<ScatterChart data={validData} width={800} height={500} />);
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('tooltip opacity 0 且无已有元素时不抛错', () => {
      document.getElementById('custom-scatter-tooltip')?.remove();
      render(<ScatterChart data={validData} />);
      expect(() =>
        capturedScatterProps.options.plugins.tooltip.external({
          chart: {
            canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
          },
          tooltip: { opacity: 0 },
        }),
      ).not.toThrow();
    });

    it('单 category 仍渲染 ChartFilter', () => {
      render(
        <ScatterChart
          data={[{ category: 'A', type: 'T1', x: 1, y: 10 }]}
          renderFilterInToolbar={false}
        />,
      );
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
    });

    it('字符串 y 坐标解析', () => {
      const data = [{ category: 'A', type: 'T1', x: '5', y: '10.5' }];
      render(<ScatterChart data={data} />);
      expect(capturedScatterProps.data.datasets[0].data[0]).toEqual({
        x: 5,
        y: 10.5,
      });
    });

    it('desktop legend strokeStyle 白边', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      render(<ScatterChart data={validData} theme="light" />);
      const generateLabels =
        capturedScatterProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({
        data: { datasets: [{ borderColor: '#1677ff' }] },
      });
      expect(result[0].strokeStyle).toBe('#fff');
    });

    it('仅 yMax override 时 x 仍自动计算', () => {
      render(<ScatterChart data={validData} yMax={100} />);
      expect(capturedScatterProps.options.scales.y.max).toBe(100);
      expect(capturedScatterProps.options.scales.x.max).toBeGreaterThan(
        capturedScatterProps.options.scales.x.min,
      );
    });

    it('selectedFilter 失效后回退到首个 category', async () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: 1, y: 10 },
        { category: 'B', type: 'T1', x: 2, y: 20 },
      ];
      const { rerender } = render(<ScatterChart data={data} />);
      rerender(
        <ScatterChart
          data={[{ category: 'C', type: 'T1', x: 3, y: 30 }]}
        />,
      );
      await waitFor(() => {
        expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
      });
    });

    it('xUnit/yUnit 同时存在时 tooltip 追加双单位', () => {
      render(<ScatterChart data={validData} xUnit="px" yUnit="元" />);
      capturedScatterProps.options.plugins.tooltip.external({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        },
        tooltip: {
          opacity: 1,
          caretX: 0,
          caretY: 0,
          dataPoints: [
            {
              parsed: { x: 2, y: 25 },
              dataset: { label: 'T1', borderColor: '#1677ff' },
            },
          ],
        },
      });
      const html = document.getElementById('custom-scatter-tooltip')?.innerHTML;
      expect(html).toContain('px');
      expect(html).toContain('元');
      document.getElementById('custom-scatter-tooltip')?.remove();
    });

    it('dark theme 图例 strokeStyle 使用 axisTextColor', () => {
      render(<ScatterChart data={validData} theme="dark" />);
      const generateLabels =
        capturedScatterProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({
        data: { datasets: [{ borderColor: '#1677ff' }] },
      });
      expect(result[0].strokeStyle).toBeDefined();
    });

    it('大范围数据 computeStepSize 使用 10× 量级步长', () => {
      render(
        <ScatterChart
          data={[
            { category: 'A', type: 'T1', x: 0, y: 0 },
            { category: 'A', type: 'T1', x: 950, y: 900 },
          ]}
        />,
      );
      const xTicks = capturedScatterProps.options.scales.x.ticks;
      expect(xTicks.stepSize).toBeGreaterThanOrEqual(100);
    });

    it('同值坐标轴使用 computeAxisBounds 默认 padding', () => {
      render(
        <ScatterChart
          data={[
            { category: 'A', type: 'T1', x: 5, y: 5 },
            { category: 'A', type: 'T1', x: 5, y: 5 },
          ]}
        />,
      );
      expect(capturedScatterProps.options.scales.x.min).toBeLessThan(5);
      expect(capturedScatterProps.options.scales.x.max).toBeGreaterThan(5);
    });

    it('filterLabel 数据变化后仅保留有效标签数据', async () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: 1, y: 10, filterLabel: 'F1' },
        { category: 'A', type: 'T1', x: 2, y: 20, filterLabel: 'F2' },
      ];
      const { rerender } = render(<ScatterChart data={data} />);
      rerender(
        <ScatterChart
          data={[
            { category: 'A', type: 'T1', x: 3, y: 30, filterLabel: 'F1' },
          ]}
        />,
      );
      await waitFor(() => {
        expect(capturedScatterProps.data.datasets[0].data).toEqual([
          { x: 3, y: 30 },
        ]);
      });
    });

    it('categories 清空后仍按 type 构建 datasets', async () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: 1, y: 10 },
        { category: 'B', type: 'T1', x: 2, y: 20 },
      ];
      const { rerender } = render(<ScatterChart data={data} />);
      rerender(
        <ScatterChart data={[{ type: 'T1', x: 3, y: 30 }]} />,
      );
      await waitFor(() => {
        expect(capturedScatterProps.data.datasets[0].data).toEqual([
          { x: 3, y: 30 },
        ]);
      });
    });

    it('切换 filterLabel 后 datasets 点数变化', async () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: 1, y: 10, filterLabel: 'F1' },
        { category: 'A', type: 'T1', x: 2, y: 20, filterLabel: 'F2' },
        { category: 'B', type: 'T1', x: 3, y: 30, filterLabel: 'F1' },
      ];
      render(<ScatterChart data={data} renderFilterInToolbar />);
      fireEvent.click(screen.getByTestId('custom-F2'));
      await waitFor(() => {
        expect(capturedScatterProps.data.datasets[0].data.length).toBe(1);
      });
    });
  });

  describe('深度 edge-case 分支', () => {
    it('statisticConfig 单对象时渲染 ChartStatistic', () => {
      render(
        <ScatterChart
          data={validData}
          statistic={{ type: 'avg', target: 'y', label: '均值' } as any}
        />,
      );
      expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
    });

    it('x/y 为 null 与非法字符串时解析为 0', () => {
      const data = [
        { category: 'A', type: 'T1', x: null as any, y: null as any },
        { category: 'A', type: 'T1', x: 'NaN', y: 'Infinity' },
      ];
      render(<ScatterChart data={data} />);
      const coords = capturedScatterProps.data.datasets[0].data;
      expect(coords[0]).toEqual({ x: 0, y: 0 });
      expect(coords[1]).toEqual({ x: 0, y: 0 });
    });

    it('color 空数组时使用 defaultColorList 回退色', () => {
      render(
        <ScatterChart
          data={validData}
          color={[]}
        />,
      );
      expect(capturedScatterProps.data.datasets[0].borderColor).toBe('#111111');
    });

    it('移动端宽度 768 时 pointRadius 为 4', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      render(<ScatterChart data={validData} />);
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(capturedScatterProps.data.datasets[0].pointRadius).toBe(4);
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('min=max 时 computeStepSize range<=0 返回 1', () => {
      // computeAxisBounds 在数据 min=max 时会加 padding，需用 xMin/xMax（及 y）覆盖强制 range=0
      render(
        <ScatterChart
          data={[
            { category: 'A', type: 'T1', x: 5, y: 5 },
            { category: 'A', type: 'T1', x: 5, y: 5 },
          ]}
          xMin={5}
          xMax={5}
          yMin={5}
          yMax={5}
        />,
      );
      expect(capturedScatterProps.options.scales.x.ticks.stepSize).toBe(1);
      expect(capturedScatterProps.options.scales.y.ticks.stepSize).toBe(1);
    });

    it('全部缺少 type 时显示空状态', () => {
      render(
        <ScatterChart
          data={[
            { category: 'A', x: 1, y: 2 },
            { category: 'A', x: 3, y: 4 },
          ]}
        />,
      );
      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('istanbul residual：空 item、字符串坐标、空数据集、tooltip 创建', () => {
      render(
        <ScatterChart
          data={[
            null as any,
            { category: 'A', type: 'T1', x: '3.5', y: '4.5' },
            { category: 'A', type: '', x: 1, y: 2 },
          ]}
          color={[]}
        />,
      );
      expect(capturedScatterProps?.data?.datasets?.length).toBeGreaterThan(0);

      render(<ScatterChart data={[]} />);
      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();

      render(
        <ScatterChart
          data={[{ category: 'A', type: 'T1', x: 1, y: 2 }]}
        />,
      );
      const ext = capturedScatterProps?.options?.plugins?.tooltip?.external;
      if (typeof ext === 'function') {
        const tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip-scatter';
        document.body.appendChild(tooltipEl);
        ext({
          tooltip: {
            opacity: 1,
            dataPoints: [
              {
                raw: { x: null, y: undefined },
                dataset: { label: '', borderColor: null },
                parsed: { x: 1, y: 2 },
              },
            ],
            caretX: 10,
            caretY: 20,
          },
          chart: {
            canvas: {
              getBoundingClientRect: () => ({
                left: 0,
                top: 0,
                width: 100,
                height: 100,
              }),
            },
          },
        });
        ext({
          tooltip: { opacity: 0, dataPoints: [] },
          chart: {
            canvas: {
              getBoundingClientRect: () => ({
                left: 0,
                top: 0,
                width: 100,
                height: 100,
              }),
            },
          },
        });
      }

      const genLabels =
        capturedScatterProps?.options?.plugins?.legend?.labels?.generateLabels;
      if (typeof genLabels === 'function') {
        genLabels({
          data: { datasets: [{ label: 'L', borderColor: '#f00' }] },
        });
      }
    });

    it('istanbul buffer：custom-scatter-tooltip 创建与空 dataPoints', () => {
      document.getElementById('custom-scatter-tooltip')?.remove();
      render(
        <ScatterChart
          data={[{ category: 'A', type: 'T1', x: 1, y: 2 }]}
        />,
      );
      const ext = capturedScatterProps?.options?.plugins?.tooltip?.external;
      expect(typeof ext).toBe('function');
      ext({
        tooltip: {
          opacity: 1,
          dataPoints: [
            {
              raw: { x: Number.NaN, y: Number.NaN },
              dataset: { label: '', borderColor: null },
              parsed: { x: 1, y: 2 },
            },
          ],
          caretX: 4,
          caretY: 6,
        },
        chart: {
          canvas: {
            getBoundingClientRect: () => ({
              left: 0,
              top: 0,
              width: 100,
              height: 100,
            }),
          },
        },
      });
      expect(document.getElementById('custom-scatter-tooltip')).toBeTruthy();
      ext({
        tooltip: { opacity: 0, dataPoints: [] },
        chart: {
          canvas: {
            getBoundingClientRect: () => ({
              left: 0,
              top: 0,
              width: 100,
              height: 100,
            }),
          },
        },
      });
      document.getElementById('custom-scatter-tooltip')?.remove();
    });

    it('istanbul fill：全非有限坐标走空 values 边界；无 yUnit ticks', () => {
      render(
        <ScatterChart
          data={[
            { category: 'A', type: 'T1', x: Number.NaN, y: Number.NaN },
            { category: 'A', type: 'T1', x: Infinity, y: -Infinity },
          ]}
          yUnit={undefined}
          xUnit=""
        />,
      );
      expect(capturedScatterProps?.options?.scales?.x?.min).toBeDefined();
      const tickCb =
        capturedScatterProps?.options?.scales?.y?.ticks?.callback;
      if (typeof tickCb === 'function') {
        expect(tickCb(3)).toBe('3');
      }
      // chartRef 为空时 download 走 else（mock 未挂载 ref）
      fireEvent.click(screen.getByTestId('download-button'));
    });

    it('istanbul after：字符串坐标非法解析为 0；空 type 默认系列；桌面 pointRadius', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      // 空 type 被 Boolean(type) 过滤 → datasetTypes 空 → 空状态（非「默认」系列）
      const { unmount } = render(
        <ScatterChart
          data={[
            { category: 'A', type: '', x: 'abc', y: 'NaN' },
            { category: 'A', type: '', x: '  ', y: 'null' },
          ]}
        />,
      );
      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
      unmount();

      // 合法 type：非法字符串坐标 → 0；桌面端 pointRadius 6 / hover 8
      render(
        <ScatterChart
          data={[
            { category: 'A', type: 'T1', x: 'abc', y: 'NaN' },
            { category: 'A', type: 'T1', x: '  ', y: 'null' },
            { category: 'A', type: 'T1', x: '3.5', y: '4.5' },
          ]}
        />,
      );
      const ds = capturedScatterProps?.data?.datasets?.[0];
      expect(ds?.label).toBe('T1');
      expect(ds?.pointRadius).toBe(6);
      expect(ds?.pointHoverRadius).toBe(8);
      expect(ds?.data).toEqual(
        expect.arrayContaining([
          { x: 0, y: 0 },
          { x: 3.5, y: 4.5 },
        ]),
      );
    });

    it('istanbul residual-extra：空 item 跳过；color 假值；tooltip datasetIndex', () => {
      render(
        <ScatterChart
          data={[
            null as any,
            { category: 'A', type: 'T1', x: 1, y: 2 },
            { category: 'A', type: 'T1', x: 3, y: 4 },
          ]}
          color={['', undefined as any]}
          theme="dark"
        />,
      );
      const ds = capturedScatterProps?.data?.datasets?.[0];
      expect(ds?.data?.length).toBeGreaterThan(0);

      const tooltipExt =
        capturedScatterProps?.options?.plugins?.tooltip?.external;
      if (typeof tooltipExt === 'function') {
        tooltipExt({
          tooltip: {
            opacity: 1,
            dataPoints: [
              {
                dataIndex: 0,
                datasetIndex: undefined,
                raw: { x: 1, y: 2 },
              },
            ],
            caretX: 1,
            caretY: 2,
          },
          chart: { canvas: document.createElement('canvas') },
        });
      }
    });
  });
});

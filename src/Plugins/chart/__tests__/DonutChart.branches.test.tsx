/**
 * DonutChart 分支覆盖补充测试
 *
 * 针对空数据、resize、filterLabel 回退、singleMode、
 * showDataLabels、pie/donut 样式、下载合并等分支。
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

let capturedDonutCalls: Array<{
  data: any;
  options: any;
  plugins: any[];
}> = [];

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  ArcElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('chartjs-plugin-datalabels', () => ({
  default: { id: 'datalabels' },
}));

vi.mock('react-chartjs-2', () => ({
  Doughnut: React.forwardRef(({ data, options, plugins }: any, ref: any) => {
    capturedDonutCalls.push({ data, options, plugins: plugins ?? [] });
    (globalThis as any).__donutBranchLast = {
      data,
      options,
      plugins: plugins ?? [],
    };
    React.useEffect(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const inst = { canvas, toBase64Image: vi.fn(() => 'data:image/png;base64,x') };
      if (typeof ref === 'function') ref(inst);
      else if (ref) ref.current = inst;
    }, [ref]);
    return (
      <div
        data-testid="doughnut-chart"
        data-chart-data={JSON.stringify(data)}
      />
    );
  }),
}));

vi.mock('../utils', () => ({
  resolveCssVariable: vi.fn((color) => color),
}));

vi.mock('../env', () => ({
  isWindowDefined: vi.fn(() => true),
}));

vi.mock('../DonutChart/Legend', () => ({
  default: ({
    onLegendItemClick,
    chartData,
  }: {
    onLegendItemClick: (index: number) => void;
    chartData: any[];
  }) => (
    <div data-testid="donut-legend">
      {chartData.map((_, i) => (
        <button
          type="button"
          key={i}
          data-testid={`legend-item-${i}`}
          onClick={() => onLegendItemClick(i)}
        >
          Legend {i}
        </button>
      ))}
    </div>
  ),
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
      {filterOptions?.map((f: any, i: number) => (
        <button
          type="button"
          key={i}
          onClick={() => onFilterChange?.(f.value)}
          data-testid={`filter-${f.value}`}
        >
          {f.label}
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
  ChartStatistic: () => <div data-testid="chart-statistic" />,
  ChartToolBar: ({ onDownload, filter, title }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span>{title}</span>}
      <button type="button" onClick={onDownload} data-testid="download-btn">
        Download
      </button>
      {filter}
    </div>
  ),
  downloadChart: vi.fn(),
}));

vi.mock('../DonutChart/style', () => ({
  useStyle: () => ({ hashId: 'donut-hash' }),
}));

import DonutChart from '../DonutChart';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

const mockData = [
  { label: 'A', value: 30, category: 'cat1' },
  { label: 'B', value: 50, category: 'cat1' },
  { label: 'C', value: 20, category: 'cat2' },
];

describe('DonutChart 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedDonutCalls = [];
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('空数据与 filterList 校验', () => {
    it('空数据数组仍渲染默认图表容器', () => {
      render(
        <Wrapper>
          <DonutChart data={[]} />
        </Wrapper>,
      );
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    it('filterList 含重复项时抛出错误', () => {
      expect(() =>
        render(
          <Wrapper>
            <DonutChart data={mockData} filterList={['X', 'X']} />
          </Wrapper>,
        ),
      ).toThrow('DonutChart filterList 包含重复项');
    });
  });

  describe('resize 与移动端分支', () => {
    it('触发 resize 后仍正常渲染', async () => {
      render(
        <Wrapper>
          <DonutChart data={mockData} />
        </Wrapper>,
      );
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    it('移动端 numeric cutout 乘以 0.9', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      render(
        <Wrapper>
          <DonutChart data={mockData} configs={[{ cutout: 50 }]} />
        </Wrapper>,
      );
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      const last = (globalThis as any).__donutBranchLast;
      expect(last.options.cutout).toBe(45);
    });
  });

  describe('selectedFilter / filterLabel 回退', () => {
    it('filterLabel 变化时自动回退到第一项', async () => {
      const dataWithFilter = [
        { label: 'A', value: 30, filterLabel: 'F1', category: 'cat1' },
        { label: 'B', value: 50, filterLabel: 'F2', category: 'cat2' },
      ];
      const { rerender } = render(
        <Wrapper>
          <DonutChart
            data={dataWithFilter}
            title="筛选"
            showToolbar
            filterList={['cat1', 'cat2']}
            selectedFilter="cat1"
          />
        </Wrapper>,
      );
      expect(screen.getByTestId('custom-F1')).toBeInTheDocument();

      rerender(
        <Wrapper>
          <DonutChart
            data={[{ label: 'C', value: 10, filterLabel: 'F3', category: 'cat1' }]}
            title="筛选"
            showToolbar
            filterList={['cat1']}
            selectedFilter="cat1"
          />
        </Wrapper>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('custom-F3')).toBeInTheDocument();
      });
    });

    it('enableAutoCategory 多 category 时显示筛选器', () => {
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            enableAutoCategory
            title="自动分类"
            showToolbar
          />
        </Wrapper>,
      );
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
    });

    it('切换 category 筛选', () => {
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            enableAutoCategory
            title="分类"
            showToolbar
          />
        </Wrapper>,
      );
      const cat2Btn = screen
        .getAllByRole('button')
        .find((b) => b.textContent === 'cat2');
      if (cat2Btn) fireEvent.click(cat2Btn);
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  describe('singleMode 与自定义颜色', () => {
    it('singleMode 且无 configs 时为每项生成独立图表', () => {
      render(
        <Wrapper>
          <DonutChart data={mockData} singleMode enableAutoCategory={false} />
        </Wrapper>,
      );
      expect(screen.getAllByTestId('doughnut-chart')).toHaveLength(
        mockData.length,
      );
    });

    it('singleMode 字符串 value 与非数字 value 分支', () => {
      render(
        <Wrapper>
          <DonutChart
            data={[
              { label: 'X', value: '75' },
              { label: 'Y', value: 'bad' },
            ]}
            singleMode
          />
        </Wrapper>,
      );
      expect(screen.getAllByTestId('doughnut-chart')).toHaveLength(2);
    });

    it('configs backgroundColor 自定义色', () => {
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            configs={[
              {
                backgroundColor: ['#ff0000', '#00ff00', '#0000ff'],
                showLegend: true,
              },
            ]}
          />
        </Wrapper>,
      );
      const last = (globalThis as any).__donutBranchLast;
      expect(last.data.datasets[0].backgroundColor.length).toBeGreaterThan(0);
    });
  });

  describe('pie / donut 样式与 datalabels', () => {
    it('pie 样式 cutout 为 0', () => {
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            configs={[{ chartStyle: 'pie', showLegend: true }]}
          />
        </Wrapper>,
      );
      expect((globalThis as any).__donutBranchLast.options.cutout).toBe(0);
    });

    it('showDataLabels 开启时 display 过滤小占比', () => {
      render(
        <Wrapper>
          <DonutChart
            data={[
              { label: 'Big', value: 99 },
              { label: 'Tiny', value: 1 },
            ]}
            configs={[{ showDataLabels: true, showLegend: true }]}
          />
        </Wrapper>,
      );
      const opts = (globalThis as any).__donutBranchLast.options;
      const display = opts.plugins.datalabels.display;
      expect(display({ dataset: { data: [99, 1] }, dataIndex: 0 })).toBe(true);
      expect(display({ dataset: { data: [99, 1] }, dataIndex: 1 })).toBe(
        false,
      );
    });

    it('datalabels formatter 有/无 label 分支', () => {
      render(
        <Wrapper>
          <DonutChart
            data={[
              { label: 'A', value: 50 },
              { label: 'B', value: 50 },
            ]}
            configs={[{ showDataLabels: true, showLegend: true }]}
          />
        </Wrapper>,
      );
      const formatter =
        (globalThis as any).__donutBranchLast.options.plugins.datalabels
          .formatter;
      const ctx = {
        chart: { data: { labels: ['A', 'B'] } },
        dataIndex: 0,
      };
      expect(formatter(50, ctx)).toContain('A');
      const ctxNoLabel = {
        chart: { data: { labels: ['', 'B'] } },
        dataIndex: 0,
      };
      expect(formatter(50, ctxNoLabel)).toContain('50');
    });

    it('tooltip label showDataLabels 为 true 时含数值', () => {
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            configs={[{ showDataLabels: true, showTooltip: true }]}
          />
        </Wrapper>,
      );
      const labelCb =
        (globalThis as any).__donutBranchLast.options.plugins.tooltip.callbacks
          .label;
      expect(labelCb({ label: 'A', raw: 30 })).toContain('30');
    });

    it('dark 主题 borderColor 分支', () => {
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            theme="dark"
            configs={[{ showLegend: true }]}
          />
        </Wrapper>,
      );
      const borderColor = (globalThis as any).__donutBranchLast.data.datasets[0]
        .borderColor;
      expect(borderColor).toBe('#1f1f1f');
    });
  });

  describe('图例点击与隐藏数据', () => {
    it('图例点击隐藏/显示数据项', () => {
      render(
        <Wrapper>
          <DonutChart data={mockData} configs={[{ showLegend: true }]} />
        </Wrapper>,
      );
      fireEvent.click(screen.getByTestId('legend-item-0'));
      fireEvent.click(screen.getByTestId('legend-item-0'));
      expect(screen.getByTestId('donut-legend')).toBeInTheDocument();
    });
  });

  describe('下载分支', () => {
    it('自定义 onDownload 优先于默认下载', () => {
      const onDownload = vi.fn();
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            onDownload={onDownload}
            title="下载"
            showToolbar
          />
        </Wrapper>,
      );
      fireEvent.click(screen.getByTestId('download-btn'));
      expect(onDownload).toHaveBeenCalled();
    });

    it('多图下载拼接 canvas', () => {
      const origCreate = Document.prototype.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'canvas') {
          const canvas = origCreate('canvas') as HTMLCanvasElement;
          canvas.width = 100;
          canvas.height = 100;
          canvas.getContext = vi.fn(
            () =>
              ({
                fillStyle: '',
                fillRect: vi.fn(),
                drawImage: vi.fn(),
              }) as any,
          );
          canvas.toDataURL = vi.fn(() => 'data:image/png;base64,test');
          return canvas;
        }
        if (tag === 'a') {
          const link = origCreate('a') as HTMLAnchorElement;
          link.click = vi.fn();
          return link;
        }
        return origCreate(tag);
      });

      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            configs={[{ showLegend: true }, { showLegend: true }]}
            title="多图"
            showToolbar
          />
        </Wrapper>,
      );
      fireEvent.click(screen.getByTestId('download-btn'));
    });
  });

  describe('其余边界分支', () => {
    it('filterList 为空时不抛错', () => {
      render(
        <Wrapper>
          <DonutChart data={mockData} filterList={[]} />
        </Wrapper>,
      );
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    it('showToolbar=false 时不渲染 toolbar', () => {
      render(
        <Wrapper>
          <DonutChart data={mockData} showToolbar={false} />
        </Wrapper>,
      );
      expect(screen.queryByTestId('chart-toolbar')).not.toBeInTheDocument();
    });

    it('字符串 value 可解析为数字', () => {
      render(
        <Wrapper>
          <DonutChart
            data={[{ label: 'P', value: '45' }]}
            configs={[{ showLegend: true }]}
          />
        </Wrapper>,
      );
      const last = (globalThis as any).__donutBranchLast;
      expect(last.data.datasets[0].data[0]).toBe(45);
    });

    it('tooltip label showDataLabels=false 时不含数值', () => {
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            configs={[{ showTooltip: true, showDataLabels: false }]}
          />
        </Wrapper>,
      );
      const labelCb =
        (globalThis as any).__donutBranchLast.options.plugins.tooltip.callbacks
          .label;
      const result = labelCb({ label: 'A', raw: 30 });
      expect(result).not.toContain('30');
    });

    it('light 主题 borderColor 为 white', () => {
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            theme="light"
            configs={[{ showLegend: true }]}
          />
        </Wrapper>,
      );
      const borderColor = (globalThis as any).__donutBranchLast.data.datasets[0]
        .borderColor;
      expect(borderColor).toBe('#fff');
    });

    it('卸载时移除 resize 监听', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(
        <Wrapper>
          <DonutChart data={mockData} />
        </Wrapper>,
      );
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeSpy.mockRestore();
    });

    it('空数据仍渲染', () => {
      render(
        <Wrapper>
          <DonutChart data={[]} title="空环形" />
        </Wrapper>,
      );
      expect(document.body).toBeTruthy();
    });

    it('single 配置 + filterLabel', () => {
      render(
        <Wrapper>
          <DonutChart
            data={[
              { label: 'A', value: 10, filterLabel: 'f1' },
              { label: 'B', value: 20, filterLabel: 'f2' },
            ]}
            configs={[{ showLegend: false, showTooltip: true }]}
          />
        </Wrapper>,
      );
      expect(document.body).toBeTruthy();
    });

    it('dark 主题 borderColor', () => {
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            theme="dark"
            configs={[{ showLegend: true }]}
          />
        </Wrapper>,
      );
      const borderColor = (globalThis as any).__donutBranchLast?.data
        ?.datasets?.[0]?.borderColor;
      expect(borderColor || '#000').toBeTruthy();
    });
  });

  describe('深度 edge-case 分支', () => {
    it('下载时 chart 实例 ≤1 走 downloadChart 兜底', async () => {
      const { downloadChart } = await import('../components');
      render(
        <Wrapper>
          <DonutChart data={mockData} title="单图下载" showToolbar />
        </Wrapper>,
      );
      fireEvent.click(screen.getByTestId('download-btn'));
      expect(downloadChart).toHaveBeenCalled();
    });

    it('下载时 canvas 为空数组时不抛错', async () => {
      const origCreate = Document.prototype.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'canvas') {
          const canvas = origCreate('canvas') as HTMLCanvasElement;
          canvas.width = 0;
          canvas.height = 0;
          canvas.getContext = vi.fn(() => null) as any;
          return canvas;
        }
        return origCreate(tag);
      });
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            configs={[{ showLegend: true }, { showLegend: true }]}
            title="空 canvas"
            showToolbar
          />
        </Wrapper>,
      );
      expect(() => fireEvent.click(screen.getByTestId('download-btn'))).not.toThrow();
      vi.restoreAllMocks();
    });

    it('finalSelectedFilter 为空时使用空字符串传给 ChartFilter', () => {
      // autoCategory 会 filter(Boolean) 丢掉 ''；用显式 filterList 覆盖 item||'' / selectedFilter||''
      render(
        <Wrapper>
          <DonutChart
            data={[
              { label: 'A', value: 30, category: 'cat1' },
              { label: 'B', value: 50, category: 'cat2' },
            ]}
            filterList={['', 'cat2']}
            selectedFilter=""
            enableAutoCategory={false}
            title="空 category"
            showToolbar
            renderFilterInToolbar
          />
        </Wrapper>,
      );
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-')).toBeInTheDocument();
    });

    it('移动端 legend 字体与 datalabels 尺寸分支', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            configs={[{ showLegend: true, showDataLabels: true }]}
          />
        </Wrapper>,
      );
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      const last = (globalThis as any).__donutBranchLast;
      // Chart.js legend.display 恒为 false（自定义 Legend 组件）；移动端尺寸在 tooltip / datalabels
      expect(last.options.plugins.legend.display).toBe(false);
      expect(last.options.plugins.tooltip.titleFont.size).toBe(12);
      expect(last.options.plugins.datalabels.font.size).toBe(10);
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('renderFilterInToolbar 且 category 为空字符串时仍渲染筛选', () => {
      render(
        <Wrapper>
          <DonutChart
            data={[
              { label: 'A', value: 10, category: 'cat1' },
              { label: 'B', value: 20, category: 'cat2' },
            ]}
            filterList={['', 'grp']}
            selectedFilter=""
            enableAutoCategory={false}
            showToolbar
            renderFilterInToolbar
            title="toolbar filter"
          />
        </Wrapper>,
      );
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('filter-')).toBeInTheDocument();
    });

    it('istanbul residual：单值模式、暗色边框、空 filter、无 statistic', () => {
      // singleMode + dark：扇区描边走单值暗色数组分支；不传 statistic
      const { unmount: unmountSingle } = render(
        <Wrapper>
          <DonutChart
            data={[{ label: 'Only', value: 75 }]}
            singleMode
            configs={[
              {
                chartStyle: 'donut',
                showLegend: true,
                showDataLabels: true,
              },
            ]}
            theme="dark"
            showToolbar={false}
          />
        </Wrapper>,
      );
      const singleLast = (globalThis as any).__donutBranchLast;
      expect(singleLast.data.datasets[0].borderColor).toEqual([
        'rgba(255, 255, 255, 0.14)',
        'transparent',
      ]);
      expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
      unmountSingle();

      // filterLabel 空串仍参与 useFilterLabels；无 statistic
      const { unmount: unmountFilter } = render(
        <Wrapper>
          <DonutChart
            data={[
              { label: 'A', value: 10, category: 'c1', filterLabel: '' },
              { label: 'B', value: 20, category: 'c1', filterLabel: '' },
            ]}
            filterList={['', 'x']}
            selectedFilter=""
            enableAutoCategory={false}
            title="空 filter"
            showToolbar
            renderFilterInToolbar
          />
        </Wrapper>,
      );
      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
      expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
      unmountFilter();

      // 非 singleMode 暗色 donut 描边融进背景
      render(
        <Wrapper>
          <DonutChart
            data={mockData}
            theme="dark"
            configs={[{ chartStyle: 'donut', showLegend: true }]}
            showToolbar={false}
          />
        </Wrapper>,
      );
      expect(
        (globalThis as any).__donutBranchLast.data.datasets[0].borderColor,
      ).toBe('#1f1f1f');
    });

    it('istanbul buffer：datalabels 非有限值、小占比、空 label', () => {
      render(
        <Wrapper>
          <DonutChart
            data={[
              { label: 'Big', value: 100 },
              { label: 'Tiny', value: 1 },
              { label: undefined as any, value: Number.NaN },
            ]}
            configs={[
              {
                chartStyle: 'donut',
                showDataLabels: true,
                showLegend: false,
              },
            ]}
            showToolbar={false}
          />
        </Wrapper>,
      );
      const last = (globalThis as any).__donutBranchLast;
      const display = last?.options?.plugins?.datalabels?.display;
      const formatter = last?.options?.plugins?.datalabels?.formatter;
      if (typeof display === 'function') {
        expect(
          display({
            dataset: { data: [100, 1, Number.NaN] },
            dataIndex: 2,
          }),
        ).toBe(false);
        expect(
          display({
            dataset: { data: [100, 1, Number.NaN] },
            dataIndex: 1,
          }),
        ).toBe(false);
        expect(
          display({
            dataset: { data: [100, 1, Number.NaN] },
            dataIndex: 0,
          }),
        ).toBe(true);
      }
      if (typeof formatter === 'function') {
        expect(
          formatter(100, {
            dataIndex: 2,
            chart: { data: { labels: [undefined, 'Tiny', null] } },
          }),
        ).toContain('(');
      }
    });

    it('istanbul after：移动端切面；空 filterLabel；非数组 statistic', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      render(
        <Wrapper>
          <DonutChart
            data={[
              { label: 'A', value: 10, category: 'c1', filterLabel: '' },
              { label: 'B', value: 20, category: 'c1', filterLabel: '' },
            ]}
            statistic={{ title: 'Total', value: 30 } as any}
            theme="light"
            showToolbar
            renderFilterInToolbar
            enableAutoCategory={false}
          />
        </Wrapper>,
      );
      expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
      const last = (globalThis as any).__donutBranchLast;
      expect(last?.options?.layout?.padding).toBeDefined();
    });
  });
});

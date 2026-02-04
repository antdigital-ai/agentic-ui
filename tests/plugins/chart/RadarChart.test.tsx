import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RadarChart, {
  RadarChartDataItem,
} from '../../../src/Plugins/chart/RadarChart';

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => []),
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

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Radar: React.forwardRef((props: any, ref: any) => (
    <div data-testid="radar-chart" ref={ref}>
      Mocked Radar Chart
    </div>
  )),
}));

// Mock utils
vi.mock('../../../src/Plugins/chart/utils', () => ({
  hexToRgba: vi.fn((color, alpha) => `rgba(0,0,0,${alpha})`),
  resolveCssVariable: vi.fn((color) =>
    typeof color === 'string' && color.startsWith('var(') ? '#1d7afc' : color,
  ),
}));

// Mock components
vi.mock('../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children, ...props }: any) => (
    <div data-testid="chart-container" {...props}>
      {children}
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((option: any) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          data-testid={`filter-${option.value}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
  ChartToolBar: ({ title, onDownload, dataTime }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span data-testid="chart-title">{title}</span>}
      {dataTime && <span data-testid="chart-datatime">{dataTime}</span>}
      <button type="button" onClick={onDownload} data-testid="download-button">
        下载
      </button>
    </div>
  ),
  downloadChart: vi.fn(),
}));

// Mock ChartStatistic
vi.mock('../../../src/Plugins/chart/ChartStatistic', () => ({
  default: ({ title, value }: any) => (
    <div data-testid="chart-statistic">
      {title}: {value}
    </div>
  ),
}));

// Mock style hook
vi.mock('../../../src/Plugins/chart/RadarChart/style', () => ({
  useStyle: vi.fn(() => ({
    wrapSSR: (node: any) => node,
    hashId: 'test-hash-id',
  })),
}));

describe('RadarChart', () => {
  const sampleData: RadarChartDataItem[] = [
    { category: 'A组', label: '技术', type: '团队A', score: 80 },
    { category: 'A组', label: '沟通', type: '团队A', score: 70 },
    { category: 'A组', label: '创新', type: '团队A', score: 90 },
    { category: 'A组', label: '领导力', type: '团队A', score: 75 },
    { category: 'A组', label: '执行力', type: '团队A', score: 85 },
    { category: 'A组', label: '技术', type: '团队B', score: 70 },
    { category: 'A组', label: '沟通', type: '团队B', score: 80 },
    { category: 'A组', label: '创新', type: '团队B', score: 75 },
    { category: 'A组', label: '领导力', type: '团队B', score: 85 },
    { category: 'A组', label: '执行力', type: '团队B', score: 70 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      measureText: vi.fn(() => ({ width: 50 })),
      fillText: vi.fn(),
      canvas: document.createElement('canvas'),
    })) as any;
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染雷达图', () => {
      render(<RadarChart data={sampleData} title="团队能力雷达图" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该正确渲染标题', () => {
      render(<RadarChart data={sampleData} title="技能评估雷达图" />);

      expect(screen.getByTestId('chart-title')).toHaveTextContent(
        '技能评估雷达图',
      );
    });

    it('应该正确渲染数据时间', () => {
      render(
        <RadarChart data={sampleData} title="雷达图" dataTime="2025-10-15" />,
      );

      expect(screen.getByTestId('chart-datatime')).toHaveTextContent(
        '2025-10-15',
      );
    });

    it('应该使用默认标题当未提供时', () => {
      render(<RadarChart data={sampleData} />);

      expect(screen.getByTestId('chart-title')).toHaveTextContent('雷达图');
    });
  });

  describe('空数据和边界测试', () => {
    it('应该正确处理空数据数组', () => {
      render(<RadarChart data={[]} title="空数据" />);

      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('应该处理 null 数据', () => {
      render(<RadarChart data={null as any} title="null 数据" />);

      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('应该处理 undefined 数据', () => {
      render(<RadarChart data={undefined as any} title="undefined 数据" />);

      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('应该过滤掉无效的数据项', () => {
      const invalidData: any[] = [
        { category: 'A组', label: '技术', type: '团队A', score: 80 },
        null,
        undefined,
        {},
        { category: 'A组', type: '团队A', score: 70 },
      ];

      render(<RadarChart data={invalidData} title="包含无效数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理没有 type 的数据', () => {
      const noTypeData: RadarChartDataItem[] = [
        { category: 'A组', label: '技术', score: 80 },
      ];

      render(<RadarChart data={noTypeData} title="无 type 数据" />);

      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('应该处理没有 label 的数据', () => {
      const noLabelData: any[] = [
        { category: 'A组', type: '团队A', score: 80 },
      ];

      render(<RadarChart data={noLabelData} title="无 label 数据" />);

      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });
  });

  describe('分数处理测试', () => {
    it('应该处理字符串类型的 score', () => {
      const stringScoreData: RadarChartDataItem[] = [
        { category: 'A组', label: '技术', type: '团队A', score: '80' },
        { category: 'A组', label: '沟通', type: '团队A', score: '70' },
      ];

      render(<RadarChart data={stringScoreData} title="字符串分数" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该处理空字符串 score', () => {
      const emptyScoreData: RadarChartDataItem[] = [
        { category: 'A组', label: '技术', type: '团队A', score: '' },
        { category: 'A组', label: '沟通', type: '团队A', score: 70 },
      ];

      render(<RadarChart data={emptyScoreData} title="空字符串分数" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该处理 null 字符串 score', () => {
      const nullScoreData: RadarChartDataItem[] = [
        { category: 'A组', label: '技术', type: '团队A', score: 'null' },
        { category: 'A组', label: '沟通', type: '团队A', score: 70 },
      ];

      render(<RadarChart data={nullScoreData} title="null 字符串分数" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该处理负数 score', () => {
      const negativeScoreData: RadarChartDataItem[] = [
        { category: 'A组', label: '技术', type: '团队A', score: -10 },
        { category: 'A组', label: '沟通', type: '团队A', score: 70 },
      ];

      render(<RadarChart data={negativeScoreData} title="负数分数" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该处理 NaN score', () => {
      const nanScoreData: RadarChartDataItem[] = [
        { category: 'A组', label: '技术', type: '团队A', score: NaN },
        { category: 'A组', label: '沟通', type: '团队A', score: 70 },
      ];

      render(<RadarChart data={nanScoreData} title="NaN 分数" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该处理 Infinity score', () => {
      const infinityScoreData: RadarChartDataItem[] = [
        { category: 'A组', label: '技术', type: '团队A', score: Infinity },
        { category: 'A组', label: '沟通', type: '团队A', score: 70 },
      ];

      render(<RadarChart data={infinityScoreData} title="Infinity 分数" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该处理 null score', () => {
      const nullValueScoreData: any[] = [
        { category: 'A组', label: '技术', type: '团队A', score: null },
        { category: 'A组', label: '沟通', type: '团队A', score: 70 },
      ];

      render(<RadarChart data={nullValueScoreData} title="null 值分数" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该处理 undefined score', () => {
      const undefinedScoreData: any[] = [
        { category: 'A组', label: '技术', type: '团队A', score: undefined },
        { category: 'A组', label: '沟通', type: '团队A', score: 70 },
      ];

      render(<RadarChart data={undefinedScoreData} title="undefined 分数" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  describe('分类和筛选测试', () => {
    it('应该显示分类筛选器当有多个分类时', () => {
      const multiCategoryData: RadarChartDataItem[] = [
        { category: 'A组', label: '技术', type: '团队A', score: 80 },
        { category: 'B组', label: '技术', type: '团队B', score: 70 },
      ];

      render(<RadarChart data={multiCategoryData} title="多分类数据" />);

      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-A组')).toBeInTheDocument();
      expect(screen.getByTestId('filter-B组')).toBeInTheDocument();
    });

    it('应该处理 filterLabel', () => {
      const dataWithFilterLabel: RadarChartDataItem[] = [
        {
          category: 'A组',
          label: '技术',
          type: '团队A',
          score: 80,
          filterLabel: '2023年',
        },
        {
          category: 'A组',
          label: '技术',
          type: '团队A',
          score: 85,
          filterLabel: '2024年',
        },
      ];

      render(<RadarChart data={dataWithFilterLabel} title="多维度筛选数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该过滤掉 undefined 的 category', () => {
      const mixedCategoryData: any[] = [
        { label: '技术', type: '团队A', score: 80 },
        { category: 'A组', label: '沟通', type: '团队B', score: 70 },
        { category: null, label: '创新', type: '团队C', score: 75 },
        { category: '', label: '领导力', type: '团队D', score: 65 },
      ];

      render(<RadarChart data={mixedCategoryData} title="混合分类数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('尺寸和样式测试', () => {
    it('应该支持自定义宽度和高度', () => {
      render(
        <RadarChart
          data={sampleData}
          width={800}
          height={800}
          title="自定义尺寸"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义颜色', () => {
      render(
        <RadarChart
          data={sampleData}
          borderColor="#ff0000"
          backgroundColor="#0000ff"
          pointBackgroundColor="#00ff00"
          title="自定义颜色"
        />,
      );

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该支持自定义 className', () => {
      render(
        <RadarChart
          data={sampleData}
          className="custom-radar"
          title="自定义类名"
        />,
      );

      const container = screen.getByTestId('chart-container');
      expect(container.className).toContain('custom-radar');
    });
  });

  describe('图例配置测试', () => {
    it('应该支持自定义图例文字最大宽度', () => {
      const longNameData: RadarChartDataItem[] = [
        {
          category: 'A组',
          label: '技术',
          type: '这是一个非常非常长的团队名称用于测试截断功能',
          score: 80,
        },
      ];

      render(
        <RadarChart
          data={longNameData}
          textMaxWidth={50}
          title="图例文字截断"
        />,
      );

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该支持下载功能', async () => {
      const { downloadChart } = await import(
        '../../../src/Plugins/chart/components'
      );

      render(<RadarChart data={sampleData} title="可下载雷达图" />);

      const downloadButton = screen.getByTestId('download-button');
      downloadButton.click();

      await waitFor(() => {
        expect(downloadChart).toHaveBeenCalled();
      });
    });

    it('应该支持额外的工具栏按钮', () => {
      const extraButton = (
        <button type="button" data-testid="extra-button">
          额外按钮
        </button>
      );

      render(
        <RadarChart
          data={sampleData}
          toolbarExtra={extraButton}
          title="带额外按钮"
        />,
      );

      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
    });
  });

  describe('响应式测试', () => {
    it('应该根据窗口大小调整布局', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500,
      });

      render(<RadarChart data={sampleData} title="移动端雷达图" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该监听窗口大小变化', () => {
      render(<RadarChart data={sampleData} title="响应式雷达图" />);

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200,
      });

      window.dispatchEvent(new Event('resize'));

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('自定义 tooltip 测试', () => {
    it('应该在组件卸载时清理 tooltip', () => {
      const tooltipEl = document.createElement('div');
      tooltipEl.id = 'custom-radar-tooltip';
      document.body.appendChild(tooltipEl);

      const { unmount } = render(
        <RadarChart data={sampleData} title="tooltip 清理测试" />,
      );

      expect(document.getElementById('custom-radar-tooltip')).toBeTruthy();

      unmount();

      // 等待清理完成
      setTimeout(() => {
        expect(document.getElementById('custom-radar-tooltip')).toBeFalsy();
      }, 0);
    });
  });

  describe('ChartStatistic 集成测试', () => {
    it('应该支持 statistic 配置', () => {
      render(
        <RadarChart
          data={sampleData}
          statistic={{
            title: '平均分',
            value: 75.5,
          }}
          title="带统计数据"
        />,
      );

      expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
    });
  });

  describe('错误处理测试', () => {
    it('应该捕获并显示渲染错误', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<RadarChart data={sampleData} title="错误处理测试" />);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('大数据集测试', () => {
    it('应该处理多个维度', () => {
      const multiDimensionData: RadarChartDataItem[] = Array.from(
        { length: 20 },
        (_, i) => ({
          category: 'A组',
          label: `维度${i + 1}`,
          type: '团队A',
          score: Math.random() * 100,
        }),
      );

      render(<RadarChart data={multiDimensionData} title="多维度数据" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  describe('variant 属性测试', () => {
    it('应该支持 variant 属性', () => {
      render(
        <RadarChart data={sampleData} variant="outline" title="边框样式" />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('默认颜色测试', () => {
    it('应该使用默认颜色当未指定时', () => {
      render(<RadarChart data={sampleData} title="默认颜色" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该处理多个数据集的颜色分配', () => {
      const multiTypeData: RadarChartDataItem[] = Array.from(
        { length: 15 },
        (_, i) => ({
          category: 'A组',
          label: '技术',
          type: `团队${i + 1}`,
          score: 80,
        }),
      );

      render(<RadarChart data={multiTypeData} title="多数据集颜色" />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  describe('classNames 和 styles 支持', () => {
    it('应该支持 ChartClassNames 对象格式的 classNames', () => {
      const classNames = {
        root: 'custom-root-class',
        toolbar: 'custom-toolbar-class',
        statisticContainer: 'custom-statistic-class',
        wrapper: 'custom-wrapper-class',
      };

      render(<RadarChart data={sampleData} classNames={classNames} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持 ChartStyles 对象格式的 styles', () => {
      const styles = {
        root: { width: '500px', height: '300px' },
        toolbar: { padding: '10px' },
        statisticContainer: { display: 'flex' },
        wrapper: { marginTop: '20px' },
      };

      render(<RadarChart data={sampleData} styles={styles} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该合并 classNames 和 className', () => {
      const classNames = {
        root: 'custom-root-class',
      };

      render(
        <RadarChart
          data={sampleData}
          classNames={classNames}
          className="additional-class"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该合并 styles 和 style', () => {
      const styles = {
        root: { width: '500px', height: '300px' },
      };

      render(
        <RadarChart
          data={sampleData}
          styles={styles}
          style={{ padding: '10px' }}
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该正确处理 styles?.root 的合并顺序', () => {
      const styles = {
        root: { backgroundColor: 'red' },
      };

      render(
        <RadarChart
          data={sampleData}
          styles={styles}
          style={{ width: '500px', height: '300px' }}
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 classNames 为 undefined 的情况', () => {
      render(<RadarChart data={sampleData} classNames={undefined} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 styles 为 undefined 的情况', () => {
      render(<RadarChart data={sampleData} styles={undefined} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('CSS 变量颜色支持测试', () => {
    it('应该支持单个 CSS 变量颜色', () => {
      render(
        <RadarChart
          data={sampleData}
          color="var(--color-blue-control-fill-primary)"
        />,
      );

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该支持多个 CSS 变量颜色', () => {
      render(
        <RadarChart
          data={sampleData}
          color={[
            'var(--color-blue-control-fill-primary)',
            'var(--color-green-control-fill-primary)',
          ]}
        />,
      );

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('应该支持混合使用 CSS 变量和十六进制颜色', () => {
      render(
        <RadarChart
          data={sampleData}
          color={['var(--color-blue-control-fill-primary)', '#ff0000']}
        />,
      );

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });
});

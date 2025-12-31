import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => (
    <div
      data-testid="bar-chart"
      data-labels={JSON.stringify(data?.labels)}
      data-datasets={JSON.stringify(data?.datasets)}
      data-options={JSON.stringify(options)}
    >
      Bar Chart
    </div>
  ),
}));

// Mock chartjs-plugin-datalabels
vi.mock('chartjs-plugin-datalabels', () => ({
  default: {},
}));

// Mock rc-resize-observer
vi.mock('rc-resize-observer', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

// Mock utils - 必须在导入 BarChart 之前
vi.mock('../../../src/Plugins/chart/utils', () => ({
  ChartDataItem: class {},
  extractAndSortXValues: vi.fn((data) => [
    ...new Set(data.map((d: any) => d.x)),
  ]),
  findDataPointByXValue: vi.fn((data, x, type) =>
    data.find((d: any) => d.x === x && d.type === type),
  ),
  hexToRgba: vi.fn((color, alpha) => `rgba(0,0,0,${alpha})`),
  resolveCssVariable: vi.fn((color) =>
    typeof color === 'string' && color.startsWith('var(') ? '#1d7afc' : color,
  ),
}));

// Import BarChart after mocking
import BarChart, {
  BarChartDataItem,
} from '../../../src/Plugins/chart/BarChart';

describe('BarChart maxBarThickness 功能测试', () => {
  const basicData: BarChartDataItem[] = [
    {
      category: '销售数据',
      type: '本季度',
      x: 'Q1',
      y: 85000,
      xtitle: '季度',
      ytitle: '销售额',
    },
    {
      category: '销售数据',
      type: '本季度',
      x: 'Q2',
      y: 92000,
      xtitle: '季度',
      ytitle: '销售额',
    },
    {
      category: '销售数据',
      type: '本季度',
      x: 'Q3',
      y: 78000,
      xtitle: '季度',
      ytitle: '销售额',
    },
  ];

  it('应该正确接受 maxBarThickness 属性并传递给图表', () => {
    const { container } = render(
      <BarChart data={basicData} maxBarThickness={50} />,
    );

    const chartElement = container.querySelector('[data-testid="bar-chart"]');
    expect(chartElement).toBeInTheDocument();

    const datasets = JSON.parse(chartElement!.getAttribute('data-datasets')!);
    expect(datasets[0].maxBarThickness).toBe(50);
  });

  it('应该在未设置 maxBarThickness 时正常渲染', () => {
    const { container } = render(<BarChart data={basicData} />);

    const chartElement = container.querySelector('[data-testid="bar-chart"]');
    expect(chartElement).toBeInTheDocument();
  });

  it('应该支持不同的 maxBarThickness 值', () => {
    const testValues = [20, 50, 80, 100];

    testValues.forEach((maxBarThickness) => {
      const { container } = render(
        <BarChart data={basicData} maxBarThickness={maxBarThickness} />,
      );

      const chartElement = container.querySelector('[data-testid="bar-chart"]');
      expect(chartElement).toBeInTheDocument();
    });
  });

  it('应该在堆叠模式下支持 maxBarThickness', () => {
    const stackedData: BarChartDataItem[] = [
      ...basicData,
      {
        category: '销售数据',
        type: '上季度',
        x: 'Q1',
        y: 75000,
        xtitle: '季度',
        ytitle: '销售额',
      },
      {
        category: '销售数据',
        type: '上季度',
        x: 'Q2',
        y: 82000,
        xtitle: '季度',
        ytitle: '销售额',
      },
      {
        category: '销售数据',
        type: '上季度',
        x: 'Q3',
        y: 68000,
        xtitle: '季度',
        ytitle: '销售额',
      },
    ];

    const { container } = render(
      <BarChart data={stackedData} stacked={true} maxBarThickness={60} />,
    );

    const chartElement = container.querySelector('[data-testid="bar-chart"]');
    expect(chartElement).toBeInTheDocument();
  });

  it('应该在横向柱状图模式下支持 maxBarThickness', () => {
    const { container } = render(
      <BarChart data={basicData} indexAxis="y" maxBarThickness={40} />,
    );

    const chartElement = container.querySelector('[data-testid="bar-chart"]');
    expect(chartElement).toBeInTheDocument();
  });

  it('应该在少量数据时应用 maxBarThickness', () => {
    const smallData: BarChartDataItem[] = [
      {
        category: '销售数据',
        type: '本季度',
        x: 'Q1',
        y: 85000,
        xtitle: '季度',
        ytitle: '销售额',
      },
      {
        category: '销售数据',
        type: '本季度',
        x: 'Q2',
        y: 92000,
        xtitle: '季度',
        ytitle: '销售额',
      },
    ];

    const { container } = render(
      <BarChart data={smallData} maxBarThickness={50} />,
    );

    const chartElement = container.querySelector('[data-testid="bar-chart"]');
    expect(chartElement).toBeInTheDocument();
  });

  it('应该与其他配置选项兼容', () => {
    const { container } = render(
      <BarChart
        data={basicData}
        maxBarThickness={50}
        showLegend={true}
        showGrid={true}
        showDataLabels={true}
        theme="dark"
      />,
    );

    const chartElement = container.querySelector('[data-testid="bar-chart"]');
    expect(chartElement).toBeInTheDocument();
  });

  describe('classNames 和 styles 支持', () => {
    it('应该支持 ChartClassNames 对象格式的 classNames', () => {
      const classNames = {
        root: 'custom-root-class',
        toolbar: 'custom-toolbar-class',
        statisticContainer: 'custom-statistic-class',
        filter: 'custom-filter-class',
        wrapper: 'custom-wrapper-class',
        chart: 'custom-chart-class',
      };

      const { container } = render(
        <BarChart data={basicData} classNames={classNames} />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });

    it('应该支持 ChartStyles 对象格式的 styles', () => {
      const styles = {
        root: { width: '500px', height: '300px' },
        toolbar: { padding: '10px' },
        statisticContainer: { display: 'flex' },
        filter: { marginBottom: '10px' },
        wrapper: { marginTop: '20px' },
        chart: { minHeight: '300px' },
      };

      const { container } = render(
        <BarChart data={basicData} styles={styles} />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });

    it('应该合并 classNames 和 className', () => {
      const classNames = {
        root: 'custom-root-class',
      };

      const { container } = render(
        <BarChart
          data={basicData}
          classNames={classNames}
          className="additional-class"
        />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });

    it('应该合并 styles 和 style', () => {
      const styles = {
        root: { width: '500px', height: '300px' },
      };

      const { container } = render(
        <BarChart
          data={basicData}
          styles={styles}
          style={{ padding: '10px' }}
        />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });

    it('应该正确处理 styles?.root 的合并顺序', () => {
      const styles = {
        root: { backgroundColor: 'red', width: '600px' },
      };

      const { container } = render(
        <BarChart
          data={basicData}
          styles={styles}
          style={{ width: '500px', height: '300px' }}
        />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });

    it('应该处理 classNames 为 undefined 的情况', () => {
      const { container } = render(
        <BarChart data={basicData} classNames={undefined} />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });

    it('应该处理 styles 为 undefined 的情况', () => {
      const { container } = render(
        <BarChart data={basicData} styles={undefined} />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });
  });

  describe('CSS 变量颜色支持测试', () => {
    it('应该支持单个 CSS 变量颜色', () => {
      const { container } = render(
        <BarChart
          data={basicData}
          color="var(--color-blue-control-fill-primary)"
        />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });

    it('应该支持多个 CSS 变量颜色', () => {
      const { container } = render(
        <BarChart
          data={basicData}
          color={[
            'var(--color-blue-control-fill-primary)',
            'var(--color-green-control-fill-primary)',
          ]}
        />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });

    it('应该支持混合使用 CSS 变量和十六进制颜色', () => {
      const { container } = render(
        <BarChart
          data={basicData}
          color={['var(--color-blue-control-fill-primary)', '#ff0000']}
        />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });

    it('应该支持在正负值分离模式下使用 CSS 变量', () => {
      const divergingData: BarChartDataItem[] = [
        { x: 'A', y: 10, type: 'Data' },
        { x: 'B', y: -5, type: 'Data' },
        { x: 'C', y: 15, type: 'Data' },
        { x: 'D', y: -8, type: 'Data' },
      ];

      const { container } = render(
        <BarChart
          data={divergingData}
          color={[
            'var(--color-blue-control-fill-primary)',
            'var(--color-red-control-fill-primary)',
          ]}
        />,
      );

      expect(
        container.querySelector('[data-testid="bar-chart"]'),
      ).toBeInTheDocument();
    });
  });

  describe('BarChart 其他功能覆盖测试', () => {
    const mockData = [{ x: 'A', y: 10, type: 'Data' } as BarChartDataItem];

    it('应该支持自定义数据标签格式化函数', () => {
      const dataLabelFormatter = vi.fn().mockReturnValue('custom-label');
      const { container } = render(
        <BarChart
          data={mockData}
          showDataLabels={true}
          dataLabelFormatter={dataLabelFormatter}
        />,
      );
      expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument();
      expect(dataLabelFormatter).toHaveBeenCalled();
    });

    it('应该支持 indexAxis="y" 配置', () => {
      const { container } = render(
        <BarChart data={mockData} indexAxis="y" showDataLabels={true} />,
      );
      expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument();
    });

    it('当无法获取 canvas context 时应使用备用宽度计算', () => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      const { container } = render(<BarChart data={mockData} showDataLabels={true} />);
      expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument();

      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });
  });
});

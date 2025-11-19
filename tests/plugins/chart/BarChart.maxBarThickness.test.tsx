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
});


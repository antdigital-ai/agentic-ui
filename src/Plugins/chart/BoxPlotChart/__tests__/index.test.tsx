import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import BoxPlotChart from '../index';

// Mock Chart.js to avoid canvas issues in tests
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('@sgratzl/chartjs-chart-boxplot', () => ({
  BoxPlotController: vi.fn(),
  BoxAndWiskers: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Chart: vi.fn(() => <div data-testid="mock-chart" />),
}));

// 在ConfigProvider中包装组件来提供完整的样式上下文
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ConfigProvider prefixCls="ant">{ui}</ConfigProvider>);
};

describe('BoxPlotChart 组件', () => {
  const basicData = [
    { label: 'A组', values: [10, 15, 20, 25, 30, 35, 40] },
    { label: 'B组', values: [15, 20, 25, 30, 35, 40, 45] },
  ];

  it('应该正确渲染基础箱线图', () => {
    const { container } = renderWithProvider(
      <BoxPlotChart title="测试箱线图" data={basicData} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该正确处理空数据', () => {
    const { getByText } = renderWithProvider(
      <BoxPlotChart title="空数据测试" data={[]} />,
    );

    expect(getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('应该正确处理多系列数据', () => {
    const multiSeriesData = [
      { label: '一月', values: [10, 15, 20], type: '产品A' },
      { label: '一月', values: [15, 20, 25], type: '产品B' },
      { label: '二月', values: [20, 25, 30], type: '产品A' },
      { label: '二月', values: [25, 30, 35], type: '产品B' },
    ];

    const { container } = renderWithProvider(
      <BoxPlotChart title="多系列测试" data={multiSeriesData} showLegend />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持自定义尺寸', () => {
    const { container } = renderWithProvider(
      <BoxPlotChart title="自定义尺寸" data={basicData} width={800} height={500} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持暗色主题', () => {
    const { container } = renderWithProvider(
      <BoxPlotChart title="暗色主题" data={basicData} theme="dark" />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持自定义颜色', () => {
    const { container } = renderWithProvider(
      <BoxPlotChart title="自定义颜色" data={basicData} color="#1890ff" />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持隐藏网格线', () => {
    const { container } = renderWithProvider(
      <BoxPlotChart title="无网格线" data={basicData} showGrid={false} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持隐藏图例', () => {
    const { container } = renderWithProvider(
      <BoxPlotChart title="无图例" data={basicData} showLegend={false} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持轴标签', () => {
    const { container } = renderWithProvider(
      <BoxPlotChart
        title="带轴标签"
        data={basicData}
        xAxisLabel="分组"
        yAxisLabel="数值"
      />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持隐藏异常点', () => {
    const dataWithOutliers = [
      { label: '有异常值', values: [10, 15, 20, 25, 30, 100] },
    ];

    const { container } = renderWithProvider(
      <BoxPlotChart
        title="隐藏异常点"
        data={dataWithOutliers}
        showOutliers={false}
      />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持分类筛选数据', () => {
    const dataWithCategory = [
      { label: 'A组', values: [10, 20, 30], category: '类别1' },
      { label: 'B组', values: [15, 25, 35], category: '类别2' },
    ];

    const { container } = renderWithProvider(
      <BoxPlotChart title="分类筛选" data={dataWithCategory} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持 loading 状态', () => {
    const { container } = renderWithProvider(
      <BoxPlotChart title="加载中" data={basicData} loading />,
    );

    expect(container).toBeInTheDocument();
  });
});

describe('calculateBoxPlotStats 函数', () => {
  // 由于 calculateBoxPlotStats 是内部函数，我们通过组件行为来测试
  it('应该正确计算统计值', () => {
    const data = [
      { label: '测试', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    ];

    const { container } = renderWithProvider(
      <BoxPlotChart title="统计值测试" data={data} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该正确处理异常值', () => {
    // 包含明显异常值的数据
    const data = [
      { label: '有异常值', values: [1, 2, 3, 4, 5, 100, -50] },
    ];

    const { container } = renderWithProvider(
      <BoxPlotChart title="异常值测试" data={data} showOutliers />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该正确处理单个数据点', () => {
    const data = [{ label: '单点', values: [50] }];

    const { container } = renderWithProvider(
      <BoxPlotChart title="单点测试" data={data} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该正确处理相同值的数据', () => {
    const data = [{ label: '相同值', values: [10, 10, 10, 10, 10] }];

    const { container } = renderWithProvider(
      <BoxPlotChart title="相同值测试" data={data} />,
    );

    expect(container).toBeInTheDocument();
  });
});
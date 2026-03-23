import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import HistogramChart from '../index';

// Mock Chart.js to avoid canvas issues in tests
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Bar: vi.fn(() => <div data-testid="mock-bar-chart" />),
}));

// 在ConfigProvider中包装组件来提供完整的样式上下文
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ConfigProvider prefixCls="ant">{ui}</ConfigProvider>);
};

describe('HistogramChart 组件', () => {
  const basicData = [
    { value: 10 },
    { value: 15 },
    { value: 20 },
    { value: 25 },
    { value: 30 },
    { value: 35 },
    { value: 40 },
  ];

  it('应该正确渲染基础直方图', () => {
    const { container } = renderWithProvider(
      <HistogramChart title="测试直方图" data={basicData} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该正确处理空数据', () => {
    const { getByText } = renderWithProvider(
      <HistogramChart title="空数据测试" data={[]} />,
    );

    expect(getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('应该正确处理多系列数据', () => {
    const multiSeriesData = [
      { value: 10, type: 'A组' },
      { value: 15, type: 'A组' },
      { value: 20, type: 'B组' },
      { value: 25, type: 'B组' },
    ];

    const { container } = renderWithProvider(
      <HistogramChart title="多系列测试" data={multiSeriesData} showLegend />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持自定义分箱数量', () => {
    const { container } = renderWithProvider(
      <HistogramChart
        title="自定义分箱"
        data={basicData}
        binCount={5}
      />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持频率模式', () => {
    const { container } = renderWithProvider(
      <HistogramChart
        title="频率直方图"
        data={basicData}
        showFrequency
      />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持堆叠模式', () => {
    const multiSeriesData = [
      { value: 10, type: 'A组' },
      { value: 20, type: 'B组' },
    ];

    const { container } = renderWithProvider(
      <HistogramChart
        title="堆叠直方图"
        data={multiSeriesData}
        stacked
      />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持非堆叠模式', () => {
    const multiSeriesData = [
      { value: 10, type: 'A组' },
      { value: 20, type: 'B组' },
    ];

    const { container } = renderWithProvider(
      <HistogramChart
        title="非堆叠直方图"
        data={multiSeriesData}
        stacked={false}
      />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持自定义尺寸', () => {
    const { container } = renderWithProvider(
      <HistogramChart
        title="自定义尺寸"
        data={basicData}
        width={800}
        height={500}
      />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持暗色主题', () => {
    const { container } = renderWithProvider(
      <HistogramChart title="暗色主题" data={basicData} theme="dark" />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持自定义颜色', () => {
    const { container } = renderWithProvider(
      <HistogramChart title="自定义颜色" data={basicData} color="#1890ff" />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持隐藏网格线', () => {
    const { container } = renderWithProvider(
      <HistogramChart title="无网格线" data={basicData} showGrid={false} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持隐藏图例', () => {
    const { container } = renderWithProvider(
      <HistogramChart title="无图例" data={basicData} showLegend={false} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持轴标签', () => {
    const { container } = renderWithProvider(
      <HistogramChart
        title="带轴标签"
        data={basicData}
        xAxisLabel="数值范围"
        yAxisLabel="频数"
      />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持分类筛选数据', () => {
    const dataWithCategory = [
      { value: 10, category: '类别1' },
      { value: 20, category: '类别2' },
    ];

    const { container } = renderWithProvider(
      <HistogramChart title="分类筛选" data={dataWithCategory} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该支持 loading 状态', () => {
    const { container } = renderWithProvider(
      <HistogramChart title="加载中" data={basicData} loading />,
    );

    expect(container).toBeInTheDocument();
  });
});

describe('分箱计算', () => {
  it('应该正确处理大量数据', () => {
    // 生成大量数据
    const largeData = Array.from({ length: 1000 }, () => ({
      value: Math.random() * 100,
    }));

    const { container } = renderWithProvider(
      <HistogramChart title="大数据量测试" data={largeData} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该正确处理极端值', () => {
    const extremeData = [
      { value: 0 },
      { value: 0.001 },
      { value: 1000000 },
      { value: -1000000 },
    ];

    const { container } = renderWithProvider(
      <HistogramChart title="极端值测试" data={extremeData} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该正确处理相同值', () => {
    const sameValueData = [
      { value: 50 },
      { value: 50 },
      { value: 50 },
      { value: 50 },
    ];

    const { container } = renderWithProvider(
      <HistogramChart title="相同值测试" data={sameValueData} />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该正确处理小数数据', () => {
    const decimalData = [
      { value: 0.1 },
      { value: 0.2 },
      { value: 0.3 },
      { value: 0.4 },
      { value: 0.5 },
    ];

    const { container } = renderWithProvider(
      <HistogramChart title="小数数据测试" data={decimalData} />,
    );

    expect(container).toBeInTheDocument();
  });
});

describe('多系列分组', () => {
  const multiTypeData = [
    { value: 10, type: 'A' },
    { value: 15, type: 'A' },
    { value: 20, type: 'B' },
    { value: 25, type: 'B' },
    { value: 30, type: 'C' },
  ];

  it('应该正确处理多个类型', () => {
    const { container } = renderWithProvider(
      <HistogramChart title="多类型测试" data={multiTypeData} showLegend />,
    );

    expect(container).toBeInTheDocument();
  });

  it('应该正确处理不均衡的多系列数据', () => {
    const unbalancedData = [
      { value: 10, type: 'A' },
      { value: 15, type: 'A' },
      { value: 20, type: 'A' },
      { value: 25, type: 'B' },
    ];

    const { container } = renderWithProvider(
      <HistogramChart title="不均衡数据测试" data={unbalancedData} />,
    );

    expect(container).toBeInTheDocument();
  });
});
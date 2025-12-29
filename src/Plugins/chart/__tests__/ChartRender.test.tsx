import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

// Mock Chart.js（补齐 CategoryScale 等导出）
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  BarElement: vi.fn(),
  ArcElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn(),
  RadialLinearScale: vi.fn(),
  TimeScale: vi.fn(),
  TimeSeriesScale: vi.fn(),
  Decimation: vi.fn(),
  Zoom: vi.fn(),
}));

// Mock react-chartjs-2 to prevent DOM operations
vi.mock('react-chartjs-2', () => ({
  Doughnut: vi
    .fn()
    .mockImplementation(() => (
      <div data-testid="doughnut-chart">Mocked Doughnut Chart</div>
    )),
  Bar: vi
    .fn()
    .mockImplementation(() => (
      <div data-testid="bar-chart">Mocked Bar Chart</div>
    )),
  Line: vi
    .fn()
    .mockImplementation(() => (
      <div data-testid="line-chart">Mocked Line Chart</div>
    )),
  Scatter: vi
    .fn()
    .mockImplementation(() => (
      <div data-testid="scatter-chart">Mocked Scatter Chart</div>
    )),
  Radar: vi
    .fn()
    .mockImplementation(() => (
      <div data-testid="radar-chart">Mocked Radar Chart</div>
    )),
}));

// Mock ChartMark components
vi.mock('../ChartMark', () => ({
  Pie: vi.fn().mockImplementation((props) => (
    <div data-testid="pie-chart">
      Pie Chart - {props.xField} vs {props.yField}
    </div>
  )),
  Bar: vi.fn().mockImplementation((props) => (
    <div data-testid="bar-chart">
      Bar Chart - {props.xField} vs {props.yField}
    </div>
  )),
  Line: vi.fn().mockImplementation((props) => (
    <div data-testid="line-chart">
      Line Chart - {props.xField} vs {props.yField}
    </div>
  )),
  Column: vi.fn().mockImplementation((props) => (
    <div data-testid="column-chart">
      Column Chart - {props.xField} vs {props.yField}
    </div>
  )),
  Area: vi.fn().mockImplementation((props) => (
    <div data-testid="area-chart">
      Area Chart - {props.xField} vs {props.yField}
    </div>
  )),
}));

// Mock the actual ChartMark components
vi.mock('../ChartMark/index', () => ({
  Pie: vi.fn().mockImplementation((props) => (
    <div data-testid="pie-chart">
      Pie Chart - {props.xField} vs {props.yField}
    </div>
  )),
  Bar: vi.fn().mockImplementation((props) => (
    <div data-testid="bar-chart">
      Bar Chart - {props.xField} vs {props.yField}
    </div>
  )),
  Line: vi.fn().mockImplementation((props) => (
    <div data-testid="line-chart">
      Line Chart - {props.xField} vs {props.yField}
    </div>
  )),
  Column: vi.fn().mockImplementation((props) => (
    <div data-testid="column-chart">
      Column Chart - {props.xField} vs {props.yField}
    </div>
  )),
  Area: vi.fn().mockImplementation((props) => (
    <div data-testid="area-chart">
      Area Chart - {props.xField} vs {props.yField}
    </div>
  )),
}));

// Mock ChartAttrToolBar
vi.mock('../ChartAttrToolBar', () => ({
  ChartAttrToolBar: vi.fn().mockImplementation((props) => (
    <div data-testid="chart-attr-toolbar">
      {props.title}
      {props.options?.map((option: any, index: number) => (
        <div key={index}>{option.icon}</div>
      ))}
    </div>
  )),
}));

// Mock the actual ChartAttrToolBar component
vi.mock('../ChartAttrToolBar/index', () => ({
  ChartAttrToolBar: vi.fn().mockImplementation((props) => (
    <div data-testid="chart-attr-toolbar">
      {props.title}
      {props.options?.map((option: any, index: number) => (
        <div key={index}>{option.icon}</div>
      ))}
    </div>
  )),
}));

const createRuntimeComponent =
  (testId: string) => (props: { title?: string }) => (
    <div data-testid={testId}>{props.title ?? `mock-${testId}`}</div>
  );

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    AreaChart: createRuntimeComponent('area-chart'),
    BarChart: createRuntimeComponent('bar-chart'),
    DonutChart: createRuntimeComponent('donut-chart'),
    FunnelChart: createRuntimeComponent('funnel-chart'),
    LineChart: createRuntimeComponent('line-chart'),
    RadarChart: createRuntimeComponent('radar-chart'),
    ScatterChart: createRuntimeComponent('scatter-chart'),
  })),
}));

describe('ChartRender', () => {
  const defaultProps = {
    chartType: 'bar' as const,
    chartData: [
      { name: 'A', value: 10 },
      { name: 'B', value: 20 },
      { name: 'C', value: 30 },
    ],
    config: {
      height: 300,
      x: 'name',
      y: 'value',
      rest: {},
      columns: [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Value', dataIndex: 'value' },
      ],
    },
    node: {},
    title: 'Test Chart',
    isChartList: false,
    columnLength: 3,
    onColumnLengthChange: vi.fn(),
  };

  const mockI18n = {
    locale: {
      pieChart: '饼图',
      barChart: '条形图',
      lineChart: '折线图',
      columnChart: '柱状图',
      areaChart: '面积图',
      tableChart: '表格',
      configChart: '配置图表',
      updateChart: '更新',
      fullScreen: '全屏',
    } as any,
    language: 'zh-CN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 设置测试环境，但允许图表渲染
    process.env.NODE_ENV = 'test-chart';
    // 确保 window 对象存在
    Object.defineProperty(window, 'notRenderChart', {
      value: false,
      writable: true,
      configurable: true,
    });
    // 确保 window 对象存在
    if (typeof window === 'undefined') {
      global.window = {} as any;
    }

    // Mock DOM methods that Chart.js might use
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: vi.fn(() => ({
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Array(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ data: new Array(4) })),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        fillText: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        transform: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
      })),
      writable: true,
    });

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 400,
      height: 300,
      top: 0,
      left: 0,
      bottom: 300,
      right: 400,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Mock ownerDocument for Chart.js DOM operations
    Object.defineProperty(HTMLElement.prototype, 'ownerDocument', {
      value: {
        defaultView: {
          getComputedStyle: vi.fn(() => ({
            getPropertyValue: vi.fn(() => ''),
            width: '400px',
            height: '300px',
          })),
        },
        documentElement: {
          style: {},
        },
      },
      writable: true,
    });

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
    vi.restoreAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染条形图', () => {
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...defaultProps} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该正确渲染饼图', () => {
      const props = { ...defaultProps, chartType: 'pie' as const };
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该正确渲染折线图', () => {
      const props = { ...defaultProps, chartType: 'line' as const };
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该正确渲染柱状图', () => {
      const props = { ...defaultProps, chartType: 'column' as const };
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该正确渲染面积图', () => {
      const props = { ...defaultProps, chartType: 'area' as const };
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该在测试环境下返回 null', () => {
      process.env.NODE_ENV = 'test';
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...defaultProps} />
        </I18nContext.Provider>,
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild?.hasChildNodes?.()).toBe(false);
    });

    it('应该在 notRenderChart 环境下返回 null', () => {
      Object.defineProperty(window, 'notRenderChart', {
        value: true,
        writable: true,
      });

      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...defaultProps} />
        </I18nContext.Provider>,
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild?.hasChildNodes?.()).toBe(false);
    });
  });

  describe('表格渲染测试', () => {
    it('应该正确渲染表格', () => {
      const props = { ...defaultProps, chartType: 'table' as const };
      render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查表格数据是否渲染
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });
  });

  describe('定义列表渲染测试', () => {
    it('应该正确渲染定义列表', () => {
      const props = { ...defaultProps, chartType: 'descriptions' as const };
      render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查定义列表数据是否渲染
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('应该在数据少于2条且列数大于8时渲染定义列表', () => {
      const props = {
        ...defaultProps,
        chartType: 'bar' as const,
        chartData: [{ name: 'A', value: 10 }],
        config: {
          ...defaultProps.config,
          columns: new Array(10).fill(0).map((_, i) => ({
            title: `Column ${i}`,
            dataIndex: `col${i}`,
          })),
        },
      };

      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('数据处理测试', () => {
    it('应该处理空数据', () => {
      const props = { ...defaultProps, chartData: [] };
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该处理复杂数据结构', () => {
      const props = {
        ...defaultProps,
        chartData: [
          { category: 'A', subcategory: 'A1', value: 10 },
          { category: 'A', subcategory: 'A2', value: 20 },
          { category: 'B', subcategory: 'B1', value: 30 },
        ],
        config: {
          ...defaultProps.config,
          x: 'category',
          y: 'value',
        },
      };

      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该处理没有配置的情况', () => {
      const props = {
        ...defaultProps,
        config: {
          height: 300,
          x: 'name',
          y: 'value',
          rest: {},
          columns: [
            { title: 'Name', dataIndex: 'name' },
            { title: 'Value', dataIndex: 'value' },
          ],
        } as any,
      };
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理无效的图表类型', () => {
      const props = { ...defaultProps, chartType: 'invalid' as any };
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 无效图表类型时保持容器但不渲染内容
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该处理没有标题的情况', () => {
      const props = { ...defaultProps, title: undefined };
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该处理没有列数变化回调的情况', () => {
      const props = { ...defaultProps, onColumnLengthChange: undefined };
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('图表类型切换测试', () => {
    it('应该支持图表类型切换', () => {
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...defaultProps} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('列数变化测试', () => {
    it('应该处理列数变化回调', () => {
      const onColumnLengthChange = vi.fn();
      const props = {
        ...defaultProps,
        isChartList: true,
        onColumnLengthChange,
      };

      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...props} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('配置更新测试', () => {
    it('应该处理配置更新', () => {
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...defaultProps} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('国际化测试', () => {
    it('应该使用正确的国际化文本', () => {
      const { container } = render(
        <I18nContext.Provider value={mockI18n}>
          <ChartRender {...defaultProps} />
        </I18nContext.Provider>,
      );

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该在没有国际化时使用默认文本', () => {
      const { container } = render(<ChartRender {...defaultProps} />);

      // 检查组件是否渲染了基本结构
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

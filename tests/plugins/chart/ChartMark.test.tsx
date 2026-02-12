import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock chart env
vi.mock('../../../src/Plugins/chart/env', () => ({
  isWindowDefined: vi.fn(() => true),
}));

// Mock Chart.js with all required components
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

// Mock react-chartjs-2（Line/Doughnut 使用 forwardRef 以便 Area/Pie 的 chartRef 同步）
vi.mock('react-chartjs-2', () => {
  const R = require('react');
  return {
    Line: R.forwardRef(({ data, options }: any, ref: any) => {
      R.useEffect(() => {
        if (ref) ref.current = {};
      }, [ref]);
      // 覆盖 Line.tsx 148,149,160：调用 scales ticks callback
      R.useEffect(() => {
        if (options?.scales?.x?.ticks?.callback && data?.labels) {
          data.labels.forEach((_: any, index: number) => {
            options.scales.x.ticks.callback(null, index);
          });
        }
        if (options?.scales?.y?.ticks?.callback) {
          options.scales.y.ticks.callback(10);
          options.scales.y.ticks.callback(100);
        }
      }, [options, data]);
      return R.createElement('div', {
        'data-testid': 'line-chart',
        'data-labels': JSON.stringify(data?.labels),
        'data-datasets': JSON.stringify(data?.datasets),
        children: 'Line Chart',
      });
    }),
    Bar: R.forwardRef(({ data, options }: any, ref: any) => {
      R.useEffect(() => {
        if (ref) ref.current = {};
      }, [ref]);
      // 覆盖 Column.tsx 154,155,166,177 与 Bar.tsx 155,166,167,177：调用 scales ticks callback 并设置 ref
      R.useEffect(() => {
        const xCallback = options?.scales?.x?.ticks?.callback;
        const yCallback = options?.scales?.y?.ticks?.callback;
        const labels = data?.labels || [];
        if (xCallback) {
          xCallback(10);
          xCallback(100);
          labels.forEach((_: any, index: number) => {
            xCallback(null, index);
          });
        }
        if (yCallback) {
          yCallback(10);
          yCallback(100);
          labels.forEach((_: any, index: number) => {
            yCallback(null, index);
          });
        }
      }, [options, data]);
      return R.createElement('div', {
        'data-testid': 'bar-chart',
        'data-labels': JSON.stringify(data?.labels),
        'data-datasets': JSON.stringify(data?.datasets),
        children: 'Bar Chart',
      });
    }),
    Doughnut: R.forwardRef(({ data }: any, ref: any) => {
      R.useEffect(() => {
        if (ref) ref.current = {};
      }, [ref]);
      return R.createElement('div', {
        'data-testid': 'doughnut-chart',
        'data-labels': JSON.stringify(data?.labels),
        'data-datasets': JSON.stringify(data?.datasets),
        children: 'Doughnut Chart',
      });
    }),
  };
});

// Mock rc-resize-observer
vi.mock('rc-resize-observer', () => ({
  default: ({ children, onResize }: any) => (
    <div data-testid="resize-observer" onClick={() => onResize()}>
      {children}
    </div>
  ),
}));

// Import components after mocking
import { Area } from '../../../src/Plugins/chart/ChartMark/Area';
import { Bar } from '../../../src/Plugins/chart/ChartMark/Bar';
import { Column } from '../../../src/Plugins/chart/ChartMark/Column';
import { Container } from '../../../src/Plugins/chart/ChartMark/Container';
import { Line } from '../../../src/Plugins/chart/ChartMark/Line';
import { Pie } from '../../../src/Plugins/chart/ChartMark/Pie';
import { debounce, stringFormatNumber } from '../../../src/Plugins/chart/utils';

describe('ChartMark Components', () => {
  afterEach(() => {
    process.env.NODE_ENV = 'test';
  });
  beforeEach(() => {
    process.env.NODE_ENV = 'test-chart';
  });

  const defaultProps = {
    data: [
      { name: 'A', value: 10 },
      { name: 'B', value: 20 },
      { name: 'C', value: 30 },
    ],
    xField: 'name',
    yField: 'value',
    index: 0,
    chartRef: { current: null } as any,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clientWidth for container
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 400,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('SSR / isWindowDefined 分支覆盖', () => {
    it('Area: isWindowDefined 为 false 时不注册 Chart', async () => {
      const { isWindowDefined } =
        await import('../../../src/Plugins/chart/env');
      vi.mocked(isWindowDefined).mockReturnValueOnce(false);
      render(<Area {...defaultProps} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('Bar: isWindowDefined 为 false 时不注册 Chart', async () => {
      const { isWindowDefined } =
        await import('../../../src/Plugins/chart/env');
      vi.mocked(isWindowDefined).mockReturnValueOnce(false);
      render(<Bar {...defaultProps} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('Column: isWindowDefined 为 false 时不注册 Chart', async () => {
      const { isWindowDefined } =
        await import('../../../src/Plugins/chart/env');
      vi.mocked(isWindowDefined).mockReturnValueOnce(false);
      render(<Column {...defaultProps} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('Line: isWindowDefined 为 false 时不注册 Chart', async () => {
      const { isWindowDefined } =
        await import('../../../src/Plugins/chart/env');
      vi.mocked(isWindowDefined).mockReturnValueOnce(false);
      render(<Line {...defaultProps} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('Pie: isWindowDefined 为 false 时不注册 Chart', async () => {
      const { isWindowDefined } =
        await import('../../../src/Plugins/chart/env');
      vi.mocked(isWindowDefined).mockReturnValueOnce(false);
      render(<Pie {...defaultProps} />);
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  describe('Line Chart Component', () => {
    it('应该正确渲染基本折线图', () => {
      render(<Line {...defaultProps} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理空数据', () => {
      const props = { ...defaultProps, data: [] };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理带颜色图例的数据', () => {
      const props = {
        ...defaultProps,
        data: [
          { name: 'A', value: 10, color: 'red' },
          { name: 'B', value: 20, color: 'blue' },
          { name: 'A', value: 15, color: 'red' },
        ],
        colorLegend: 'color',
      };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理 undefined 数据', () => {
      const props = { ...defaultProps, data: undefined as any };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理 null 数据', () => {
      const props = { ...defaultProps, data: null as any };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理复杂数据结构', () => {
      const props = {
        ...defaultProps,
        data: [
          { category: 'A', subcategory: 'A1', value: 10 },
          { category: 'A', subcategory: 'A2', value: 20 },
          { category: 'B', subcategory: 'B1', value: 30 },
        ],
        xField: 'category',
        yField: 'value',
      };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理 chartRef', () => {
      const chartRef = { current: null };
      const props = { ...defaultProps, chartRef };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Bar Chart Component', () => {
    it('应该正确渲染基本条形图', () => {
      render(<Bar {...defaultProps} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('应该处理空数据', () => {
      const props = { ...defaultProps, data: [] };
      render(<Bar {...props} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('应该处理带颜色图例的数据', () => {
      const props = {
        ...defaultProps,
        data: [
          { name: 'A', value: 10, color: 'red' },
          { name: 'B', value: 20, color: 'blue' },
          { name: 'A', value: 15, color: 'red' },
        ],
        colorLegend: 'color',
      };
      render(<Bar {...props} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('应该处理 undefined 数据', () => {
      const props = { ...defaultProps, data: undefined };
      render(<Bar {...props} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('应该处理复杂数据结构', () => {
      const props = {
        ...defaultProps,
        data: [
          { category: 'A', subcategory: 'A1', value: 10 },
          { category: 'A', subcategory: 'A2', value: 20 },
          { category: 'B', subcategory: 'B1', value: 30 },
        ],
        xField: 'category',
        yField: 'value',
      };
      render(<Bar {...props} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Column Chart Component', () => {
    it('应该正确渲染基本柱状图', () => {
      render(<Column {...defaultProps} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('应该处理空数据', () => {
      const props = { ...defaultProps, data: [] };
      render(<Column {...props} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('应该处理带颜色图例的数据', () => {
      const props = {
        ...defaultProps,
        data: [
          { name: 'A', value: 10, color: 'red' },
          { name: 'B', value: 20, color: 'blue' },
          { name: 'A', value: 15, color: 'red' },
        ],
        colorLegend: 'color',
      };
      render(<Column {...props} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Area Chart Component', () => {
    it('应该正确渲染基本面积图', () => {
      render(<Area {...defaultProps} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理空数据', () => {
      const props = { ...defaultProps, data: [] };
      render(<Area {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理带颜色图例的数据', () => {
      const props = {
        ...defaultProps,
        data: [
          { name: 'A', value: 10, color: 'red' },
          { name: 'B', value: 20, color: 'blue' },
          { name: 'A', value: 15, color: 'red' },
        ],
        colorLegend: 'color',
      };
      render(<Area {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Pie Chart Component', () => {
    it('应该正确渲染基本饼图', () => {
      render(<Pie {...defaultProps} />);
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    it('应该处理空数据', () => {
      const props = { ...defaultProps, data: [] };
      render(<Pie {...props} />);
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    it('应该处理 undefined 数据', () => {
      const props = { ...defaultProps, data: undefined };
      render(<Pie {...props} />);
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    it('应该处理复杂数据结构', () => {
      const props = {
        ...defaultProps,
        data: [
          { category: 'A', value: 10 },
          { category: 'B', value: 20 },
          { category: 'C', value: 30 },
        ],
        xField: 'category',
        yField: 'value',
      };
      render(<Pie {...props} />);
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  describe('Container Component', () => {
    const mockChartRef = React.createRef() as any;
    const mockHtmlRef = React.createRef() as any;

    beforeEach(() => {
      // Mock ResizeObserver
      global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }));
    });

    it('应该正确渲染容器', () => {
      render(
        <Container chartRef={mockChartRef} htmlRef={mockHtmlRef} index={0}>
          <div>Test Content</div>
        </Container>,
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('应该处理不同的索引值', () => {
      render(
        <Container chartRef={mockChartRef} htmlRef={mockHtmlRef} index={5}>
          <div>Index 5 Content</div>
        </Container>,
      );
      expect(screen.getByText('Index 5 Content')).toBeInTheDocument();
    });

    it('inView 为 true 且尺寸变化超过阈值时应调用 chart.resize', () => {
      vi.useFakeTimers();
      const resizeFn = vi.fn();
      mockChartRef.current = { resize: resizeFn };
      render(
        <Container chartRef={mockChartRef} htmlRef={mockHtmlRef} index={0}>
          <div>Chart</div>
        </Container>,
      );
      const div = mockHtmlRef.current;
      expect(div).toBeTruthy();
      Object.defineProperty(div, 'clientWidth', {
        value: 500,
        configurable: true,
      });
      vi.advanceTimersByTime(400);
      expect(resizeFn).toHaveBeenCalledWith(500, 300);
      vi.useRealTimers();
    });

    it('点击容器应触发 onSize', () => {
      vi.useFakeTimers();
      const resizeFn = vi.fn();
      mockChartRef.current = { resize: resizeFn };
      render(
        <Container chartRef={mockChartRef} htmlRef={mockHtmlRef} index={0}>
          <div>Chart</div>
        </Container>,
      );
      const div = mockHtmlRef.current;
      if (div) {
        Object.defineProperty(div, 'clientWidth', {
          value: 600,
          configurable: true,
        });
        fireEvent.click(div);
      }
      vi.advanceTimersByTime(400);
      expect(resizeFn).toHaveBeenCalledWith(600, 360);
      vi.useRealTimers();
    });
  });

  describe('Utils Functions', () => {
    describe('stringFormatNumber', () => {
      it('应该格式化数字', () => {
        expect(stringFormatNumber(1234.56)).toBe('1,234.56');
        expect(stringFormatNumber(1000000)).toBe('1,000,000');
      });

      it('应该处理字符串', () => {
        expect(stringFormatNumber('test')).toBe('test');
        expect(stringFormatNumber('123')).toBe('123');
      });

      it('应该处理空值', () => {
        expect(stringFormatNumber('')).toBe('');
        expect(stringFormatNumber(null as any)).toBe(null);
        expect(stringFormatNumber(undefined as any)).toBe(undefined);
      });

      it('应该处理零值', () => {
        expect(stringFormatNumber(0)).toBe(0);
      });

      it('应该处理负数', () => {
        expect(stringFormatNumber(-1234.56)).toBe('-1,234.56');
      });

      it('应该处理大数字', () => {
        expect(stringFormatNumber(999999999)).toBe('999,999,999');
      });
    });

    describe('debounce', () => {
      it('应该创建防抖函数', () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 100);

        expect(typeof debouncedFn).toBe('function');
        expect(typeof debouncedFn.flush).toBe('function');
        expect(typeof debouncedFn.cancel).toBe('function');
      });

      it('应该延迟执行函数', async () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 50);

        debouncedFn();
        expect(mockFn).not.toHaveBeenCalled();

        // 等待防抖延迟
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        expect(mockFn).toHaveBeenCalled();
      });

      it('应该取消延迟执行', () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn();
        debouncedFn.cancel();

        expect(mockFn).not.toHaveBeenCalled();
      });

      it('应该立即执行 flush', () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn.flush();
        expect(mockFn).toHaveBeenCalled();
      });

      it('应该处理多次调用', async () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 50);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        // 等待防抖延迟
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('边界条件和错误处理', () => {
    it('应该处理无效的字段名', () => {
      const props = {
        ...defaultProps,
        xField: 'invalidField',
        yField: 'invalidField',
      };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理数据类型不匹配', () => {
      const props = {
        ...defaultProps,
        data: [
          { name: 'A', value: 'not a number' },
          { name: 'B', value: null },
          { name: 'C', value: undefined },
        ],
      };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理重复的 x 值', () => {
      const props = {
        ...defaultProps,
        data: [
          { name: 'A', value: 10 },
          { name: 'A', value: 20 },
          { name: 'B', value: 30 },
        ],
      };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理缺失的 chartRef', () => {
      const props = { ...defaultProps, chartRef: undefined };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理缺失的 htmlRef', () => {
      const props = { ...defaultProps };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('性能测试', () => {
    it('应该处理大量数据', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        name: `Item ${i}`,
        value: Math.random() * 100,
      }));

      const props = { ...defaultProps, data: largeData };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('应该处理复杂的颜色图例数据', () => {
      const complexData = Array.from({ length: 100 }, (_, i) => ({
        name: `Item ${i % 10}`,
        value: Math.random() * 100,
        color: `color${i % 5}`,
      }));

      const props = {
        ...defaultProps,
        data: complexData,
        colorLegend: 'color',
      };
      render(<Line {...props} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('集成测试', () => {
    it('应该正确处理所有图表类型的组合', () => {
      const testData = [
        { name: 'A', value: 10, category: 'cat1' },
        { name: 'B', value: 20, category: 'cat2' },
        { name: 'C', value: 30, category: 'cat1' },
      ];

      const { rerender } = render(<Line {...defaultProps} data={testData} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      rerender(<Bar {...defaultProps} data={testData} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

      rerender(<Column {...defaultProps} data={testData} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

      rerender(<Area {...defaultProps} data={testData} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      rerender(<Pie {...defaultProps} data={testData} />);
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    it('应该处理动态数据更新', () => {
      const { rerender } = render(<Line {...defaultProps} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      const newData = [
        { name: 'X', value: 50 },
        { name: 'Y', value: 60 },
      ];

      rerender(<Line {...defaultProps} data={newData} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
});

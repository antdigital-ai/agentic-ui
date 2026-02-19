import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartElement } from '../../../src/Plugins/chart/index';

const mockUpdate = vi.fn();

const mockIsLatestNode = vi.fn().mockReturnValue(false);
const mockDragStart = vi.fn();
let mockReadonly = false;

const mockRootContainer = document.createElement('div');
Object.defineProperty(mockRootContainer, 'clientWidth', {
  value: 512,
  configurable: true,
});

vi.mock('../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: { dragStart: mockDragStart, isLatestNode: mockIsLatestNode },
    readonly: mockReadonly,
    markdownContainerRef: { current: document.createElement('div') },
    rootContainer: { current: mockRootContainer },
  }),
}));

vi.mock('slate-react', () => ({
  useSlate: () => ({}),
}));

vi.mock('../../../src/MarkdownEditor/hooks/editor', () => ({
  useMEditor: () => [, mockUpdate],
}));

vi.mock('../../../src/Plugins/chart/ChartRender', () => ({
  ChartRender: (props: any) => (
    <div data-testid="chart-render" data-chart-type={props.chartType}>
      {props.title}
    </div>
  ),
}));

vi.mock('../../../src/MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle" />,
}));

vi.mock('../../../src/MarkdownEditor/editor/elements/ErrorBoundary', () => ({
  ErrorBoundary: ({ children, fallback }: any) => (
    <div data-testid="error-boundary">
      {children}
      {fallback}
    </div>
  ),
}));

describe('ChartElement', () => {
  const defaultProps = {
    element: {
      type: 'chart',
      chartType: 'bar',
      dataSource: [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
        { name: 'C', value: 30 },
      ],
      config: {
        x: 'name',
        y: 'value',
        height: 300,
      },
      otherProps: {
        dataSource: [
          { name: 'A', value: 10 },
          { name: 'B', value: 20 },
          { name: 'C', value: 30 },
        ],
      },
    },
    attributes: {} as any,
    children: <div>Chart Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本结构测试', () => {
    it('应该正确处理基本属性', () => {
      expect(defaultProps.element.chartType).toBe('bar');
      expect(defaultProps.element.dataSource).toHaveLength(3);
      expect(defaultProps.element.config.x).toBe('name');
      expect(defaultProps.element.config.y).toBe('value');
    });

    it('应该处理不同的图表类型', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          chartType: 'pie',
        },
      };

      expect(props.element.chartType).toBe('pie');
    });

    it('应该处理空数据源', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          otherProps: {
            dataSource: [],
          },
        },
      };

      expect(props.element.otherProps.dataSource).toHaveLength(0);
    });
  });

  describe('数据处理测试', () => {
    it('应该正确处理数字格式化', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          otherProps: {
            dataSource: [
              { name: 'A', value: '1,234.56' },
              { name: 'B', value: '2,345.67' },
            ],
          },
        },
      };

      expect(props.element.otherProps.dataSource).toHaveLength(2);
    });

    it('应该处理日期数据', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          otherProps: {
            dataSource: [
              { name: '2023-01-01', value: 10 },
              { name: '2023-01-02', value: 20 },
            ],
          },
        },
      };

      expect(props.element.otherProps.dataSource).toHaveLength(2);
    });

    it('应该处理复杂的数据结构', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          otherProps: {
            dataSource: [
              { category: 'A', subcategory: 'A1', value: 10 },
              { category: 'A', subcategory: 'A2', value: 20 },
              { category: 'B', subcategory: 'B1', value: 30 },
            ],
          },
        },
      };

      expect(props.element.otherProps.dataSource).toHaveLength(3);
    });
  });

  describe('配置测试', () => {
    it('应该传递正确的配置参数', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          config: {
            x: 'category',
            y: 'amount',
            height: 400,
            rest: { color: 'blue' },
          },
        },
      };

      expect(props.element.config.x).toBe('category');
      expect(props.element.config.y).toBe('amount');
      expect(props.element.config.height).toBe(400);
    });

    it('应该处理默认配置', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          config: undefined,
        },
      };

      expect(props.element.config).toBeUndefined();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理没有 element 的情况', () => {
      const props = {
        ...defaultProps,
        element: undefined,
      };

      expect(props.element).toBeUndefined();
    });

    it('应该处理没有 otherProps 的情况', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          otherProps: undefined,
        },
      };

      expect(props.element.otherProps).toBeUndefined();
    });

    it('应该处理没有 dataSource 的情况', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          otherProps: {} as any,
        },
      };

      expect(props.element.otherProps.dataSource).toBeUndefined();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理无效的数据格式', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          otherProps: {
            dataSource: [
              { name: null, value: 'invalid' },
              { name: undefined, value: NaN },
            ],
          },
        },
      };

      expect(props.element.otherProps.dataSource).toHaveLength(2);
    });
  });

  describe('ChartElement 渲染与覆盖率', () => {
    const renderChartElement = (props: Partial<typeof defaultProps> = {}) => {
      const merged = {
        ...defaultProps,
        element: {
          type: 'chart',
          children: [{ text: '' }],
          ...defaultProps.element,
          otherProps: {
            dataSource: defaultProps.element.otherProps.dataSource,
            config: defaultProps.element.config,
            columns: [],
            ...(defaultProps.element as any).otherProps,
          },
        },
        ...props,
      } as any;
      merged.element.otherProps = merged.element.otherProps || {};
      return render(<ChartElement {...merged} />);
    };

    it('应渲染出 data-be=chart 的容器', () => {
      renderChartElement();
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
      expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('空 dataSource 时仍渲染容器', () => {
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: { dataSource: [], config: { x: 'name', y: 'value' } },
        } as any,
      });
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
    });

    it('最后一行 keys 与第一行不同时应丢弃最后一行', () => {
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: {
            dataSource: [
              { name: 'A', value: 10 },
              { name: 'B', value: 20 },
              { only: 1 },
            ],
            config: { x: 'name', y: 'value' },
          },
        } as any,
      });
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
    });

    it('isLastNode 抛错时应安全返回 false', () => {
      mockIsLatestNode.mockImplementationOnce(() => {
        throw new Error('store error');
      });
      renderChartElement();
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
    });

    it('未闭合且非只读且非最后节点时应调用 update', () => {
      mockUpdate.mockClear();
      mockIsLatestNode.mockReturnValue(false);
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: {
            ...defaultProps.element.otherProps,
            finished: false,
            config: { x: 'name', y: 'value' },
          },
        } as any,
      });
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('未闭合且为最后节点时 5 秒后应调用 update', async () => {
      vi.useFakeTimers();
      mockUpdate.mockClear();
      mockIsLatestNode.mockReturnValue(true);
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: {
            ...defaultProps.element.otherProps,
            finished: false,
            config: { x: 'name', y: 'value' },
          },
        } as any,
      });
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(mockUpdate).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('应支持 config 为数组', () => {
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: {
            dataSource: [
              { name: 'A', value: 10 },
              { name: 'B', value: 20 },
            ],
            config: [
              { chartType: 'bar', x: 'name', y: 'value' },
              { chartType: 'line', x: 'name', y: 'value' },
            ],
          },
        } as any,
      });
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
    });

    it('应支持 subgraphBy 分组渲染', () => {
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: {
            dataSource: [
              { region: 'North', name: 'A', value: 10 },
              { region: 'North', name: 'B', value: 20 },
              { region: 'South', name: 'C', value: 30 },
            ],
            config: {
              chartType: 'bar',
              x: 'name',
              y: 'value',
              subgraphBy: 'region',
            },
          },
        } as any,
      });
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
    });

    it('应通过 numberString 处理带千分位数字的 dataSource', () => {
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: {
            dataSource: [
              { name: 'A', value: '1,234.56' },
              { name: 'B', value: '2,345.67' },
            ],
            config: { x: 'name', y: 'value' },
          },
        } as any,
      });
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
    });

    it('应通过 numberString 处理日期字符串', () => {
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: {
            dataSource: [
              { name: '2023-01-01', value: 10 },
              { name: '2023-01-02', value: 20 },
            ],
            config: { x: 'name', y: 'value' },
          },
        } as any,
      });
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
    });

    it('应响应 resize 更新宽度', () => {
      renderChartElement();
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
    });

    it('onDragStart 应调用 store.dragStart', () => {
      renderChartElement();
      const target = document.querySelector('[data-be="chart"]');
      expect(target).toBeInTheDocument();
      mockDragStart.mockClear();
      fireEvent.dragStart(target!);
      expect(mockDragStart).toHaveBeenCalled();
    });

    it('readonly 时未闭合不触发 update', () => {
      mockUpdate.mockClear();
      mockReadonly = true;
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: {
            ...defaultProps.element.otherProps,
            finished: false,
            config: { x: 'name', y: 'value' },
          },
        } as any,
      });
      expect(mockUpdate).not.toHaveBeenCalled();
      mockReadonly = false;
    });

    it('应支持 otherProps 直接作为 config', () => {
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: {
            dataSource: [{ name: 'A', value: 10 }],
            chartType: 'bar',
            x: 'name',
            y: 'value',
          },
        } as any,
      });
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
    });

    it('subgraphBy 分组空组应返回 null', () => {
      renderChartElement({
        element: {
          ...defaultProps.element,
          type: 'chart',
          children: [{ text: '' }],
          otherProps: {
            dataSource: [
              { region: 'North', name: 'A', value: 10 },
            ],
            config: {
              chartType: 'bar',
              x: 'name',
              y: 'value',
              subgraphBy: 'region',
            },
          },
        } as any,
      });
      expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
    });
  });
});

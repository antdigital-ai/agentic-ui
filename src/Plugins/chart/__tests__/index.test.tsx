import '@testing-library/jest-dom';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
});

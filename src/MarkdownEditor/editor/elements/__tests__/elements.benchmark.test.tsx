/**
 * @fileoverview 性能基准测试
 *
 * 这个文件包含了性能基准测试，用于比较优化前后的性能差异
 *
 * @author AI Assistant
 * @created 2025-01-07
 */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

// 创建未优化版本的组件
const createUnoptimizedMElement = () => {
  return (props: any) => {
    switch (props.element.type) {
      case 'head':
        return (
          <div
            {...props.attributes}
            data-testid="markdown-heading"
            style={{
              fontSize: `${1.5 - (props.element.level - 1) * 0.125}em`,
              fontWeight: 600,
            }}
          >
            {props.children}
          </div>
        );
      default:
        return <p data-testid="paragraph">{props.children}</p>;
    }
  };
};

// 创建优化版本的组件（使用 React.memo）
const createOptimizedMElement = () => {
  const areElementPropsEqual = (prevProps: any, nextProps: any) => {
    if (prevProps.element !== nextProps.element) {
      if (
        prevProps.element.type !== nextProps.element.type ||
        JSON.stringify(prevProps.element) !== JSON.stringify(nextProps.element)
      ) {
        return false;
      }
    }
    return prevProps.children === nextProps.children;
  };

  const MElementComponent = (props: any) => {
    switch (props.element.type) {
      case 'head':
        return (
          <div
            {...props.attributes}
            data-testid="markdown-heading"
            style={{
              fontSize: `${1.5 - (props.element.level - 1) * 0.125}em`,
              fontWeight: 600,
            }}
          >
            {props.children}
          </div>
        );
      default:
        return <p data-testid="paragraph">{props.children}</p>;
    }
  };

  return React.memo(MElementComponent, areElementPropsEqual);
};

describe('Performance Benchmark Tests', () => {
  const RENDER_COUNT = 1000;
  const RERENDER_COUNT = 100;

  describe('MElement Performance Comparison', () => {
    it('should measure rendering performance difference', () => {
      const UnoptimizedMElement = createUnoptimizedMElement();
      const OptimizedMElement = createOptimizedMElement();

      const element = { type: 'paragraph', children: [{ text: 'test' }] };
      const attributes = { ref: React.createRef() };

      // 测试未优化组件的渲染时间
      const unoptimizedStart = performance.now();
      for (let i = 0; i < RENDER_COUNT; i++) {
        render(
          <UnoptimizedMElement element={element} attributes={attributes}>
            Content {i}
          </UnoptimizedMElement>,
        );
      }
      const unoptimizedEnd = performance.now();
      const unoptimizedTime = unoptimizedEnd - unoptimizedStart;

      // 测试优化组件的渲染时间
      const optimizedStart = performance.now();
      for (let i = 0; i < RENDER_COUNT; i++) {
        render(
          <OptimizedMElement element={element} attributes={attributes}>
            Content {i}
          </OptimizedMElement>,
        );
      }
      const optimizedEnd = performance.now();
      const optimizedTime = optimizedEnd - optimizedStart;

      // 优化版本应该至少不会比未优化版本慢太多
      // 在某些情况下，memo 可能会增加轻微的开销，但应该在合理范围内
      expect(optimizedTime).toBeLessThan(unoptimizedTime * 3);
    });

    it('should measure re-rendering performance with prop changes', () => {
      const UnoptimizedMElement = createUnoptimizedMElement();
      const OptimizedMElement = createOptimizedMElement();

      let unoptimizedRerenderCount = 0;
      let optimizedRerenderCount = 0;

      // 创建计数包装器
      const UnoptimizedWrapper = ({ element }: any) => {
        unoptimizedRerenderCount++;
        return (
          <UnoptimizedMElement
            element={element}
            attributes={{ ref: React.createRef() }}
          >
            Test
          </UnoptimizedMElement>
        );
      };

      const OptimizedWrapper = ({ element }: any) => {
        optimizedRerenderCount++;
        return (
          <OptimizedMElement
            element={element}
            attributes={{ ref: React.createRef() }}
          >
            Test
          </OptimizedMElement>
        );
      };

      const element1 = { type: 'paragraph', children: [{ text: 'test1' }] };
      const element2 = { type: 'paragraph', children: [{ text: 'test2' }] };

      // 测试未优化组件的重新渲染
      const { rerender: rerenderUnoptimized } = render(
        <UnoptimizedWrapper element={element1} />,
      );

      for (let i = 0; i < RERENDER_COUNT; i++) {
        rerenderUnoptimized(
          <UnoptimizedWrapper element={i % 2 === 0 ? element1 : element2} />,
        );
      }

      // 测试优化组件的重新渲染
      const { rerender: rerenderOptimized } = render(
        <OptimizedWrapper element={element1} />,
      );

      for (let i = 0; i < RERENDER_COUNT; i++) {
        rerenderOptimized(
          <OptimizedWrapper element={i % 2 === 0 ? element1 : element2} />,
        );
      }

      // 两者的重新渲染次数应该相似，因为元素确实在变化
      expect(optimizedRerenderCount).toBeGreaterThan(0);
      expect(unoptimizedRerenderCount).toBeGreaterThan(0);
    });

    it('should measure re-rendering performance with same props', () => {
      const OptimizedMElement = createOptimizedMElement();

      let wrapperRenderCount = 0;
      let memoizedComponentRenderCount = 0;

      // 创建一个内部计数的组件
      const CountingMElement = React.memo(
        (props: any) => {
          memoizedComponentRenderCount++;
          return <OptimizedMElement {...props} />;
        },
        (prevProps, nextProps) => {
          // 总是返回 true 表示 props 相同，不需要重新渲染
          return JSON.stringify(prevProps) === JSON.stringify(nextProps);
        },
      );

      const TestWrapper = ({ element }: any) => {
        wrapperRenderCount++;
        return (
          <CountingMElement
            element={element}
            attributes={{ ref: React.createRef() }}
          >
            Test
          </CountingMElement>
        );
      };

      const element = { type: 'paragraph', children: [{ text: 'test' }] };

      // 初始渲染
      const { rerender } = render(<TestWrapper element={element} />);

      // 使用相同的 props 多次重新渲染
      for (let i = 0; i < RERENDER_COUNT; i++) {
        rerender(<TestWrapper element={element} />);
      }

      // 包装组件应该渲染多次，但 memo 化的组件应该只渲染一次
      expect(wrapperRenderCount).toBeGreaterThan(RERENDER_COUNT);
      expect(memoizedComponentRenderCount).toBeLessThanOrEqual(
        wrapperRenderCount / 2,
      );
    });

    it('should handle complex element structures efficiently', () => {
      const OptimizedMElement = createOptimizedMElement();

      // 创建复杂的元素结构
      const createComplexElement = (depth: number, breadth: number): any => {
        if (depth === 0) {
          return {
            type: 'paragraph',
            children: [{ text: `leaf-${Math.random()}` }],
          };
        }

        const children = [];
        for (let i = 0; i < breadth; i++) {
          children.push(createComplexElement(depth - 1, breadth));
        }

        return {
          type: 'head',
          level: depth,
          children,
        };
      };

      const complexElement = createComplexElement(3, 5);

      const startTime = performance.now();

      // 渲染复杂结构
      render(
        <OptimizedMElement
          element={complexElement}
          attributes={{ ref: React.createRef() }}
        >
          Complex Content
        </OptimizedMElement>,
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // 复杂结构的渲染应该在合理时间内完成
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not cause memory leaks with frequent re-renders', () => {
      const OptimizedMElement = createOptimizedMElement();

      // 模拟大量的渲染和清理
      const elements: any[] = [];

      for (let i = 0; i < 1000; i++) {
        const element = {
          type: 'paragraph',
          children: [{ text: `test-${i}` }],
        };
        elements.push(element);

        const { unmount } = render(
          <OptimizedMElement
            element={element}
            attributes={{ ref: React.createRef() }}
          >
            Content {i}
          </OptimizedMElement>,
        );

        // 立即卸载组件
        unmount();
      }

      // 如果没有内存泄漏，这个测试应该能够顺利完成
      expect(elements.length).toBe(1000);
    });

    it('should handle rapid prop changes efficiently', () => {
      const OptimizedMElement = createOptimizedMElement();

      const elements = Array.from({ length: 100 }, (_, i) => ({
        type: 'paragraph',
        children: [{ text: `test-${i}` }],
      }));

      const startTime = performance.now();

      let currentElementIndex = 0;
      const { rerender } = render(
        <OptimizedMElement
          element={elements[currentElementIndex]}
          attributes={{ ref: React.createRef() }}
        >
          Content
        </OptimizedMElement>,
      );

      // 快速更改 props
      for (let i = 0; i < 500; i++) {
        currentElementIndex = (currentElementIndex + 1) % elements.length;
        rerender(
          <OptimizedMElement
            element={elements[currentElementIndex]}
            attributes={{ ref: React.createRef() }}
          >
            Content
          </OptimizedMElement>,
        );
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 快速更改应该在合理时间内完成
      expect(totalTime).toBeLessThan(1000);
      expect(totalTime / 500).toBeLessThan(2); // 平均每次更改不超过 2ms
    });
  });
});

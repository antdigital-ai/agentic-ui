/**
 * ErrorBoundary 组件测试文件
 *
 * 测试覆盖范围：
 * - 基本渲染功能
 * - 错误捕获功能
 * - 错误状态处理
 * - 边界情况处理
 */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '../../../editor/elements/ErrorBoundary';

// Mock console.log
const mockConsoleLog = vi.fn();
console.log = mockConsoleLog;

describe('ErrorBoundary Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ConfigProvider>{component}</ConfigProvider>);
  };

  // 创建一个会抛出错误的组件
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>正常内容</div>;
  };

  const defaultProps = {
    children: <div>正常内容</div>,
    fallback: <div>错误回退内容</div>,
  };

  describe('基本渲染功能', () => {
    it('应该正确渲染 ErrorBoundary 组件', () => {
      const { container } = renderWithProvider(
        <ErrorBoundary {...defaultProps} />,
      );

      expect(container).toHaveTextContent('正常内容');
    });

    it('应该显示 children 内容', () => {
      const { container } = renderWithProvider(
        <ErrorBoundary {...defaultProps} />,
      );

      expect(container).toHaveTextContent('正常内容');
    });

    it('应该渲染为 React 组件', () => {
      const { container } = renderWithProvider(
        <ErrorBoundary {...defaultProps} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('错误捕获功能', () => {
    it('应该捕获子组件的错误', () => {
      const { container } = renderWithProvider(
        <ErrorBoundary fallback={<div>错误回退内容</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(container).toHaveTextContent('错误回退内容');
    });

    it('应该在错误时显示 fallback', () => {
      const customFallback = <div>自定义错误回退</div>;
      const { container } = renderWithProvider(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(container).toHaveTextContent('自定义错误回退');
    });

    it('应该调用 componentDidCatch', () => {
      renderWithProvider(
        <ErrorBoundary fallback={<div>错误回退内容</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  describe('错误状态处理', () => {
    it('应该在错误后保持错误状态', () => {
      const { container, rerender } = renderWithProvider(
        <ErrorBoundary fallback={<div>错误回退内容</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(container).toHaveTextContent('错误回退内容');

      // 重新渲染，错误状态应该保持
      rerender(
        <ConfigProvider>
          <ErrorBoundary fallback={<div>错误回退内容</div>}>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </ConfigProvider>,
      );

      expect(container).toHaveTextContent('错误回退内容');
    });

    it('应该在无错误时显示正常内容', () => {
      const { container } = renderWithProvider(
        <ErrorBoundary fallback={<div>错误回退内容</div>}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(container).toHaveTextContent('正常内容');
    });
  });

  describe('边界情况处理', () => {
    it('应该处理空的 children', () => {
      const { container } = renderWithProvider(
        <ErrorBoundary fallback={<div>错误回退内容</div>}>
          {null}
        </ErrorBoundary>,
      );

      expect(container).toBeInTheDocument();
    });

    it('应该处理空的 fallback', () => {
      const { container } = renderWithProvider(
        <ErrorBoundary fallback={null}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(container).toBeInTheDocument();
    });

    it('应该处理复杂的 children', () => {
      const complexChildren = (
        <div>
          <span>复杂内容</span>
          <strong>粗体文本</strong>
        </div>
      );

      const { container } = renderWithProvider(
        <ErrorBoundary fallback={<div>错误回退内容</div>}>
          {complexChildren}
        </ErrorBoundary>,
      );

      expect(container).toHaveTextContent('复杂内容');
      expect(container).toHaveTextContent('粗体文本');
    });

    it('应该处理复杂的 fallback', () => {
      const complexFallback = (
        <div>
          <span>复杂错误回退</span>
          <strong>粗体错误文本</strong>
        </div>
      );

      const { container } = renderWithProvider(
        <ErrorBoundary fallback={complexFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(container).toHaveTextContent('复杂错误回退');
      expect(container).toHaveTextContent('粗体错误文本');
    });

    it('应该处理多个 children', () => {
      const multipleChildren = [
        <span key="1">第一个</span>,
        <span key="2">第二个</span>,
        <span key="3">第三个</span>,
      ];

      const { container } = renderWithProvider(
        <ErrorBoundary fallback={<div>错误回退内容</div>}>
          {multipleChildren}
        </ErrorBoundary>,
      );

      expect(container).toHaveTextContent('第一个');
      expect(container).toHaveTextContent('第二个');
      expect(container).toHaveTextContent('第三个');
    });
  });

  describe('构造函数和状态', () => {
    it('应该正确初始化状态', () => {
      const { container } = renderWithProvider(
        <ErrorBoundary {...defaultProps} />,
      );

      expect(container).toHaveTextContent('正常内容');
    });

    it('应该在构造函数中设置初始状态', () => {
      const { container } = renderWithProvider(
        <ErrorBoundary {...defaultProps} />,
      );

      expect(container).toHaveTextContent('正常内容');
    });
  });

  describe('静态方法', () => {
    it('应该正确处理 getDerivedStateFromError', () => {
      const { container } = renderWithProvider(
        <ErrorBoundary fallback={<div>错误回退内容</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(container).toHaveTextContent('错误回退内容');
    });
  });

  describe('生命周期方法', () => {
    it('应该调用 componentDidCatch 方法', () => {
      renderWithProvider(
        <ErrorBoundary fallback={<div>错误回退内容</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });
});

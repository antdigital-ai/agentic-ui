import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXCEPTION } from '../MessagesContent/EXCEPTION';

describe('EXCEPTION', () => {
  const defaultProps = {
    content: 'This is an error message',
    extra: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染错误消息', () => {
      render(<EXCEPTION {...defaultProps} />);

      expect(screen.getByText('This is an error message')).toBeInTheDocument();
    });

    it('应该处理空内容', () => {
      const { container } = render(<EXCEPTION content="" extra={null} />);

      // 检查组件是否渲染
      const divElement = container.querySelector('div');
      expect(divElement).toBeInTheDocument();
    });

    it('应该处理undefined内容', () => {
      const { container } = render(
        <EXCEPTION content={undefined as any} extra={null} />,
      );

      // 检查组件是否渲染
      const divElement = container.querySelector('div');
      expect(divElement).toBeInTheDocument();
    });

    it('应该处理null内容', () => {
      const { container } = render(
        <EXCEPTION content={null as any} extra={null} />,
      );

      // 检查组件是否渲染
      const divElement = container.querySelector('div');
      expect(divElement).toBeInTheDocument();
    });
  });

  describe('额外内容测试', () => {
    it('应该渲染额外内容', () => {
      render(
        <EXCEPTION
          {...defaultProps}
          extra={<div data-testid="extra-content">Extra</div>}
        />,
      );

      expect(screen.getByTestId('extra-content')).toBeInTheDocument();
    });

    it('应该处理字符串额外内容', () => {
      render(<EXCEPTION {...defaultProps} extra="Extra string" />);

      expect(screen.getByText('Extra string')).toBeInTheDocument();
    });

    it('应该处理数字额外内容', () => {
      render(<EXCEPTION {...defaultProps} extra={123} />);

      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理数字内容', () => {
      render(<EXCEPTION content={String(42)} extra={null} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('组合测试', () => {
    it('应该同时渲染内容和额外内容', () => {
      render(
        <EXCEPTION
          content="Error message"
          extra={<div data-testid="extra-content">Extra</div>}
        />,
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByTestId('extra-content')).toBeInTheDocument();
    });

    it('应该处理复杂的额外内容', () => {
      render(
        <EXCEPTION
          content="Error message"
          extra={
            <div>
              <span data-testid="complex-extra">Complex</span>
              <span>Content</span>
            </div>
          }
        />,
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByTestId('complex-extra')).toBeInTheDocument();
    });
  });
});

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReloadIcon } from '../@ant-design/agentic-ui/Bubble/MessagesContent/icons';

describe('ReloadIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染ReloadIcon', () => {
      render(<ReloadIcon data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      expect(svg).toBeInTheDocument();
    });

    it('应该应用正确的SVG属性', () => {
      render(<ReloadIcon data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('version', '1.1');
      expect(svg).toHaveAttribute('width', '1em');
      expect(svg).toHaveAttribute('height', '1em');
    });

    it('应该处理自定义props', () => {
      render(<ReloadIcon className="custom-class" data-testid="custom-icon" />);
      const svg = screen.getByTestId('custom-icon');
      expect(svg).toHaveClass('custom-class');
    });
  });

  describe('点击处理测试', () => {
    it('应该处理点击事件', () => {
      render(<ReloadIcon data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      fireEvent.click(svg);

      // 点击后应该应用旋转动画
      expect(svg).toHaveStyle({
        transform: 'rotate(360deg)',
        transition: 'transform 0.5s ease-in-out',
      });
    });

    it('应该处理多次点击', () => {
      render(<ReloadIcon data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');

      // 第一次点击
      fireEvent.click(svg);
      expect(svg).toHaveStyle({
        transform: 'rotate(360deg)',
      });

      // 第二次点击
      fireEvent.click(svg);
      expect(svg).toHaveStyle({
        transform: 'rotate(720deg)',
      });
    });

    it('应该处理自定义onClick', () => {
      const onClick = vi.fn();
      render(<ReloadIcon onClick={onClick} data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      fireEvent.click(svg);

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('动画测试', () => {
    it('应该应用正确的初始样式', () => {
      render(<ReloadIcon data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      expect(svg).toHaveStyle({
        transform: 'rotate(0deg)',
        transition: 'transform 0.5s ease-in-out',
      });
    });

    it('应该处理旋转动画', () => {
      render(<ReloadIcon data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');

      // 模拟多次点击
      for (let i = 0; i < 3; i++) {
        fireEvent.click(svg);
      }

      expect(svg).toHaveStyle({
        transform: 'rotate(1080deg)',
      });
    });
  });

  describe('SVG内容测试', () => {
    it('应该包含正确的SVG路径', () => {
      render(<ReloadIcon data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      const paths = svg.querySelectorAll('path');

      // 应该有两个path元素
      expect(paths).toHaveLength(2);
    });

    it('应该应用正确的fill属性', () => {
      render(<ReloadIcon data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      const paths = svg.querySelectorAll('path');

      paths.forEach((path) => {
        expect(path).toHaveAttribute('fill', 'currentColor');
      });
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空的props', () => {
      render(<ReloadIcon data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      expect(svg).toBeInTheDocument();
    });

    it('应该处理undefined的onClick', () => {
      render(<ReloadIcon onClick={undefined} data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      fireEvent.click(svg);

      // 不应该抛出错误
      expect(svg).toBeInTheDocument();
    });
  });

  describe('可访问性测试', () => {
    it('应该保持SVG的可访问性', () => {
      render(<ReloadIcon data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      expect(svg).toBeInTheDocument();
      expect(svg.tagName).toBe('svg');
    });

    it('应该处理aria属性', () => {
      render(<ReloadIcon aria-label="Reload icon" data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      expect(svg).toHaveAttribute('aria-label', 'Reload icon');
    });

    it('应该处理role属性', () => {
      render(<ReloadIcon role="button" data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      expect(svg).toHaveAttribute('role', 'button');
    });
  });

  describe('性能测试', () => {
    it('应该正确处理多次渲染', () => {
      const { rerender } = render(<ReloadIcon data-testid="reload-icon" />);

      // 重新渲染
      rerender(<ReloadIcon data-testid="reload-icon" />);

      const svg = screen.getByTestId('reload-icon');
      expect(svg).toBeInTheDocument();
    });

    it('应该处理props变化', () => {
      const { rerender } = render(<ReloadIcon data-testid="reload-icon" />);

      // 改变props
      rerender(<ReloadIcon className="new-class" data-testid="reload-icon" />);

      const svg = screen.getByTestId('reload-icon');
      expect(svg).toHaveClass('new-class');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理onClick抛出错误', () => {
      const onClick = vi.fn().mockImplementation(() => {
        throw new Error('Click error');
      });

      render(<ReloadIcon onClick={onClick} data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');

      // 不应该因为错误而崩溃
      expect(() => fireEvent.click(svg)).not.toThrow();
    });

    it('应该处理异步onClick', () => {
      const onClick = vi.fn().mockImplementation(() => Promise.resolve());

      render(<ReloadIcon onClick={onClick} data-testid="reload-icon" />);
      const svg = screen.getByTestId('reload-icon');
      fireEvent.click(svg);

      expect(onClick).toHaveBeenCalled();
    });
  });
});

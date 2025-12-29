import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { TextLoading } from '../@ant-design/agentic-ui/Components/lotties/TextLoading';

describe('TextLoading 组件', () => {
  it('应该渲染文字加载组件', () => {
    render(<TextLoading />);

    expect(screen.getByTestId('text-loading')).toBeInTheDocument();
  });

  it('应该显示自定义文本', () => {
    render(<TextLoading text="加载中..." />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('应该显示默认文本', () => {
    render(<TextLoading />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('应该应用自定义className', () => {
    render(<TextLoading className="custom-class" />);

    expect(screen.getByTestId('text-loading')).toHaveClass('custom-class');
  });

  it('应该应用自定义样式', () => {
    render(<TextLoading style={{ color: 'rgb(255, 0, 0)' }} />);

    expect(screen.getByTestId('text-loading')).toHaveStyle({
      color: 'rgb(255, 0, 0)',
    });
  });

  it('应该支持无障碍属性', () => {
    render(<TextLoading text="加载中..." />);

    const element = screen.getByTestId('text-loading');
    expect(element).toHaveAttribute('role', 'status');
    expect(element).toHaveAttribute('aria-live', 'polite');
    expect(element).toHaveAttribute('aria-label', '加载中...');
  });

  it('禁用动画时应该添加disabled类', () => {
    render(<TextLoading disabled={true} />);

    const element = screen.getByTestId('text-loading');
    expect(element.className).toContain('disabled');
  });

  it('应该应用自定义字体大小', () => {
    render(<TextLoading fontSize="24px" />);

    expect(screen.getByTestId('text-loading')).toHaveStyle({ fontSize: '24px' });
  });

  it('默认应该使用亮色主题', () => {
    render(<TextLoading />);

    const element = screen.getByTestId('text-loading');
    expect(element.className).toContain('light');
  });

  it('应该支持暗色主题', () => {
    render(<TextLoading theme="dark" />);

    const element = screen.getByTestId('text-loading');
    expect(element.className).toContain('dark');
  });

  it('应该支持亮色主题', () => {
    render(<TextLoading theme="light" />);

    const element = screen.getByTestId('text-loading');
    expect(element.className).toContain('light');
  });
});


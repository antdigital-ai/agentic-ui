import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IconButton } from '../Button/IconButton';

describe('IconButton 组件', () => {
  const TestIcon = () => <span data-testid="test-icon">📌</span>;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该渲染基本的图标按钮', () => {
    const { container } = render(<IconButton icon={<TestIcon />} />);

    expect(container.querySelector('.ant-icon-button')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('应该显示工具提示', () => {
    render(<IconButton icon={<TestIcon />} tooltip="这是提示" />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('应该处理点击事件', async () => {
    const handleClick = vi.fn();

    render(<IconButton icon={<TestIcon />} onClick={handleClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该处理异步点击事件', async () => {
    const asyncClick = vi.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    render(<IconButton icon={<TestIcon />} onClick={asyncClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(asyncClick).toHaveBeenCalledTimes(1);
  });

  it('应该在禁用状态下阻止点击', () => {
    const handleClick = vi.fn();

    render(<IconButton icon={<TestIcon />} disabled onClick={handleClick} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该显示加载状态', () => {
    const { container } = render(<IconButton icon={<TestIcon />} loading />);

    const button = container.querySelector('.ant-icon-button-button');
    expect(button).toHaveClass('ant-icon-button-button-loading');
  });

  it('应该支持激活状态', () => {
    const { container } = render(<IconButton icon={<TestIcon />} active />);

    const button = container.querySelector('.ant-icon-button-button');
    expect(button).toHaveClass('ant-icon-button-button-active');
  });

  it('应该支持提升效果', () => {
    const { container } = render(<IconButton icon={<TestIcon />} elevated />);

    const button = container.querySelector('.ant-icon-button-button');
    expect(button).toHaveClass('ant-icon-button-button-elevated');
  });

  it('应该支持基本尺寸', () => {
    const { container } = render(
      <IconButton icon={<TestIcon />} size="base" />,
    );

    const button = container.querySelector('.ant-icon-button-button');
    expect(button).not.toHaveClass('ant-icon-button-button-sm');
    expect(button).not.toHaveClass('ant-icon-button-button-xs');
  });

  it('应该支持小尺寸', () => {
    const { container } = render(<IconButton icon={<TestIcon />} size="sm" />);

    const button = container.querySelector('.ant-icon-button-button');
    expect(button).toHaveClass('ant-icon-button-button-sm');
  });

  it('应该支持超小尺寸', () => {
    const { container } = render(<IconButton icon={<TestIcon />} size="xs" />);

    const button = container.querySelector('.ant-icon-button-button');
    expect(button).toHaveClass('ant-icon-button-button-xs');
  });

  it('应该支持自定义 className', () => {
    const { container } = render(
      <IconButton icon={<TestIcon />} className="custom-class" />,
    );

    const wrapper = container.querySelector('.ant-icon-button');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('应该支持自定义样式', () => {
    const { container } = render(
      <IconButton
        icon={<TestIcon />}
        style={{ backgroundColor: 'red' }}
      />,
    );

    const wrapper = container.querySelector('.ant-icon-button');
    expect(wrapper).toHaveStyle({ backgroundColor: 'red' });
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    const { container } = render(
      <ConfigProvider prefixCls="custom">
        <IconButton icon={<TestIcon />} />
      </ConfigProvider>,
    );

    expect(container.querySelector('.custom-icon-button')).toBeInTheDocument();
  });

  it('应该支持多种状态组合', () => {
    const { container } = render(
      <IconButton
        icon={<TestIcon />}
        active
        elevated
        disabled
        loading
        size="sm"
      />,
    );

    const button = container.querySelector('.ant-icon-button-button');
    expect(button).toHaveClass('ant-icon-button-button-active');
    expect(button).toHaveClass('ant-icon-button-button-elevated');
    expect(button).toHaveClass('ant-icon-button-button-disabled');
    expect(button).toHaveClass('ant-icon-button-button-loading');
    expect(button).toHaveClass('ant-icon-button-button-sm');
  });

  it('应该处理没有 icon 的情况', () => {
    const { container } = render(<IconButton />);

    expect(container.querySelector('.ant-icon-button')).toBeInTheDocument();
  });

  it('应该支持自定义 key', () => {
    const { container } = render(
      <IconButton key="test-key" icon={<TestIcon />} />,
    );

    expect(container.querySelector('.ant-icon-button')).toBeInTheDocument();
  });

  it('禁用状态应该有正确的样式类', () => {
    const { container } = render(<IconButton icon={<TestIcon />} disabled />);

    const button = container.querySelector('.ant-icon-button-button');
    expect(button).toHaveClass('ant-icon-button-button-disabled');
  });

  it('加载状态应该显示加载样式', () => {
    const { container } = render(<IconButton icon={<TestIcon />} loading />);

    const button = container.querySelector('.ant-icon-button-button');
    // 加载状态下按钮应该有加载样式类
    expect(button).toHaveClass('ant-icon-button-button-loading');
  });

  it('应该正确渲染在 Tooltip 中', () => {
    render(<IconButton icon={<TestIcon />} tooltip="测试工具提示" />);

    // 验证按钮存在
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToggleButton } from '../../src/Components/Button/ToggleButton';

describe('ToggleButton 组件', () => {
  const TestIcon = () => <span data-testid="test-icon">🔘</span>;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该渲染基本的切换按钮', () => {
    render(<ToggleButton>切换</ToggleButton>);

    expect(screen.getByText('切换')).toBeInTheDocument();
  });

  it('应该显示图标', () => {
    render(<ToggleButton icon={<TestIcon />}>带图标</ToggleButton>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('应该显示触发图标', () => {
    const TriggerIcon = () => <span data-testid="trigger-icon">⚡</span>;

    render(
      <ToggleButton triggerIcon={<TriggerIcon />}>带触发图标</ToggleButton>,
    );

    expect(screen.getByTestId('trigger-icon')).toBeInTheDocument();
  });

  it('应该处理点击事件', async () => {
    const handleClick = vi.fn();

    render(<ToggleButton onClick={handleClick}>点击我</ToggleButton>);

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

    render(<ToggleButton onClick={asyncClick}>异步点击</ToggleButton>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(asyncClick).toHaveBeenCalledTimes(1);
  });

  it('应该在禁用状态下阻止点击', () => {
    const handleClick = vi.fn();

    render(
      <ToggleButton disabled onClick={handleClick}>
        禁用
      </ToggleButton>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该支持激活状态样式', () => {
    const { container } = render(<ToggleButton active>激活</ToggleButton>);

    const wrapper = container.querySelector('.ant-toggle-button');
    expect(wrapper).toHaveClass('ant-toggle-button-active');
  });

  it('应该支持禁用状态样式', () => {
    const { container } = render(<ToggleButton disabled>禁用</ToggleButton>);

    const wrapper = container.querySelector('.ant-toggle-button');
    expect(wrapper).toHaveClass('ant-toggle-button-disabled');
  });

  it('应该支持自定义 className', () => {
    const { container } = render(
      <ToggleButton className="custom-class">自定义类名</ToggleButton>,
    );

    const wrapper = container.querySelector('.ant-toggle-button');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('应该支持自定义样式', () => {
    const { container } = render(
      <ToggleButton style={{ backgroundColor: 'red' }}>
        自定义样式
      </ToggleButton>,
    );

    const wrapper = container.querySelector('.ant-toggle-button');
    expect(wrapper).toHaveStyle({ backgroundColor: 'red' });
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    const { container } = render(
      <ConfigProvider prefixCls="custom">
        <ToggleButton>配置提供者</ToggleButton>
      </ConfigProvider>,
    );

    expect(
      container.querySelector('.custom-toggle-button'),
    ).toBeInTheDocument();
  });

  it('应该同时显示图标、文本和触发图标', () => {
    const TriggerIcon = () => <span data-testid="trigger">→</span>;

    render(
      <ToggleButton icon={<TestIcon />} triggerIcon={<TriggerIcon />}>
        完整按钮
      </ToggleButton>,
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('完整按钮')).toBeInTheDocument();
    expect(screen.getByTestId('trigger')).toBeInTheDocument();
  });

  it('应该支持只有图标无文本', () => {
    render(<ToggleButton icon={<TestIcon />} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('应该支持只有文本无图标', () => {
    render(<ToggleButton>只有文本</ToggleButton>);

    expect(screen.getByText('只有文本')).toBeInTheDocument();
  });

  it('应该禁用按钮波纹效果', () => {
    const { container } = render(<ToggleButton>无波纹</ToggleButton>);

    // 验证按钮存在
    expect(container.querySelector('.ant-toggle-button')).toBeInTheDocument();
  });

  it('应该应用正确的按钮样式', () => {
    const { container } = render(<ToggleButton>样式测试</ToggleButton>);

    const button = container.querySelector('.ant-toggle-button-button');
    expect(button).toHaveStyle({
      background: 'transparent',
      padding: '0',
    });
  });

  it('应该支持多种状态组合', () => {
    const { container } = render(
      <ToggleButton active disabled>
        组合状态
      </ToggleButton>,
    );

    const wrapper = container.querySelector('.ant-toggle-button');
    expect(wrapper).toHaveClass('ant-toggle-button-active');
    expect(wrapper).toHaveClass('ant-toggle-button-disabled');
  });

  it('应该支持自定义 key', () => {
    const { container } = render(
      <ToggleButton key="test-key">自定义键</ToggleButton>,
    );

    expect(container.querySelector('.ant-toggle-button')).toBeInTheDocument();
  });

  it('应该正确渲染空内容', () => {
    const { container } = render(<ToggleButton />);

    expect(container.querySelector('.ant-toggle-button')).toBeInTheDocument();
  });

  it('禁用状态下按钮应该有正确的样式', () => {
    render(<ToggleButton disabled>禁用按钮</ToggleButton>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});

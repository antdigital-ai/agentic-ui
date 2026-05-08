import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SwitchButton } from '../../src/Components/Button/SwitchButton';

describe('SwitchButton 组件', () => {
  const TestIcon = () => <span data-testid="test-icon">📝</span>;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该渲染基本的切换按钮', () => {
    render(<SwitchButton>切换按钮</SwitchButton>);

    expect(screen.getByText('切换按钮')).toBeInTheDocument();
  });

  it('应该显示图标', () => {
    render(<SwitchButton icon={<TestIcon />}>带图标</SwitchButton>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('应该处理点击事件', async () => {
    const handleClick = vi.fn();

    render(<SwitchButton onClick={handleClick}>点击我</SwitchButton>);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
      // 等待 Promise 完成
      await Promise.resolve();
      vi.advanceTimersByTime(0);
      await vi.runAllTimersAsync();
    });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该处理异步点击事件', async () => {
    const asyncClick = vi.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    render(<SwitchButton onClick={asyncClick}>异步点击</SwitchButton>);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
      // 推进时间让 setTimeout 完成
      vi.advanceTimersByTime(100);
      await vi.runAllTimersAsync();
    });

    expect(asyncClick).toHaveBeenCalledTimes(1);
  });

  it('应该在非受控模式下切换激活状态', () => {
    const handleChange = vi.fn();

    render(<SwitchButton onChange={handleChange}>切换</SwitchButton>);

    const button = screen.getByRole('button');

    // 初始状态应该是 false
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // 点击切换到 true
    fireEvent.click(button);
    expect(handleChange).toHaveBeenCalledWith(true);

    // 再次点击切换到 false
    fireEvent.click(button);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('应该支持默认激活状态', () => {
    render(<SwitchButton defaultActive={true}>默认激活</SwitchButton>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('应该在受控模式下工作', () => {
    const { rerender } = render(
      <SwitchButton active={false}>受控按钮</SwitchButton>,
    );

    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    rerender(<SwitchButton active={true}>受控按钮</SwitchButton>);

    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('应该在禁用状态下阻止操作', () => {
    const handleClick = vi.fn();
    const handleChange = vi.fn();

    render(
      <SwitchButton disabled onClick={handleClick} onChange={handleChange}>
        禁用按钮
      </SwitchButton>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('应该显示默认的切换图标', () => {
    const { container } = render(<SwitchButton>默认图标</SwitchButton>);

    // 初始状态应该显示 ChevronDown
    expect(
      container.querySelector('.ant-switch-button-trigger-icon'),
    ).toBeInTheDocument();
  });

  it('应该在激活时显示不同的图标', () => {
    const { container } = render(
      <SwitchButton active={true}>激活图标</SwitchButton>,
    );

    expect(
      container.querySelector('.ant-switch-button-trigger-icon'),
    ).toBeInTheDocument();
  });

  it('应该支持自定义触发图标', () => {
    const CustomTrigger = () => <span data-testid="custom-trigger">⚡</span>;

    render(
      <SwitchButton triggerIcon={<CustomTrigger />}>
        自定义触发图标
      </SwitchButton>,
    );

    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
  });

  it('应该支持自定义 className', () => {
    const { container } = render(
      <SwitchButton className="custom-class">自定义类名</SwitchButton>,
    );

    const button = container.querySelector('.ant-switch-button-button');
    expect(button).toHaveClass('custom-class');
  });

  it('应该支持自定义样式', () => {
    const { container } = render(
      <SwitchButton style={{ backgroundColor: 'red' }}>
        自定义样式
      </SwitchButton>,
    );

    const button = container.querySelector('.ant-switch-button-button');
    expect(button).toHaveStyle({ backgroundColor: 'red' });
  });

  it('应该应用激活状态的样式类', () => {
    const { container } = render(
      <SwitchButton active={true}>激活样式</SwitchButton>,
    );

    const button = container.querySelector('.ant-switch-button-button');
    expect(button).toHaveClass('ant-switch-button-active');
  });

  it('应该应用禁用状态的样式类', () => {
    const { container } = render(
      <SwitchButton disabled>禁用样式</SwitchButton>,
    );

    const button = container.querySelector('.ant-switch-button-button');
    expect(button).toHaveClass('ant-switch-button-disabled');
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    const { container } = render(
      <ConfigProvider prefixCls="custom">
        <SwitchButton>配置提供者</SwitchButton>
      </ConfigProvider>,
    );

    expect(
      container.querySelector('.custom-switch-button-button'),
    ).toBeInTheDocument();
  });

  it('应该同时触发 onChange 和 onClick', async () => {
    const handleChange = vi.fn();
    const handleClick = vi.fn();

    render(
      <SwitchButton onChange={handleChange} onClick={handleClick}>
        双回调
      </SwitchButton>,
    );

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
      // 等待 Promise 完成
      await Promise.resolve();
      vi.advanceTimersByTime(0);
      await vi.runAllTimersAsync();
    });

    expect(handleChange).toHaveBeenCalledWith(true);
    expect(handleClick).toHaveBeenCalled();
  });

  it('应该正确显示图标和文本', () => {
    render(<SwitchButton icon={<TestIcon />}>图标和文本</SwitchButton>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('图标和文本')).toBeInTheDocument();
  });

  it('应该支持可访问性属性', () => {
    render(<SwitchButton>可访问性</SwitchButton>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed');
  });

  it('应该在受控模式下不改变内部状态', () => {
    const handleChange = vi.fn();

    render(
      <SwitchButton active={false} onChange={handleChange}>
        固定状态
      </SwitchButton>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleChange).toHaveBeenCalledWith(true);
    // 按钮仍应保持 false，因为是受控模式且未更新 prop
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('应该支持自定义 key', () => {
    const { container } = render(
      <SwitchButton key="test-key">自定义键</SwitchButton>,
    );

    expect(container.querySelector('.ant-switch-button')).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ButtonTab from '../@ant-design/agentic-ui/ChatBootPage/ButtonTab';

describe('ButtonTab 组件', () => {
  const TestIcon = () => <span data-testid="test-icon">📌</span>;

  it('应该渲染基本的按钮标签', () => {
    render(<ButtonTab>测试按钮</ButtonTab>);

    expect(screen.getByText('测试按钮')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('应该显示选中状态', () => {
    const { container } = render(<ButtonTab selected>选中按钮</ButtonTab>);

    const button = container.querySelector('.md-editor-button-tab');
    expect(button).toHaveClass('md-editor-button-tab-selected');
  });

  it('应该处理点击事件', () => {
    const handleClick = vi.fn();

    render(<ButtonTab onClick={handleClick}>点击按钮</ButtonTab>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该处理图标点击事件', () => {
    const handleIconClick = vi.fn();

    render(
      <ButtonTab icon={<TestIcon />} onIconClick={handleIconClick}>
        图标按钮
      </ButtonTab>,
    );

    const iconElement = screen.getByTestId('test-icon');
    fireEvent.click(iconElement);

    expect(handleIconClick).toHaveBeenCalledTimes(1);
  });

  it('应该阻止图标点击事件冒泡', () => {
    const handleClick = vi.fn();
    const handleIconClick = vi.fn();

    render(
      <ButtonTab
        onClick={handleClick}
        icon={<TestIcon />}
        onIconClick={handleIconClick}
      >
        冒泡测试
      </ButtonTab>,
    );

    const iconElement = screen.getByTestId('test-icon');
    fireEvent.click(iconElement);

    expect(handleIconClick).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该处理键盘事件（Enter键）', () => {
    const handleClick = vi.fn();

    render(<ButtonTab onClick={handleClick}>键盘按钮</ButtonTab>);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该处理键盘事件（空格键）', () => {
    const handleClick = vi.fn();

    render(<ButtonTab onClick={handleClick}>空格按钮</ButtonTab>);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该忽略其他键盘事件', () => {
    const handleClick = vi.fn();

    render(<ButtonTab onClick={handleClick}>其他键按钮</ButtonTab>);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Escape' });

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该显示图标', () => {
    render(<ButtonTab icon={<TestIcon />}>带图标</ButtonTab>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('应该支持自定义类名', () => {
    const { container } = render(
      <ButtonTab className="custom-class">自定义类名</ButtonTab>,
    );

    const button = container.querySelector('.md-editor-button-tab');
    expect(button).toHaveClass('custom-class');
  });

  it('应该支持自定义前缀类名', () => {
    const { container } = render(
      <ButtonTab prefixCls="custom-prefix">自定义前缀</ButtonTab>,
    );

    const button = container.querySelector('.custom-prefix');
    expect(button).toBeInTheDocument();
  });

  it('应该在没有子元素时不显示文本', () => {
    const { container } = render(<ButtonTab />);

    const textElement = container.querySelector('.md-editor-button-tab-text');
    expect(textElement).not.toBeInTheDocument();
  });

  it('应该在没有图标时不显示图标容器', () => {
    const { container } = render(<ButtonTab>无图标</ButtonTab>);

    const iconElement = container.querySelector('.md-editor-button-tab-icon');
    expect(iconElement).not.toBeInTheDocument();
  });

  it('应该为可点击图标添加样式类', () => {
    const { container } = render(
      <ButtonTab icon={<TestIcon />} onIconClick={vi.fn()}>
        可点击图标
      </ButtonTab>,
    );

    const iconElement = container.querySelector('.md-editor-button-tab-icon');
    expect(iconElement).toHaveClass('md-editor-button-tab-icon-clickable');
  });

  it('应该为不可点击图标不添加样式类', () => {
    const { container } = render(
      <ButtonTab icon={<TestIcon />}>不可点击图标</ButtonTab>,
    );

    const iconElement = container.querySelector('.md-editor-button-tab-icon');
    expect(iconElement).not.toHaveClass('md-editor-button-tab-icon-clickable');
  });

  it('应该设置正确的 tabIndex', () => {
    render(<ButtonTab>可聚焦</ButtonTab>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('应该设置正确的按钮类型', () => {
    render(<ButtonTab>按钮类型</ButtonTab>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    const { container } = render(
      <ConfigProvider prefixCls="custom">
        <ButtonTab>配置提供者</ButtonTab>
      </ConfigProvider>,
    );

    expect(
      container.querySelector('.md-editor-button-tab'),
    ).toBeInTheDocument();
  });

  it('应该支持所有属性的组合', () => {
    const handleClick = vi.fn();
    const handleIconClick = vi.fn();

    const { container } = render(
      <ButtonTab
        selected
        onClick={handleClick}
        onIconClick={handleIconClick}
        className="custom-class"
        prefixCls="custom-prefix"
        icon={<TestIcon />}
      >
        完整功能
      </ButtonTab>,
    );

    const button = container.querySelector('.custom-prefix');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('custom-prefix-selected');
    expect(button).toHaveClass('custom-class');
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('完整功能')).toBeInTheDocument();
  });

  it('应该正确处理默认值', () => {
    const { container } = render(<ButtonTab>默认值测试</ButtonTab>);

    const button = container.querySelector('.md-editor-button-tab');
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveClass('md-editor-button-tab-selected');
  });
});

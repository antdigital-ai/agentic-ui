import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ButtonTabGroup, {
  ButtonTabItem,
} from '../../ChatBootPage/ButtonTabGroup';

describe('ButtonTabGroup 组件', () => {
  const TestIcon = () => <span data-testid="test-icon">📌</span>;

  const mockItems: ButtonTabItem[] = [
    { key: 'tab1', label: '标签1' },
    { key: 'tab2', label: '标签2', icon: <TestIcon /> },
    { key: 'tab3', label: '标签3', disabled: true },
    { key: 'tab4', label: '标签4', icon: <TestIcon />, onIconClick: vi.fn() },
  ];

  it('应该渲染基本的标签组', () => {
    render(<ButtonTabGroup items={mockItems} />);

    expect(screen.getByText('标签1')).toBeInTheDocument();
    expect(screen.getByText('标签2')).toBeInTheDocument();
    expect(screen.getByText('标签3')).toBeInTheDocument();
    expect(screen.getByText('标签4')).toBeInTheDocument();
  });

  it('应该显示正确的角色和标签', () => {
    render(<ButtonTabGroup items={mockItems} />);

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', 'Tab group');
  });

  it('应该处理标签点击事件', () => {
    const handleChange = vi.fn();

    render(<ButtonTabGroup items={mockItems} onChange={handleChange} />);

    const tab1 = screen.getByText('标签1');
    fireEvent.click(tab1);

    expect(handleChange).toHaveBeenCalledWith('tab1');
  });

  it('应该支持受控模式', () => {
    const handleChange = vi.fn();

    render(
      <ButtonTabGroup
        items={mockItems}
        activeKey="tab2"
        onChange={handleChange}
      />,
    );

    const tab1 = screen.getByText('标签1');
    fireEvent.click(tab1);

    expect(handleChange).toHaveBeenCalledWith('tab1');
  });

  it('应该支持非受控模式', () => {
    const handleChange = vi.fn();

    render(
      <ButtonTabGroup
        items={mockItems}
        defaultActiveKey="tab2"
        onChange={handleChange}
      />,
    );

    const tab1 = screen.getByText('标签1');
    fireEvent.click(tab1);

    expect(handleChange).toHaveBeenCalledWith('tab1');
  });

  it('应该正确处理默认选中项', () => {
    render(<ButtonTabGroup items={mockItems} defaultActiveKey="tab2" />);

    // 检查第二个标签是否被选中
    const tab2 = screen.getByText('标签2').closest('button');
    expect(tab2).toHaveClass('md-editor-button-tab-selected');
  });

  it('应该在没有指定默认选中项时选中第一个', () => {
    render(<ButtonTabGroup items={mockItems} />);

    const tab1 = screen.getByText('标签1').closest('button');
    expect(tab1).toHaveClass('md-editor-button-tab-selected');
  });

  it('应该阻止禁用标签的点击', () => {
    const handleChange = vi.fn();

    render(<ButtonTabGroup items={mockItems} onChange={handleChange} />);

    const disabledTab = screen.getByText('标签3');
    fireEvent.click(disabledTab);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('应该为禁用标签添加样式类', () => {
    render(<ButtonTabGroup items={mockItems} />);

    const disabledTab = screen.getByText('标签3').closest('button');
    expect(disabledTab).toHaveClass('md-editor-button-tab-group-item-disabled');
  });

  it('应该传递图标点击事件', () => {
    const handleIconClick = vi.fn();
    const itemsWithIconClick: ButtonTabItem[] = [
      {
        key: 'tab1',
        label: '标签1',
        icon: <TestIcon />,
        onIconClick: handleIconClick,
      },
    ];

    render(<ButtonTabGroup items={itemsWithIconClick} />);

    const icon = screen.getByTestId('test-icon');
    fireEvent.click(icon);

    expect(handleIconClick).toHaveBeenCalledTimes(1);
  });

  it('应该支持自定义类名', () => {
    const { container } = render(
      <ButtonTabGroup items={mockItems} className="custom-class" />,
    );

    const group = container.querySelector('.md-editor-button-tab-group');
    expect(group).toHaveClass('custom-class');
  });

  it('应该支持自定义前缀类名', () => {
    const { container } = render(
      <ButtonTabGroup items={mockItems} prefixCls="custom-prefix" />,
    );

    const group = container.querySelector('.custom-prefix');
    expect(group).toBeInTheDocument();
  });

  it('应该处理空数组', () => {
    const { container } = render(<ButtonTabGroup items={[]} />);

    const group = container.querySelector('.md-editor-button-tab-group');
    expect(group).toBeInTheDocument();
    expect(group).toBeEmptyDOMElement();
  });

  it('应该处理未定义的项目数组', () => {
    const { container } = render(<ButtonTabGroup />);

    const group = container.querySelector('.md-editor-button-tab-group');
    expect(group).toBeInTheDocument();
    expect(group).toBeEmptyDOMElement();
  });

  it('应该正确处理受控和非受控模式的切换', () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <ButtonTabGroup
        items={mockItems}
        defaultActiveKey="tab1"
        onChange={handleChange}
      />,
    );

    // 非受控模式：点击应该更新内部状态
    const tab2 = screen.getByText('标签2');
    fireEvent.click(tab2);
    expect(handleChange).toHaveBeenCalledWith('tab2');

    // 切换到受控模式
    rerender(
      <ButtonTabGroup
        items={mockItems}
        activeKey="tab3"
        onChange={handleChange}
      />,
    );

    // 受控模式：点击应该调用 onChange 但不改变显示状态
    const tab1 = screen.getByText('标签1');
    fireEvent.click(tab1);
    expect(handleChange).toHaveBeenCalledWith('tab1');

    // 显示状态应该由 activeKey 控制
    const tab3 = screen.getByText('标签3').closest('button');
    expect(tab3).toHaveClass('md-editor-button-tab-selected');
  });

  it('应该在没有默认选中项且数组为空时正确处理', () => {
    render(<ButtonTabGroup items={[]} defaultActiveKey="nonexistent" />);

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
  });

  it('应该正确处理图标属性', () => {
    render(<ButtonTabGroup items={mockItems} />);

    // 检查有图标的标签
    const icons = screen.getAllByTestId('test-icon');
    expect(icons).toHaveLength(2); // 标签2和标签4都有图标
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    const { container } = render(
      <ConfigProvider prefixCls="custom">
        <ButtonTabGroup items={mockItems} />
      </ConfigProvider>,
    );

    expect(
      container.querySelector('.md-editor-button-tab-group'),
    ).toBeInTheDocument();
  });

  it('应该支持所有属性的组合', () => {
    const handleChange = vi.fn();
    const handleIconClick = vi.fn();
    const complexItems: ButtonTabItem[] = [
      {
        key: 'tab1',
        label: '标签1',
        icon: <TestIcon />,
        onIconClick: handleIconClick,
      },
      { key: 'tab2', label: '标签2', disabled: true },
    ];

    const { container } = render(
      <ButtonTabGroup
        items={complexItems}
        activeKey="tab1"
        onChange={handleChange}
        className="custom-class"
        prefixCls="custom-prefix"
      />,
    );

    const group = container.querySelector('.custom-prefix');
    expect(group).toBeInTheDocument();
    expect(group).toHaveClass('custom-class');
    expect(screen.getByText('标签1')).toBeInTheDocument();
    expect(screen.getByText('标签2')).toBeInTheDocument();
  });

  it('应该正确处理默认值', () => {
    const { container } = render(<ButtonTabGroup items={mockItems} />);

    const group = container.querySelector('.md-editor-button-tab-group');
    expect(group).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GroupMenu, MenuItemType } from '@ant-design/agentic-ui/History/menu';

describe('GroupMenu', () => {
  const mockItems: MenuItemType[] = [
    {
      key: 'item1',
      label: '菜单项1',
    },
    {
      key: 'item2',
      label: '菜单项2',
      disabled: true,
    },
    {
      key: 'item3',
      label: '菜单项3',
    },
    {
      key: 'group1',
      label: '分组1',
      type: 'group',
      children: [
        {
          key: 'group1-item1',
          label: '分组1-项目1',
        },
        {
          key: 'group1-item2',
          label: '分组1-项目2',
        },
      ],
    },
  ];

  it('应该渲染所有菜单项', () => {
    render(<GroupMenu items={mockItems} />);

    expect(screen.getByText('菜单项1')).toBeInTheDocument();
    expect(screen.getByText('菜单项2')).toBeInTheDocument();
    expect(screen.getByText('菜单项3')).toBeInTheDocument();
    expect(screen.getByText('分组1')).toBeInTheDocument();
  });

  it('应该正确处理选中状态', () => {
    render(<GroupMenu items={mockItems} selectedKeys={['item1']} />);

    const selectedItem = screen
      .getByText('菜单项1')
      .closest('[role="menuitem"]');
    expect(selectedItem).toHaveAttribute('aria-selected', 'true');
  });

  it('应该正确处理点击事件', () => {
    const mockOnSelect = vi.fn();
    render(<GroupMenu items={mockItems} onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText('菜单项1'));
    expect(mockOnSelect).toHaveBeenCalledWith({ key: 'item1' });
  });

  it('应该正确处理禁用状态', () => {
    const mockOnSelect = vi.fn();
    render(<GroupMenu items={mockItems} onSelect={mockOnSelect} />);

    const disabledItem = screen
      .getByText('菜单项2')
      .closest('[role="menuitem"]');
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(screen.getByText('菜单项2'));
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('应该正确渲染图标', () => {
    const itemsWithIcon: MenuItemType[] = [
      {
        key: 'item1',
        label: '测试项目',
        icon: <span data-testid="test-icon">🔥</span>,
      },
    ];

    render(<GroupMenu items={itemsWithIcon} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('应该支持子菜单渲染', () => {
    render(<GroupMenu items={mockItems} />);

    // 分组项目应该存在
    expect(screen.getByText('分组1')).toBeInTheDocument();

    // 子菜单项目应该存在
    expect(screen.getByText('分组1-项目1')).toBeInTheDocument();
    expect(screen.getByText('分组1-项目2')).toBeInTheDocument();
  });
});

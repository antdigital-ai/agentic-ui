import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import GroupMenu, { MenuItemType } from '../menu';

const mockItems: MenuItemType[] = [
  {
    key: 'item1',
    label: '菜单项 1',
    icon: <span>📁</span>,
  },
  {
    key: 'group1',
    label: '分组 1',
    type: 'group',
    children: [
      {
        key: 'subitem1',
        label: '子菜单项 1',
        icon: <span>📄</span>,
      },
      {
        key: 'subitem2',
        label: '子菜单项 2',
        icon: <span>📄</span>,
      },
    ],
  },
  {
    key: 'item2',
    label: '菜单项 2',
    disabled: true,
  },
];

describe('GroupMenu', () => {
  const renderWithConfig = (component: React.ReactElement) => {
    return render(<ConfigProvider>{component}</ConfigProvider>);
  };

  it('应该正确渲染菜单项', () => {
    renderWithConfig(<GroupMenu items={mockItems} />);

    expect(screen.getByText('菜单项 1')).toBeInTheDocument();
    expect(screen.getByText('分组 1')).toBeInTheDocument();
    expect(screen.getByText('子菜单项 1')).toBeInTheDocument();
    expect(screen.getByText('子菜单项 2')).toBeInTheDocument();
    expect(screen.getByText('菜单项 2')).toBeInTheDocument();
  });

  it('应该应用正确的样式类名', () => {
    const { container } = renderWithConfig(<GroupMenu items={mockItems} />);

    const menuContainer = container.firstChild as HTMLElement;
    expect(menuContainer).toHaveClass('ant-agentic-chat-history-menu');
  });

  it('应该处理菜单项点击', () => {
    const onSelect = vi.fn();
    renderWithConfig(<GroupMenu items={mockItems} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('菜单项 1'));
    expect(onSelect).toHaveBeenCalledWith({ key: 'item1' });
  });

  it('应该正确显示禁用状态', () => {
    renderWithConfig(<GroupMenu items={mockItems} />);

    const disabledItem = screen.getByText('菜单项 2');
    expect(disabledItem.closest('[role="menuitem"]')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('应该支持自定义样式类名', () => {
    const customClassNames = {
      menuItemClassName: 'custom-menu-item',
      menuItemActiveClassName: 'custom-active',
    };

    const { container } = renderWithConfig(
      <GroupMenu
        items={mockItems}
        selectedKeys={['item1']}
        classNames={customClassNames}
      />,
    );

    // 检查自定义类名是否被应用
    expect(container.querySelector('.custom-menu-item')).toBeInTheDocument();
  });

  it('子项为空的分组不应展示', () => {
    const itemsWithEmptyGroup: MenuItemType[] = [
      {
        key: 'empty-group',
        label: '空分组',
        type: 'group',
        children: [],
      },
      {
        key: 'item1',
        label: '菜单项 1',
      },
    ];

    const { container } = renderWithConfig(
      <GroupMenu items={itemsWithEmptyGroup} />,
    );

    expect(screen.getByText('菜单项 1')).toBeInTheDocument();
    expect(screen.queryByText('空分组')).not.toBeInTheDocument();
    expect(
      container.querySelector('.ant-agentic-chat-history-menu-item-group'),
    ).not.toBeInTheDocument();
  });
});

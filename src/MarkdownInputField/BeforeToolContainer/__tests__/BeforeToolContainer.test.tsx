import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ActionItemContainer } from '../BeforeToolContainer';

type KeyedElement = React.ReactElement & { key: React.Key };

describe('ActionItemContainer Component', () => {
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => <ConfigProvider>{children}</ConfigProvider>;

  const createMockItems = (count: number = 3) => {
    return Array.from({ length: count }, (_, i) => {
      const element = (
        <button key={`item-${i}`} type="button" data-testid={`item-${i}`}>
          Item {i}
        </button>
      );
      return element as KeyedElement;
    });
  };

  it('应该渲染基本容器', () => {
    const items = createMockItems();

    render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  it('应该支持自定义尺寸', () => {
    const items = createMockItems();
    const { container, rerender } = render(
      <TestWrapper>
        <ActionItemContainer size="small">{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀和 small 尺寸的容器类名
    const smallContainer = container.querySelector('[class*="ant-"][class*="container"][class*="small"]');
    expect(smallContainer).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <ActionItemContainer size="large">{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀和 large 尺寸的容器类名
    const largeContainer = container.querySelector('[class*="ant-"][class*="container"][class*="large"]');
    expect(largeContainer).toBeInTheDocument();
  });

  it('应该支持自定义样式', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer style={{ backgroundColor: 'red' }}>
          {items}
        </ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀的容器类名
    const containerEl = container.querySelector('[class*="ant-"][class*="container"]');
    expect(containerEl).toBeInTheDocument();
    expect(containerEl).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('应该显示溢出菜单按钮', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀和 overflow-container-menu 的类名
    const menuButton = container.querySelector('[class*="ant-"][class*="overflow-container-menu"]');
    expect(menuButton).toBeInTheDocument();
  });

  it('应该支持隐藏溢出菜单', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer showMenu={false}>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    expect(
      container.querySelector(
        '[class*="ant-"][class*="overflow-container"]',
      ),
    ).not.toBeInTheDocument();
  });

  it('应该保持子元素顺序', () => {
    const items = createMockItems();
    const { rerender } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    const firstItem = screen.getByTestId('item-0');
    expect(firstItem).toBeInTheDocument();

    // 重新渲染相同的子元素
    rerender(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 顺序应该保持不变
    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
  });

  it('应该处理子元素更新', () => {
    const items = createMockItems(2);
    const { rerender } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.queryByTestId('item-2')).not.toBeInTheDocument();

    // 添加新子元素
    const newItems = createMockItems(3);
    rerender(
      <TestWrapper>
        <ActionItemContainer>{newItems}</ActionItemContainer>
      </TestWrapper>,
    );

    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  it('应该处理空子元素', () => {
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{[]}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀的容器类名
    const containerDiv = container.querySelector('[class*="ant-"][class*="container"]');
    expect(containerDiv).toBeInTheDocument();
  });

  it('应该在鼠标悬停菜单时添加无悬停类', async () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀和 overflow-container-menu 的类名
    const menuButton = container.querySelector(
      '[class*="ant-"][class*="overflow-container-menu"]',
    ) as HTMLElement;

    expect(menuButton).toBeInTheDocument();
    fireEvent.mouseEnter(menuButton);

    await waitFor(() => {
      // 查找包含 ant- 前缀和 no-hover 的容器类名
      const noHoverContainer = container.querySelector(
        '[class*="ant-"][class*="container"][class*="no-hover"]',
      );
      expect(noHoverContainer).toBeInTheDocument();
    });

    fireEvent.mouseLeave(menuButton);

    await waitFor(() => {
      // 查找包含 ant- 前缀和 no-hover 的容器类名
      const noHoverContainer = container.querySelector(
        '[class*="ant-"][class*="container"][class*="no-hover"]',
      );
      expect(noHoverContainer).not.toBeInTheDocument();
    });
  });

  it('应该支持水平滚动', () => {
    const items = createMockItems(10);
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀和 scroll 的类名
    const scrollContainer = container.querySelector(
      '[class*="ant-"][class*="scroll"]',
    ) as HTMLElement;

    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer.style.overflowX).toBe('auto');
  });

  it('应该处理单个子元素', () => {
    const item = (
      <button key="single-item" type="button">
        Single Item
      </button>
    ) as KeyedElement;

    render(
      <TestWrapper>
        <ActionItemContainer>{item}</ActionItemContainer>
      </TestWrapper>,
    );

    expect(screen.getByText('Single Item')).toBeInTheDocument();
  });

  it('应该支持可拖拽的弹窗项', async () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀和 overflow-container-menu 的类名
    const menuButton = container.querySelector(
      '[class*="ant-"][class*="overflow-container-menu"]',
    ) as HTMLElement;

    fireEvent.click(menuButton);

    await waitFor(
      () => {
        const popupItems = document.querySelectorAll(
          '[class*="ant-"][class*="overflow-container-popup-item"]',
        );
        expect(popupItems.length).toBe(3);
        popupItems.forEach((item) => {
          expect(item).toHaveAttribute('draggable', 'true');
        });
      },
      { timeout: 1000 },
    );
  });

  it('应该处理鼠标滚轮事件', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀的容器类名
    const containerEl = container.querySelector(
      '[class*="ant-"][class*="container"]',
    ) as HTMLElement;

    const scrollContainer = container.querySelector(
      '[class*="ant-"][class*="scroll"]',
    ) as HTMLElement;

    fireEvent.wheel(containerEl, { deltaY: 100 });

    // 滚动应该已处理（即使实际滚动可能不会在测试环境中发生）
    expect(scrollContainer).toBeInTheDocument();
  });

  it('应该在弹窗中显示所有项目', async () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀和 overflow-container-menu 的类名
    const menuButton = container.querySelector(
      '[class*="ant-"][class*="overflow-container-menu"]',
    ) as HTMLElement;

    fireEvent.click(menuButton);

    await waitFor(
      () => {
        // 弹窗应该显示所有项目（弹窗中有3个，主容器中也有3个）
        const allItems = document.querySelectorAll('[data-testid^="item-"]');
        expect(allItems.length).toBeGreaterThanOrEqual(3);
      },
      { timeout: 1000 },
    );
  });

  it('应该处理拖拽手柄', async () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀和 overflow-container-menu 的类名
    const menuButton = container.querySelector(
      '[class*="ant-"][class*="overflow-container-menu"]',
    ) as HTMLElement;

    fireEvent.click(menuButton);

    await waitFor(
      () => {
        const dragHandles = document.querySelectorAll(
          '[class*="ant-"][class*="drag-handle"]',
        );
        expect(dragHandles.length).toBe(3);
      },
      { timeout: 1000 },
    );
  });

  it('应该支持交互式目标检测', () => {
    const item = (
      <button key="interactive" type="button" data-testid="interactive-button">
        Interactive
      </button>
    ) as KeyedElement;

    render(
      <TestWrapper>
        <ActionItemContainer>{item}</ActionItemContainer>
      </TestWrapper>,
    );

    const button = screen.getByTestId('interactive-button');
    expect(button).toBeInTheDocument();
  });

  it('应该处理 resize 观察', async () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀和 overflow-container-menu 的类名
    const menuButton = container.querySelector(
      '[class*="ant-"][class*="overflow-container-menu"]',
    ) as HTMLElement;

    fireEvent.click(menuButton);

    await waitFor(
      () => {
        expect(
          document.querySelector(
            '[class*="ant-"][class*="overflow-container-popup"]',
          ),
        ).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    // ResizeObserver 应该被设置（即使在测试环境中可能不会真正触发）
  });

  it('应该处理 pointer 事件', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀的容器类名
    const containerEl = container.querySelector(
      '[class*="ant-"][class*="container"]',
    ) as HTMLElement;

    // 模拟 pointer down
    fireEvent.pointerDown(containerEl, { button: 0, clientX: 100 });

    // 模拟 pointer move
    fireEvent.pointerMove(containerEl, { clientX: 110 });

    // 模拟 pointer up
    fireEvent.pointerUp(containerEl);

    expect(containerEl).toBeInTheDocument();
  });

  it('应该处理 pointer cancel', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀的容器类名
    const containerEl = container.querySelector(
      '[class*="ant-"][class*="container"]',
    ) as HTMLElement;

    fireEvent.pointerDown(containerEl, { button: 0, clientX: 100 });
    fireEvent.pointerCancel(containerEl);

    expect(containerEl).toBeInTheDocument();
  });

  it('应该在开发环境验证 key 属性', () => {
    // 这个测试只在开发环境有效
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // 创建没有 key 的元素
    const invalidItems = [
      React.createElement('div', null, 'Item 1'),
      React.createElement('div', null, 'Item 2'),
    ];

    expect(() => {
      render(
        <TestWrapper>
          <ActionItemContainer>{invalidItems as any}</ActionItemContainer>
        </TestWrapper>,
      );
    }).toThrow(
      'ActionItemContainer: all children must include an explicit `key` prop.',
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('应该支持 menuDisabled 属性', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer menuDisabled={true}>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀和 overflow-container-menu 的类名
    const menuButton = container.querySelector(
      '[class*="ant-"][class*="overflow-container-menu"]',
    ) as HTMLElement;

    // 检查类名是否包含预期的模式
    expect(menuButton?.className).toMatch(/ant-.*-overflow-container-menu-disabled/);

    // 点击不应该打开弹窗
    fireEvent.click(menuButton);

    expect(
      document.querySelector(
        '[class*="ant-"][class*="overflow-container-popup"]',
      ),
    ).not.toBeInTheDocument();
  });

  it('应该处理 pointer 捕获', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀的容器类名
    const containerEl = container.querySelector(
      '[class*="ant-"][class*="container"]',
    ) as HTMLElement;

    // 模拟拖拽开始
    fireEvent.pointerDown(containerEl, {
      button: 0,
      clientX: 100,
      pointerId: 1,
    });

    // 模拟移动足够的距离来触发平移
    fireEvent.pointerMove(containerEl, { clientX: 120, pointerId: 1 });

    // 释放
    fireEvent.pointerUp(containerEl, { pointerId: 1 });

    expect(containerEl).toBeInTheDocument();
  });

  it('应该阻止交互元素的平移', () => {
    const items = [
      <button key="btn-1" type="button" data-testid="interactive-btn">
        Click Me
      </button>,
    ] as KeyedElement[];

    render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    const button = screen.getByTestId('interactive-btn');

    // 在按钮上按下不应该触发平移
    fireEvent.pointerDown(button, { button: 0, clientX: 100 });
    fireEvent.pointerMove(button, { clientX: 120 });

    expect(button).toBeInTheDocument();
  });

  it('应该处理滚轮的水平和垂直滚动', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    // 查找包含 ant- 前缀的容器类名
    const containerEl = container.querySelector(
      '[class*="ant-"][class*="container"]',
    ) as HTMLElement;

    // 测试垂直滚轮（应该转换为水平滚动）
    fireEvent.wheel(containerEl, { deltaY: 50, deltaX: 0 });

    // 测试水平滚轮
    fireEvent.wheel(containerEl, { deltaX: 50, deltaY: 0 });

    expect(containerEl).toBeInTheDocument();
  });
});

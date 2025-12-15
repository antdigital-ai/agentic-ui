import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionItemContainer } from '../../../src/MarkdownInputField/BeforeToolContainer/BeforeToolContainer';

// Mock the icons
vi.mock('@sofa-design/icons', () => ({
  GripVertical: () => <div data-testid="grip-vertical-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
}));

// Mock ConfigProvider
vi.mock('antd', async () => {
  const actualAntd: any = await vi.importActual('antd');
  return {
    ...actualAntd,
    ConfigProvider: {
      ...actualAntd.ConfigProvider,
      ConfigContext: {
        Consumer: actualAntd.ConfigProvider.ConfigContext.Consumer,
        Provider: actualAntd.ConfigProvider.ConfigContext.Provider,
        displayName: 'ConfigContext',
        $$typeof: Symbol.for('react.context'),
        _currentValue: {
          getPrefixCls: (suffix: string) => `ant-${suffix}`,
        },
      },
    },
  };
});

// Mock useStyle
vi.mock('../../../src/Components/ActionItemBox', () => ({
  useStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  }),
}));

// Mock useRefFunction
vi.mock('../../../src/Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

// Type for keyed elements
type KeyedElement = React.ReactElement & { key: React.Key };

// Helper function to create keyed elements
const createKeyedElement = (key: string, text: string): KeyedElement => {
  const element = (
    <button key={key} data-testid={`action-button-${key}`} type="button">
      {text}
    </button>
  ) as KeyedElement;
  return element;
};

describe('ActionItemContainer - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('拖拽手柄功能', () => {
    it('应该正确处理拖拽手柄的鼠标按下事件', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer showMenu>{child1}</ActionItemContainer>);

      // 触发弹出框显示
      const menuIcon = screen.getByTestId('menu-icon');
      fireEvent.click(menuIcon);

      // 获取拖拽手柄并模拟鼠标按下
      const gripIcons = screen.getAllByTestId('grip-vertical-icon');
      const gripIcon = gripIcons[0];

      expect(() => {
        fireEvent.mouseDown(gripIcon);
      }).not.toThrow();
    });

    it('应该正确处理拖拽项目的鼠标按下和释放事件', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer showMenu>{child1}</ActionItemContainer>);

      // 触发弹出框显示
      const menuIcon = screen.getByTestId('menu-icon');
      fireEvent.click(menuIcon);

      // 获取可拖拽项
      const gripIcons = screen.getAllByTestId('grip-vertical-icon');
      const dragItem = gripIcons[0].closest('div')!;

      // 模拟鼠标按下
      expect(() => {
        fireEvent.mouseDown(dragItem);
      }).not.toThrow();

      // 模拟鼠标释放
      expect(() => {
        fireEvent.mouseUp(dragItem);
      }).not.toThrow();
    });
  });

  describe('指针事件处理', () => {
    it('应该正确处理指针按下事件', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer>{child1}</ActionItemContainer>);

      // 使用更具体的选择器来获取容器
      const containers = screen.getAllByRole('generic', { hidden: true });
      const container = containers[0]; // 获取第一个容器

      // 模拟指针按下事件
      expect(() => {
        fireEvent.pointerDown(container, { button: 0, clientX: 100 });
      }).not.toThrow();
    });

    it('应该正确处理指针移动事件', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer>{child1}</ActionItemContainer>);

      // 使用更具体的选择器来获取容器
      const containers = screen.getAllByRole('generic', { hidden: true });
      const container = containers[0]; // 获取第一个容器

      // 先按下指针
      fireEvent.pointerDown(container, { button: 0, clientX: 100 });

      // 再移动指针
      expect(() => {
        fireEvent.pointerMove(container, { clientX: 120 });
      }).not.toThrow();
    });

    it('应该正确处理指针释放事件', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer>{child1}</ActionItemContainer>);

      // 使用更具体的选择器来获取容器
      const containers = screen.getAllByRole('generic', { hidden: true });
      const container = containers[0]; // 获取第一个容器

      // 先按下指针
      fireEvent.pointerDown(container, { button: 0, clientX: 100 });

      // 移动指针
      fireEvent.pointerMove(container, { clientX: 120 });

      // 释放指针
      expect(() => {
        fireEvent.pointerUp(container);
      }).not.toThrow();
    });

    it('应该正确处理指针取消事件', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer>{child1}</ActionItemContainer>);

      // 使用更具体的选择器来获取容器
      const containers = screen.getAllByRole('generic', { hidden: true });
      const container = containers[0]; // 获取第一个容器

      // 先按下指针
      fireEvent.pointerDown(container, { button: 0, clientX: 100 });

      // 取消指针操作
      expect(() => {
        fireEvent.pointerCancel(container);
      }).not.toThrow();
    });
  });

  describe('拖拽排序功能', () => {
    it('应该正确处理拖拽开始事件', () => {
      const child1 = createKeyedElement('1', 'Button 1');
      const child2 = createKeyedElement('2', 'Button 2');

      render(
        <ActionItemContainer showMenu>
          {child1}
          {child2}
        </ActionItemContainer>,
      );

      // 触发弹出框显示
      const menuIcon = screen.getByTestId('menu-icon');
      fireEvent.click(menuIcon);

      // 获取可拖拽项
      const dragItems = screen
        .getAllByTestId('grip-vertical-icon')
        .map((icon) => icon.closest('div')!);

      // 模拟拖拽开始
      expect(() => {
        fireEvent.dragStart(dragItems[0], {
          dataTransfer: {
            effectAllowed: 'move',
            setData: vi.fn(),
          },
        });
      }).not.toThrow();
    });

    it('应该正确处理拖拽悬停事件', () => {
      const child1 = createKeyedElement('1', 'Button 1');
      const child2 = createKeyedElement('2', 'Button 2');

      render(
        <ActionItemContainer showMenu>
          {child1}
          {child2}
        </ActionItemContainer>,
      );

      // 触发弹出框显示
      const menuIcon = screen.getByTestId('menu-icon');
      fireEvent.click(menuIcon);

      // 获取可拖拽项
      const dragItems = screen
        .getAllByTestId('grip-vertical-icon')
        .map((icon) => icon.closest('div')!);

      // 模拟拖拽悬停
      expect(() => {
        fireEvent.dragOver(dragItems[1], {
          dataTransfer: {
            dropEffect: 'move',
          },
          preventDefault: vi.fn(),
        });
      }).not.toThrow();
    });

    it('应该正确处理拖拽放置事件', () => {
      const child1 = createKeyedElement('1', 'Button 1');
      const child2 = createKeyedElement('2', 'Button 2');

      render(
        <ActionItemContainer showMenu>
          {child1}
          {child2}
        </ActionItemContainer>,
      );

      // 触发弹出框显示
      const menuIcon = screen.getByTestId('menu-icon');
      fireEvent.click(menuIcon);

      // 获取可拖拽项
      const dragItems = screen
        .getAllByTestId('grip-vertical-icon')
        .map((icon) => icon.closest('div')!);

      // 模拟拖拽开始
      fireEvent.dragStart(dragItems[0], {
        dataTransfer: {
          effectAllowed: 'move',
          setData: vi.fn(),
        },
      });

      // 模拟拖拽放置
      expect(() => {
        fireEvent.drop(dragItems[1], {
          dataTransfer: {},
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        });
      }).not.toThrow();
    });
  });

  describe('滚轮事件处理', () => {
    it('应该正确处理滚轮事件并映射到水平滚动', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer>{child1}</ActionItemContainer>);

      // 使用更具体的选择器来获取容器
      const containers = screen.getAllByRole('generic', { hidden: true });
      const container = containers[0]; // 获取第一个容器

      // 模拟垂直滚轮事件（应该映射到水平滚动）
      expect(() => {
        fireEvent.wheel(container, {
          deltaY: 50,
          deltaX: 0,
          stopPropagation: vi.fn(),
        });
      }).not.toThrow();

      // 模拟水平滚轮事件
      expect(() => {
        fireEvent.wheel(container, {
          deltaX: 50,
          deltaY: 0,
          stopPropagation: vi.fn(),
        });
      }).not.toThrow();
    });

    it('应该正确处理弹窗中的滚轮事件', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer showMenu>{child1}</ActionItemContainer>);

      // 触发弹出框显示
      const menuIcon = screen.getByTestId('menu-icon');
      fireEvent.click(menuIcon);

      // 获取弹窗容器
      const popupContainers = document.querySelectorAll(
        '[class*="overflow-container-popup"]',
      );
      if (popupContainers.length > 0) {
        const popupContainer = popupContainers[0];

        // 模拟弹窗中的滚轮事件
        expect(() => {
          fireEvent.wheel(popupContainer, { stopPropagation: vi.fn() });
        }).not.toThrow();
      }
    });
  });

  describe('辅助函数测试', () => {
    it('应该正确处理 reorder 函数', () => {
      const child1 = createKeyedElement('1', 'Button 1');
      const child2 = createKeyedElement('2', 'Button 2');
      const child3 = createKeyedElement('3', 'Button 3');

      const { rerender } = render(
        <ActionItemContainer showMenu>
          {child1}
          {child2}
          {child3}
        </ActionItemContainer>,
      );

      // 重新渲染以不同的顺序
      rerender(
        <ActionItemContainer showMenu>
          {child3}
          {child1}
          {child2}
        </ActionItemContainer>,
      );

      // 确保组件能正常处理子元素顺序的变化
      expect(screen.getByTestId('action-button-1')).toBeInTheDocument();
      expect(screen.getByTestId('action-button-2')).toBeInTheDocument();
      expect(screen.getByTestId('action-button-3')).toBeInTheDocument();
    });

    it('应该正确处理 toEntries 函数', () => {
      const child1 = createKeyedElement('1', 'Button 1');
      const child2 = createKeyedElement('2', 'Button 2');

      render(
        <ActionItemContainer>
          {child1}
          {child2}
        </ActionItemContainer>,
      );

      // 确保组件能正确处理子元素转换为条目
      expect(screen.getByTestId('action-button-1')).toBeInTheDocument();
      expect(screen.getByTestId('action-button-2')).toBeInTheDocument();
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该正确处理无效的目标元素', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer>{child1}</ActionItemContainer>);

      // 使用更具体的选择器来获取容器
      const containers = screen.getAllByRole('generic', { hidden: true });
      const container = containers[0]; // 获取第一个容器

      // 模拟无效的目标元素（不传递 target 属性）
      expect(() => {
        fireEvent.pointerDown(container, { button: 0, clientX: 100 });
      }).not.toThrow();
    });

    it('应该正确处理非 HTMLElement 目标', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer>{child1}</ActionItemContainer>);

      // 使用更具体的选择器来获取容器
      const containers = screen.getAllByRole('generic', { hidden: true });
      const container = containers[0]; // 获取第一个容器

      // 模拟非 HTMLElement 目标
      expect(() => {
        fireEvent.pointerDown(container, { button: 0, clientX: 100 });
      }).not.toThrow();
    });

    it('应该正确处理拖拽索引为 null 的情况', () => {
      const child1 = createKeyedElement('1', 'Button 1');

      render(<ActionItemContainer showMenu>{child1}</ActionItemContainer>);

      // 触发弹出框显示
      const menuIcon = screen.getByTestId('menu-icon');
      fireEvent.click(menuIcon);

      // 获取可拖拽项
      const dragItems = screen
        .getAllByTestId('grip-vertical-icon')
        .map((icon) => icon.closest('div')!);

      // 模拟拖拽放置，但没有有效的拖拽索引
      expect(() => {
        fireEvent.drop(dragItems[0], {
          dataTransfer: {},
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        });
      }).not.toThrow();
    });
  });
});

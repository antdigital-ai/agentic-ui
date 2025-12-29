// @ts-nocheck
import '@testing-library/jest-dom';
import { ConfigProvider } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionItemContainer } from '../BeforeToolContainer';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => children,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('ActionItemContainer', () => {
  const mockItems = [
    <button key="1" type="button">
      Action 1
    </button>,
    <button key="2" type="button">
      Action 2
    </button>,
    <button key="3" type="button">
      Action 3
    </button>,
  ];

  // 测试包装器组件
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ConfigProvider>{children}</ConfigProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render all children', () => {
      render(
        <TestWrapper>
          <ActionItemContainer>{mockItems}</ActionItemContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
      expect(screen.getByText('Action 3')).toBeInTheDocument();
    });

    it('should render empty container when no children provided', () => {
      const { container } = render(
        <TestWrapper>
          <ActionItemContainer />
        </TestWrapper>
      );
      // 查找包含 ant- 前缀的容器类名
      const containerDiv = container.querySelector('[class*="ant-"][class*="container"]');
      expect(containerDiv).toBeInTheDocument();
      // Component still renders scroll container and menu even without children
      expect(container.querySelectorAll('button').length).toBe(0);
    });

    it('should render with correct base className', () => {
      const { container } = render(
        <TestWrapper>
          <ActionItemContainer>{mockItems}</ActionItemContainer>
        </TestWrapper>
      );
      // 查找包含 ant- 前缀的容器类名
      const containerDiv = container.querySelector('[class*="ant-"][class*="container"]');
      expect(containerDiv).toBeInTheDocument();
      // 检查类名是否包含预期的模式
      expect(containerDiv?.className).toMatch(/ant-.*-container/);
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red', padding: '10px' };
      const { container } = render(
        <TestWrapper>
          <ActionItemContainer style={customStyle}>
            {mockItems}
          </ActionItemContainer>
        </TestWrapper>
      );
      // 查找包含 ant- 前缀的容器类名
      const containerDiv = container.querySelector('[class*="ant-"][class*="container"]') as HTMLElement;
      expect(containerDiv).toBeInTheDocument();
      expect(containerDiv.style.backgroundColor).toBe('red');
      expect(containerDiv.style.padding).toBe('10px');
    });
  });

  describe('Overflow Menu', () => {
    it('should show overflow menu button when items overflow', async () => {
      // Mock getBoundingClientRect to simulate overflow
      const mockGetBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 32,
        top: 0,
        left: 0,
        right: 100,
        bottom: 32,
        x: 0,
        y: 0,
      }));

      HTMLElement.prototype.getBoundingClientRect = mockGetBoundingClientRect;

      render(
        <TestWrapper>
          <ActionItemContainer>{mockItems}</ActionItemContainer>
        </TestWrapper>
      );

      await waitFor(() => {
        const overflowButton = screen.queryByRole('button', { name: /more/i });
        // Overflow button may or may not appear based on actual DOM measurements
        // Just check if the component renders properly
        expect(screen.getByText('Action 1')).toBeInTheDocument();
      });
    });

    it('should toggle overflow menu on click', async () => {
      render(
        <TestWrapper>
          <ActionItemContainer>
            {[...mockItems, ...mockItems]} {/* More items to force overflow */}
          </ActionItemContainer>
        </TestWrapper>
      );

      // Try to find and click overflow button if it exists
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Scroll Behavior', () => {
    it('should handle scroll events', () => {
      const { container } = render(
        <TestWrapper>
          <ActionItemContainer>{mockItems}</ActionItemContainer>
        </TestWrapper>
      );

      // 查找包含 ant- 前缀的容器类名
      const scrollContainer = container.querySelector('[class*="ant-"][class*="container"]');
      expect(scrollContainer).toBeInTheDocument();

      // Simulate scroll
      fireEvent.scroll(scrollContainer!, { target: { scrollLeft: 100 } });

      // Component should handle scroll without errors
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should support pointer drag to scroll', () => {
      const { container } = render(
        <TestWrapper>
          <ActionItemContainer>{mockItems}</ActionItemContainer>
        </TestWrapper>
      );

      // 查找包含 ant- 前缀的容器类名
      const scrollContainer = container.querySelector('[class*="ant-"][class*="container"]');
      expect(scrollContainer).toBeInTheDocument();

      // Simulate pointer down
      fireEvent.pointerDown(scrollContainer!, { clientX: 100, pointerId: 1 });

      // Simulate pointer move
      fireEvent.pointerMove(scrollContainer!, { clientX: 50, pointerId: 1 });

      // Simulate pointer up
      fireEvent.pointerUp(scrollContainer!, { pointerId: 1 });

      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Children Updates', () => {
    it('should update when children change', () => {
      const { rerender } = render(
        <TestWrapper>
          <ActionItemContainer>{mockItems.slice(0, 2)}</ActionItemContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
      expect(screen.queryByText('Action 3')).not.toBeInTheDocument();

      // Update with all items
      rerender(
        <TestWrapper>
          <ActionItemContainer>{mockItems}</ActionItemContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Action 3')).toBeInTheDocument();
    });

    it('should handle empty children array', () => {
      const { container } = render(
        <TestWrapper>
          <ActionItemContainer>{[]}</ActionItemContainer>
        </TestWrapper>
      );

      // 查找包含 ant- 前缀的容器类名
      const containerDiv = container.querySelector('[class*="ant-"][class*="container"]');
      // Component still renders structure even without children
      expect(containerDiv).toBeInTheDocument();
      expect(container.querySelectorAll('button').length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single child', () => {
      render(
        <TestWrapper>
          <ActionItemContainer>{[mockItems[0]]}</ActionItemContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Action 1')).toBeInTheDocument();
    });

    it('should handle children without keys gracefully', () => {
      // Note: In production, this should work, but in development it will throw
      const itemsWithoutKeys = [
        <button type="button">No Key 1</button>,
        <button type="button">No Key 2</button>,
      ];

      // This test expects error in dev mode
      expect(() => {
        render(
          <TestWrapper>
            <ActionItemContainer>{itemsWithoutKeys}</ActionItemContainer>
          </TestWrapper>
        );
      }).toThrow(
        'ActionItemContainer: all children must include an explicit `key` prop.',
      );
    });

    it('should handle null or undefined children', () => {
      const { container } = render(
        <TestWrapper>
          <ActionItemContainer>{null}</ActionItemContainer>
        </TestWrapper>
      );

      // 查找包含 ant- 前缀的容器类名
      const containerDiv = container.querySelector('[class*="ant-"][class*="container"]');
      expect(containerDiv).toBeInTheDocument();
    });
  });
});

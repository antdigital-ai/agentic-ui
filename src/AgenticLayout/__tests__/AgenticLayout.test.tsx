import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AgenticLayout } from '../index';

describe('AgenticLayout', () => {
  const originalInnerWidth = window.innerWidth;
  
  beforeEach(() => {
    // 重置 window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  afterEach(() => {
    // 恢复原始值
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    // 清理 body 样式
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  it('renders with basic props', () => {
    render(
      <AgenticLayout center={<div>Center content</div>}>
        <div>Test content</div>
      </AgenticLayout>,
    );

    expect(screen.getByText('Center content')).toBeInTheDocument();
  });

  it('renders with header configuration', () => {
    render(
      <AgenticLayout
        center={<div>Center content</div>}
        header={{ title: 'Agentic Layout' }}
      >
        <div>Test content</div>
      </AgenticLayout>,
    );

    expect(screen.getByText('Agentic Layout')).toBeInTheDocument();
  });

  it('renders left and right sidebars', () => {
    render(
      <AgenticLayout
        left={<div>Left content</div>}
        center={<div>Center content</div>}
        right={<div>Right content</div>}
      >
        <div>Test content</div>
      </AgenticLayout>,
    );

    expect(screen.getByText('Left content')).toBeInTheDocument();
    expect(screen.getByText('Center content')).toBeInTheDocument();
    expect(screen.getByText('Right content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        className="custom-class"
      >
        <div>Test content</div>
      </AgenticLayout>,
    );

    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('ant-agentic-layout');
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'blue' };
    const { container } = render(
      <AgenticLayout center={<div>Center content</div>} style={customStyle}>
        <div>Test content</div>
      </AgenticLayout>,
    );

    expect(container.firstChild).toHaveStyle(
      'background-color: rgb(0, 0, 255)',
    );
  });

  it('handles left sidebar collapse state', () => {
    const { container } = render(
      <AgenticLayout
        left={<div>Left content</div>}
        center={<div>Center content</div>}
        header={{ leftCollapsed: true }}
      />,
    );

    const leftSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-left',
    );
    expect(leftSidebar).toHaveClass('ant-agentic-layout-sidebar-left-collapsed');
  });

  it('handles right sidebar collapse state', () => {
    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        header={{ rightCollapsed: true }}
      />,
    );

    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    );
    expect(rightSidebar).toHaveClass(
      'ant-agentic-layout-sidebar-right-collapsed',
    );
  });

  it('handles leftDefaultCollapsed prop', () => {
    const { container } = render(
      <AgenticLayout
        left={<div>Left content</div>}
        center={<div>Center content</div>}
        header={{ leftDefaultCollapsed: true }}
      />,
    );

    const leftSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-left',
    );
    expect(leftSidebar).toHaveClass('ant-agentic-layout-sidebar-left-collapsed');
  });

  it('handles rightDefaultCollapsed prop', () => {
    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        header={{ rightDefaultCollapsed: true }}
      />,
    );

    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    );
    expect(rightSidebar).toHaveClass(
      'ant-agentic-layout-sidebar-right-collapsed',
    );
  });

  it('updates rightWidth when prop changes', () => {
    const { rerender, container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={500}
      />,
    );

    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;
    expect(rightSidebar?.style.width).toBe('500px');

    rerender(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={600}
      />,
    );

    expect(rightSidebar?.style.width).toBe('600px');
  });

  it('handles window resize event and adjusts right sidebar width', () => {
    // 设置初始窗口宽度
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={1000}
      />,
    );

    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;

    // 初始宽度应该是 1000px
    expect(rightSidebar?.style.width).toBe('1000px');

    // 模拟窗口缩小到 1000px（最大宽度应该是 700px，即 70%）
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1000,
      });
      window.dispatchEvent(new Event('resize'));
    });

    // 右侧边栏宽度应该被限制为 700px（1000 * 0.7）
    expect(rightSidebar?.style.width).toBe('700px');
  });

  it('handles resize drag start', () => {
    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={540}
      />,
    );

    const resizeHandle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;

    expect(resizeHandle).toBeInTheDocument();

    // 模拟鼠标按下事件
    act(() => {
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(mouseDownEvent, 'preventDefault', {
        value: vi.fn(),
      });
      Object.defineProperty(mouseDownEvent, 'stopPropagation', {
        value: vi.fn(),
      });
      resizeHandle.dispatchEvent(mouseDownEvent);
    });

    // 验证 body 样式被设置
    expect(document.body.style.cursor).toBe('col-resize');
    expect(document.body.style.userSelect).toBe('none');
  });

  it('handles resize drag move', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={540}
      />,
    );

    const resizeHandle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;

    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;

    // 开始拖拽
    act(() => {
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(mouseDownEvent, 'preventDefault', {
        value: vi.fn(),
      });
      Object.defineProperty(mouseDownEvent, 'stopPropagation', {
        value: vi.fn(),
      });
      resizeHandle.dispatchEvent(mouseDownEvent);
    });

    // 模拟鼠标移动（向左拖拽，扩大右侧边栏）
    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 50, // 向左移动 50px
        bubbles: true,
      });
      document.dispatchEvent(mouseMoveEvent);
    });

    // 验证宽度增加了（540 + 50 = 590）
    expect(parseInt(rightSidebar?.style.width || '0')).toBeGreaterThan(540);
  });

  it('handles resize drag end', () => {
    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={540}
      />,
    );

    const resizeHandle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;

    // 开始拖拽
    act(() => {
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(mouseDownEvent, 'preventDefault', {
        value: vi.fn(),
      });
      Object.defineProperty(mouseDownEvent, 'stopPropagation', {
        value: vi.fn(),
      });
      resizeHandle.dispatchEvent(mouseDownEvent);
    });

    expect(document.body.style.cursor).toBe('col-resize');

    // 结束拖拽
    act(() => {
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true,
      });
      document.dispatchEvent(mouseUpEvent);
    });

    // 验证 body 样式被清除
    expect(document.body.style.cursor).toBe('');
    expect(document.body.style.userSelect).toBe('');
  });

  it('respects minimum right width constraint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={540}
      />,
    );

    const resizeHandle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;

    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;

    // 开始拖拽
    act(() => {
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(mouseDownEvent, 'preventDefault', {
        value: vi.fn(),
      });
      Object.defineProperty(mouseDownEvent, 'stopPropagation', {
        value: vi.fn(),
      });
      resizeHandle.dispatchEvent(mouseDownEvent);
    });

    // 模拟向右拖拽很多（缩小），应该被限制在最小宽度 400px
    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 1000, // 向右移动很多
        bubbles: true,
      });
      document.dispatchEvent(mouseMoveEvent);
    });

    // 验证宽度不小于 400px（MIN_RIGHT_WIDTH）
    const width = parseInt(rightSidebar?.style.width || '0');
    expect(width).toBeGreaterThanOrEqual(400);
  });

  it('respects maximum right width constraint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    });

    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={500}
      />,
    );

    const resizeHandle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;

    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;

    // 开始拖拽
    act(() => {
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(mouseDownEvent, 'preventDefault', {
        value: vi.fn(),
      });
      Object.defineProperty(mouseDownEvent, 'stopPropagation', {
        value: vi.fn(),
      });
      resizeHandle.dispatchEvent(mouseDownEvent);
    });

    // 模拟向左拖拽很多（扩大），应该被限制在最大宽度 700px（1000 * 0.7）
    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: -1000, // 向左移动很多
        bubbles: true,
      });
      document.dispatchEvent(mouseMoveEvent);
    });

    // 验证宽度不超过 700px（1000 * 0.7）
    const width = parseInt(rightSidebar?.style.width || '0');
    expect(width).toBeLessThanOrEqual(700);
  });

  it('does not show resize handle when right sidebar is collapsed', () => {
    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        header={{ rightCollapsed: true }}
      />,
    );

    const resizeHandle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    );

    expect(resizeHandle).not.toBeInTheDocument();
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={540}
      />,
    );

    unmount();

    // 验证事件监听器被移除
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });

  it('does not resize when mousemove is triggered without starting drag', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={540}
      />,
    );

    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;

    const initialWidth = rightSidebar?.style.width;

    // 直接触发 mousemove 事件，但没有先触发 mousedown
    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 50,
        bubbles: true,
      });
      document.dispatchEvent(mouseMoveEvent);
    });

    // 验证宽度没有改变（因为 isResizingRef.current 为 false）
    expect(rightSidebar?.style.width).toBe(initialWidth);
  });
});

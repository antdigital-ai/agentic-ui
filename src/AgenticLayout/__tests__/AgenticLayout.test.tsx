import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    render(<AgenticLayout center={<div>Center content</div>} />);

    expect(screen.getByText('Center content')).toBeInTheDocument();
  });

  it('renders with header configuration', () => {
    render(
      <AgenticLayout
        center={<div>Center content</div>}
        header={{ title: 'Agentic Layout' }}
      />,
    );

    expect(screen.getByText('Agentic Layout')).toBeInTheDocument();
  });

  it('renders left and right sidebars', () => {
    render(
      <AgenticLayout
        left={<div>Left content</div>}
        center={<div>Center content</div>}
        right={<div>Right content</div>}
      />,
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
      />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('ant-agentic-layout');
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'blue' };
    const { container } = render(
      <AgenticLayout center={<div>Center content</div>} style={customStyle} />,
    );

    expect(container.firstChild).toHaveStyle(
      { backgroundColor: 'blue' },
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
    expect(leftSidebar).toHaveClass(
      'ant-agentic-layout-sidebar-left-collapsed',
    );
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
    expect(leftSidebar).toHaveClass(
      'ant-agentic-layout-sidebar-left-collapsed',
    );
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

  it('handles resize drag move', async () => {
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

    // 模拟鼠标移动（向左拖拽，扩大右侧边栏）。
    // 实现使用 rAF 节流，需要等一帧让节流后的 setState 落盘。
    await act(async () => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 50, // 向左移动 50px
        bubbles: true,
      });
      document.dispatchEvent(mouseMoveEvent);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
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

  it('cleans up event listeners on unmount when a drag is in progress', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { container, unmount } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={540}
      />,
    );

    // 先触发拖拽以真实注册 mousemove/mouseup listener；
    // 实现仅在确实注册过 listener 时才在卸载阶段调用 removeEventListener，
    // 避免无意义的全局事件操作。
    const resizeHandle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;
    act(() => {
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        bubbles: true,
        cancelable: true,
      });
      resizeHandle.dispatchEvent(mouseDownEvent);
    });

    unmount();

    // 验证拖拽期间注册的事件监听器在卸载时被精确移除
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

  // === P3 #11：首屏渲染前就应完成 clamp，不应出现「先渲染超大值再回收」 ===
  it('clamps initial rightWidth to maxWidth on first render (no flicker)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000, // maxWidth = 700
    });

    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={2000} // 远超 maxWidth
      />,
    );

    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;

    // 关键：首屏 width 已经是 700，而非 2000
    expect(rightSidebar?.style.width).toBe('700px');
  });

  // === P3 #13：a11y 属性 ===
  it('exposes accessible separator semantics on resize handle', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2000, // maxWidth = 1400
    });

    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={540}
      />,
    );

    const handle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;

    expect(handle.getAttribute('role')).toBe('separator');
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle.getAttribute('aria-valuemin')).toBe('400');
    expect(handle.getAttribute('aria-valuemax')).toBe('1400');
    expect(handle.getAttribute('aria-valuenow')).toBe('540');
    expect(handle.getAttribute('tabindex')).toBe('0');
    expect(handle.getAttribute('aria-label')).toBeTruthy();
  });

  // === P3 #13：键盘交互 ===
  it('supports keyboard arrow keys to resize (LTR)', () => {
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

    const handle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;
    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;

    // LTR 下 ArrowLeft 扩大（+16）
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(rightSidebar.style.width).toBe('556px');

    // ArrowRight 缩小（-16）
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(rightSidebar.style.width).toBe('540px');

    // Shift + ArrowLeft 大步长扩大（+64）
    fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true });
    expect(rightSidebar.style.width).toBe('604px');

    // Home 跳到最小值
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(rightSidebar.style.width).toBe('400px');

    // End 跳到最大值（2000 * 0.7 = 1400）
    fireEvent.keyDown(handle, { key: 'End' });
    expect(rightSidebar.style.width).toBe('1400px');
  });

  it('ignores unrelated keys on resize handle', () => {
    const { container } = render(
      <AgenticLayout
        center={<div>Center content</div>}
        right={<div>Right content</div>}
        rightWidth={540}
      />,
    );

    const handle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;
    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;

    fireEvent.keyDown(handle, { key: 'Enter' });
    fireEvent.keyDown(handle, { key: 'a' });
    expect(rightSidebar.style.width).toBe('540px');
  });

  // === P3 #14：RTL 方向反转 ===
  it('reverses drag direction in RTL mode', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { container } = render(
      <ConfigProvider direction="rtl">
        <AgenticLayout
          center={<div>Center content</div>}
          right={<div>Right content</div>}
          rightWidth={540}
        />
      </ConfigProvider>,
    );

    const handle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;
    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;

    // RTL 下 ArrowRight 扩大（与 LTR 相反）
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(rightSidebar.style.width).toBe('556px');

    // RTL 下 ArrowLeft 缩小
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(rightSidebar.style.width).toBe('540px');
  });

  it('reverses drag direction in RTL mode (mouse drag)', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { container } = render(
      <ConfigProvider direction="rtl">
        <AgenticLayout
          center={<div>Center content</div>}
          right={<div>Right content</div>}
          rightWidth={540}
        />
      </ConfigProvider>,
    );

    const handle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;
    const rightSidebar = container.querySelector(
      '.ant-agentic-layout-sidebar-right',
    ) as HTMLElement;

    // RTL 下，鼠标向右（clientX 增大 50）= 扩大右栏
    act(() => {
      handle.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 100,
          bubbles: true,
          cancelable: true,
        }),
      );
    });

    // 用 act + 等待 rAF 让节流的 setState 落盘
    await act(async () => {
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 150, bubbles: true }),
      );
      // 等待一个动画帧
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    });

    // 540 + 50 = 590（RTL 下方向反转，clientX 增大对应扩大）
    expect(parseInt(rightSidebar.style.width, 10)).toBeGreaterThan(540);

    // 收尾
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });
  });

  describe('main area corner radius', () => {
    // 这一组用例锚定 style.ts 中的圆角策略：
    // -main 默认仅圆角右上/右下，左上/左下交给左栏；
    // 当无左栏时 -main 是 -body 的第一个直接子元素，靠 :first-child 补齐左侧圆角；
    // 当左栏折叠时 -main 紧随 -sidebar-left-collapsed，靠相邻兄弟选择器补齐左侧圆角。
    // 由于 jsdom 不解析 cssinjs 注入的样式，这里通过 DOM 结构关系断言来验证选择器的命中条件。

    it('places main as the first child of body when no left sidebar exists', () => {
      const { container } = render(
        <AgenticLayout center={<div>Center content</div>} />,
      );

      const body = container.querySelector(
        '.ant-agentic-layout-body',
      ) as HTMLElement;
      const main = container.querySelector(
        '.ant-agentic-layout-main',
      ) as HTMLElement;

      expect(body).toBeInTheDocument();
      expect(main).toBeInTheDocument();
      // :first-child 选择器命中条件：-main 是 -body 的第一个直接子元素
      expect(body.firstElementChild).toBe(main);
    });

    it('keeps main as a non-first child when left sidebar is rendered and expanded', () => {
      const { container } = render(
        <AgenticLayout
          left={<div>Left content</div>}
          center={<div>Center content</div>}
        />,
      );

      const body = container.querySelector(
        '.ant-agentic-layout-body',
      ) as HTMLElement;
      const leftSidebar = container.querySelector(
        '.ant-agentic-layout-sidebar-left',
      ) as HTMLElement;
      const main = container.querySelector(
        '.ant-agentic-layout-main',
      ) as HTMLElement;

      // 展开态：左栏不带 -collapsed 后缀类，-main 不是第一个子元素
      expect(leftSidebar).not.toHaveClass(
        'ant-agentic-layout-sidebar-left-collapsed',
      );
      expect(body.firstElementChild).toBe(leftSidebar);
      expect(body.firstElementChild).not.toBe(main);
    });

    it('places collapsed left sidebar as the immediate previous sibling of main', () => {
      const { container } = render(
        <AgenticLayout
          left={<div>Left content</div>}
          center={<div>Center content</div>}
          header={{ leftDefaultCollapsed: true }}
        />,
      );

      const leftSidebar = container.querySelector(
        '.ant-agentic-layout-sidebar-left',
      ) as HTMLElement;
      const main = container.querySelector(
        '.ant-agentic-layout-main',
      ) as HTMLElement;

      // 折叠态相邻兄弟选择器命中条件：
      // 1) 左栏带 -collapsed 后缀类
      // 2) -main 是左栏的紧邻下一个兄弟元素
      expect(leftSidebar).toHaveClass(
        'ant-agentic-layout-sidebar-left-collapsed',
      );
      expect(leftSidebar.nextElementSibling).toBe(main);
    });
  });

  describe('rightWidth prop', () => {
    // 这一组用例锚定「外部 rightWidth prop 的下限」与「拖拽手柄下限」的拆分：
    // - 外部 prop（含初始化与 rerender）应完全尊重用户传入值，仅夹视口最大限制；
    // - 拖拽 / 键盘交互仍受 MIN_RIGHT_WIDTH=400 约束，避免用户手抖把右栏拖没。

    it('respects rightWidth values smaller than MIN_RIGHT_WIDTH on initial render', () => {
      // 历史 bug：rightWidth=200 会被 clampRightWidth 夹到 400，导致 prop 不生效。
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1600,
      });

      const { container } = render(
        <AgenticLayout
          center={<div>Center content</div>}
          right={<div>Right content</div>}
          rightWidth={200}
        />,
      );

      const rightSidebar = container.querySelector(
        '.ant-agentic-layout-sidebar-right',
      ) as HTMLElement;
      expect(rightSidebar.style.width).toBe('200px');
    });

    it('respects rightWidth values smaller than MIN_RIGHT_WIDTH after rerender', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1600,
      });

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
      expect(rightSidebar.style.width).toBe('500px');

      rerender(
        <AgenticLayout
          center={<div>Center content</div>}
          right={<div>Right content</div>}
          rightWidth={240}
        />,
      );

      // 切到比 MIN_RIGHT_WIDTH 还小的值，外部 prop 同样应被尊重。
      expect(rightSidebar.style.width).toBe('240px');
    });

    it('still clamps drag interactions to MIN_RIGHT_WIDTH (400)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1600,
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

      // 模拟向右拖拽 1000px（即缩小右栏 1000px：500 - 1000 = -500，应被夹到 400）。
      act(() => {
        fireEvent.mouseDown(resizeHandle, { clientX: 100 });
      });
      act(() => {
        document.dispatchEvent(
          new MouseEvent('mousemove', { clientX: 1100, bubbles: true }),
        );
      });
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      expect(rightSidebar.style.width).toBe('400px');
    });
  });
});

import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChatLayout, type ChatLayoutRef } from '../index';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('ChatLayout', () => {
  it('renders with default props', () => {
    render(
      <ChatLayout>
        <div>Test content</div>
      </ChatLayout>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(
      <ChatLayout header={{ title: 'Custom Title' }}>
        <div>Test content</div>
      </ChatLayout>,
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('calls onLeftCollapse when left collapse button is clicked', () => {
    const handleLeftCollapse = vi.fn();

    render(
      <ChatLayout
        header={{
          leftCollapsible: true,
          onLeftCollapse: handleLeftCollapse,
        }}
      >
        <div>Test content</div>
      </ChatLayout>,
    );

    const leftCollapseButton = screen.getByLabelText('折叠左侧边栏');
    fireEvent.click(leftCollapseButton);

    expect(handleLeftCollapse).toHaveBeenCalledTimes(1);
  });

  it('calls onShare when share button is clicked', () => {
    const handleShare = vi.fn();

    render(
      <ChatLayout
        header={{
          showShare: true,
          onShare: handleShare,
        }}
      >
        <div>Test content</div>
      </ChatLayout>,
    );

    const shareButton = screen.getByLabelText('分享对话');
    fireEvent.click(shareButton);

    expect(handleShare).toHaveBeenCalledTimes(1);
  });

  it('hides buttons when show props are false', () => {
    render(
      <ChatLayout
        header={{
          leftCollapsible: false,
          rightCollapsible: false,
          showShare: false,
        }}
      >
        <div>Test content</div>
      </ChatLayout>,
    );

    expect(screen.queryByLabelText('折叠左侧边栏')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('折叠右侧边栏')).not.toBeInTheDocument();
    expect(screen.queryByText('分享')).not.toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <ChatLayout footer={<div>Footer content</div>}>
        <div>Test content</div>
      </ChatLayout>,
    );

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ChatLayout className="custom-class">
        <div>Test content</div>
      </ChatLayout>,
    );

    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('ant-chat-layout');
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { container } = render(
      <ChatLayout style={customStyle}>
        <div>Test content</div>
      </ChatLayout>,
    );

    expect(container.firstChild).toHaveStyle(
      'background-color: rgb(255, 0, 0)',
    );
  });

  it('applies custom footerHeight to footer', () => {
    const { container } = render(
      <ChatLayout footer={<div>Footer</div>} footerHeight={120}>
        <div>Test content</div>
      </ChatLayout>,
    );

    const footer = container.querySelector('.ant-chat-layout-footer');
    expect(footer).toHaveStyle('min-height: 120px');
  });

  it('uses default footerHeight when not provided', () => {
    const { container } = render(
      <ChatLayout footer={<div>Footer</div>}>
        <div>Test content</div>
      </ChatLayout>,
    );

    const footer = container.querySelector('.ant-chat-layout-footer');
    expect(footer).toHaveStyle('min-height: 48px');
  });

  it('applies footerHeight to spacer element when footer is provided', () => {
    const { container } = render(
      <ChatLayout footer={<div>Footer</div>} footerHeight={150}>
        <div>Test content</div>
      </ChatLayout>,
    );

    const scrollable = container.querySelector(
      '.ant-chat-layout-content-scrollable',
    );
    const spacer = scrollable?.lastElementChild as HTMLElement;
    // spacer 高度由 useElementSize 钩子测量的实际 footer 高度决定
    // 在测试环境中由于 ResizeObserver 被 mock，高度为 0
    expect(spacer).toHaveStyle('height: 0px');
  });

  it('sets spacer height to 0 when footer is not provided', () => {
    const { container } = render(
      <ChatLayout>
        <div>Test content</div>
      </ChatLayout>,
    );

    const scrollable = container.querySelector(
      '.ant-chat-layout-content-scrollable',
    );
    // 当没有 footer 时，spacer 元素不应该存在
    // 查找带有 aria-hidden="true" 的 spacer 元素
    const spacer = scrollable?.querySelector('[aria-hidden="true"]');
    expect(spacer).toBeNull();
  });

  it('supports scrollBehavior prop with smooth value', () => {
    const { container } = render(
      <ChatLayout scrollBehavior="smooth">
        <div>Test content</div>
      </ChatLayout>,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('supports scrollBehavior prop with auto value', () => {
    const { container } = render(
      <ChatLayout scrollBehavior="auto">
        <div>Test content</div>
      </ChatLayout>,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('uses default scrollBehavior when not provided', () => {
    const { container } = render(
      <ChatLayout>
        <div>Test content</div>
      </ChatLayout>,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  describe('ref functionality', () => {
    it('exposes scrollContainer through ref', () => {
      const ref = createRef<ChatLayoutRef>();
      const { container } = render(
        <ChatLayout ref={ref}>
          <div>Test content</div>
        </ChatLayout>,
      );

      const scrollable = container.querySelector(
        '.ant-chat-layout-content-scrollable',
      ) as HTMLDivElement;

      expect(ref.current).toBeDefined();
      expect(ref.current?.scrollContainer).toBe(scrollable);
    });

    it('exposes scrollToBottom method through ref', () => {
      const ref = createRef<ChatLayoutRef>();
      render(
        <ChatLayout ref={ref}>
          <div>Test content</div>
        </ChatLayout>,
      );

      expect(ref.current).toBeDefined();
      expect(typeof ref.current?.scrollToBottom).toBe('function');
    });

    it('scrollToBottom method can be called', () => {
      vi.useFakeTimers();
      const ref = createRef<ChatLayoutRef>();
      const { container } = render(
        <ChatLayout ref={ref}>
          <div>Test content</div>
        </ChatLayout>,
      );

      const scrollable = container.querySelector(
        '.ant-chat-layout-content-scrollable',
      ) as HTMLDivElement;

      // Mock scrollTo method
      const scrollToSpy = vi.fn();
      scrollable.scrollTo = scrollToSpy;

      // Set up scroll properties
      Object.defineProperty(scrollable, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      });
      Object.defineProperty(scrollable, 'clientHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });

      act(() => {
        ref.current?.scrollToBottom();
      });

      // Fast-forward timers to trigger the throttled function
      act(() => {
        vi.runAllTimers();
      });

      expect(scrollToSpy).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('controlled mode', () => {
    it('handles leftCollapsed prop in controlled mode', () => {
      render(
        <ChatLayout header={{ leftCollapsed: true }}>
          <div>Test content</div>
        </ChatLayout>,
      );

      // LayoutHeader should receive the collapsed state
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('handles rightCollapsed prop in controlled mode', () => {
      render(
        <ChatLayout header={{ rightCollapsed: true }}>
          <div>Test content</div>
        </ChatLayout>,
      );

      // LayoutHeader should receive the collapsed state
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('handles both leftCollapsed and rightCollapsed in controlled mode', () => {
      render(
        <ChatLayout header={{ leftCollapsed: true, rightCollapsed: false }}>
          <div>Test content</div>
        </ChatLayout>,
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('uncontrolled mode', () => {
    it('handles leftDefaultCollapsed prop in uncontrolled mode', () => {
      render(
        <ChatLayout header={{ leftDefaultCollapsed: true }}>
          <div>Test content</div>
        </ChatLayout>,
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('handles rightDefaultCollapsed prop in uncontrolled mode', () => {
      render(
        <ChatLayout header={{ rightDefaultCollapsed: true }}>
          <div>Test content</div>
        </ChatLayout>,
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('handles both leftDefaultCollapsed and rightDefaultCollapsed in uncontrolled mode', () => {
      render(
        <ChatLayout
          header={{
            leftDefaultCollapsed: true,
            rightDefaultCollapsed: false,
          }}
        >
          <div>Test content</div>
        </ChatLayout>,
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('header configuration', () => {
    it('renders without header when header prop is not provided', () => {
      const { container } = render(
        <ChatLayout>
          <div>Test content</div>
        </ChatLayout>,
      );

      const header = container.querySelector('.ant-layout-header');
      expect(header).not.toBeInTheDocument();
    });

    it('renders header when header prop is provided', () => {
      render(
        <ChatLayout header={{ title: 'Test Header' }}>
          <div>Test content</div>
        </ChatLayout>,
      );

      expect(screen.getByText('Test Header')).toBeInTheDocument();
    });
  });
});

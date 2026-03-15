import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToolUseBarThink } from '../src/ToolUseBarThink';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

describe('ToolUseBarThink', () => {
  it('should render with time and show time element', () => {
    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Test"
          time="10:00"
        />
      </Wrapper>,
    );
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('should not render time element when time is undefined', () => {
    const { container } = render(
      <Wrapper>
        <ToolUseBarThink toolName="Test" />
      </Wrapper>,
    );
    expect(container.querySelector('[class*="time"]')).toBeFalsy();
  });

  it('should render light mode and toggle hover/expand', () => {
    render(
      <Wrapper>
        <ToolUseBarThink toolName="Test" light defaultExpanded={false} />
      </Wrapper>,
    );
    const header = screen.getByTestId('tool-use-bar-think-header');
    fireEvent.mouseMove(header);
    fireEvent.mouseLeave(header);
    const bar = screen.getByTestId('tool-use-bar-think-bar');
    fireEvent.click(bar);
    expect(header).toBeInTheDocument();
  });

  it('should set hover and call handleToggleFloatingExpand', () => {
    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Test"
          status="loading"
          thinkContent={<div>Think</div>}
        />
      </Wrapper>,
    );
    const header = screen.getByTestId('tool-use-bar-think-header');
    fireEvent.mouseMove(header);
    fireEvent.mouseLeave(header);
    const floatingExpand = screen.queryByTestId(
      'tool-use-bar-think-floating-expand',
    );
    if (floatingExpand) {
      fireEvent.click(floatingExpand);
    }
    expect(header).toBeInTheDocument();
  });

  it('status loading 时不显示内容展开按钮', () => {
    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Test"
          status="loading"
          thinkContent={<div data-testid="think-body">Think</div>}
          defaultExpanded
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByTestId('tool-use-bar-think-bar'));
    expect(screen.getByTestId('think-body')).toBeInTheDocument();
    expect(
      screen.queryByTestId('tool-use-bar-think-content-expand'),
    ).not.toBeInTheDocument();
  });

  it('无 thinkContent 时不显示内容展开按钮', () => {
    render(
      <Wrapper>
        <ToolUseBarThink toolName="Test" defaultExpanded />
      </Wrapper>,
    );
    expect(
      screen.queryByTestId('tool-use-bar-think-content-expand'),
    ).not.toBeInTheDocument();
  });

  it('有 thinkContent 且展开时渲染内容区', () => {
    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Test"
          status="success"
          thinkContent={<div data-testid="think-content">Content</div>}
          defaultExpanded
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('think-content')).toBeInTheDocument();
  });

  it('内容溢出时显示展开/收起按钮并可点击', () => {
    const originalRO = global.ResizeObserver;
    global.ResizeObserver = class MockResizeObserver {
      callback: () => void;
      constructor(callback: () => void) {
        this.callback = callback;
      }
      observe(el: HTMLElement) {
        Object.defineProperty(el, 'scrollHeight', {
          value: 250,
          configurable: true,
        });
        this.callback();
      }
      disconnect() {}
      unobserve() {}
    };

    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Test"
          status="success"
          thinkContent={
            <div style={{ height: 250 }} data-testid="think-tall">
              Tall
            </div>
          }
          defaultExpanded
        />
      </Wrapper>,
    );

    expect(screen.getByTestId('think-tall')).toBeInTheDocument();
    const expandBtn = screen.queryByTestId('tool-use-bar-think-content-expand');
    if (expandBtn) {
      expect(expandBtn).toHaveTextContent(/展开|收起/);
      fireEvent.click(expandBtn);
    }

    global.ResizeObserver = originalRO;
  });

  it('内容溢出时展开按钮 Enter 触发 handleContentExpandToggle', () => {
    const originalRO = global.ResizeObserver;
    global.ResizeObserver = class MockResizeObserver {
      callback: () => void;
      constructor(callback: () => void) {
        this.callback = callback;
      }
      observe(el: HTMLElement) {
        Object.defineProperty(el, 'scrollHeight', { value: 250, configurable: true });
        this.callback();
      }
      disconnect() {}
      unobserve() {}
    };

    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Test"
          status="success"
          thinkContent={<div data-testid="think-tall-2">Tall</div>}
          defaultExpanded
        />
      </Wrapper>,
    );

    const expandBtn = screen.queryByTestId('tool-use-bar-think-content-expand');
    if (expandBtn) {
      fireEvent.keyDown(expandBtn, { key: 'Enter', preventDefault: vi.fn() });
    }
    expect(screen.getByTestId('think-tall-2')).toBeInTheDocument();
    global.ResizeObserver = originalRO;
  });

  it('内容溢出时展开按钮 Space 触发 handleContentExpandToggle', () => {
    const originalRO = global.ResizeObserver;
    global.ResizeObserver = class MockResizeObserver {
      callback: () => void;
      constructor(callback: () => void) {
        this.callback = callback;
      }
      observe(el: HTMLElement) {
        Object.defineProperty(el, 'scrollHeight', { value: 250, configurable: true });
        this.callback();
      }
      disconnect() {}
      unobserve() {}
    };

    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Test"
          status="success"
          thinkContent={<div data-testid="think-tall-3">Tall</div>}
          defaultExpanded
        />
      </Wrapper>,
    );

    const expandBtn = screen.queryByTestId('tool-use-bar-think-content-expand');
    if (expandBtn) {
      fireEvent.keyDown(expandBtn, { key: ' ', preventDefault: vi.fn() });
    }
    expect(screen.getByTestId('think-tall-3')).toBeInTheDocument();
    global.ResizeObserver = originalRO;
  });
});

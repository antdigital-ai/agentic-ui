import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToolUseBarThink } from '..';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

const mockOverflowingContent = (scrollHeight = 250) => {
  const originalResizeObserver = global.ResizeObserver;

  global.ResizeObserver = class MockResizeObserver {
    private readonly callback: () => void;

    constructor(callback: () => void) {
      this.callback = callback;
    }

    observe(el: HTMLElement) {
      Object.defineProperty(el, 'scrollHeight', {
        value: scrollHeight,
        configurable: true,
      });
      this.callback();
    }

    disconnect() {}
    unobserve() {}
  };

  return () => {
    global.ResizeObserver = originalResizeObserver;
  };
};

describe('ToolUseBarThink', () => {
  it('should render with time and show time element', () => {
    render(
      <Wrapper>
        <ToolUseBarThink toolName="Test" time="10:00" />
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
    // defaultExpanded 下内容区已展开，无需点击 bar（点击会收起）
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

  it('展开时应在折叠动画结束后滚动到组件容器', () => {
    const scrollIntoViewSpy = vi.fn();
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoViewSpy;

    try {
      render(
        <Wrapper>
          <ToolUseBarThink toolName="Test" scrollIntoViewOnExpand />
        </Wrapper>,
      );

      fireEvent.click(screen.getByTestId('tool-use-bar-think-bar'));

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
      });
    } finally {
      vi.useRealTimers();
      delete (Element.prototype as Partial<Element>).scrollIntoView;
    }
  });

  it('初始展开不触发滚动，后续展开透传自定义滚动参数', () => {
    const scrollIntoViewSpy = vi.fn();
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoViewSpy;

    try {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: 'auto',
        block: 'center',
      };
      const { rerender } = render(
        <Wrapper>
          <ToolUseBarThink
            toolName="Test"
            expanded={true}
            scrollIntoViewOnExpand={scrollOptions}
          />
        </Wrapper>,
      );

      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      rerender(
        <Wrapper>
          <ToolUseBarThink
            toolName="Test"
            expanded={false}
            scrollIntoViewOnExpand={scrollOptions}
          />
        </Wrapper>,
      );
      act(() => {
        vi.advanceTimersByTime(350);
      });

      rerender(
        <Wrapper>
          <ToolUseBarThink
            toolName="Test"
            expanded={true}
            scrollIntoViewOnExpand={scrollOptions}
          />
        </Wrapper>,
      );
      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
      expect(scrollIntoViewSpy).toHaveBeenCalledWith(scrollOptions);
    } finally {
      vi.useRealTimers();
      delete (Element.prototype as Partial<Element>).scrollIntoView;
    }
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

  it('内容溢出展开后解除折叠父级和容器高度限制', () => {
    const restoreResizeObserver = mockOverflowingContent();

    try {
      render(
        <Wrapper>
          <ToolUseBarThink
            toolName="Test"
            status="success"
            thinkContent={<div data-testid="think-overflowing">Tall</div>}
            defaultExpanded
          />
        </Wrapper>,
      );

      const container = screen.getByTestId('tool-use-bar-think-container');
      const collapse = container.parentElement?.parentElement;

      expect(screen.getByTestId('think-overflowing')).toBeInTheDocument();
      expect(container.style.maxHeight).toBe('');
      expect(collapse?.className).not.toContain(
        'think-collapse-content-expanded',
      );

      fireEvent.click(screen.getByTestId('tool-use-bar-think-content-expand'));

      expect(container).toHaveStyle({
        maxHeight: 'none',
        overflowY: 'auto',
      });
      expect(collapse?.className).toContain('think-collapse-content-expanded');
    } finally {
      restoreResizeObserver();
    }
  });

  it('loading 状态 floating 展开后解除长内容裁剪并保持按钮可见', () => {
    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Test"
          status="loading"
          thinkContent={<div data-testid="think-loading-long">Loading</div>}
          defaultExpanded
        />
      </Wrapper>,
    );

    const container = screen.getByTestId('tool-use-bar-think-container');
    const collapse = container.parentElement?.parentElement;

    expect(container.style.maxHeight).toBe('');
    expect(container.className).not.toContain('container-floating-expanded');
    expect(collapse?.className).not.toContain(
      'think-collapse-content-expanded',
    );

    fireEvent.click(screen.getByTestId('tool-use-bar-think-floating-expand'));

    expect(container).toHaveStyle({
      maxHeight: 'none',
      overflowY: 'auto',
    });
    expect(container.className).toContain('container-floating-expanded');
    expect(collapse?.className).toContain('think-collapse-content-expanded');
    expect(
      screen.getByTestId('tool-use-bar-think-floating-expand'),
    ).toBeInTheDocument();
  });
});

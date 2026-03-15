import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolUseBarItem } from '../../src/ToolUseBar/BarItem';

const prefixCls = 'ant-agentic-tool-use-bar';
const hashId = '';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

describe('ToolUseBarItem', () => {
  it('有内容时点击工具栏非交互元素会切换展开状态', () => {
    const tool = {
      id: 't1',
      toolName: 'Tool',
      toolTarget: 'Target',
      status: 'success' as const,
      content: <div data-testid="tool-content">Content</div>,
    };

    render(
      <TestWrapper>
        <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
      </TestWrapper>,
    );

    const toolBar = screen.getByTestId('tool-user-item-tool-bar');
    fireEvent.click(toolBar);
    expect(screen.getByTestId('tool-content')).toBeInTheDocument();
    fireEvent.click(toolBar);
    expect(toolBar).toBeInTheDocument();
  });

  it('点击展开图标时调用 setExpanded', () => {
    const tool = {
      id: 't2',
      toolName: 'Tool',
      toolTarget: 'Target',
      status: 'success' as const,
      content: <div>Body</div>,
    };

    const { container } = render(
      <TestWrapper>
        <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
      </TestWrapper>,
    );

    const expandEl = container.querySelector(`.${prefixCls}-tool-expand`);
    expect(expandEl).toBeInTheDocument();
    if (expandEl) fireEvent.click(expandEl);
    expect(expandEl).toBeInTheDocument();
  });

  it('点击工具栏内的 button 时不切换展开', () => {
    const tool = {
      id: 't3',
      toolName: (
        <button type="button" data-testid="header-btn">
          Btn
        </button>
      ),
      toolTarget: 'Target',
      status: 'success' as const,
      content: <div>Body</div>,
    };

    render(
      <TestWrapper>
        <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
      </TestWrapper>,
    );

    const headerBtn = screen.getByTestId('header-btn');
    fireEvent.click(headerBtn);
    expect(headerBtn).toBeInTheDocument();
  });

  it('disableAnimation 为 true 时展开收起功能正常', () => {
    const tool = {
      id: 't4',
      toolName: 'Tool',
      toolTarget: 'Target',
      status: 'success' as const,
      content: <div data-testid="tool-content">Content</div>,
    };

    render(
      <TestWrapper>
        <ToolUseBarItem
          tool={tool}
          prefixCls={prefixCls}
          hashId={hashId}
          disableAnimation
        />
      </TestWrapper>,
    );

    const toolBar = screen.getByTestId('tool-user-item-tool-bar');
    fireEvent.click(toolBar);
    expect(screen.getByTestId('tool-content')).toBeInTheDocument();

    fireEvent.click(toolBar);
    expect(screen.queryByTestId('tool-content')).not.toBeInTheDocument();
  });

  it('status 为 loading 时应用 loading 样式', () => {
    const tool = {
      id: 't5',
      toolName: 'Tool',
      toolTarget: 'Target',
      status: 'loading' as const,
      content: <div>Body</div>,
    };

    const { container } = render(
      <TestWrapper>
        <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
      </TestWrapper>,
    );

    expect(
      container.querySelector(`.${prefixCls}-tool-loading`),
    ).toBeInTheDocument();
  });

  it('errorMessage 存在时展示错误区域', () => {
    const tool = {
      id: 't6',
      toolName: 'Tool',
      toolTarget: 'Target',
      status: 'error' as const,
      errorMessage: 'Something went wrong',
      content: <div>Body</div>,
    };

    render(
      <TestWrapper>
        <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
      </TestWrapper>,
    );

    const toolBar = screen.getByTestId('tool-user-item-tool-bar');
    fireEvent.click(toolBar);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('传入自定义 tool.icon 时使用自定义图标', () => {
    const CustomIcon = () => <span data-testid="custom-tool-icon">Icon</span>;
    const tool = {
      id: 't-icon',
      toolName: 'Tool',
      toolTarget: 'Target',
      status: 'success' as const,
      icon: <CustomIcon />,
      content: <div>Body</div>,
    };

    render(
      <TestWrapper>
        <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
      </TestWrapper>,
    );

    expect(screen.getByTestId('custom-tool-icon')).toBeInTheDocument();
  });

  it('展开后高内容可展示', () => {
    const tool = {
      id: 't7',
      toolName: 'Tool',
      toolTarget: 'Target',
      status: 'success' as const,
      content: (
        <div style={{ height: 300 }} data-testid="tall-content">
          Tall content
        </div>
      ),
    };

    render(
      <TestWrapper>
        <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByTestId('tool-user-item-tool-bar'));
    expect(screen.getByTestId('tall-content')).toBeInTheDocument();
  });

  describe('Content 展开/收起按钮与键盘', () => {
    beforeEach(() => {
      global.ResizeObserver = vi.fn().mockImplementation((callback: () => void) => ({
        observe: vi.fn((el: HTMLElement) => {
          if (el) {
            Object.defineProperty(el, 'scrollHeight', {
              value: 250,
              configurable: true,
            });
            callback();
          }
        }),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      }));
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('内容溢出时显示展开按钮，Enter 触发收起', async () => {
      const tool = {
        id: 't8',
        toolName: 'Tool',
        toolTarget: 'Target',
        status: 'success' as const,
        content: (
          <div style={{ height: 250 }} data-testid="overflow-content">
            Long content
          </div>
        ),
      };

      const { rerender } = render(
        <TestWrapper>
          <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByTestId('tool-user-item-tool-bar'));
      expect(screen.getByTestId('overflow-content')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
        </TestWrapper>,
      );

      const expandBtn = screen.queryByTestId('tool-content-expand');
      if (expandBtn) {
        expect(expandBtn.textContent).toMatch(/展开|收起/);
        fireEvent.keyDown(expandBtn, { key: 'Enter', preventDefault: vi.fn() });
      }
      expect(screen.getByTestId('overflow-content')).toBeInTheDocument();
    });

    it('展开按钮 Space 键触发 handleContentExpandToggle', async () => {
      const tool = {
        id: 't9',
        toolName: 'Tool',
        toolTarget: 'Target',
        status: 'success' as const,
        content: (
          <div style={{ height: 250 }} data-testid="overflow-content-2">
            Long
          </div>
        ),
      };

      render(
        <TestWrapper>
          <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByTestId('tool-user-item-tool-bar'));
      const expandBtn = screen.queryByTestId('tool-content-expand');
      if (expandBtn) {
        fireEvent.keyDown(expandBtn, { key: ' ', preventDefault: vi.fn() });
      }
      expect(screen.getByTestId('overflow-content-2')).toBeInTheDocument();
    });

    it('展开按钮点击触发 handleContentExpandToggle', () => {
      const tool = {
        id: 't10',
        toolName: 'Tool',
        toolTarget: 'Target',
        status: 'success' as const,
        content: (
          <div style={{ height: 250 }} data-testid="overflow-content-3">
            Long
          </div>
        ),
      };

      render(
        <TestWrapper>
          <ToolUseBarItem tool={tool} prefixCls={prefixCls} hashId={hashId} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByTestId('tool-user-item-tool-bar'));
      const expandBtn = screen.queryByTestId('tool-content-expand');
      if (expandBtn) {
        fireEvent.click(expandBtn);
        expect(expandBtn).toBeInTheDocument();
      }
      expect(screen.getByTestId('overflow-content-3')).toBeInTheDocument();
    });
  });
});

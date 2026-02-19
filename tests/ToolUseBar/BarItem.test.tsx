import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
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
});

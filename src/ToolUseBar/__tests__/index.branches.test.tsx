/**
 * ToolUseBar 根组件分支覆盖：空列表、展开/激活受控、disableAnimation。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToolUseBar } from '../index';

const tools = [
  {
    id: 't1',
    toolName: 'Search',
    toolTarget: 'web',
    status: 'success' as const,
    content: <div>Search result</div>,
  },
  {
    id: 't2',
    toolName: 'Read',
    toolTarget: 'file',
    status: 'loading' as const,
    content: 'loading body',
  },
];

describe('ToolUseBar branches', () => {
  it('tools 为空时渲染空容器', () => {
    render(<ToolUseBar tools={[]} testId="empty-bar" />);
    expect(screen.getByTestId('empty-bar')).toBeInTheDocument();
  });

  it('defaultExpandedKeys 展开内容', () => {
    const { container } = render(
      <ToolUseBar tools={tools} defaultExpandedKeys={['t1']} />,
    );
    expect(container.textContent).toContain('Search result');
  });

  it('onExpandedKeysChange 展开时传递 newKeys', () => {
    const onExpandedKeysChange = vi.fn();
    const { container } = render(
      <ToolUseBar
        tools={tools}
        expandedKeys={[]}
        onExpandedKeysChange={onExpandedKeysChange}
      />,
    );
    const expandButtons = container.querySelectorAll(
      '[class*="tool-use-bar-tool-expand"]',
    );
    fireEvent.click(expandButtons[0]!);
    expect(onExpandedKeysChange).toHaveBeenCalledWith(['t1'], []);
  });

  it('onToolClick 点击 tool bar', () => {
    const onToolClick = vi.fn();
    const { container } = render(
      <ToolUseBar tools={tools} onToolClick={onToolClick} />,
    );
    const toolBar = container.querySelector(
      '[data-testid="tool-user-item-tool-bar"]',
    );
    fireEvent.click(toolBar!);
    expect(onToolClick).toHaveBeenCalledWith('t1');
  });

  it('disableAnimation 应用 no-animation 类名', () => {
    const { container } = render(
      <ToolUseBar tools={tools} disableAnimation />,
    );
    expect(container.firstChild?.className).toContain('no-animation');
  });

  it('省略 light 时默认非 light 模式', () => {
    const { container } = render(<ToolUseBar tools={tools} />);
    expect(container.querySelector('[class*="-tool-light"]')).toBeNull();
  });

  it('light 模式透传 BarItem', () => {
    render(<ToolUseBar tools={tools} light />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('受控 expandedKeys', () => {
    const Controlled = () => {
      const [keys, setKeys] = useState<string[]>(['t1']);
      return (
        <ToolUseBar
          tools={tools}
          expandedKeys={keys}
          onExpandedKeysChange={(next) => setKeys(next)}
        />
      );
    };
    const { container } = render(<Controlled />);
    expect(container.textContent).toContain('Search result');
  });

  it('error tool + disableAnimation；无 content 的 active', () => {
    render(
      <ToolUseBar
        tools={[
          {
            id: 'e',
            toolName: 'Err',
            status: 'error',
            errorMessage: 'e',
          } as any,
          {
            id: 'a',
            toolName: 'Active',
            status: 'success',
          } as any,
        ]}
        activeKeys={['a']}
        disableAnimation
      />,
    );
    expect(screen.getByText('Err')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

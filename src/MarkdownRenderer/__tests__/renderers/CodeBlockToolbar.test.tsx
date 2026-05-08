import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CodeBlockToolbar } from '../../renderers/CodeBlockToolbar';

const noop = () => {};

describe('CodeBlockToolbar', () => {
  it('renders the language label', () => {
    render(
      <CodeBlockToolbar
        language="typescript"
        expanded
        theme="light"
        onCopy={noop}
        onToggleExpanded={noop}
      />,
    );
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('renders fallback "plain text" when language is missing', () => {
    render(
      <CodeBlockToolbar
        expanded
        theme="light"
        onCopy={noop}
        onToggleExpanded={noop}
      />,
    );
    expect(screen.getByText('plain text')).toBeInTheDocument();
  });

  it('exposes a stable testid for the toolbar root', () => {
    const { container } = render(
      <CodeBlockToolbar
        language="json"
        expanded
        theme="light"
        onCopy={noop}
        onToggleExpanded={noop}
      />,
    );
    expect(
      container.querySelector('[data-testid="code-toolbar"]'),
    ).toBeTruthy();
  });

  it('applies a bottom border only in expanded state', () => {
    const { container, rerender } = render(
      <CodeBlockToolbar
        language="json"
        expanded
        theme="light"
        onCopy={noop}
        onToggleExpanded={noop}
      />,
    );
    const expandedToolbar = container.querySelector(
      '[data-testid="code-toolbar"]',
    ) as HTMLElement;
    // 展开态下应有非空的 border-bottom（jsdom 对 simple value vs shorthand 的 normalize 不稳定，
    // 因此只断言其非空，不与字面量比较）
    expect(expandedToolbar.style.borderBottom).not.toBe('');

    rerender(
      <CodeBlockToolbar
        language="json"
        expanded={false}
        theme="light"
        onCopy={noop}
        onToggleExpanded={noop}
      />,
    );
    const collapsedToolbar = container.querySelector(
      '[data-testid="code-toolbar"]',
    ) as HTMLElement;
    // happy-dom 将 borderBottomWidth 归一化为 'initial'，jsdom 则为空字符串；
    // 两者都表示"无显式可见边框"
    expect(['', 'initial']).toContain(collapsedToolbar.style.borderBottomWidth);
  });

  it('invokes onCopy when copy button is clicked', () => {
    const onCopy = vi.fn();
    const { container } = render(
      <CodeBlockToolbar
        language="json"
        expanded
        theme="light"
        onCopy={onCopy}
        onToggleExpanded={noop}
      />,
    );
    // 工具栏右侧第一个 ActionIconBox 是复制按钮
    const buttons = container.querySelectorAll(
      '[data-testid="code-toolbar"] [role="button"], [data-testid="code-toolbar"] button',
    );
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(buttons[0]);
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it('invokes onToggleExpanded when the toggle button is clicked', () => {
    const onToggleExpanded = vi.fn();
    const { container } = render(
      <CodeBlockToolbar
        language="json"
        expanded
        theme="light"
        onCopy={noop}
        onToggleExpanded={onToggleExpanded}
      />,
    );
    const buttons = container.querySelectorAll(
      '[data-testid="code-toolbar"] [role="button"], [data-testid="code-toolbar"] button',
    );
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onToggleExpanded).toHaveBeenCalledTimes(1);
  });
});

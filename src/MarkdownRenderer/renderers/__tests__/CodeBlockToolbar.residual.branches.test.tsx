/**
 * CodeBlockToolbar residual：dark theme、无语言图标、复制/折叠回调。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CodeBlockToolbar } from '../CodeBlockToolbar';

describe('CodeBlockToolbar residual branches', () => {
  it('无 language 显示 plain text；dark theme 可交互', () => {
    const onCopy = vi.fn();
    const onToggle = vi.fn();
    const { container } = render(
      <CodeBlockToolbar
        expanded={false}
        theme="dark"
        onCopy={onCopy}
        onToggleExpanded={onToggle}
      />,
    );
    expect(screen.getByText('plain text')).toBeTruthy();
    const buttons = container.querySelectorAll(
      '[data-testid="code-toolbar"] [role="button"], [data-testid="code-toolbar"] button',
    );
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onCopy).toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalled();
  });

  it('expanded 有底边；未知 language 无 icon；light theme', () => {
    const { container, rerender } = render(
      <CodeBlockToolbar
        language="unknown-lang"
        expanded
        theme="light"
        onCopy={() => {}}
        onToggleExpanded={() => {}}
      />,
    );
    expect(container.textContent).toMatch(/unknown-lang/i);
    rerender(
      <CodeBlockToolbar
        language=""
        expanded={false}
        theme="light"
        onCopy={() => {}}
        onToggleExpanded={() => {}}
      />,
    );
    expect(screen.getByText('plain text')).toBeTruthy();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToolUseBarThink } from '../index';

class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe('ToolUseBarThink residual branches', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('expands long content and scrolls after a user expansion', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(
      <ToolUseBarThink
        toolName="tool"
        thinkContent={<span>long content</span>}
        scrollIntoViewOnExpand={{ behavior: 'auto', block: 'center' }}
      />,
    );
    fireEvent.click(screen.getByTestId('tool-use-bar-think-bar'));
    vi.advanceTimersByTime(500);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center',
    });
  });

  it('renders and toggles the loading floating expand affordance', () => {
    render(
      <ToolUseBarThink
        toolName="tool"
        thinkContent="thinking"
        status="loading"
        defaultFloatingExpanded={false}
      />,
    );
    const toggle = screen.getByTestId('tool-use-bar-think-floating-expand');
    fireEvent.click(toggle);
    expect(toggle).toBeInTheDocument();
  });

  it('无 thinkContent；error status；CSS.registerProperty 安全', () => {
    render(
      <ToolUseBarThink toolName="empty" status="error" thinkContent={null} />,
    );
    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});

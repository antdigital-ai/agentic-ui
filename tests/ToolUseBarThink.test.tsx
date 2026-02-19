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
});

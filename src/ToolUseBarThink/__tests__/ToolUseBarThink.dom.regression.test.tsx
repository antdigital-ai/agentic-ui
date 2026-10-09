import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToolUseBarThink } from '..';

describe('ToolUseBarThink lazy content regressions', () => {
  it('does not mount collapsed custom content and preserves state after opening', () => {
    const mount = vi.fn();
    const Body = () => {
      mount();
      const [count, setCount] = useState(0);
      return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
    };
    const body = <Body />;
    const { rerender } = render(
      <ToolUseBarThink toolName="Think" thinkContent={body} expanded={false} />,
    );
    expect(mount).not.toHaveBeenCalled();
    expect(screen.queryByTestId('tool-use-bar-think-container')).toBeNull();

    rerender(<ToolUseBarThink toolName="Think" thinkContent={body} expanded />);
    fireEvent.click(screen.getByRole('button', { name: 'Count 0' }));
    const button = screen.getByRole('button', { name: 'Count 1' });

    rerender(
      <ToolUseBarThink toolName="Think" thinkContent={body} expanded={false} />,
    );
    expect(button).toBeInTheDocument();
    rerender(<ToolUseBarThink toolName="Think" thinkContent={body} expanded />);
    expect(screen.getByRole('button', { name: 'Count 1' })).toBe(button);
  });

  it('mounts a loading body after auto-expansion and shows one floating control', () => {
    render(
      <ToolUseBarThink
        toolName="Think"
        status="loading"
        thinkContent={<div>Loading thoughts</div>}
      />,
    );
    expect(screen.getByText('Loading thoughts')).toBeInTheDocument();
    expect(
      screen.getAllByTestId('tool-use-bar-think-floating-expand'),
    ).toHaveLength(1);
  });

  it('keeps one floating control when a previously expanded loading bar is collapsed', () => {
    const body = <div>Loading thoughts</div>;
    const { rerender } = render(
      <ToolUseBarThink
        toolName="Think"
        status="loading"
        thinkContent={body}
        expanded
      />,
    );
    rerender(
      <ToolUseBarThink
        toolName="Think"
        status="loading"
        thinkContent={body}
        expanded={false}
      />,
    );
    expect(
      screen.getAllByTestId('tool-use-bar-think-floating-expand'),
    ).toHaveLength(1);
  });
});

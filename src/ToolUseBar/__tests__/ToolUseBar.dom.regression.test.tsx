import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ToolUseBar } from '..';

describe('ToolUseBar empty content DOM regressions', () => {
  it('does not create hidden placeholders for tools without a body', () => {
    const tools = Array.from({ length: 50 }, (_, index) => ({
      id: String(index),
      toolName: `Tool ${index}`,
      toolTarget: '',
      status: 'success' as const,
    }));
    const { container } = render(<ToolUseBar tools={tools} />);

    expect(screen.getAllByTestId('ToolUserItem')).toHaveLength(50);
    expect(container.querySelectorAll('[role="presentation"]')).toHaveLength(0);
    expect(screen.queryByTestId('tool-user-item-tool-container')).toBeNull();
  });
});

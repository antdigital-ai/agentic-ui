import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { AGENTIC_LAYOUT_TEST_ID, AgenticLayout } from '../index';

describe('AgenticLayout residual branches', () => {
  it('renders a center-only layout without sidebar controls', () => {
    const { container } = render(
      <AgenticLayout center={<span>center-only</span>} />,
    );

    expect(screen.getByTestId(AGENTIC_LAYOUT_TEST_ID)).toBeInTheDocument();
    expect(container.querySelector('[role="separator"]')).toBeNull();
  });

  it('honors collapsed widths when both sidebars are present', () => {
    const { container } = render(
      <AgenticLayout
        left={<span>left</span>}
        center={<span>center</span>}
        right={<span>right</span>}
        header={{ leftCollapsed: true, rightCollapsed: true }}
      />,
    );

    expect(
      container.querySelector('.ant-agentic-layout-sidebar-left'),
    ).toHaveStyle({ width: '0px' });
    expect(
      container.querySelector('.ant-agentic-layout-sidebar-right'),
    ).toHaveStyle({ width: '0px' });
  });

  it('展开侧栏宽度与自定义 className', () => {
    const { container } = render(
      <AgenticLayout
        className="layout-x"
        left={<span>L</span>}
        center={<span>C</span>}
        right={<span>R</span>}
        header={{ leftCollapsed: false, rightCollapsed: false }}
      />,
    );
    expect(container.querySelector('.layout-x')).toBeTruthy();
    expect(
      container.querySelector('.ant-agentic-layout-sidebar-left'),
    ).not.toHaveStyle({ width: '0px' });
  });
});

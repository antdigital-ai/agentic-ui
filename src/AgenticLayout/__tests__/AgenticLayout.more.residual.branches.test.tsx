/**
 * AgenticLayout more residual：折叠回调、rightExtra、仅 center。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AGENTIC_LAYOUT_TEST_ID, AgenticLayout } from '../index';

describe('AgenticLayout more residual branches', () => {
  it('header collapsible + onLeft/RightCollapse + rightExtra', () => {
    const onLeftCollapse = vi.fn();
    const onRightCollapse = vi.fn();
    render(
      <ConfigProvider>
        <AgenticLayout
          left={<div>L</div>}
          center={<div>C</div>}
          right={<div>R</div>}
          leftWidth={180}
          rightWidth={220}
          header={{
            title: 'H',
            leftCollapsible: true,
            rightCollapsible: true,
            onLeftCollapse,
            onRightCollapse,
            rightExtra: <span data-testid="extra">E</span>,
          }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('extra')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    buttons.forEach((b) => fireEvent.click(b));
    expect(onLeftCollapse).toHaveBeenCalled();
    expect(screen.getByTestId(AGENTIC_LAYOUT_TEST_ID)).toBeInTheDocument();
  });

  it('无 left/right 仅 center', () => {
    render(
      <ConfigProvider>
        <AgenticLayout center={<div data-testid="only-c">C</div>} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('only-c')).toBeInTheDocument();
  });
});

/**
 * ButtonTab deepen：disabled 短路 click / icon / keydown。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ButtonTab from '../ButtonTab';

describe('ButtonTab deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('disabled 时 onClick / onIconClick 不触发', () => {
    const onClick = vi.fn();
    const onIconClick = vi.fn();
    render(
      <ButtonTab
        disabled
        onClick={onClick}
        onIconClick={onIconClick}
        icon={<span data-testid="ico">i</span>}
      >
        tab
      </ButtonTab>,
    );
    fireEvent.click(screen.getByTestId('agentic-chatboot-button-tab'));
    fireEvent.click(screen.getByTestId('ico'));
    expect(onClick).not.toHaveBeenCalled();
    expect(onIconClick).not.toHaveBeenCalled();
  });

  it('disabled 时 icon Enter 不触发', () => {
    const onIconClick = vi.fn();
    const { container } = render(
      <ButtonTab
        disabled
        onIconClick={onIconClick}
        icon={<span>i</span>}
      >
        tab
      </ButtonTab>,
    );
    const icon = container.querySelector('[role="button"]');
    if (icon) {
      fireEvent.keyDown(icon, { key: 'Enter' });
    }
    expect(onIconClick).not.toHaveBeenCalled();
  });

  it('启用时 icon Space 触发 onIconClick', () => {
    const onIconClick = vi.fn();
    const { container } = render(
      <ButtonTab onIconClick={onIconClick} icon={<span>i</span>}>
        tab
      </ButtonTab>,
    );
    const icon = container.querySelector(
      '.ant-agentic-chatboot-button-tab-icon, [class*="button-tab-icon"]',
    );
    expect(icon).toBeTruthy();
    fireEvent.keyDown(icon!, { key: ' ' });
    expect(onIconClick).toHaveBeenCalled();
  });
});

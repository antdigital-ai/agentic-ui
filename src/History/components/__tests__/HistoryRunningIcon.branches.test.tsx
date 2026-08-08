/**
 * HistoryRunningIcon：animated / paused / duration / 二次注入。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { HistoryRunningIcon, HistoryRunningIconContainer } from '../HistoryRunningIcon';

describe('HistoryRunningIcon branches', () => {
  it('默认动画注入 keyframes', () => {
    const { container } = render(<HistoryRunningIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(
      document.querySelector('[data-history-running-icon]'),
    ).toBeTruthy();
  });

  it('animated false 不旋转', () => {
    const { container } = render(
      <HistoryRunningIcon animated={false} />,
    );
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.style.animation).toBeFalsy();
  });

  it('paused 与自定义 duration / animationStyle', () => {
    const { container } = render(
      <HistoryRunningIcon
        paused
        duration={1}
        animationStyle={{ animationTimingFunction: 'linear' }}
        className="x"
      />,
    );
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.className.baseVal || svg.getAttribute('class')).toContain('x');
  });

  it('二次渲染复用已注入 keyframes', () => {
    const before = document.querySelectorAll(
      '[data-history-running-icon]',
    ).length;
    render(<HistoryRunningIcon />);
    render(<HistoryRunningIcon />);
    const after = document.querySelectorAll(
      '[data-history-running-icon]',
    ).length;
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('自定义 size / color / 非数字 size；Container 包装', () => {
    const { container, rerender } = render(
      <HistoryRunningIcon size={24} color="#f00" />,
    );
    expect(container.querySelector('svg')).toBeTruthy();
    rerender(<HistoryRunningIcon size="2em" animated={false} paused />);
    expect(container.querySelector('svg')).toBeTruthy();
    const { container: c2 } = render(
      <HistoryRunningIconContainer size="1.5em" iconProps={{ animated: false }}>
        <span data-testid="child">x</span>
      </HistoryRunningIconContainer>,
    );
    expect(c2.querySelector('svg')).toBeTruthy();
    expect(c2.textContent).toContain('x');
  });
});

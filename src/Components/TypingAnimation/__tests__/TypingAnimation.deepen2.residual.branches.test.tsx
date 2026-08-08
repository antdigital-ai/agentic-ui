/**
 * TypingAnimation deepen2：多段 children、delay、空 children、自定义 element。
 */
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TypingAnimation } from '../index';

describe('TypingAnimation deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('IntersectionObserver', undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('as=span 渲染；打字推进', () => {
    const onComplete = vi.fn();
    render(
      <TypingAnimation
        duration={5}
        onComplete={onComplete}
        as="span"
        startOnView={false}
      >
        Hi
      </TypingAnimation>,
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText(/H|Hi/)).toBeTruthy();
  });

  it('空 children 安全；数字 children', () => {
    expect(() =>
      render(
        <TypingAnimation duration={5} startOnView={false}>
          {''}
        </TypingAnimation>,
      ),
    ).not.toThrow();
    cleanup();
    render(
      <TypingAnimation duration={5} startOnView={false}>
        {42 as any}
      </TypingAnimation>,
    );
    act(() => {
      vi.advanceTimersByTime(100);
    });
  });

  it('delay 后再开始；className', () => {
    render(
      <TypingAnimation
        duration={5}
        delay={20}
        startOnView={false}
        className="type-x"
      >
        XY
      </TypingAnimation>,
    );
    act(() => {
      vi.advanceTimersByTime(10);
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(document.querySelector('.type-x')).toBeTruthy();
  });
});

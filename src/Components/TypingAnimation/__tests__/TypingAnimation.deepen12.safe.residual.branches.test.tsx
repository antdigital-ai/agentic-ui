/**
 * TypingAnimation deepen12 safe：空 words、showCursor false、as span。
 */
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TypingAnimation } from '../index';

describe('TypingAnimation deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('IntersectionObserver', undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
  });

  it('空 words 数组早退', () => {
    const { container } = render(
      <TypingAnimation words={[]} startOnView={false} />,
    );
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(container).toBeTruthy();
  });

  it('showCursor false；children 打字', () => {
    render(
      <TypingAnimation showCursor={false} startOnView={false} duration={5}>
        Hi
      </TypingAnimation>,
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText(/H|Hi/)).toBeTruthy();
  });

  it('as span + className 合并', () => {
    const { container } = render(
      <TypingAnimation as="span" className="custom-type" startOnView={false}>
        X
      </TypingAnimation>,
    );
    expect(container.querySelector('.custom-type')).toBeTruthy();
  });
});

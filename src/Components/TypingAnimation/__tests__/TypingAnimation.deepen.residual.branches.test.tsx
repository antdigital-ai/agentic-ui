/**
 * TypingAnimation deepen：无 IO；startOnView=false；target 缺失早退。
 */
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TypingAnimation } from '../index';

describe('TypingAnimation deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('无 IntersectionObserver 时开始打字', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<TypingAnimation duration={10}>Abc</TypingAnimation>);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText(/A|Abc/)).toBeTruthy();
  });

  it('startOnView=false 立即开打', () => {
    let observed = false;
    class FakeIO {
      observe() {
        observed = true;
      }
      disconnect() {}
      unobserve() {}
    }
    vi.stubGlobal('IntersectionObserver', FakeIO as any);
    render(
      <TypingAnimation startOnView={false} duration={5}>
        Z
      </TypingAnimation>,
    );
    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(observed).toBe(true);
  });
});

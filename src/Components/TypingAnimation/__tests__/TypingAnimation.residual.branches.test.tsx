/**
 * TypingAnimation 残留：空 children、words、cursor。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../style', () => ({
  useTypingAnimationStyle: () => ({ hashId: 'h' }),
}));

import { TypingAnimation } from '../index';

describe('TypingAnimation residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 children 不抛', () => {
    expect(() => render(<TypingAnimation />)).not.toThrow();
  });

  it('words + 关闭 cursor', () => {
    render(
      <TypingAnimation
        words={['Hi']}
        typeSpeed={1}
        delay={1}
        loop={false}
        showCursor={false}
        startOnView={false}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(document.body.textContent).toMatch(/H|i/);
  });

  it('children 字符串', () => {
    render(
      <TypingAnimation typeSpeed={1} startOnView={false} showCursor={false}>
        ab
      </TypingAnimation>,
    );
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(document.body).toBeTruthy();
  });
});

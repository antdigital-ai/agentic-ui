/**
 * TextAnimate deepen：无 IntersectionObserver；once=false。
 */
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { TextAnimate } from '../index';

describe('TextAnimate deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('无 IntersectionObserver 时直接展示', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<TextAnimate>Hello</TextAnimate>);
    expect(screen.getByText(/Hello/)).toBeTruthy();
  });

  it('once=false 时交并离开可回调', () => {
    let cb: IntersectionObserverCallback = () => {};
    class FakeIO {
      constructor(c: IntersectionObserverCallback) {
        cb = c;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds = [];
    }
    vi.stubGlobal('IntersectionObserver', FakeIO as any);
    render(
      <TextAnimate once={false} startOnView>
        Hi
      </TextAnimate>,
    );
    act(() => {
      cb(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    act(() => {
      cb(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByText(/Hi/)).toBeTruthy();
  });
});

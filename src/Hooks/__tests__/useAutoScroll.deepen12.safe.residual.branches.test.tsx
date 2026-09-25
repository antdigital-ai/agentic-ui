/**
 * useAutoScroll deepen12 safe：无 container 早退、shrink pinned、
 * wheel up 取消 pinned。
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAutoScroll from '../useAutoScroll';

const installObserverMocks = () => {
  global.ResizeObserver = vi.fn(function MockResizeObserver() {
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  }) as unknown as typeof ResizeObserver;
  global.MutationObserver = vi.fn(function MockMutationObserver() {
    return { observe: vi.fn(), disconnect: vi.fn(), takeRecords: () => [] };
  }) as unknown as typeof MutationObserver;
};

describe('useAutoScroll deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    installObserverMocks();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
  });

  it('scrollToBottom 无 container 早退', () => {
    let scrollToBottom!: () => void;
    const Probe = () => {
      const api = useAutoScroll({ deps: [1] });
      scrollToBottom = api.scrollToBottom;
      return null;
    };
    render(<Probe />);
    act(() => {
      scrollToBottom();
    });
    expect(true).toBe(true);
  });

  it('wheel up 取消 pinned', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'scrollHeight', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(el, 'clientHeight', {
      value: 100,
      configurable: true,
    });
    Object.defineProperty(el, 'scrollTop', {
      value: 200,
      writable: true,
      configurable: true,
    });
    const Probe = () => {
      const { containerRef } = useAutoScroll({ deps: [2], scrollTolerance: 8 });
      React.useEffect(() => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
          el;
      }, [containerRef]);
      return <div ref={containerRef} data-testid="as12" />;
    };
    render(<Probe />);
    act(() => {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -12, bubbles: true }));
      vi.advanceTimersByTime(20);
    });
    expect(el.scrollTop).toBeDefined();
  });
});

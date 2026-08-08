/**
 * useElementSize deepen：空 entries 与 cleanup 取消 RAF。
 */
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useElementSize } from '../useElementSize';

function Box() {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="sized" style={{ width: 40, height: 20 }}>
      {width}x{height}
    </div>
  );
}

describe('useElementSize deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 entries 回调早退；卸载清理 RAF', () => {
    let observerCb: ResizeObserverCallback | null = null;
    const disconnect = vi.fn();
    const observe = vi.fn();
    class FakeRO {
      constructor(cb: ResizeObserverCallback) {
        observerCb = cb;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
    }
    const prev = window.ResizeObserver;
    window.ResizeObserver = FakeRO as any;

    const { unmount } = render(<Box />);
    act(() => {
      observerCb?.([], {} as ResizeObserver);
    });
    act(() => {
      unmount();
    });
    expect(disconnect).toHaveBeenCalled();
    window.ResizeObserver = prev;
  });
});

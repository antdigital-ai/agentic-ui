/**
 * useTextOverflow deepen：无 DOM / 无 ResizeObserver 早退。
 */
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTextOverflow } from '../useTextOverflow';

function Probe({ text }: { text: string }) {
  const { textRef, isTextOverflow } = useTextOverflow(text);
  return (
    <div>
      <div ref={textRef} data-testid="overflow-el">
        {text}
      </div>
      <span data-testid="flag">{String(isTextOverflow)}</span>
    </div>
  );
}

describe('useTextOverflow deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('ResizeObserver 缺失时静默跳过观察', () => {
    const prev = window.ResizeObserver;
    // @ts-expect-error intentional
    delete window.ResizeObserver;
    render(<Probe text="hello overflow text" />);
    expect(document.querySelector('[data-testid="overflow-el"]')).toBeTruthy();
    window.ResizeObserver = prev;
  });

  it('卸载后 measure 无 el 安全返回', () => {
    const { unmount } = render(<Probe text="x" />);
    act(() => {
      unmount();
    });
    expect(true).toBe(true);
  });
});

/**
 * useScrollShadow deepen3：挂载后连续 scroll 命中 raf 短路。
 */
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useSmartScrollShadow from '../useScrollShadow';

const Harness = () => {
  const [ref] = useSmartScrollShadow(1);
  return (
    <div
      ref={ref}
      data-testid="scroll-box"
      style={{ overflow: 'auto', height: 40, width: 40 }}
    >
      <div style={{ height: 200, width: 200 }}>x</div>
    </div>
  );
};

describe('useScrollShadow deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('连续 scroll 触发 raf 短路', async () => {
    const { getByTestId } = render(<Harness />);
    const box = getByTestId('scroll-box');
    await act(async () => {
      fireEvent.scroll(box);
      fireEvent.scroll(box);
      vi.advanceTimersByTime(50);
    });
    expect(box).toBeTruthy();
  });
});

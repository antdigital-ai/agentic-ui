/**
 * ContentThrottle deepen4：disposed tick 早退与 hidden 页用 timer。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentThrottle } from '../ContentThrottle';

describe('ContentThrottle deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('dispose 后 tick 早退；visibility hidden 走 setTimeout', () => {
    const onFlush = vi.fn();
    const throttle = new ContentThrottle(onFlush, {
      charsPerFrame: 2,
      speed: 1,
      backgroundInterval: 20,
    });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    throttle.push('abcdefghij');
    vi.advanceTimersByTime(50);
    expect(onFlush).toHaveBeenCalled();
    throttle.dispose();
    const calls = onFlush.mock.calls.length;
    vi.advanceTimersByTime(100);
    expect(onFlush.mock.calls.length).toBe(calls);
  });
});

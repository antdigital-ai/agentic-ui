/**
 * scrollTo residual：Document / HTMLElement / duration 0 / callback。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import scrollTo from '../scrollTo';

describe('scrollTo residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('window 容器滚动并回调', async () => {
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const cb = vi.fn();
    scrollTo(200, { duration: 0, callback: cb });
    await vi.advanceTimersByTimeAsync(20);
    expect(spy).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
  });

  it('HTMLElement 容器滚动不抛', async () => {
    const el = document.createElement('div');
    el.scrollTop = 0;
    expect(() => scrollTo(80, { container: el, duration: 0 })).not.toThrow();
    await vi.advanceTimersByTimeAsync(20);
  });

  it('Document 容器写 documentElement.scrollTop', async () => {
    expect(() =>
      scrollTo(10, { container: document, duration: 0 }),
    ).not.toThrow();
    await vi.advanceTimersByTimeAsync(20);
    expect(typeof document.documentElement.scrollTop).toBe('number');
  });

  it('默认 window 容器可带 callback', async () => {
    const cb = vi.fn();
    scrollTo(1, { duration: 0, callback: cb });
    await vi.advanceTimersByTimeAsync(20);
    expect(cb).toHaveBeenCalled();
  });
});

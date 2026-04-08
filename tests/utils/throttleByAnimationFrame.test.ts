import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import throttleByAnimationFrame from '../../src/Utils/throttleByAnimationFrame';

describe('throttleByAnimationFrame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call the function on the first invocation', () => {
    const fn = vi.fn();
    const throttled = throttleByAnimationFrame(fn);

    throttled('arg1', 'arg2');

    vi.advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should throttle subsequent calls within the same animation frame', () => {
    const fn = vi.fn();
    const throttled = throttleByAnimationFrame(fn);

    throttled('first');
    throttled('second');
    throttled('third');

    vi.advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');
  });

  it('should allow new calls after the animation frame completes', () => {
    const fn = vi.fn();
    const throttled = throttleByAnimationFrame(fn);

    throttled('first');
    vi.advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);

    throttled('second');
    vi.advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');
  });

  it('should support cancel method', () => {
    const fn = vi.fn();
    const throttled = throttleByAnimationFrame(fn);

    throttled('test');
    throttled.cancel();

    vi.advanceTimersByTime(16);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should reset state after cancel', () => {
    const fn = vi.fn();
    const throttled = throttleByAnimationFrame(fn);

    throttled('before-cancel');
    throttled.cancel();
    vi.advanceTimersByTime(16);

    throttled('after-cancel');
    vi.advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('after-cancel');
  });

  it('should work with no arguments', () => {
    const fn = vi.fn();
    const throttled = throttleByAnimationFrame(fn);

    throttled();
    vi.advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass multiple arguments correctly', () => {
    const fn = vi.fn();
    const throttled = throttleByAnimationFrame(fn);

    throttled(1, 'two', { three: 3 });
    vi.advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledWith(1, 'two', { three: 3 });
  });
});

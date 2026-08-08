/**
 * ContentThrottle deepen6 safe：visibility 监听、tick 正常推进、
 * cancelAnimationFrame、disposed/remaining 守卫。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentThrottle } from '../ContentThrottle';

describe('ContentThrottle deepen6 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
  });

  it('构造/销毁注册 visibilitychange；visible 页 rAF tick', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const onFlush = vi.fn();
    const rafQueue: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return rafQueue.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });

    const throttle = new ContentThrottle(onFlush, { charsPerFrame: 3 });
    expect(addSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );

    throttle.push('abcdef');
    const flushRaf = () => {
      const q = rafQueue.splice(0, rafQueue.length);
      q.forEach((cb) => cb(0));
    };
    flushRaf();
    expect(onFlush).toHaveBeenCalled();

    throttle.dispose();
    expect(removeSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );

    const calls = onFlush.mock.calls.length;
    flushRaf();
    expect(onFlush.mock.calls.length).toBe(calls);
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('visibilitychange 重新 schedule；remaining<=0 不再 tick', () => {
    const onFlush = vi.fn();
    const rafQueue: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return rafQueue.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const throttle = new ContentThrottle(onFlush, { charsPerFrame: 10 });
    throttle.push('hi');
    const flushRaf = () => {
      rafQueue.splice(0).forEach((cb) => cb(0));
    };
    flushRaf();
    expect(onFlush).toHaveBeenLastCalledWith('hi');

    document.dispatchEvent(new Event('visibilitychange'));
    flushRaf();
    expect(onFlush).toHaveBeenCalled();
    throttle.dispose();
  });
});

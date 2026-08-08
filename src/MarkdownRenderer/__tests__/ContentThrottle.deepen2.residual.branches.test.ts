/**
 * ContentThrottle deepen2：tick remaining<=0；visibility disposed；无 raf 走 timer。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentThrottle } from '../ContentThrottle';
import { installRafStub } from './installRafStub';

describe('ContentThrottle deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    installRafStub();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.unstubAllGlobals();
  });

  it('无 requestAnimationFrame 时用 setTimeout 调度', () => {
    const raf = globalThis.requestAnimationFrame;
    // @ts-expect-error
    delete globalThis.requestAnimationFrame;
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 2,
      backgroundInterval: 10,
    });
    t.push('abcd');
    vi.advanceTimersByTime(50);
    expect(flushed.length).toBeGreaterThan(0);
    t.dispose();
    globalThis.requestAnimationFrame = raf;
  });

  it('dispose 后 visibilitychange 早退', () => {
    const t = new ContentThrottle(() => {}, { charsPerFrame: 1 });
    t.push('hello');
    t.dispose();
    expect(() =>
      document.dispatchEvent(new Event('visibilitychange')),
    ).not.toThrow();
  });

  it('setOptions 在已追上时不 restart', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 100,
    });
    t.push('ab');
    vi.advanceTimersByTime(16);
    const n = flushed.length;
    t.setOptions({ charsPerFrame: 1 });
    vi.advanceTimersByTime(16);
    expect(flushed.length).toBe(n);
    t.dispose();
  });
});

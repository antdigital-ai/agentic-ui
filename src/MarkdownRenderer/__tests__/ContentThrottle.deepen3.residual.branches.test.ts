/**
 * ContentThrottle deepen3：flushOnComplete false、background 批量、
 * push 空串、dispose 重复、setOptions restart。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentThrottle } from '../ContentThrottle';
import { installRafStub } from './installRafStub';

describe('ContentThrottle deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    installRafStub();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.unstubAllGlobals();
  });

  it('flushOnComplete=false 不一次吐完', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
      flushOnComplete: false,
    });
    t.push('abcd');
    vi.advanceTimersByTime(16);
    expect(flushed[flushed.length - 1]?.length ?? 0).toBeLessThan(4);
    vi.advanceTimersByTime(200);
    expect(flushed[flushed.length - 1]).toBe('abcd');
    t.dispose();
  });

  it('document.hidden 走 backgroundInterval 与 multiplier', () => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
      backgroundInterval: 5,
      backgroundBatchMultiplier: 3,
    });
    t.push('abcdefgh');
    vi.advanceTimersByTime(20);
    expect(flushed.length).toBeGreaterThan(0);
    t.dispose();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
  });

  it('push 空串；重复 dispose；中途 setOptions 加速', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
    });
    t.push('');
    t.push('xyz');
    t.setOptions({ charsPerFrame: 10 });
    vi.advanceTimersByTime(32);
    expect(flushed.join('')).toContain('xyz');
    t.dispose();
    expect(() => t.dispose()).not.toThrow();
  });
});

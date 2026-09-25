/**
 * ContentThrottle deepen residual：dispose 中途、complete no-op、
 * remaining<=0、visibility 已追上、非前缀重置。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentThrottle } from '../ContentThrottle';
import { installRafStub } from './installRafStub';

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: state,
  });
};

describe('ContentThrottle deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    installRafStub();
    setVisibility('visible');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.unstubAllGlobals();
    setVisibility('visible');
  });

  it('flushOnComplete:false 时 complete 不 flush', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 2,
      flushOnComplete: false,
    });
    t.push('abcdef');
    vi.advanceTimersByTime(16);
    const n = flushed.length;
    t.complete();
    expect(flushed.length).toBe(n);
    t.dispose();
  });

  it('dispose 后 tick 提前 return', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
    });
    t.push('abcdefghij');
    t.dispose();
    const n = flushed.length;
    vi.advanceTimersByTime(200);
    expect(flushed.length).toBe(n);
  });

  it('非前缀内容重置 displayedLength', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 100,
    });
    t.push('abc');
    vi.advanceTimersByTime(16);
    flushed.length = 0;
    t.push('xyz');
    vi.advanceTimersByTime(16);
    expect(flushed.at(-1)).toBe('xyz');
    t.dispose();
  });

  it('已追上时 visibilitychange 为 no-op；getters 可用', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 100,
    });
    t.push('ok');
    vi.advanceTimersByTime(16);
    expect(t.getDisplayedLength()).toBe(2);
    expect(t.getFullContent()).toBe('ok');
    document.dispatchEvent(new Event('visibilitychange'));
    t.dispose();
    document.dispatchEvent(new Event('visibilitychange'));
  });

  it('complete 已追上为 no-op；同内容 push 续 tick', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 100,
    });
    t.push('hi');
    vi.advanceTimersByTime(16);
    const n = flushed.length;
    t.complete();
    t.push('hi');
    expect(flushed.length).toBe(n);
    t.dispose();
  });
});

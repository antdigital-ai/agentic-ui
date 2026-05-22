import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentThrottle } from '../ContentThrottle';
import { installRafStub } from './installRafStub';

describe('ContentThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
  });

  it('enabled 模式下按帧推进字符', () => {
    const flushed: string[] = [];
    const throttle = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 5,
      speed: 1,
    });

    throttle.push('Hello World');

    expect(flushed).toEqual([]);
    vi.advanceTimersToNextTimer();
    vi.advanceTimersToNextTimer();
    expect(flushed.at(-1)).toContain('Hello');

    vi.advanceTimersToNextTimer();
    vi.advanceTimersToNextTimer();
    vi.advanceTimersToNextTimer();
    expect(flushed.at(-1)).toBe('Hello World');

    throttle.dispose();
  });

  it('complete 应立即 flush 剩余内容', () => {
    const flushed: string[] = [];
    const throttle = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
    });

    throttle.push('Hello World');
    throttle.complete();

    expect(flushed.at(-1)).toBe('Hello World');
    throttle.dispose();
  });

  it('content 前缀变化时应重置进度', () => {
    const flushed: string[] = [];
    const throttle = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 100,
    });

    throttle.push('Hello');
    throttle.complete();
    throttle.push('World');
    throttle.complete();

    expect(flushed.at(-1)).toBe('World');
    throttle.dispose();
  });

  it('边界字符不匹配时应从头追赶新内容', () => {
    const flushed: string[] = [];
    const throttle = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 5,
    });

    throttle.push('Hello World');
    vi.advanceTimersToNextTimer();
    expect(throttle.getDisplayedLength()).toBe(5);

    throttle.push('Hellx World');

    expect(throttle.getDisplayedLength()).toBe(0);
    vi.advanceTimersToNextTimer();
    expect(flushed.at(-1)).toBe('Hellx');
    throttle.dispose();
  });

  it('页面隐藏后应改用后台批量推进', () => {
    const flushed: string[] = [];
    const throttle = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 2,
      backgroundBatchMultiplier: 3,
      backgroundInterval: 25,
    });

    throttle.push('Hello World');
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));

    vi.advanceTimersByTime(16);
    expect(flushed).toEqual([]);

    vi.advanceTimersByTime(25);
    expect(flushed.at(-1)).toBe('Hello ');
    throttle.dispose();
  });

  it('flushOnComplete=false 时 complete 不应强制 flush', () => {
    const flushed: string[] = [];
    const throttle = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
      flushOnComplete: false,
    });

    throttle.push('Hello');
    throttle.complete();

    expect(flushed).toEqual([]);
    throttle.dispose();
  });

  it('已追上目标时不应重复调度或 flush', () => {
    const flushed: string[] = [];
    const throttle = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 100,
    });

    throttle.push('Hi');
    throttle.complete();
    const countAfterComplete = flushed.length;
    throttle.push('Hi');

    vi.advanceTimersToNextTimer();
    expect(flushed.length).toBe(countAfterComplete);
    throttle.dispose();
  });
});

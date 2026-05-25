import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentThrottle } from '../ContentThrottle';
import { installRafStub } from './installRafStub';

describe('ContentThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
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

  it('页面隐藏时使用后台定时器与批量步进', () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
    const flushed: string[] = [];
    const throttle = new ContentThrottle((s) => flushed.push(s), {
      backgroundBatchMultiplier: 4,
      backgroundInterval: 50,
      charsPerFrame: 2,
    });

    throttle.push('abcdefghij');

    vi.advanceTimersByTime(49);
    expect(flushed).toEqual([]);
    expect(rafSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(flushed).toEqual(['abcdefgh']);

    vi.advanceTimersByTime(50);
    expect(flushed.at(-1)).toBe('abcdefghij');
    throttle.dispose();
  });

  it('可见性恢复时取消后台定时器并切回 raf 推进', () => {
    let visibilityState: DocumentVisibilityState = 'hidden';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(
      () => visibilityState,
    );
    const flushed: string[] = [];
    const throttle = new ContentThrottle((s) => flushed.push(s), {
      backgroundBatchMultiplier: 10,
      backgroundInterval: 100,
      charsPerFrame: 2,
    });

    throttle.push('abcdef');
    visibilityState = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));

    vi.advanceTimersByTime(16);
    expect(flushed).toEqual(['ab']);

    vi.advanceTimersByTime(84);
    expect(flushed).toEqual(['ab']);

    vi.advanceTimersByTime(16);
    expect(flushed).toEqual(['ab', 'abcd']);
    throttle.dispose();
  });
});

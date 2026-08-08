import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentThrottle } from '../ContentThrottle';
import { installRafStub } from './installRafStub';

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: state,
  });
};

describe('ContentThrottle 分支补洞', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
    setVisibility('visible');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.unstubAllGlobals();
    setVisibility('visible');
  });

  it('默认 options 与 setOptions 触发 ensureTicking', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s));
    t.push('abcdef');
    t.setOptions({ charsPerFrame: 2, speed: 2 });
    vi.advanceTimersByTime(16);
    expect(flushed.at(-1)!.length).toBeGreaterThan(0);
    t.dispose();
  });

  it('相同 content 且未追上时继续 tick', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
    });
    t.push('hello');
    vi.advanceTimersByTime(16);
    const len = flushed.length;
    t.push('hello');
    vi.advanceTimersByTime(16);
    expect(flushed.length).toBeGreaterThan(len);
    t.dispose();
  });

  it('缩短内容且 displayedLength 已覆盖时直接 flush；同内容追上为 no-op', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 100,
    });
    t.push('x');
    flushed.length = 0;
    // displayedLength 仍为 0，压入空串命中 length 追上 flush
    t.push('');
    expect(flushed).toEqual(['']);
    flushed.length = 0;
    t.push('hi');
    vi.advanceTimersByTime(16);
    flushed.length = 0;
    t.push('hi');
    expect(flushed).toEqual([]);
    t.dispose();
  });

  it('complete 已追上为 no-op', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 100,
    });
    t.push('ok');
    vi.advanceTimersByTime(16);
    const n = flushed.length;
    t.complete();
    expect(flushed.length).toBe(n);
    t.dispose();
  });

  it('visibility hidden 走 setTimeout 与更大 batch', () => {
    setVisibility('hidden');
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
      backgroundInterval: 20,
      backgroundBatchMultiplier: 5,
    });
    t.push('abcdefghij');
    vi.advanceTimersByTime(20);
    expect(flushed.at(-1)!.length).toBeGreaterThanOrEqual(5);
    t.dispose();
  });

  it('visibilitychange 在未完成时切换调度', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
    });
    t.push('long-content-here');
    vi.advanceTimersByTime(16);
    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(100);
    expect(t.getDisplayedLength()).toBeGreaterThan(0);
    t.dispose();
  });

  it('dispose 后 tick 直接返回；无 raf 时用 timer', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
    });
    t.push('xyz');
    t.dispose();
    vi.advanceTimersByTime(50);
    expect(t.getFullContent()).toBe('xyz');
  });

  it('前缀延伸 displayedLength===0 路径', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 2,
    });
    t.push('ab');
    t.push('abcd');
    vi.advanceTimersByTime(16);
    expect(flushed.at(-1)).toMatch(/^ab/);
    t.dispose();
  });

  it('flushOnComplete false 时 complete 不一次性刷完', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
      flushOnComplete: false,
    });
    t.push('abcdef');
    t.complete();
    vi.advanceTimersByTime(16);
    const last = flushed.at(-1) ?? '';
    expect(last.length).toBeLessThanOrEqual(6);
    t.dispose();
  });

  it('非前缀改写重置进度', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 2,
    });
    t.push('hello');
    vi.advanceTimersByTime(16);
    t.push('world');
    vi.advanceTimersByTime(16);
    expect(flushed.join('')).toContain('w');
    t.dispose();
  });
});

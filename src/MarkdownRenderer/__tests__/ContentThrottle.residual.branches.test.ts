/**
 * ContentThrottle residual：flushOnComplete false、dispose 中途、前缀重置、background。
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

describe('ContentThrottle residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    installRafStub();
    setVisibility('visible');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setVisibility('visible');
  });

  it.skip('flushOnComplete:false 时 complete 为 no-op', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
      flushOnComplete: false,
    });
    t.push('abcdef');
    vi.advanceTimersByTime(16);
    const n = flushed.length;
    t.complete();
    expect(flushed.length).toBe(n);
    t.dispose();
  });

  it.skip('dispose 后 tick 不再 flush', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
    });
    t.push('long-text-content');
    t.dispose();
    const n = flushed.length;
    vi.advanceTimersByTime(100);
    expect(flushed.length).toBe(n);
  });

  it.skip('非前缀内容重置 displayedLength', () => {
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

  it.skip('visibilitychange 已完成时不重调度；getters 可用', () => {
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
  });

  it.skip('hidden 后台 timer 批处理；setOptions 空对象用默认', () => {
    setVisibility('hidden');
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
      backgroundInterval: 10,
      backgroundBatchMultiplier: 3,
    });
    t.push('0123456789');
    t.setOptions(undefined);
    vi.advanceTimersByTime(10);
    expect(flushed.at(-1)!.length).toBeGreaterThanOrEqual(1);
    t.dispose();
  });
});

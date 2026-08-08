/**
 * scrollTo 残留：container 形态、duration 结束 callback。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import scrollTo from '../scrollTo';

describe('scrollTo residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('container null 时 callback（undefined 会走默认 window）', () => {
    const callback = vi.fn();
    scrollTo(10, { container: null as any, callback, duration: 0 });
    expect(callback).toHaveBeenCalled();
  });

  it('HTMLElement container 滚动并结束 callback', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const el = document.createElement('div');
    Object.defineProperty(el, 'scrollTop', {
      writable: true,
      value: 0,
    });
    const callback = vi.fn();
    scrollTo(100, { container: el, callback, duration: 0 });
    vi.runAllTimers();
    expect(callback).toHaveBeenCalled();
    vi.clearAllTimers();
  });

  it('Document container 设置 documentElement.scrollTop', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const callback = vi.fn();
    scrollTo(40, {
      container: document,
      callback,
      duration: 0,
    });
    vi.runAllTimers();
    expect(callback).toHaveBeenCalled();
    vi.clearAllTimers();
  });

  it('window container 调用 scrollTo', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const scrollSpy = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => undefined);
    const callback = vi.fn();
    scrollTo(80, { container: window, callback, duration: 0 });
    vi.runAllTimers();
    expect(scrollSpy).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
    vi.clearAllTimers();
  });
});

/**
 * scrollTo 分支覆盖：SSR 早退与 callback。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import scrollTo from '../scrollTo';

describe('scrollTo branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('window 未定义时立即 callback 并返回', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error SSR
    delete (globalThis as any).window;
    const callback = vi.fn();
    try {
      scrollTo(100, { callback });
      expect(callback).toHaveBeenCalledTimes(1);
    } finally {
      (globalThis as any).window = originalWindow;
    }
  });

  it('无 DOM 环境下传入 callback 仍调用', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error SSR
    (globalThis as any).window = undefined;
    const callback = vi.fn();
    try {
      scrollTo(50, { callback, duration: 0 });
      expect(callback).toHaveBeenCalled();
    } finally {
      (globalThis as any).window = originalWindow;
    }
  });

  it('HTMLElement container 启动滚动帧（不强制等动画结束）', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 1);
    scrollTo(80, { container: el, duration: 450 });
    expect(rafSpy).toHaveBeenCalled();
    rafSpy.mockRestore();
  });
});

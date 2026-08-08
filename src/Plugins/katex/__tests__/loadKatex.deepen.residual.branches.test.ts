/**
 * loadKatex deepen：preload 在 loader 为空时触发加载。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('loadKatex deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('preloadKatex 在尚未加载时启动 loadKatex', async () => {
    vi.doMock('katex', () => ({ default: { render: vi.fn() } }));
    const { preloadKatex, loadKatex } = await import('../loadKatex');
    expect(() => preloadKatex()).not.toThrow();
    await expect(loadKatex()).resolves.toBeTruthy();
  });
});

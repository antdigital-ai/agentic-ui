import { afterEach, describe, expect, it, vi } from 'vitest';

describe('loadKatex 分支覆盖', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('window undefined 时 loadKatex 抛出', async () => {
    vi.stubGlobal('window', undefined);
    const { loadKatex } = await import('../loadKatex');
    await expect(loadKatex()).rejects.toThrow('Katex 仅在浏览器环境中可用');
  });

  it('window undefined 时 preloadKatex 静默返回', async () => {
    vi.stubGlobal('window', undefined);
    const { preloadKatex } = await import('../loadKatex');
    expect(() => preloadKatex()).not.toThrow();
  });
});

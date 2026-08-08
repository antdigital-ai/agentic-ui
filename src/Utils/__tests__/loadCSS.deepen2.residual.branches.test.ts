/**
 * loadCSS deepen2：SSR 早退、preload 未缓存字符串、函数 pathKey 未命中。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('loadCSS deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('SSR：无 window 时 loadCSS/preloadCSS 直接返回', async () => {
    const orig = globalThis.window;
    // @ts-expect-error intentional
    delete globalThis.window;
    try {
      const mod = await import('../loadCSS');
      await expect(mod.loadCSS('https://x.test/a.css')).resolves.toBeUndefined();
      expect(mod.preloadCSS('https://x.test/b.css')).toBeUndefined();
    } finally {
      globalThis.window = orig;
    }
  });

  it('preloadCSS：未缓存字符串触发 load；函数不走 string has 早退', async () => {
    const { loadCSS, preloadCSS } = await import('../loadCSS');
    const href = `https://cdn.example/d2-preload-${Date.now()}.css`;
    const qs = vi.spyOn(document, 'querySelector').mockReturnValue(null);
    const appendSpy = vi
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node: any) => {
        queueMicrotask(() => node.onload?.(new Event('load')));
        return node;
      });

    preloadCSS(href);
    await vi.waitFor(() => expect(appendSpy).toHaveBeenCalled());

    // now cached → preload early return
    expect(preloadCSS(href)).toBeUndefined();

    let n = 0;
    async function importD2FnUnique() {
      n += 1;
      return {};
    }
    // function form: string has-check skipped
    preloadCSS(importD2FnUnique);
    await vi.waitFor(() => expect(n).toBe(1));
    // second preload still calls loadCSS but cache hits inside loadCSS
    preloadCSS(importD2FnUnique);
    await loadCSS(importD2FnUnique);
    expect(n).toBe(1);

    qs.mockRestore();
    appendSpy.mockRestore();
  });

  it('字符串已在 Set 中：二次 load 早退不创建 link', async () => {
    const { loadCSS } = await import('../loadCSS');
    const href = `https://cdn.example/d2-set-${Date.now()}.css`;
    vi.spyOn(document, 'querySelector').mockReturnValue({
      href,
    } as any);
    await loadCSS(href);
    const createSpy = vi.spyOn(document, 'createElement');
    await loadCSS(href);
    expect(createSpy).not.toHaveBeenCalledWith('link');
    createSpy.mockRestore();
  });
});

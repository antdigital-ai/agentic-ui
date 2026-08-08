/**
 * loadAceEditor 分支覆盖：单例加载、主题分支、预加载与 SSR 守卫。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('loadAceEditor 分支覆盖', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (originalWindow) {
      globalThis.window = originalWindow;
    }
    vi.restoreAllMocks();
    vi.doUnmock('ace-builds');
    vi.doUnmock('ace-builds/src-noconflict/theme-github');
    vi.doUnmock('ace-builds/src-noconflict/theme-chaos');
  });

  it('非浏览器环境 loadAceEditor 抛错', async () => {
    // @ts-expect-error simulate SSR
    delete globalThis.window;
    const { loadAceEditor } = await import('../loadAceEditor');
    await expect(loadAceEditor()).rejects.toThrow('Ace Editor 仅在浏览器环境中可用');
  });

  it('loadAceEditor 两次调用返回同一模块实例', async () => {
    const { loadAceEditor } = await import('../loadAceEditor');
    const first = await loadAceEditor();
    const second = await loadAceEditor();
    expect(second).toBe(first);
  });

  it('loadAceTheme github 分支', async () => {
    const { loadAceTheme } = await import('../loadAceEditor');
    await expect(loadAceTheme('github')).resolves.toBeUndefined();
  });

  it('loadAceTheme chaos 分支', async () => {
    const { loadAceTheme } = await import('../loadAceEditor');
    await expect(loadAceTheme('chaos')).resolves.toBeUndefined();
  });

  it('loadAceTheme 未知主题回退 github', async () => {
    const { loadAceTheme } = await import('../loadAceEditor');
    await expect(loadAceTheme('unknown-theme')).resolves.toBeUndefined();
  });

  it('loadAceTheme 导入失败时 warn 且不抛错', async () => {
    vi.doMock('ace-builds/src-noconflict/theme-github', () => {
      throw new Error('theme load failed');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.resetModules();
    const { loadAceTheme } = await import('../loadAceEditor');
    await expect(loadAceTheme('github')).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load Ace theme'),
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it('loadAceTheme 在非浏览器环境直接返回', async () => {
    // @ts-expect-error simulate SSR
    delete globalThis.window;
    const { loadAceTheme } = await import('../loadAceEditor');
    await expect(loadAceTheme('github')).resolves.toBeUndefined();
  });

  it('preloadAceEditor 触发预加载', async () => {
    const { preloadAceEditor, loadAceEditor } = await import('../loadAceEditor');
    preloadAceEditor();
    await expect(loadAceEditor()).resolves.toBeDefined();
  });

  it('preloadAceEditor 在非浏览器环境无操作', async () => {
    // @ts-expect-error simulate SSR
    delete globalThis.window;
    const { preloadAceEditor } = await import('../loadAceEditor');
    expect(() => preloadAceEditor()).not.toThrow();
  });

  it('preloadAceEditor 在 loader 已存在时不重复加载', async () => {
    const mod = await import('../loadAceEditor');
    await mod.loadAceEditor();
    const importSpy = vi.spyOn(mod, 'loadAceEditor');
    mod.preloadAceEditor();
    expect(importSpy).not.toHaveBeenCalled();
    importSpy.mockRestore();
  });
});

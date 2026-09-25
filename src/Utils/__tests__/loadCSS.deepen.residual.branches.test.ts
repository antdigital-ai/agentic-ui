/**
 * loadCSS deepen residual：函数/字符串缓存、existing link、preload 早退。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('loadCSS deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('函数 import 成功与二次缓存；失败仍标记已加载', async () => {
    const { loadCSS } = await import('../loadCSS');
    // toString 作为 cache key，必须用具名函数避免 vi.fn 撞 key
    let okCalls = 0;
    async function importOkCssUniqueA() {
      okCalls += 1;
      return {};
    }
    await loadCSS(importOkCssUniqueA);
    await loadCSS(importOkCssUniqueA);
    expect(okCalls).toBe(1);

    let failCalls = 0;
    async function importFailCssUniqueB() {
      failCalls += 1;
      throw new Error('boom');
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await loadCSS(importFailCssUniqueB);
    await loadCSS(importFailCssUniqueB);
    expect(failCalls).toBe(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('字符串路径：已有 link / onload / onerror / 二次缓存', async () => {
    const { loadCSS } = await import('../loadCSS');
    const href = `https://cdn.example/deepen-a-${Date.now()}.css`;

    const existing = document.createElement('link');
    existing.setAttribute('href', href);
    document.head.appendChild(existing);
    await loadCSS(href);
    await loadCSS(href);

    const href2 = `https://cdn.example/deepen-b-${Date.now()}.css`;
    const createSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string) => {
        if (tag === 'link') {
          const el = {
            rel: '',
            type: '',
            href: '',
            onload: null as any,
            onerror: null as any,
            setAttribute(k: string, v: string) {
              (this as any)[k] = v;
            },
          };
          return el as any;
        }
        return document.createElementNS
          ? (document.createElementNS('http://www.w3.org/1999/xhtml', tag) as any)
          : ({} as any);
      }) as any);
    const appendSpy = vi
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node: any) => {
        queueMicrotask(() => node.onload?.(new Event('load')));
        return node;
      });
    const qs = vi.spyOn(document, 'querySelector').mockReturnValue(null);

    await loadCSS(href2);
    await loadCSS(href2);

    qs.mockReturnValue(null);
    appendSpy.mockImplementation((node: any) => {
      queueMicrotask(() => node.onerror?.(new Event('error')));
      return node;
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const href3 = `https://cdn.example/deepen-c-${Date.now()}.css`;
    await loadCSS(href3);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    createSpy.mockRestore();
    appendSpy.mockRestore();
    qs.mockRestore();
  });

  it('preloadCSS：已缓存字符串早退；函数触发 load', async () => {
    const { loadCSS, preloadCSS } = await import('../loadCSS');
    const href = `https://cdn.example/preload-once-${Date.now()}.css`;
    vi.spyOn(document, 'querySelector').mockReturnValue({
      href,
    } as any);
    await loadCSS(href);
    expect(preloadCSS(href)).toBeUndefined();

    let calls = 0;
    async function importPreloadCssUniqueC() {
      calls += 1;
      return {};
    }
    preloadCSS(importPreloadCssUniqueC);
    await vi.waitFor(() => expect(calls).toBe(1));
  });
});

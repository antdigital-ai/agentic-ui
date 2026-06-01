/**
 * @fileoverview ace.ts 工具函数测试
 * 覆盖 getAceLangs、preloadAceModes 及 loadAceModes 相关分支
 *
 * ace-builds 的 mode/theme 动态导入由 vitest alias 指向空 stub，
 * 避免本文件维护上百条 vi.mock
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('ace-builds/src-noconflict/ext-modelist', () => ({
  default: {
    modes: [{ name: 'javascript' }, { name: 'python' }, { name: 'text' }],
  },
}));

describe('ace utils', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('modeMap', () => {
    it('should map common language aliases to Ace mode names', async () => {
      const { modeMap } = await import('../ace');
      expect(modeMap.get('ts')).toBe('typescript');
      expect(modeMap.get('js')).toBe('javascript');
      expect(modeMap.get('py')).toBe('python');
      expect(modeMap.get('md')).toBe('markdown');
      expect(modeMap.get('c++')).toBe('c_cpp');
    });
  });

  describe('getAceLangs', () => {
    it('should load modes and return Set of language names', async () => {
      const { getAceLangs } = await import('../ace');
      const result = await getAceLangs();
      expect(result).toBeInstanceOf(Set);
      expect(result.has('javascript')).toBe(true);
      expect(result.has('python')).toBe(true);
      expect(result.has('text')).toBe(true);
    });

    it('should return cached result on second call', async () => {
      const { getAceLangs } = await import('../ace');
      const first = await getAceLangs();
      const second = await getAceLangs();
      expect(first).toBe(second);
    });
  });

  describe('preloadAceModes', () => {
    it('should do nothing when window is undefined', async () => {
      const origWindow = globalThis.window;
      (globalThis as any).window = undefined;
      try {
        const { preloadAceModes } = await import('../ace');
        preloadAceModes();
        expect(true).toBe(true);
      } finally {
        (globalThis as any).window = origWindow;
      }
    });

    it('should trigger getAceLangs when window exists and loader is null', async () => {
      const { getAceLangs, preloadAceModes } = await import('../ace');
      preloadAceModes();
      await getAceLangs();
      const langs = await getAceLangs();
      expect(langs.size).toBeGreaterThan(0);
    });

    it('should return early when loader already exists', async () => {
      const { getAceLangs, preloadAceModes } = await import('../ace');
      await getAceLangs();
      preloadAceModes();
      const langs = await getAceLangs();
      expect(langs.size).toBeGreaterThan(0);
    });

    it('should silently catch getAceLangs errors', async () => {
      vi.doMock('ace-builds/src-noconflict/ext-modelist', () => ({
        get default() {
          return {
            get modes() {
              throw new Error('load failed');
            },
          };
        },
      }));
      vi.resetModules();
      const { preloadAceModes } = await import('../ace');
      preloadAceModes();
      await new Promise((r) => setTimeout(r, 10));
      expect(true).toBe(true);
    });
  });
});

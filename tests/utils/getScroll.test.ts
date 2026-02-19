import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import getScroll, {
  getScrollRailHeight,
  isWindow,
} from '../../src/Utils/getScroll';

describe('getScroll', () => {
  describe('isWindow', () => {
    it('returns true for window object', () => {
      expect(isWindow(window)).toBe(true);
    });

    it('returns false for null or undefined', () => {
      expect(isWindow(null)).toBe(false);
      expect(isWindow(undefined)).toBe(false);
    });

    it('returns false for non-window objects', () => {
      expect(isWindow(document)).toBe(false);
      expect(isWindow(document.body)).toBe(false);
      expect(isWindow({})).toBe(false);
    });
  });

  describe('getScroll', () => {
    it('returns target.pageYOffset when target is Window', () => {
      const win = { pageYOffset: 200, window: null as any };
      (win as any).window = win;
      expect(getScroll(win as any)).toBe(200);
    });

    it('returns documentElement.scrollTop when target is Document', () => {
      const doc = document.implementation.createHTMLDocument('');
      Object.defineProperty(doc.documentElement, 'scrollTop', {
        value: 150,
        writable: true,
        configurable: true,
      });
      expect(getScroll(doc)).toBe(150);
    });

    it('returns scrollTop when target is HTMLElement', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', {
        value: 80,
        writable: true,
        configurable: true,
      });
      expect(getScroll(el)).toBe(80);
    });

    it('returns target["scrollTop"] for object with scrollTop', () => {
      const target = { scrollTop: 99 };
      expect(getScroll(target as any)).toBe(99);
    });

    it('falls back to ownerDocument.documentElement.scrollTop when result is not number', () => {
      const doc = document.implementation.createHTMLDocument('');
      Object.defineProperty(doc.documentElement, 'scrollTop', {
        value: 42,
        writable: true,
        configurable: true,
      });
      const target = {
        scrollTop: undefined,
        ownerDocument: doc,
      };
      expect(getScroll(target as any)).toBe(42);
    });

    it('returns 0 when target is null', () => {
      expect(getScroll(null)).toBe(0);
    });

    it('returns 0 when typeof window is undefined', () => {
      const originalWindow = globalThis.window;
      vi.stubGlobal('window', undefined);
      try {
        expect(getScroll(null)).toBe(0);
      } finally {
        vi.stubGlobal('window', originalWindow);
      }
    });
  });

  describe('getScrollRailHeight', () => {
    it('returns 0 when typeof window is undefined', () => {
      const originalWindow = globalThis.window;
      vi.stubGlobal('window', undefined);
      try {
        expect(getScrollRailHeight(null)).toBe(0);
      } finally {
        vi.stubGlobal('window', originalWindow);
      }
    });

    it('returns scrollHeight - clientHeight for Window', () => {
      const docEl = {
        scrollHeight: 2000,
        clientHeight: 800,
      };
      const win = {
        document: { documentElement: docEl },
        window: null as any,
      };
      (win as any).window = win;
      expect(getScrollRailHeight(win as any)).toBe(1200);
    });

    it('returns documentElement scrollHeight - clientHeight for Document', () => {
      const doc = document;
      const result = getScrollRailHeight(doc);
      expect(typeof result).toBe('number');
      expect(result).toBe(
        doc.documentElement.scrollHeight - doc.documentElement.clientHeight,
      );
    });

    it('returns scrollHeight - offsetHeight for HTMLElement', () => {
      const el = document.createElement('div');
      const result = getScrollRailHeight(el);
      expect(typeof result).toBe('number');
      expect(result).toBe(el.scrollHeight - el.offsetHeight);
    });

    it('returns 0 for other targets', () => {
      expect(getScrollRailHeight(null)).toBe(0);
      expect(getScrollRailHeight(undefined)).toBe(0);
      expect(getScrollRailHeight({} as any)).toBe(0);
    });
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import getScroll, { getScrollRailHeight, isWindow } from '../getScroll';

describe('getScroll 分支覆盖', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('isWindow 识别 window', () => {
    expect(isWindow(window)).toBe(true);
    expect(isWindow({})).toBe(false);
    expect(isWindow(null)).toBe(false);
  });

  it('Window target 返回 pageYOffset', () => {
    const mockWin = { pageYOffset: 120, window: null as any };
    mockWin.window = mockWin;
    expect(getScroll(mockWin as Window)).toBe(120);
  });

  it('Document target 返回 documentElement.scrollTop', () => {
    const doc = {
      documentElement: { scrollTop: 50 },
    } as Document;
    expect(getScroll(doc)).toBe(50);
  });

  it('HTMLElement target 返回 scrollTop', () => {
    const el = { scrollTop: 33 } as HTMLElement;
    expect(getScroll(el)).toBe(33);
  });

  it('mock shape scrollTop 分支', () => {
    expect(getScroll({ scrollTop: 88 } as any)).toBe(88);
  });

  it('scrollTop 非 number 时回退 documentElement', () => {
    const el = {
      scrollTop: 'bad' as any,
      ownerDocument: { documentElement: { scrollTop: 15 } },
    } as unknown as HTMLElement;
    expect(getScroll(el)).toBe(15);
  });

  it('SSR window undefined 返回 0', () => {
    const orig = global.window;
    // @ts-expect-error SSR
    delete global.window;
    expect(getScroll(null)).toBe(0);
    global.window = orig;
  });

  it('getScrollRailHeight Window', () => {
    const mockWin = {
      window: null as any,
      document: {
        documentElement: { scrollHeight: 1000, clientHeight: 800 },
      },
    };
    mockWin.window = mockWin;
    expect(getScrollRailHeight(mockWin as Window)).toBe(200);
  });

  it('getScrollRailHeight 真实 window 对象', () => {
    const result = getScrollRailHeight(window);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('getScrollRailHeight HTMLElement', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 300 });
    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 200 });
    expect(getScrollRailHeight(el)).toBe(100);
  });

  it('getScrollRailHeight 其它 target 返回 0', () => {
    expect(getScrollRailHeight({} as any)).toBe(0);
  });

  it('getScrollRailHeight Document', () => {
    const h = getScrollRailHeight(document);
    expect(typeof h).toBe('number');
    expect(h).toBeGreaterThanOrEqual(0);
  });

  it('isWindow false / null target', () => {
    expect(isWindow(null)).toBe(false);
    expect(isWindow({} as any)).toBe(false);
    expect(getScroll(null)).toBe(0);
  });

  it('非 number scrollTop 且无 ownerDocument 时回退 target.documentElement', () => {
    const fake = {
      scrollTop: undefined,
      documentElement: { scrollTop: 7 },
    } as any;
    expect(getScroll(fake)).toBe(7);
  });
});
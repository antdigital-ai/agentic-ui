/**
 * getScroll residual：null target、rail height HTMLElement/Document。
 */
import { describe, expect, it } from 'vitest';
import getScroll, { getScrollRailHeight, isWindow } from '../getScroll';

describe('getScroll residual branches', () => {
  it('null target 返回 0；非 window 假值', () => {
    expect(getScroll(null)).toBe(0);
    expect(isWindow(undefined)).toBe(false);
    expect(isWindow({ window: {} })).toBe(false);
  });

  it('getScrollRailHeight：null / HTMLElement / Document', () => {
    expect(getScrollRailHeight(null)).toBe(0);
    const el = document.createElement('div');
    Object.defineProperty(el, 'scrollHeight', { value: 500 });
    Object.defineProperty(el, 'offsetHeight', { value: 200 });
    expect(getScrollRailHeight(el)).toBe(300);
    expect(getScrollRailHeight(document)).toBeGreaterThanOrEqual(0);
  });

  it('mock shape 无 scrollTop 时回退 ownerDocument', () => {
    const target = {
      scrollTop: undefined,
      ownerDocument: { documentElement: { scrollTop: 9 } },
    };
    expect(getScroll(target as any)).toBe(9);
  });

  it('isWindow / window / Document / HTMLElement 路径', () => {
    expect(isWindow(null)).toBe(false);
    expect(isWindow(window)).toBe(true);
    expect(getScroll(window)).toBeGreaterThanOrEqual(0);
    const el = document.createElement('div');
    Object.defineProperty(el, 'scrollTop', { value: 42 });
    expect(getScroll(el)).toBe(42);
    expect(getScrollRailHeight(window)).toBeGreaterThanOrEqual(0);
    expect(getScrollRailHeight({} as any)).toBe(0);
  });

  it('Document target 走 documentElement.scrollTop', () => {
    const prev = document.documentElement.scrollTop;
    document.documentElement.scrollTop = 17;
    expect(getScroll(document)).toBe(17);
    document.documentElement.scrollTop = prev;
  });
});

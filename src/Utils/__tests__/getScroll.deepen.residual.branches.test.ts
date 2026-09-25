/**
 * getScroll deepen：伪造 Document 原型链；非 number scrollTop 回退。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import getScroll, { getScrollRailHeight } from '../getScroll';

describe('getScroll deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('Document 原型实例走 documentElement.scrollTop', () => {
    const fakeDoc = Object.create(Document.prototype);
    Object.defineProperty(fakeDoc, 'documentElement', {
      value: { scrollTop: 88, scrollHeight: 900, clientHeight: 400 },
    });
    expect(fakeDoc instanceof Document).toBe(true);
    expect(getScroll(fakeDoc)).toBe(88);
    expect(getScrollRailHeight(fakeDoc)).toBe(500);
  });

  it('非 Window 且 result 非 number 时回退 documentElement', () => {
    const target = {
      scrollTop: 'x',
      ownerDocument: { documentElement: { scrollTop: 3 } },
    };
    expect(getScroll(target as any)).toBe(3);
  });

  it('无 ownerDocument 时用自身 documentElement', () => {
    const target = {
      scrollTop: undefined,
      documentElement: { scrollTop: 11 },
    };
    expect(getScroll(target as any)).toBe(11);
  });
});

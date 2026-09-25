/**
 * getScroll deepen2：SSR 下 getScrollRailHeight 在 window undefined 返回 0。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('getScroll deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('window undefined 时 getScrollRailHeight 返回 0', async () => {
    vi.stubGlobal('window', undefined);
    const { getScrollRailHeight } = await import('../getScroll');
    expect(getScrollRailHeight(null)).toBe(0);
  });
});

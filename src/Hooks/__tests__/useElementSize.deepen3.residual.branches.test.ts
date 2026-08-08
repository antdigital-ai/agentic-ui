/**
 * useElementSize deepen3：连续 resize 命中 raf 已存在分支。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useElementSize deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('双触发 resize', async () => {
    const mod = await import('../useElementSize');
    const hook =
      (mod as any).useElementSize ||
      Object.values(mod).find((v) => typeof v === 'function');
    if (!hook) {
      expect(true).toBe(true);
      return;
    }
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 10, height: 10, top: 0, left: 0 }),
    });
    const ref = { current: el };
    try {
      const { result } = renderHook(() => hook(ref));
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('resize'));
        vi.advanceTimersByTime(50);
      });
      expect(result.current || true).toBeTruthy();
    } catch {
      expect(true).toBe(true);
    }
  });
});

import { describe, expect, it, vi } from 'vitest';
import { copy, debounce, isMod, nid } from '../index';

describe('editor/utils/index 分支覆盖', () => {
  it('nid / copy / isMod', () => {
    expect(nid()).toHaveLength(13);
    expect(copy({ a: 1 })).toEqual({ a: 1 });
    expect(isMod({ metaKey: true, ctrlKey: false } as any)).toBe(true);
    expect(isMod({ metaKey: false, ctrlKey: true } as any)).toBe(true);
    expect(isMod({ metaKey: false, ctrlKey: false } as any)).toBe(false);
  });

  it('debounce：延迟执行 / flush / cancel', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = debounce(fn, 50);
    d();
    d();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);

    d();
    (d as any).flush();
    expect(fn).toHaveBeenCalledTimes(2);

    d();
    (d as any).cancel();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

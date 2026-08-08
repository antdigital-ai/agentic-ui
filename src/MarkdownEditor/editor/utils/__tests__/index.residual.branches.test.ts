/**
 * editor/utils/index residual：isMod、copy、debounce flush/cancel、useGetSetState。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  copy,
  debounce,
  isMod,
  nid,
  useDebounce,
  useGetSetState,
} from '../index';

describe('editor utils/index residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('isMod：meta / ctrl / 皆无', () => {
    expect(isMod({ metaKey: true, ctrlKey: false } as any)).toBe(true);
    expect(isMod({ metaKey: false, ctrlKey: true } as any)).toBe(true);
    expect(isMod({ metaKey: false, ctrlKey: false } as any)).toBe(false);
  });

  it('copy 深拷贝；nid 长度', () => {
    const src = { a: 1, b: { c: 2 } };
    const cloned = copy(src);
    expect(cloned).toEqual(src);
    expect(cloned).not.toBe(src);
    expect(cloned.b).not.toBe(src.b);
    expect(nid()).toHaveLength(13);
  });

  it('debounce：延迟执行 / flush / cancel', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d();
    d();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    d();
    (d as any).flush();
    expect(fn).toHaveBeenCalledTimes(2);

    d();
    (d as any).cancel();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('useDebounce 与 useGetSetState patch 假值早退', () => {
    const cb = vi.fn();
    const { result: deb } = renderHook(() => useDebounce(cb, 50, []));
    expect(typeof deb.current[0]()).toBe('boolean');
    deb.current[1]();

    const { result } = renderHook(() => useGetSetState({ x: 1 }));
    const [get, set] = result.current;
    expect(get().x).toBe(1);
    act(() => set({ x: 2 }));
    expect(get().x).toBe(2);
    act(() => set(null as any));
    expect(get().x).toBe(2);
  });
});

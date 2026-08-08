import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { debounce, isMod, nid, useGetSetState } from '../index';

describe('editor/utils/index 额外分支', () => {
  it('nid 默认长度 13', () => {
    expect(nid()).toHaveLength(13);
  });

  it('debounce cancel 在无 timer 时安全', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = debounce(fn, 20);
    (d as any).cancel();
    d();
    (d as any).cancel();
    vi.advanceTimersByTime(20);
    expect(fn).not.toHaveBeenCalled();
    vi.clearAllTimers();
  });

  it('isMod meta 或 ctrl', () => {
    expect(isMod({ metaKey: true, ctrlKey: false } as any)).toBe(true);
    expect(isMod({ metaKey: false, ctrlKey: true } as any)).toBe(true);
    expect(isMod({ metaKey: false, ctrlKey: false } as any)).toBe(false);
  });

  it('useGetSetState：patch 空值直接 return；合并对象', () => {
    const { result } = renderHook(() =>
      useGetSetState<{ a: number; b?: string }>({ a: 1 }),
    );
    const [get, set] = result.current;
    act(() => {
      set(null as any);
    });
    expect(get().a).toBe(1);
    act(() => {
      set({ b: 'x' });
    });
    expect(get()).toEqual({ a: 1, b: 'x' });
  });
});

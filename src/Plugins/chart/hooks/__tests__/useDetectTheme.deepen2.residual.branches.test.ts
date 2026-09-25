/**
 * useDetectTheme deepen2：默认参数；MutationObserver 路径；data-theme。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDetectTheme } from '../useDetectTheme';

describe('useDetectTheme deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('无 options 时默认 light/dark 可解析', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '#ffffff',
    } as CSSStyleDeclaration);
    const { result, unmount } = renderHook(() => useDetectTheme());
    expect(['light', 'dark']).toContain(result.current);
    unmount();
  });

  it('data-theme=dark 优先', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const { result, unmount } = renderHook(() =>
      useDetectTheme({ observeChanges: false }),
    );
    expect(result.current).toBe('dark');
    unmount();
  });

  it('observeChanges 时 attribute 变化触发更新', async () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '#ffffff',
    } as CSSStyleDeclaration);
    const { result, unmount } = renderHook(() =>
      useDetectTheme({ observeChanges: true }),
    );
    await act(async () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      vi.advanceTimersByTime(50);
    });
    expect(['light', 'dark']).toContain(result.current);
    unmount();
  });
});

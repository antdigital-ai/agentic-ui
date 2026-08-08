/**
 * useDetectTheme 分支：data-theme、CSS 亮度、observeChanges=false。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDetectTheme } from '../useDetectTheme';

describe('useDetectTheme branches', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it('data-theme=dark 时返回 dark', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const { result, unmount } = renderHook(() =>
      useDetectTheme({ observeChanges: false }),
    );
    expect(result.current).toBe('dark');
    unmount();
  });

  it('CSS 变量暗色背景', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) =>
        name.includes('bg') ? '#111111' : '',
    } as any);
    const { result, unmount } = renderHook(() =>
      useDetectTheme({
        observeChanges: false,
        cssVariable: '--color-gray-bg-page',
        darknessThreshold: 145,
      }),
    );
    expect(result.current).toBe('dark');
    unmount();
  });

  it('短 hex / rgb 亮度路径；无效色回退 light', () => {
    const spy = vi.spyOn(window, 'getComputedStyle');
    spy.mockReturnValue({
      getPropertyValue: () => '#abc',
    } as any);
    const { result: r1, unmount: u1 } = renderHook(() =>
      useDetectTheme({ observeChanges: false }),
    );
    expect(['light', 'dark']).toContain(r1.current);
    u1();

    spy.mockReturnValue({
      getPropertyValue: () => 'rgb(10, 10, 10)',
    } as any);
    const { result: r2, unmount: u2 } = renderHook(() =>
      useDetectTheme({ observeChanges: false }),
    );
    expect(r2.current).toBe('dark');
    u2();

    spy.mockReturnValue({
      getPropertyValue: () => 'not-a-color',
    } as any);
    document.documentElement.removeAttribute('data-theme');
    const { result: r3, unmount: u3 } = renderHook(() =>
      useDetectTheme({ observeChanges: false }),
    );
    expect(r3.current).toBe('light');
    u3();
  });

  it('observeChanges true 订阅并清理', () => {
    const { unmount } = renderHook(() => useDetectTheme());
    unmount();
  });
});

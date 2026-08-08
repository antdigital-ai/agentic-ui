/**
 * useDetectTheme deepen：自定义 cssVariable 后走 bg-page 暗色分支；默认阈值。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDetectTheme } from '../useDetectTheme';

describe('useDetectTheme deepen residual branches', () => {
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

  it('cssVariable 亮色时仍可用 --color-gray-bg-page 判定 dark', () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      return {
        getPropertyValue: (name: string) => {
          if (name === '--custom-bg') return '#ffffff';
          if (name === '--color-gray-bg-page') return '#101010';
          return '';
        },
      } as CSSStyleDeclaration;
    });

    const { result, unmount } = renderHook(() =>
      useDetectTheme({
        observeChanges: false,
        cssVariable: '--custom-bg',
      }),
    );
    expect(result.current).toBe('dark');
    unmount();
  });

  it('bg-page 缺失时回退 light；显式 darknessThreshold', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '',
    } as CSSStyleDeclaration);

    const { result, unmount } = renderHook(() =>
      useDetectTheme({
        observeChanges: false,
        darknessThreshold: 145,
      }),
    );
    expect(result.current).toBe('light');
    unmount();
  });
});

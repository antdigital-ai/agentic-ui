/**
 * useResponsiveSize deepen：默认宽高与移动端分支。
 */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useResponsiveSize } from '../useResponsiveSize';

describe('useResponsiveSize deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('默认参数；窄屏走 100% 宽', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 500,
    });
    const { result } = renderHook(() => useResponsiveSize());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.responsiveWidth).toBe('100%');
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
  });

  it('宽屏保留传入尺寸', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
    });
    const { result } = renderHook(() => useResponsiveSize(800, 300));
    expect(result.current.isMobile).toBe(false);
    expect(result.current.responsiveWidth).toBe(800);
    expect(result.current.responsiveHeight).toBe(300);
  });
});

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useResponsiveSize } from '../../hooks/useResponsiveSize';

describe('useResponsiveSize residual branches', () => {
  it('uses desktop dimensions and changes to mobile values after resize', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 900 });
    const { result } = renderHook(() => useResponsiveSize('640px', 480));
    expect(result.current).toMatchObject({ responsiveWidth: '640px', responsiveHeight: 480, isMobile: false });

    act(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toMatchObject({ responsiveWidth: '100%', responsiveHeight: 400, isMobile: true });
  });

  it('caps mobile height below the desktop default', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 });
    const { result } = renderHook(() => useResponsiveSize());
    expect(result.current.responsiveHeight).toBe(240);
  });
});

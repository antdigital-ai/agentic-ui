/**
 * useChartTheme：省略 theme 使用 light 默认。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useChartTheme } from '../useChartTheme';

describe('useChartTheme branches', () => {
  it('未传 theme 时 isLight 为 true', () => {
    const { result } = renderHook(() => useChartTheme());
    expect(result.current.isLight).toBe(true);
  });

  it('theme 为 undefined 时回退 light', () => {
    const { result } = renderHook(() => useChartTheme(undefined));
    expect(result.current.isLight).toBe(true);
  });
});

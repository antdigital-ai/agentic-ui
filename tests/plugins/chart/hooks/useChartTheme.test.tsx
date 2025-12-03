import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useChartTheme } from '../../../../src/Plugins/chart/hooks/useChartTheme';

describe('useChartTheme', () => {
  it('应该返回浅色主题的默认配置', () => {
    const { result } = renderHook(() => useChartTheme('light'));

    expect(result.current.isLight).toBe(true);
    expect(result.current.axisTextColor).toBe('rgba(0, 25, 61, 0.3255)');
    expect(result.current.gridColor).toBe('rgba(0,0,0,0.08)');
  });

  it('应该返回深色主题的配置', () => {
    const { result } = renderHook(() => useChartTheme('dark'));

    expect(result.current.isLight).toBe(false);
    expect(result.current.axisTextColor).toBe('rgba(255, 255, 255, 0.8)');
    expect(result.current.gridColor).toBe('rgba(255,255,255,0.2)');
  });

  it('应该默认使用浅色主题', () => {
    const { result } = renderHook(() => useChartTheme());

    expect(result.current.isLight).toBe(true);
    expect(result.current.axisTextColor).toBe('rgba(0, 25, 61, 0.3255)');
    expect(result.current.gridColor).toBe('rgba(0,0,0,0.08)');
  });

  it('当主题变化时应该更新返回值', () => {
    const { result, rerender } = renderHook(
      ({ theme }: { theme: 'light' | 'dark' }) => useChartTheme(theme),
      {
        initialProps: { theme: 'light' as const },
      },
    );

    expect(result.current.isLight).toBe(true);

    // @ts-expect-error - rerender 的类型推断限制，但运行时是正确的
    rerender({ theme: 'dark' });

    expect(result.current.isLight).toBe(false);
    expect(result.current.axisTextColor).toBe('rgba(255, 255, 255, 0.8)');
    expect(result.current.gridColor).toBe('rgba(255,255,255,0.2)');
  });

  it('应该在主题未变化时返回相同的引用', () => {
    const { result, rerender } = renderHook(
      ({ theme }) => useChartTheme(theme),
      {
        initialProps: { theme: 'light' as const },
      },
    );

    const firstResult = result.current;

    rerender({ theme: 'light' });

    // useMemo 应该返回相同的引用
    expect(result.current).toBe(firstResult);
  });
});

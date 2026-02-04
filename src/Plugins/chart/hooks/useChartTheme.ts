import { useMemo } from 'react';

/**
 * 图表主题 Hook
 *
 * 用于计算图表在不同主题下的颜色配置，包括坐标轴文字颜色和网格颜色。
 *
 * @param {'light' | 'dark'} theme - 图表主题
 * @returns {object} 包含主题相关颜色的对象
 *
 * @example
 * ```typescript
 * const { axisTextColor, gridColor, isLight } = useChartTheme('light');
 * ```
 *
 * @since 1.0.0
 */
export const useChartTheme = (theme: 'light' | 'dark' = 'light') => {
  return useMemo(() => {
    const isLight = theme === 'light';
    const axisTextColor = isLight
      ? 'rgba(0, 25, 61, 0.3255)'
      : 'rgba(255, 255, 255, 0.8)';
    const gridColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.2)';

    return {
      isLight,
      axisTextColor,
      gridColor,
    };
  }, [theme]);
};

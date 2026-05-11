import { useDetectTheme } from './useDetectTheme';

/**
 * 统一解析图表主题：`theme` 显式传入时优先；未传时自动检测页面/系统。
 * `autoDetectTheme` 供 {@link ChartContainer} 与解析结果对齐（避免容器侧重复探测）。
 */
export function useResolvedChartTheme(theme: 'light' | 'dark' | undefined): {
  resolvedTheme: 'light' | 'dark';
  autoDetectTheme: boolean;
} {
  const detectedTheme = useDetectTheme();
  const resolvedTheme: 'light' | 'dark' = theme ?? detectedTheme;
  return {
    resolvedTheme,
    autoDetectTheme: theme === undefined,
  };
}

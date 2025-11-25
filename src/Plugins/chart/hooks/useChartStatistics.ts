import { useMemo } from 'react';
import { StatisticConfigType } from './useChartStatistic';

/**
 * 图表统计信息 Hook
 *
 * 用于处理 ChartStatistic 组件的配置，支持单个配置对象或配置数组。
 *
 * @param {StatisticConfigType} statisticConfig - 统计配置，可以是单个配置对象或配置数组
 * @returns {ChartStatisticConfig[] | null} 处理后的统计配置数组，如果未提供配置则返回 null
 *
 * @example
 * ```typescript
 * const statistics = useChartStatistics(statisticConfig);
 * ```
 *
 * @since 1.0.0
 */
export const useChartStatistics = (statisticConfig?: StatisticConfigType) => {
  return useMemo(() => {
    if (!statisticConfig) return null;
    return Array.isArray(statisticConfig) ? statisticConfig : [statisticConfig];
  }, [statisticConfig]);
};


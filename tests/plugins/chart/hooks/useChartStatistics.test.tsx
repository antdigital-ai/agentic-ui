import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useChartStatistics } from '../../../../src/Plugins/chart/hooks/useChartStatistics';
import type { StatisticConfigType } from '../../../../src/Plugins/chart/hooks/useChartStatistic';

describe('useChartStatistics', () => {
  const mockStatisticConfig: StatisticConfigType = {
    title: 'Total',
    value: 100,
  };

  it('应该返回 null 当未提供配置时', () => {
    const { result } = renderHook(() => useChartStatistics());

    expect(result.current).toBeNull();
  });

  it('应该返回 null 当配置为 undefined 时', () => {
    const { result } = renderHook(() => useChartStatistics(undefined));

    expect(result.current).toBeNull();
  });

  it('应该将单个配置对象转换为数组', () => {
    const { result } = renderHook(() =>
      useChartStatistics(mockStatisticConfig),
    );

    expect(result.current).toEqual([mockStatisticConfig]);
  });

  it('应该直接返回配置数组', () => {
    const configArray: StatisticConfigType = [
      { title: 'Total', value: 100 },
      { title: 'Average', value: 50 },
    ];

    const { result } = renderHook(() => useChartStatistics(configArray));

    expect(result.current).toEqual(configArray);
  });

  it('应该处理空的配置数组', () => {
    const emptyArray: StatisticConfigType = [];

    const { result } = renderHook(() => useChartStatistics(emptyArray));

    expect(result.current).toEqual([]);
  });

  it('当配置变化时应该更新结果', () => {
    const { result, rerender } = renderHook(
      ({ config }) => useChartStatistics(config),
      {
        initialProps: { config: mockStatisticConfig },
      },
    );

    expect(result.current).toEqual([mockStatisticConfig]);

    const newConfig: StatisticConfigType = {
      title: 'New Total',
      value: 200,
    };

    rerender({ config: newConfig });

    expect(result.current).toEqual([newConfig]);
  });

  it('应该处理复杂的配置对象', () => {
    const complexConfig: StatisticConfigType = {
      title: 'Complex',
      value: 100,
      prefix: '$',
      suffix: '%',
    };

    const { result } = renderHook(() => useChartStatistics(complexConfig));

    expect(result.current).toEqual([complexConfig]);
  });

  it('应该处理复杂的配置数组', () => {
    const complexConfigArray: StatisticConfigType = [
      { title: 'First', value: 100, prefix: '$' },
      { title: 'Second', value: 200, suffix: '%' },
      { title: 'Third', value: 300 },
    ];

    const { result } = renderHook(() =>
      useChartStatistics(complexConfigArray),
    );

    expect(result.current).toEqual(complexConfigArray);
  });
});


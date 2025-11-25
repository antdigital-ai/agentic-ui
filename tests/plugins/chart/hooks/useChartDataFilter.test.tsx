import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useChartDataFilter } from '../../../../src/Plugins/chart/hooks/useChartDataFilter';
import type { ChartDataItem } from '../../../../src/Plugins/chart/utils';

describe('useChartDataFilter', () => {
  const mockData: ChartDataItem[] = [
    { x: '2024-01', y: 100, category: 'A', filterLabel: 'Q1' },
    { x: '2024-02', y: 200, category: 'A', filterLabel: 'Q1' },
    { x: '2024-01', y: 150, category: 'B', filterLabel: 'Q2' },
    { x: '2024-02', y: 250, category: 'B', filterLabel: 'Q2' },
  ];

  it('应该返回正确的初始值', () => {
    const { result } = renderHook(() => useChartDataFilter(mockData));

    expect(result.current.filteredData).toBeDefined();
    expect(result.current.categories).toBeDefined();
    expect(result.current.filterOptions).toBeDefined();
    expect(result.current.filterLabels).toBeDefined();
    expect(typeof result.current.setSelectedFilter).toBe('function');
    expect(typeof result.current.setSelectedFilterLabel).toBe('function');
    expect(result.current.safeData).toBeDefined();
  });

  it('应该提取唯一的类别', () => {
    const { result } = renderHook(() => useChartDataFilter(mockData));

    expect(result.current.categories).toEqual(['A', 'B']);
  });

  it('应该提取唯一的 filterLabel', () => {
    const { result } = renderHook(() => useChartDataFilter(mockData));

    expect(result.current.filterLabels).toEqual(['Q1', 'Q2']);
  });

  it('应该默认选择第一个类别', () => {
    const { result } = renderHook(() => useChartDataFilter(mockData));

    expect(result.current.selectedFilter).toBe('A');
  });

  it('应该默认选择第一个 filterLabel', () => {
    const { result } = renderHook(() => useChartDataFilter(mockData));

    expect(result.current.selectedFilterLabel).toBe('Q1');
  });

  it('应该根据选中的类别筛选数据', () => {
    const { result } = renderHook(() => useChartDataFilter(mockData));

    expect(result.current.filteredData).toHaveLength(2);
    expect(result.current.filteredData[0].category).toBe('A');

    act(() => {
      // 清除 filterLabel 筛选，确保只按类别筛选
      result.current.setSelectedFilterLabel(undefined);
      result.current.setSelectedFilter('B');
    });

    expect(result.current.filteredData).toHaveLength(2);
    expect(result.current.filteredData[0].category).toBe('B');
  });

  it('应该根据选中的 filterLabel 筛选数据', () => {
    const { result } = renderHook(() => useChartDataFilter(mockData));

    act(() => {
      result.current.setSelectedFilter('A');
      result.current.setSelectedFilterLabel('Q1');
    });

    expect(result.current.filteredData).toHaveLength(2);
    expect(
      result.current.filteredData.every((item) => item.filterLabel === 'Q1'),
    ).toBe(true);

    act(() => {
      result.current.setSelectedFilterLabel('Q2');
    });

    expect(result.current.filteredData).toHaveLength(0);
  });

  it('应该过滤掉 x 为 null 的数据', () => {
    const dataWithNull: ChartDataItem[] = [
      { x: '2024-01', y: 100, category: 'A' },
      { x: null as any, y: 200, category: 'A' },
      { x: undefined as any, y: 300, category: 'A' },
    ];

    const { result } = renderHook(() => useChartDataFilter(dataWithNull));

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].x).toBe('2024-01');
  });

  it('应该生成正确的筛选选项', () => {
    const { result } = renderHook(() => useChartDataFilter(mockData));

    expect(result.current.filterOptions).toEqual([
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
    ]);
  });

  it('应该生成正确的 filteredDataByFilterLabel', () => {
    const { result } = renderHook(() => useChartDataFilter(mockData));

    expect(result.current.filteredDataByFilterLabel).toEqual([
      { key: 'Q1', label: 'Q1' },
      { key: 'Q2', label: 'Q2' },
    ]);
  });

  it('应该处理空数组', () => {
    const { result } = renderHook(() => useChartDataFilter([]));

    expect(result.current.categories).toEqual([]);
    expect(result.current.filteredData).toEqual([]);
    expect(result.current.filterLabels).toBeUndefined();
    expect(result.current.selectedFilter).toBe('');
  });

  it('应该处理非数组数据', () => {
    const { result } = renderHook(() =>
      useChartDataFilter(null as any),
    );

    expect(result.current.categories).toEqual([]);
    expect(result.current.filteredData).toEqual([]);
    expect(result.current.safeData).toEqual([]);
  });

  it('应该处理没有 category 的数据', () => {
    const dataWithoutCategory: ChartDataItem[] = [
      { x: '2024-01', y: 100 },
      { x: '2024-02', y: 200 },
    ];

    const { result } = renderHook(() =>
      useChartDataFilter(dataWithoutCategory),
    );

    expect(result.current.categories).toEqual([]);
    expect(result.current.selectedFilter).toBe('');
  });

  it('应该处理没有 filterLabel 的数据', () => {
    const dataWithoutFilterLabel: ChartDataItem[] = [
      { x: '2024-01', y: 100, category: 'A' },
      { x: '2024-02', y: 200, category: 'B' },
    ];

    const { result } = renderHook(() =>
      useChartDataFilter(dataWithoutFilterLabel),
    );

    expect(result.current.filterLabels).toBeUndefined();
    // 当 filterLabels 是 undefined 时，filteredDataByFilterLabel 也是 undefined
    expect(result.current.filteredDataByFilterLabel).toBeUndefined();
  });

  it('当数据变化导致选中分类失效时，应该自动回退到首个有效分类', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useChartDataFilter(data),
      {
        initialProps: { data: mockData },
      },
    );

    expect(result.current.selectedFilter).toBe('A');

    act(() => {
      result.current.setSelectedFilter('B');
    });

    expect(result.current.selectedFilter).toBe('B');

    // 更新数据，移除 'B' 类别
    const newData: ChartDataItem[] = [
      { x: '2024-01', y: 100, category: 'A' },
      { x: '2024-02', y: 200, category: 'A' },
    ];

    rerender({ data: newData });

    expect(result.current.selectedFilter).toBe('A');
  });

  it('应该正确处理数字类型的 x 值', () => {
    const dataWithNumericX: ChartDataItem[] = [
      { x: 1, y: 100, category: 'A' },
      { x: 2, y: 200, category: 'A' },
    ];

    const { result } = renderHook(() =>
      useChartDataFilter(dataWithNumericX),
    );

    expect(result.current.filteredData).toHaveLength(2);
    expect(result.current.filteredData[0].x).toBe(1);
  });
});


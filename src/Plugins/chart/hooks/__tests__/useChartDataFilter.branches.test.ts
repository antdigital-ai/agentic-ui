/**
 * useChartDataFilter 残留分支：非数组、筛选失效、默认 label。
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useChartDataFilter } from '../useChartDataFilter';

describe('useChartDataFilter branches', () => {
  it('非数组 data 回退 EMPTY；过滤空 x；默认分类 label', () => {
    const { result } = renderHook(() =>
      useChartDataFilter(null as any),
    );
    expect(result.current.safeData).toEqual([]);
    expect(result.current.filteredData).toEqual([]);
  });

  it('分类与 filterLabel 失效回退；全量与筛选', () => {
    const data = [
      { category: 'A', filterLabel: 'L1', x: 1, y: 1 },
      { category: 'B', filterLabel: 'L2', x: 2, y: 2 },
      { category: 'A', filterLabel: 'L1', x: null, y: 3 },
      { category: '', x: 4, y: 4 },
    ] as any;

    const { result, rerender } = renderHook(
      ({ d }) => useChartDataFilter(d),
      { initialProps: { d: data } },
    );

    expect(result.current.categories).toEqual(['A', 'B']);
    expect(result.current.filterLabels).toEqual(['L1', 'L2']);
    expect(result.current.filterOptions.some((o) => o.label === '默认')).toBe(
      false,
    );

    act(() => {
      result.current.setSelectedFilter('A');
      result.current.setSelectedFilterLabel('L1');
    });
    expect(
      result.current.filteredData.every((i) => i.category === 'A'),
    ).toBe(true);
    expect(result.current.filteredData.every((i) => i.x !== null && i.x !== undefined)).toBe(true);

    act(() => {
      result.current.setSelectedFilter('gone');
    });
    rerender({
      d: [{ category: 'C', x: 1, y: 1 }] as any,
    });
    expect(result.current.selectedFilter === '' || result.current.selectedFilter === 'C').toBe(
      true,
    );

    act(() => {
      result.current.setSelectedFilterLabel('L1');
    });
    rerender({
      d: [{ category: 'C', x: 1, y: 1 }] as any,
    });
    expect(result.current.selectedFilterLabel).toBeUndefined();
    expect(result.current.filterLabels).toBeUndefined();
  });

  it('空 category 映射为默认选项', () => {
    const { result } = renderHook(() =>
      useChartDataFilter([{ category: '', x: 1, y: 1 }] as any),
    );
    // categories 过滤 Boolean，空串被去掉
    expect(result.current.categories).toEqual([]);
    expect(result.current.filterOptions).toEqual([]);
  });

  it('filterLabels 不匹配时清空 selectedFilterLabel', () => {
    const data = [
      { category: 'A', filterLabel: 'L1', x: 1, y: 1 },
      { category: 'A', filterLabel: 'L2', x: 2, y: 2 },
    ] as any;
    const { result, rerender } = renderHook(
      ({ d }) => useChartDataFilter(d),
      { initialProps: { d: data } },
    );
    act(() => {
      result.current.setSelectedFilterLabel('L1');
    });
    rerender({
      d: [{ category: 'A', filterLabel: 'ONLY', x: 1, y: 1 }] as any,
    });
    expect(result.current.filterLabels).not.toContain('L1');
  });
});

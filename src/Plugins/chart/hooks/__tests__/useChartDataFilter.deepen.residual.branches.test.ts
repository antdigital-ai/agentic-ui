/**
 * useChartDataFilter deepen：选中分类失效且 categories 空时 `|| ''`。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChartDataFilter } from '../useChartDataFilter';

describe('useChartDataFilter deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('分类列表变空时 selectedFilter 回退空串', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useChartDataFilter(data),
      {
        initialProps: {
          data: [
            { category: 'A', value: 1 },
            { category: 'B', value: 2 },
          ] as any[],
        },
      },
    );
    expect(result.current.selectedFilter).toBe('A');
    rerender({ data: [{ value: 1 }] as any[] });
    act(() => {});
    expect(result.current.selectedFilter).toBe('');
  });
});

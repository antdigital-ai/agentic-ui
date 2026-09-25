/**
 * useHistorySearch deepen：sessionTitle 为 null/undefined 时 `?? ''`。
 */
import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHistorySearch } from '../useHistorySearch';

describe('useHistorySearch deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('过滤时 sessionTitle 缺省不抛并被当成空串', () => {
    const list = [
      { id: '1', sessionTitle: null },
      { id: '2', sessionTitle: undefined },
      { id: '3', sessionTitle: 'hello' },
    ] as any[];
    const { result } = renderHook(() =>
      useHistorySearch({} as any, list),
    );
    act(() => {
      result.current.handleSearch('hello');
    });
    expect(result.current.filteredList).toHaveLength(1);
    expect(result.current.filteredList[0].id).toBe('3');
  });
});

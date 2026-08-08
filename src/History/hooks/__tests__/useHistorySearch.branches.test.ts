/**
 * useHistorySearch：空 keyword 返回完整列表。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { HistoryDataType } from '../../types/HistoryData';
import { useHistorySearch } from '../useHistorySearch';

describe('useHistorySearch branches', () => {
  it('searchKeyword 为空时 filteredList 等于 chatList', () => {
    const chatList: HistoryDataType[] = [
      { id: '1', sessionTitle: 'Alpha' },
      { id: '2', sessionTitle: 'Beta' },
    ];
    const { result } = renderHook(() => useHistorySearch({}, chatList));
    expect(result.current.filteredList).toEqual(chatList);
    expect(result.current.searchKeyword).toBe('');
  });
});

/**
 * useReadonlyTableColWidths：containerWidth falsy → undefined 传入计算。
 */
import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useReadonlyTableColWidths } from '../useReadonlyTableColWidths';

describe('useReadonlyTableColWidths branches', () => {
  it('containerWidth 为 0 时不抛错并返回数组', () => {
    const containerRef = React.createRef<HTMLDivElement>();
    const tableRef = React.createRef<HTMLTableElement>();
    const { result } = renderHook(() =>
      useReadonlyTableColWidths({
        columnCount: 2,
        containerRef,
        tableRef,
      }),
    );
    expect(Array.isArray(result.current)).toBe(true);
  });
});

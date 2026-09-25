/**
 * useReadonlyTableColWidths deepen：clientWidth 0 触发 needsColWidths。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useReadonlyTableColWidths } from '../useReadonlyTableColWidths';

describe('useReadonlyTableColWidths deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('clientWidth 0 仍可调用', () => {
    const container = document.createElement('div');
    const table = document.createElement('table');
    Object.defineProperty(container, 'clientWidth', { value: 0 });
    Object.defineProperty(table, 'scrollWidth', { value: 100 });
    const containerRef = { current: container };
    const tableRef = { current: table };
    expect(() =>
      renderHook(() =>
        useReadonlyTableColWidths({
          columnCount: 2,
          otherProps: null,
          containerRef: containerRef as any,
          tableRef: tableRef as any,
          element: null,
        }),
      ),
    ).not.toThrow();
  });
});

/**
 * useElementSize 覆盖 ResizeObserver 回调（10、11、12 行）
 */
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useElementSize } from '../../src/Hooks/useElementSize';

describe('useElementSize', () => {
  it('应在 ResizeObserver 回调中更新 size', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();
    let observerCallback: (entries: ResizeObserverEntry[]) => void = () => {};

    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(function (this: any, cb: (entries: ResizeObserverEntry[]) => void) {
        observerCallback = cb;
        return {
          observe: mockObserve,
          disconnect: mockDisconnect,
        };
      }),
    );

    const { result } = renderHook(() => useElementSize(ref));

    expect(mockObserve).toHaveBeenCalledWith(div);

    const mockEntry = {
      borderBoxSize: [{ inlineSize: 100, blockSize: 50 }],
    } as unknown as ResizeObserverEntry;

    act(() => {
      observerCallback([mockEntry]);
    });

    expect(result.current).toEqual({ width: 100, height: 50 });
  });
});

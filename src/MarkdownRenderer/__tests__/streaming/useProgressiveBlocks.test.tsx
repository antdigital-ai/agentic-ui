import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveBlocks } from '../../streaming/useProgressiveBlocks';
import { installRafStub } from '../installRafStub';

const setDocumentHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    value: hidden,
  });
};

describe('useProgressiveBlocks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
    vi.stubGlobal('requestIdleCallback', undefined);
    setDocumentHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setDocumentHidden(false);
  });

  it('non-streaming large documents render an initial batch and append by frame', async () => {
    const { result } = renderHook(() => useProgressiveBlocks(20, false, 0));

    expect(result.current).toBe(8);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expect(result.current).toBe(14);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expect(result.current).toBe(20);
  });

  it('hidden documents render all blocks immediately to avoid frozen frame callbacks', async () => {
    setDocumentHidden(true);

    const { result } = renderHook(() => useProgressiveBlocks(20, false, 0));

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current).toBe(20);
  });

  it('generation changes reset progress even when block count is unchanged', async () => {
    const { result, rerender } = renderHook(
      ({ generation }) => useProgressiveBlocks(20, false, generation),
      { initialProps: { generation: 0 } },
    );

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    expect(result.current).toBe(20);

    rerender({ generation: 1 });
    expect(result.current).toBe(8);
  });

  it('streaming mode always exposes the complete block count', () => {
    const { result } = renderHook(() => useProgressiveBlocks(20, true, 0));

    expect(result.current).toBe(20);
  });
});

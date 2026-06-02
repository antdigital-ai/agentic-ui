import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installRafStub } from '../../__tests__/installRafStub';
import { useProgressiveBlocks } from '../useProgressiveBlocks';

const LARGE_BLOCK_COUNT = 15;
const INITIAL_VISIBLE_COUNT = 8;
const NEXT_VISIBLE_COUNT = 14;
const FRAME_MS = 16;

const setDocumentHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    value: hidden,
  });
};

const advanceFrame = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(FRAME_MS);
  });
};

describe('useProgressiveBlocks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
    installRafStub();
    setDocumentHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setDocumentHidden(false);
  });

  it('progressively reveals large non-streaming documents by frame', async () => {
    const { result } = renderHook(() =>
      useProgressiveBlocks(LARGE_BLOCK_COUNT, false, 1),
    );

    expect(result.current).toBe(INITIAL_VISIBLE_COUNT);

    await advanceFrame();

    expect(result.current).toBe(NEXT_VISIBLE_COUNT);

    await advanceFrame();

    expect(result.current).toBe(LARGE_BLOCK_COUNT);
  });

  it('renders all blocks immediately for streaming or small documents', () => {
    const { result: streamingResult } = renderHook(() =>
      useProgressiveBlocks(100, true, 1),
    );
    const { result: smallDocumentResult } = renderHook(() =>
      useProgressiveBlocks(12, false, 1),
    );

    expect(streamingResult.current).toBe(100);
    expect(smallDocumentResult.current).toBe(12);
  });

  it('flushes remaining blocks when the document becomes hidden', () => {
    const { result } = renderHook(() =>
      useProgressiveBlocks(LARGE_BLOCK_COUNT, false, 1),
    );

    expect(result.current).toBe(INITIAL_VISIBLE_COUNT);

    act(() => {
      setDocumentHidden(true);
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe(LARGE_BLOCK_COUNT);
  });

  it('resets visible count when same-size content advances generation', async () => {
    const { result, rerender } = renderHook(
      ({ generation }) =>
        useProgressiveBlocks(LARGE_BLOCK_COUNT, false, generation),
      { initialProps: { generation: 1 } },
    );

    await advanceFrame();
    await advanceFrame();

    expect(result.current).toBe(LARGE_BLOCK_COUNT);

    rerender({ generation: 2 });

    expect(result.current).toBe(INITIAL_VISIBLE_COUNT);
  });
});

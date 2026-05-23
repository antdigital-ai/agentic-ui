import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveBlocks } from '../streaming/useProgressiveBlocks';
import { installRafStub } from './installRafStub';

const LARGE_BLOCK_COUNT = 20;
const THRESHOLD_BLOCK_COUNT = 12;
const INITIAL_VISIBLE_BLOCKS = 8;
const BLOCKS_PER_FRAME = 6;
const FRAME_MS = 16;

const originalHiddenDescriptor = Object.getOwnPropertyDescriptor(
  Document.prototype,
  'hidden',
);

const setDocumentHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  });
};

const restoreDocumentHidden = () => {
  if (originalHiddenDescriptor) {
    Object.defineProperty(
      Document.prototype,
      'hidden',
      originalHiddenDescriptor,
    );
    delete (document as any).hidden;
    return;
  }

  delete (document as any).hidden;
};

describe('useProgressiveBlocks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
    installRafStub();
    restoreDocumentHidden();
  });

  afterEach(() => {
    restoreDocumentHidden();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reveals large non-streaming documents across animation frames', async () => {
    const { result } = renderHook(() =>
      useProgressiveBlocks(LARGE_BLOCK_COUNT, false),
    );

    expect(result.current).toBe(INITIAL_VISIBLE_BLOCKS);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(FRAME_MS);
    });

    expect(result.current).toBe(INITIAL_VISIBLE_BLOCKS + BLOCKS_PER_FRAME);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(FRAME_MS);
    });

    expect(result.current).toBe(LARGE_BLOCK_COUNT);
  });

  it('returns all blocks for streaming and small documents', () => {
    const streamingResult = renderHook(() =>
      useProgressiveBlocks(LARGE_BLOCK_COUNT, true),
    );
    expect(streamingResult.result.current).toBe(LARGE_BLOCK_COUNT);

    const smallResult = renderHook(() =>
      useProgressiveBlocks(THRESHOLD_BLOCK_COUNT, false),
    );
    expect(smallResult.result.current).toBe(THRESHOLD_BLOCK_COUNT);
  });

  it('renders all blocks when the document is hidden', async () => {
    setDocumentHidden(true);

    const { result } = renderHook(() =>
      useProgressiveBlocks(LARGE_BLOCK_COUNT, false),
    );

    await waitFor(() => {
      expect(result.current).toBe(LARGE_BLOCK_COUNT);
    });
  });

  it('falls back to all blocks when visibility changes before the next frame', async () => {
    let hidden = false;
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden,
    });

    const { result } = renderHook(() =>
      useProgressiveBlocks(LARGE_BLOCK_COUNT, false),
    );

    expect(result.current).toBe(INITIAL_VISIBLE_BLOCKS);

    hidden = true;
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe(LARGE_BLOCK_COUNT);
  });

  it('resets visible blocks when generation changes without changing block count', async () => {
    const { result, rerender } = renderHook(
      ({ generation }) =>
        useProgressiveBlocks(LARGE_BLOCK_COUNT, false, generation),
      {
        initialProps: { generation: 0 },
      },
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(FRAME_MS * 2);
    });

    expect(result.current).toBe(LARGE_BLOCK_COUNT);

    rerender({ generation: 1 });

    await waitFor(() => {
      expect(result.current).toBe(INITIAL_VISIBLE_BLOCKS);
    });
  });
});

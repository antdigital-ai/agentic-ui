import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveBlocks } from '../streaming/useProgressiveBlocks';
import { installRafStub } from './installRafStub';

const LARGE_BLOCK_COUNT = 20;
const SMALL_BLOCK_COUNT = 12;
const INITIAL_BATCH = 8;
const BATCH_SIZE = 6;

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

  it('非流式大文档首屏分批渲染并逐帧补齐', async () => {
    const { result } = renderHook(() =>
      useProgressiveBlocks(LARGE_BLOCK_COUNT, false),
    );

    expect(result.current).toBe(INITIAL_BATCH);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expect(result.current).toBe(INITIAL_BATCH + BATCH_SIZE);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expect(result.current).toBe(LARGE_BLOCK_COUNT);
  });

  it('流式或小文档直接返回全量块数', () => {
    const streamingHook = renderHook(() =>
      useProgressiveBlocks(LARGE_BLOCK_COUNT, true),
    );
    const smallDocumentHook = renderHook(() =>
      useProgressiveBlocks(SMALL_BLOCK_COUNT, false),
    );

    expect(streamingHook.result.current).toBe(LARGE_BLOCK_COUNT);
    expect(smallDocumentHook.result.current).toBe(SMALL_BLOCK_COUNT);
  });

  it('页面不可见时直接渲染全量，避免后台帧调度冻结导致内容缺失', () => {
    setDocumentHidden(true);

    const { result } = renderHook(() =>
      useProgressiveBlocks(LARGE_BLOCK_COUNT, false),
    );

    expect(result.current).toBe(LARGE_BLOCK_COUNT);
  });

  it('同块数内容换代时重置到首屏批次', async () => {
    const { result, rerender } = renderHook(
      ({ generation }) =>
        useProgressiveBlocks(LARGE_BLOCK_COUNT, false, generation),
      {
        initialProps: { generation: 1 },
      },
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expect(result.current).toBe(LARGE_BLOCK_COUNT);

    rerender({ generation: 2 });

    expect(result.current).toBe(INITIAL_BATCH);
  });
});

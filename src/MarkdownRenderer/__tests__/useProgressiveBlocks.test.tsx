import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveBlocks } from '../streaming/useProgressiveBlocks';
import { installRafStub } from './installRafStub';

interface UseProgressiveBlocksHookProps {
  totalBlocks: number;
  streaming: boolean;
  generation?: number;
}

const renderProgressiveBlocks = (
  initialProps: UseProgressiveBlocksHookProps,
) =>
  renderHook(
    ({ totalBlocks, streaming, generation }) =>
      useProgressiveBlocks(totalBlocks, streaming, generation),
    { initialProps },
  );

const setDocumentHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    value: hidden,
  });
};

const advanceNextFrame = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(16);
  });
};

describe('useProgressiveBlocks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
    setDocumentHidden(false);
  });

  afterEach(() => {
    setDocumentHidden(false);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('非流式大文档应先渲染首批块并按帧追加', async () => {
    const { result } = renderProgressiveBlocks({
      totalBlocks: 20,
      streaming: false,
    });

    expect(result.current).toBe(8);

    await advanceNextFrame();
    expect(result.current).toBe(14);

    await advanceNextFrame();
    expect(result.current).toBe(20);
  });

  it('流式模式和小文档应直接渲染全量块', () => {
    const streamingResult = renderProgressiveBlocks({
      totalBlocks: 20,
      streaming: true,
    });
    expect(streamingResult.result.current).toBe(20);
    streamingResult.unmount();

    const smallDocumentResult = renderProgressiveBlocks({
      totalBlocks: 12,
      streaming: false,
    });
    expect(smallDocumentResult.result.current).toBe(12);
  });

  it('generation 变化时应重置同块数大文档的渐进进度', async () => {
    const { result, rerender } = renderProgressiveBlocks({
      totalBlocks: 20,
      streaming: false,
      generation: 0,
    });

    await advanceNextFrame();
    await advanceNextFrame();
    expect(result.current).toBe(20);

    await act(async () => {
      rerender({
        totalBlocks: 20,
        streaming: false,
        generation: 1,
      });
    });

    expect(result.current).toBe(8);
  });

  it('页面不可见时应直接渲染全量块避免后台 RAF 冻结导致内容缺失', async () => {
    setDocumentHidden(true);

    const { result } = renderProgressiveBlocks({
      totalBlocks: 20,
      streaming: false,
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current).toBe(20);
  });
});

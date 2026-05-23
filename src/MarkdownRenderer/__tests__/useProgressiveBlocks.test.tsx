import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveBlocks } from '../streaming/useProgressiveBlocks';
import { installRafStub } from './installRafStub';

const LARGE_BLOCK_COUNT = 20;
const INITIAL_VISIBLE_BLOCKS = 8;
const SECOND_FRAME_VISIBLE_BLOCKS = 14;

interface ProgressiveBlocksProbeProps {
  generation?: number;
  streaming?: boolean;
  totalBlocks: number;
}

const ProgressiveBlocksProbe: React.FC<ProgressiveBlocksProbeProps> = ({
  generation,
  streaming = false,
  totalBlocks,
}) => {
  const visibleCount = useProgressiveBlocks(
    totalBlocks,
    streaming,
    generation,
  );

  return <span data-testid="visible-count">{visibleCount}</span>;
};

const expectVisibleCount = (count: number) => {
  expect(screen.getByTestId('visible-count')).toHaveTextContent(String(count));
};

describe('useProgressiveBlocks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('非流式大文档先渲染首批块，再按帧追加至全量', async () => {
    render(<ProgressiveBlocksProbe totalBlocks={LARGE_BLOCK_COUNT} />);

    expectVisibleCount(INITIAL_VISIBLE_BLOCKS);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expectVisibleCount(SECOND_FRAME_VISIBLE_BLOCKS);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expectVisibleCount(LARGE_BLOCK_COUNT);
  });

  it('标签页不可见时直接展示全量块，避免后台 RAF 冻结导致内容缺失', async () => {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);

    render(<ProgressiveBlocksProbe totalBlocks={LARGE_BLOCK_COUNT} />);

    await act(async () => {
      await Promise.resolve();
    });
    expectVisibleCount(LARGE_BLOCK_COUNT);
  });

  it('等块数文档替换时根据 generation 重置首批渲染进度', async () => {
    const { rerender } = render(
      <ProgressiveBlocksProbe
        generation={0}
        totalBlocks={LARGE_BLOCK_COUNT}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(48);
    });
    expectVisibleCount(LARGE_BLOCK_COUNT);

    rerender(
      <ProgressiveBlocksProbe
        generation={1}
        totalBlocks={LARGE_BLOCK_COUNT}
      />,
    );

    expectVisibleCount(INITIAL_VISIBLE_BLOCKS);
  });
});

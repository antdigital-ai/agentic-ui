import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveBlocks } from '../streaming/useProgressiveBlocks';
import { installRafStub } from './installRafStub';

const TOTAL_BLOCKS = 20;
const INITIAL_VISIBLE_BLOCKS = 8;
const NEXT_FRAME_VISIBLE_BLOCKS = 14;

const ProgressiveBlocksProbe: React.FC<{
  totalBlocks?: number;
  streaming?: boolean;
  generation?: number;
}> = ({ totalBlocks = TOTAL_BLOCKS, streaming = false, generation }) => {
  const visibleCount = useProgressiveBlocks(
    totalBlocks,
    streaming,
    generation,
  );

  return <span data-testid="visible-count">{visibleCount}</span>;
};

const mockDocumentHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  });
};

const advanceFrame = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(16);
  });
};

describe('useProgressiveBlocks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
    mockDocumentHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    mockDocumentHidden(false);
  });

  it('renders large non-streaming documents progressively by frame', async () => {
    render(<ProgressiveBlocksProbe />);

    expect(screen.getByTestId('visible-count')).toHaveTextContent(
      String(INITIAL_VISIBLE_BLOCKS),
    );

    await advanceFrame();
    expect(screen.getByTestId('visible-count')).toHaveTextContent(
      String(NEXT_FRAME_VISIBLE_BLOCKS),
    );

    await advanceFrame();
    expect(screen.getByTestId('visible-count')).toHaveTextContent(
      String(TOTAL_BLOCKS),
    );
  });

  it('renders all blocks immediately while streaming', () => {
    render(<ProgressiveBlocksProbe streaming />);

    expect(screen.getByTestId('visible-count')).toHaveTextContent(
      String(TOTAL_BLOCKS),
    );
  });

  it('renders all blocks when the document is hidden', async () => {
    mockDocumentHidden(true);

    render(<ProgressiveBlocksProbe />);

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId('visible-count')).toHaveTextContent(
      String(TOTAL_BLOCKS),
    );
  });

  it('resets visible blocks when equal-sized content moves to a new generation', async () => {
    const { rerender } = render(<ProgressiveBlocksProbe generation={0} />);

    await advanceFrame();
    await advanceFrame();
    expect(screen.getByTestId('visible-count')).toHaveTextContent(
      String(TOTAL_BLOCKS),
    );

    rerender(<ProgressiveBlocksProbe generation={1} />);

    expect(screen.getByTestId('visible-count')).toHaveTextContent(
      String(INITIAL_VISIBLE_BLOCKS),
    );
  });
});

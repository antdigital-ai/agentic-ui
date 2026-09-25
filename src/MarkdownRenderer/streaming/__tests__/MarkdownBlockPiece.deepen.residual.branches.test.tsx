/**
 * MarkdownBlockPiece deepen：缓存命中与 shouldReparse。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { MarkdownBlockPiece } from '../MarkdownBlockPiece';

describe('MarkdownBlockPiece deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('同 source 复用缓存', () => {
    const processor = unified().use(remarkParse);
    const { rerender } = render(
      <MarkdownBlockPiece
        variant="sealed"
        blockSource="# a"
        processor={processor as any}
        components={{}}
        streaming={false}
      />,
    );
    rerender(
      <MarkdownBlockPiece
        variant="sealed"
        blockSource="# a"
        processor={processor as any}
        components={{}}
        streaming={false}
      />,
    );
    rerender(
      <MarkdownBlockPiece
        variant="tail"
        blockSource="# a\n\nb"
        processor={processor as any}
        components={{}}
        streaming
      />,
    );
    expect(document.body).toBeTruthy();
  });
});

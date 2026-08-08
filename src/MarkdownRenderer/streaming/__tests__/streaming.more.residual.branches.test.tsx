/**
 * useProgressiveBlocks / MarkdownBlockPiece / streaming react 残留。
 */
import { act, render, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownBlockPiece } from '../MarkdownBlockPiece';
import { useProgressiveBlocks } from '../useProgressiveBlocks';
import { useStreamingMarkdownReact } from '../useStreamingMarkdownReact';

vi.mock('../../markdownReactShared', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    renderMarkdownBlock: (src: string) => <span data-testid="blk">{src}</span>,
    createHastProcessor: () => ({
      processSync: (src: string) => ({ result: src }),
    }),
    splitMarkdownBlocks: (content: string) =>
      content ? content.split('\n\n') : [],
    buildEditorAlignedComponents: () => ({}),
  };
});

describe('streaming residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it.skip('document.hidden 时暂停推进', () => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    const { result } = renderHook(() => useProgressiveBlocks(40, false, 1));
    expect(result.current).toBeLessThanOrEqual(40);
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
  });

  it.skip('MarkdownBlockPiece sealed 缓存；tail streaming', () => {
    const processor = { processSync: vi.fn() } as any;
    const { rerender } = render(
      <MarkdownBlockPiece
        blockSource="hello"
        processor={processor}
        components={{}}
        streaming={false}
        variant="sealed"
      />,
    );
    rerender(
      <MarkdownBlockPiece
        blockSource="hello"
        processor={processor}
        components={{}}
        streaming={false}
        variant="sealed"
      />,
    );
    rerender(
      <MarkdownBlockPiece
        blockSource="hello world"
        processor={processor}
        components={{}}
        streaming
        variant="tail"
      />,
    );
    expect(document.body.textContent).toMatch(/hello/);
  });

  it.skip('useStreamingMarkdownReact：空 content；revision 变化', () => {
    const { result, rerender } = renderHook(
      ({ content, rev }) =>
        useStreamingMarkdownReact(content, {
          contentRevisionSource: rev,
          prefixCls: 'md',
        } as any),
      { initialProps: { content: '', rev: 'r1' } },
    );
    expect(result.current).toBeTruthy();
    act(() => {
      rerender({ content: '# Hi\n\npara', rev: 'r2' });
    });
    expect(result.current).toBeTruthy();
  });
});

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ParagraphNode } from '../../../el';
import { useParagraphEmptyState } from '../useParagraphEmptyState';

vi.mock('slate-react', () => ({
  useSlate: vi.fn(),
}));

import { useSlate } from 'slate-react';

describe('useParagraphEmptyState', () => {
  const emptyParagraph: ParagraphNode = {
    type: 'paragraph',
    children: [{ text: '' }],
  };

  it('单空段落且无 IME 时应为空', () => {
    vi.mocked(useSlate).mockReturnValue({
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    } as ReturnType<typeof useSlate>);

    const { result } = renderHook(() =>
      useParagraphEmptyState(emptyParagraph, false),
    );
    expect(result.current).toBe(true);
  });

  it('IME 组合中不应为空', () => {
    vi.mocked(useSlate).mockReturnValue({
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    } as ReturnType<typeof useSlate>);

    const { result } = renderHook(() =>
      useParagraphEmptyState(emptyParagraph, true),
    );
    expect(result.current).toBe(false);
  });

  it('多 block 时不应为空', () => {
    vi.mocked(useSlate).mockReturnValue({
      children: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: 'x' }] },
      ],
    } as ReturnType<typeof useSlate>);

    const { result } = renderHook(() =>
      useParagraphEmptyState(emptyParagraph, false),
    );
    expect(result.current).toBe(false);
  });

  it('含 tag 子节点时不应为空', () => {
    vi.mocked(useSlate).mockReturnValue({
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    } as ReturnType<typeof useSlate>);

    const taggedParagraph: ParagraphNode = {
      type: 'paragraph',
      children: [{ text: '', tag: true } as { text: string; tag: boolean }],
    };

    const { result } = renderHook(() =>
      useParagraphEmptyState(taggedParagraph, false),
    );
    expect(result.current).toBe(false);
  });
});

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as markdownReactShared from '../markdownReactShared';
import { useStreamingMarkdownReact } from '../streaming/useStreamingMarkdownReact';

describe('useStreamingMarkdownReact sealed subtree cache', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not call renderMarkdownBlock again for sealed blocks when only the tail block grows', () => {
    const spy = vi.spyOn(markdownReactShared, 'renderMarkdownBlock');

    const md1 = 'sealed\n\n\n';
    const md2 = 'sealed\n\n\ntail';

    const { rerender } = renderHook(
      ({ content }: { content: string }) =>
        useStreamingMarkdownReact(content, {
          streaming: true,
          contentRevisionSource: content,
        }),
      { initialProps: { content: md1 } },
    );

    const countAfterFirst = spy.mock.calls.length;
    expect(countAfterFirst).toBeGreaterThan(0);

    rerender({ content: md2 });

    expect(spy.mock.calls.length - countAfterFirst).toBe(1);
  });
});

import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as markdownReactShared from '../markdownReactShared';
import { useStreamingMarkdownReact } from '../streaming/useStreamingMarkdownReact';

const StreamingMarkdownHarness: React.FC<{
  content: string;
}> = ({ content }) => {
  const node = useStreamingMarkdownReact(content, {
    streaming: true,
    contentRevisionSource: content,
  });
  return <div data-testid="streaming-md-root">{node}</div>;
};

describe('useStreamingMarkdownReact sealed subtree cache', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not call renderMarkdownBlock again for sealed blocks when only the tail block grows', () => {
    const spy = vi.spyOn(markdownReactShared, 'renderMarkdownBlock');

    const md1 = 'sealed\n\n\n';
    const md2 = 'sealed\n\n\ntail';

    const { rerender } = render(<StreamingMarkdownHarness content={md1} />);

    const countAfterFirst = spy.mock.calls.length;
    expect(countAfterFirst).toBeGreaterThan(0);

    rerender(<StreamingMarkdownHarness content={md2} />);

    expect(spy.mock.calls.length - countAfterFirst).toBe(1);
  });

  it('does not re-parse a sealed pipe table when only content after the table grows', () => {
    const spy = vi.spyOn(markdownReactShared, 'renderMarkdownBlock');

    const table = '| a | b |\n|:-:|:-:|\n| 1 | 2 |';
    const md1 = `${table}\n\n### `;
    // 末块节流：纯字母增量可能跳过 parse；换行触发边界以稳定断言「仅 tail 再算一次」
    const md2 = `${table}\n\n### Sec\n`;

    const { rerender } = render(<StreamingMarkdownHarness content={md1} />);

    const countAfterFirst = spy.mock.calls.length;
    expect(countAfterFirst).toBeGreaterThan(0);

    rerender(<StreamingMarkdownHarness content={md2} />);

    expect(spy.mock.calls.length - countAfterFirst).toBe(1);
  });
});

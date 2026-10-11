import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import type { UseMarkdownToReactOptions } from '../../markdownReactShared';
import * as shared from '../../markdownReactShared';
import { useStreamingMarkdownReact } from '../useStreamingMarkdownReact';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const Harness = ({
  content,
  htmlConfig,
}: {
  content: string;
  htmlConfig: UseMarkdownToReactOptions['htmlConfig'];
}) => {
  const children = useStreamingMarkdownReact(content, {
    streaming: true,
    htmlConfig,
    remarkPlugins: [],
    rehypePlugins: [],
  });
  return <div>{children}</div>;
};

it('preserves parsed historical blocks with equal inline config and empty plugin arrays', () => {
  const parse = vi.spyOn(shared, 'renderMarkdownBlock');
  const content = 'First\n\nSecond\n\nTail';
  const { rerender } = render(
    <Harness content={content} htmlConfig={{ openLinksInNewTab: true }} />,
  );
  const before = parse.mock.calls.length;
  for (let index = 0; index < 50; index++) {
    rerender(
      <Harness
        content={`${content}${'x'.repeat(index + 1)}`}
        htmlConfig={{ openLinksInNewTab: true }}
      />,
    );
  }
  expect(parse.mock.calls.length - before).toBe(50);
});

it('invalidates parsed caches when parser configuration really changes', () => {
  const parse = vi.spyOn(shared, 'renderMarkdownBlock');
  const content = 'First\n\nSecond\n\nTail';
  const { rerender } = render(
    <Harness content={content} htmlConfig={{ openLinksInNewTab: true }} />,
  );
  const before = parse.mock.calls.length;
  rerender(
    <Harness content={content} htmlConfig={{ openLinksInNewTab: false }} />,
  );
  expect(parse.mock.calls.length - before).toBe(3);
});

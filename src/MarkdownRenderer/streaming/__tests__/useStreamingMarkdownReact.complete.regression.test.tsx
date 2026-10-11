import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, expect, it } from 'vitest';
import { useStreamingMarkdownReact } from '../useStreamingMarkdownReact';

afterEach(cleanup);

const Harness = ({
  content,
  streaming,
  isFinished,
}: {
  content: string;
  streaming: boolean;
  isFinished: boolean;
}) => {
  const children = useStreamingMarkdownReact(content, {
    streaming,
    isFinished,
    fadeTokens: streaming,
  });
  return <div>{children}</div>;
};

it('a completed stream reveals every flushed block immediately without token DOM', () => {
  const { container, rerender } = render(
    <Harness content="First paragraph" streaming isFinished={false} />,
  );
  const content = Array.from(
    { length: 30 },
    (_, index) => `Paragraph ${index}`,
  ).join('\n\n');
  rerender(<Harness content={content} streaming={false} isFinished />);
  expect(container.querySelectorAll('[data-be="paragraph"]')).toHaveLength(30);
  expect(container.querySelectorAll('.stream-token')).toHaveLength(0);
});

it('a message mounted already complete renders every block on its first frame', () => {
  const content = Array.from(
    { length: 30 },
    (_, index) => `Paragraph ${index}`,
  ).join('\n\n');
  const { container } = render(
    <Harness content={content} streaming={false} isFinished />,
  );
  expect(container.querySelectorAll('[data-be="paragraph"]')).toHaveLength(30);
  expect(container.querySelectorAll('.stream-token')).toHaveLength(0);
});

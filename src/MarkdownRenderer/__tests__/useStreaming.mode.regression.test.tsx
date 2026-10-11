import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { afterEach, expect, it } from 'vitest';
import { useStreaming } from '../useStreaming';

afterEach(cleanup);

const StatefulContent = ({ content }: { content: string }) => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <video data-testid="stream-mode-media" />
      <button type="button" onClick={() => setCount(count + 1)}>
        {count}
      </button>
      <span>{content}</span>
    </div>
  );
};

const Harness = ({ input, enabled }: { input: string; enabled: boolean }) => {
  const content = useStreaming(input, enabled);
  return content ? <StatefulContent content={content} /> : null;
};

it('静态消息更新后开启流式，保留媒体 DOM 和子组件状态', () => {
  const { rerender } = render(<Harness input="Answer" enabled={false} />);
  const media = screen.getByTestId('stream-mode-media');
  fireEvent.click(screen.getByRole('button', { name: '0' }));
  rerender(<Harness input="Updated answer" enabled={false} />);
  rerender(<Harness input="Updated answer" enabled />);
  expect(screen.getByTestId('stream-mode-media')).toBe(media);
  expect(screen.getByRole('button', { name: '1' })).toBeTruthy();
});

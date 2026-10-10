import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleList } from '../List';
import type { BubbleProps, MessageBubbleData } from '../type';

describe('BubbleList historical messages', () => {
  it('updates only the streaming row while retaining historic content and customization', () => {
    const contentRender = vi.fn((props: BubbleProps) => (
      <p>{props.originData?.content}</p>
    ));
    const bubbleRenderConfig = { contentRender, extraRender: false as const };
    const messages: MessageBubbleData[] = Array.from(
      { length: 100 },
      (_, index) => ({
        id: `message-${index}`,
        role: 'assistant',
        content: `Message ${index}`,
        isFinished: index < 99,
      }),
    );
    const { rerender } = render(
      <BubbleList
        bubbleList={messages}
        bubbleRenderConfig={bubbleRenderConfig}
      />,
    );
    expect(contentRender).toHaveBeenCalledTimes(100);
    contentRender.mockClear();
    const next = messages.map((message, index) =>
      index === 99 ? { ...message, content: 'Streamed content' } : message,
    );
    rerender(
      <BubbleList bubbleList={next} bubbleRenderConfig={bubbleRenderConfig} />,
    );
    expect(contentRender).toHaveBeenCalledOnce();
    expect(screen.getByText('Message 0')).toBeInTheDocument();
    expect(screen.getByText('Streamed content')).toBeInTheDocument();

    contentRender.mockClear();
    rerender(
      <BubbleList
        bubbleList={next}
        bubbleRenderConfig={bubbleRenderConfig}
        classNames={{
          bubbleListItemContentClassName: 'custom-message-content',
        }}
      />,
    );
    expect(contentRender).toHaveBeenCalledTimes(100);
    expect(screen.getByText('Message 0').parentElement).toHaveClass(
      'custom-message-content',
    );
  });
});

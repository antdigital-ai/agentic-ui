import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { BubbleProps, MessageBubbleData } from '../../type';
import { BubbleList } from '../index';

vi.mock('../../MessagesContent', () => ({
  LOADING_FLAT: '...',
  BubbleMessageDisplay: ({ originData }: BubbleProps) => (
    <p>{originData?.content}</p>
  ),
}));

const messages: MessageBubbleData[] = [
  { id: 'user', role: 'user', content: 'User message' },
  { id: 'assistant', role: 'assistant', content: 'Assistant message' },
];
const bubbleRenderConfig: BubbleProps['bubbleRenderConfig'] = {
  avatarRender: false,
  titleRender: false,
  extraRender: false,
};

describe('BubbleList short and legacy slots', () => {
  it('layers directional styles over the short common content slot', () => {
    render(
      <BubbleList
        bubbleList={messages}
        bubbleRenderConfig={bubbleRenderConfig}
        styles={{
          content: { padding: 7, color: 'green' },
          bubbleListItemContentStyle: { padding: 2, color: 'red' },
          bubbleListLeftItemContentStyle: { color: 'blue' },
          bubbleListRightItemContentStyle: { color: 'purple' },
        }}
        classNames={{
          content: 'short-content',
          bubbleListItemClassName: 'list-item',
          bubbleListItemContentClassName: 'legacy-content',
        }}
      />,
    );

    const userContent = screen
      .getByText('User message')
      .closest('[data-testid="message-content"]');
    const assistantContent = screen
      .getByText('Assistant message')
      .closest('[data-testid="message-content"]');
    expect(userContent?.closest('[data-bubble-list-item]')).toHaveClass(
      'list-item',
    );
    expect(userContent).toHaveClass('short-content');
    expect(userContent).not.toHaveClass('legacy-content');
    expect(userContent).toHaveStyle({ padding: '7px', color: 'purple' });
    expect(assistantContent).toHaveStyle({ padding: '7px', color: 'blue' });
  });

  it('updates short slots through the list and memoized Bubble without replacing rows', () => {
    const contentRender = vi.fn((props: BubbleProps) => (
      <p>{props.originData?.content}</p>
    ));
    const config = { ...bubbleRenderConfig, contentRender };
    const { rerender } = render(
      <BubbleList
        bubbleList={messages}
        bubbleRenderConfig={config}
        styles={{
          content: { padding: 3 },
          bubbleListRightItemContentStyle: { color: 'purple' },
        }}
        classNames={{
          content: 'old-content',
          bubbleListItemClassName: 'old-item',
        }}
      />,
    );
    const userRow = screen
      .getByText('User message')
      .closest('[data-bubble-list-item]');
    contentRender.mockClear();
    rerender(
      <BubbleList
        bubbleList={messages}
        bubbleRenderConfig={config}
        styles={{
          content: { padding: 9 },
          bubbleListRightItemContentStyle: { color: 'purple' },
        }}
        classNames={{
          content: 'new-content',
          bubbleListItemClassName: 'new-item',
        }}
      />,
    );

    const userContent = screen
      .getByText('User message')
      .closest('[data-testid="message-content"]');
    const assistantContent = screen
      .getByText('Assistant message')
      .closest('[data-testid="message-content"]');
    expect(userContent?.closest('[data-bubble-list-item]')).toBe(userRow);
    expect(userRow).toHaveClass('new-item');
    expect(userRow).not.toHaveClass('old-item');
    expect(userContent).toHaveClass('new-content');
    expect(userContent).not.toHaveClass('old-content');
    expect(userContent).toHaveStyle({ padding: '9px', color: 'purple' });
    expect(assistantContent).toHaveStyle({ padding: '9px' });
    expect(contentRender).toHaveBeenCalledTimes(2);
  });
});

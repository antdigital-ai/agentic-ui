import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { MessageBubbleData } from '../../type';
import { BubbleExtra } from '../BubbleExtra';

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({
    children,
    onClick,
    'data-testid': testId,
  }: {
    children: React.ReactNode | ((hovered: boolean) => React.ReactNode);
    onClick?: React.MouseEventHandler;
    'data-testid'?: string;
  }) => (
    <button data-testid={testId} onClick={onClick}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

vi.mock('../VoiceButton', () => ({
  VoiceButton: ({ text }: { text: string }) => (
    <span data-testid="voice">{text}</span>
  ),
}));

const originData: MessageBubbleData = {
  id: 'message',
  role: 'assistant',
  content: 'answer',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  extra: { preMessage: { content: 'question' } },
};

describe('memoized bubble actions follow live props', () => {
  it.each(['onLike', 'onDislike'] as const)(
    'calls the latest %s handler',
    (name) => {
      const first = vi.fn();
      const latest = vi.fn();
      const bubble = { originData };
      const { rerender } = render(
        <BubbleExtra bubble={bubble} {...{ [name]: first }} />,
      );
      rerender(<BubbleExtra bubble={bubble} {...{ [name]: latest }} />);
      fireEvent.click(
        screen.getByTestId(
          name === 'onLike' ? 'like-button' : 'dislike-button',
        ),
      );
      expect(latest).toHaveBeenCalledTimes(1);
      expect(first).not.toHaveBeenCalled();
    },
  );

  it('retries the latest previous message with the latest handler', () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(
      <BubbleExtra bubble={{ originData }} onReply={first} />,
    );
    rerender(
      <BubbleExtra
        bubble={{
          originData: {
            ...originData,
            extra: { preMessage: { content: 'updated question' } },
          },
        }}
        onReply={latest}
      />,
    );
    fireEvent.click(screen.getByTestId('reply-button'));
    expect(latest).toHaveBeenCalledWith('updated question');
    expect(first).not.toHaveBeenCalled();
  });

  it('shows voice after streaming completes without a final content change', () => {
    const { rerender } = render(
      <BubbleExtra
        shouldShowVoice
        bubble={{ originData: { ...originData, isFinished: false } }}
      />,
    );
    expect(screen.queryByTestId('voice')).not.toBeInTheDocument();
    rerender(<BubbleExtra shouldShowVoice bubble={{ originData }} />);
    expect(screen.getByTestId('voice')).toHaveTextContent('answer');
  });
});

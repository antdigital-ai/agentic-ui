import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleExtra } from '../BubbleExtra';

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));
vi.mock('../CopyButton', () => ({
  CopyButton: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children(false)}
    </button>
  ),
}));

describe('BubbleExtra residual branches', () => {
  it('uses onLikeCancel for an existing like', async () => {
    const onLikeCancel = vi.fn();
    render(
      <BubbleExtra
        bubble={{
          originData: { content: 'answer', feedback: 'thumbsUp', isFinished: true },
        } as any}
        readonly={false}
        onLikeCancel={onLikeCancel}
      />,
    );

    fireEvent.click(screen.getByTestId('like-button'));
    expect(onLikeCancel).toHaveBeenCalled();
  });

  it('passes the bubble to a functional shouldShowCopy predicate', () => {
    const shouldShowCopy = vi.fn(() => false);
    const bubble = { originData: { content: 'answer', isFinished: true } };
    render(
      <BubbleExtra
        bubble={bubble as any}
        readonly={false}
        shouldShowCopy={shouldShowCopy}
      />,
    );

    expect(shouldShowCopy).toHaveBeenCalledWith(bubble);
    expect(screen.queryByTestId('chat-item-copy-button')).toBeNull();
  });
});

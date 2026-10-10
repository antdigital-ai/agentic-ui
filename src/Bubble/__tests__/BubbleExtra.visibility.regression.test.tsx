import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleMessageDisplay } from '../MessagesContent';
import { BubbleExtra } from '../MessagesContent/BubbleExtra';
import type { MessageBubbleData } from '../type';
import type { BubbleExtraProps } from '../types/BubbleExtra';

vi.mock('../../MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <p>{content}</p>,
}));

const message: MessageBubbleData = {
  id: 'answer',
  role: 'assistant',
  content: 'Answer',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
};

describe('Bubble action visibility follows current configuration', () => {
  it('restores actions after an initially empty toolbar', () => {
    const { rerender } = render(
      <BubbleMessageDisplay
        content="Answer"
        originData={message}
        placement="left"
        readonly={false}
        shouldShowCopy={false}
      />,
    );
    expect(screen.queryByTestId('like-button')).toBeNull();
    rerender(
      <BubbleMessageDisplay
        content="Answer"
        originData={message}
        placement="left"
        readonly={false}
        shouldShowCopy={false}
        onLike={vi.fn()}
      />,
    );
    expect(screen.getByTestId('like-button')).toBeTruthy();
  });

  it('keeps custom right actions when all default actions are disabled', () => {
    render(
      <BubbleMessageDisplay
        content="Answer"
        originData={message}
        placement="left"
        shouldShowCopy={false}
        bubbleRenderConfig={{
          extraRightRender: () => <button>Custom action</button>,
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Custom action' })).toBeTruthy();
  });

  it('can replace an empty toolbar with a custom renderer', () => {
    const { rerender } = render(
      <BubbleMessageDisplay
        content="Answer"
        originData={message}
        placement="left"
        shouldShowCopy={false}
      />,
    );
    rerender(
      <BubbleMessageDisplay
        content="Answer"
        originData={message}
        placement="left"
        shouldShowCopy={false}
        bubbleRenderConfig={{ extraRender: () => <button>Replacement</button> }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Replacement' })).toBeTruthy();
  });

  it.each([
    {
      rightRender: () => <button>Custom action</button>,
      shouldShowCopy: false,
      empty: false,
    },
    { rightRender: false as const, shouldShowCopy: true, empty: true },
  ])(
    'reports actual rendered content for rightRender=$rightRender',
    ({ empty, ...props }) => {
      const notify = vi.fn();
      render(
        <BubbleExtra
          {...props}
          bubble={{ originData: message } as BubbleExtraProps['bubble']}
          onRenderExtraNull={notify}
        />,
      );
      expect(notify).toHaveBeenLastCalledWith(empty);
    },
  );

  it('does not create a toolbar for an empty custom fragment', () => {
    const notify = vi.fn();
    const { container } = render(
      <BubbleExtra
        bubble={{ originData: message } as BubbleExtraProps['bubble']}
        shouldShowCopy={false}
        rightRender={() => <>{null}</>}
        onRenderExtraNull={notify}
      />,
    );
    expect(container.children).toHaveLength(0);
    expect(notify).toHaveBeenLastCalledWith(true);
  });

  it('applies the extra semantic slot to the actual action container', () => {
    const { container } = render(
      <BubbleMessageDisplay
        content="Answer"
        originData={message}
        placement="left"
        styles={{ extra: { marginTop: 7 } }}
        classNames={{ extra: 'custom-extra' }}
      />,
    );
    expect(container.querySelector('.custom-extra')).toHaveStyle({
      marginTop: '7px',
    });
  });

  it('preserves semantic styling for custom render action slots', () => {
    const { container } = render(
      <BubbleExtra
        pure
        bubble={{ originData: message } as BubbleExtraProps['bubble']}
        className="slot-extra"
        style={{ gap: 12 }}
      />,
    );
    expect(container.querySelector('.slot-extra')).toHaveStyle({ gap: '12px' });
  });

  it('preserves custom right actions in custom bubble render slots', () => {
    render(
      <BubbleExtra
        pure
        bubble={{ originData: message }}
        shouldShowCopy={false}
        rightRender={() => <button>Custom slot action</button>}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Custom slot action' }),
    ).toBeTruthy();
  });

  it('respects disabled right actions in custom bubble render slots', () => {
    const { container } = render(
      <BubbleExtra pure bubble={{ originData: message }} rightRender={false} />,
    );
    expect(container.children).toHaveLength(0);
  });

  it.each([
    { content: 0 },
    { content: [<span key="a">First</span>, <span key="b">Second</span>] },
  ])(
    'renders non-string React content without parsing markdown: $content',
    ({ content }) => {
      const { container } = render(
        <BubbleMessageDisplay
          content={content}
          originData={{ ...message, isFinished: false }}
          placement="left"
          shouldShowCopy={false}
          bubbleRenderConfig={{ extraRender: false }}
        />,
      );
      expect(container.textContent).toBe(
        typeof content === 'number' ? '0' : 'FirstSecond',
      );
      expect(screen.queryByTestId('message-thinking-dots')).toBeNull();
    },
  );

  it('ignores missing entries alongside reference chunks', () => {
    render(
      <BubbleMessageDisplay
        content="Answer"
        originData={{
          ...message,
          extra: {
            white_box_process: [
              null,
              {
                output: {
                  chunks: [
                    { content: 'Reference', originUrl: '', docMeta: {} },
                  ],
                },
              },
            ],
          },
        }}
        placement="left"
        shouldShowCopy={false}
      />,
    );
    expect(screen.getByRole('button', { name: /引用内容/ })).toBeTruthy();
  });
});

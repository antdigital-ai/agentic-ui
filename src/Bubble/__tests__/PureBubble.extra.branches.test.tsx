import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PureBubble, PureUserBubble } from '../PureBubble';
import type { BubbleProps, MessageBubbleData } from '../type';

vi.mock('../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: { initValue?: string }) => (
    <div data-testid="md-editor">{initValue}</div>
  ),
}));

vi.mock('../MessagesContent/BubbleExtra', () => ({
  BubbleExtra: () => <div data-testid="bubble-extra" />,
}));

const origin = (over: Partial<MessageBubbleData> = {}): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isLast: true,
  meta: { title: 'Bot' },
  ...over,
});

const baseProps = (over: Partial<BubbleProps> = {}): BubbleProps => ({
  id: 'm1',
  originData: origin(),
  ...over,
});

describe('PureBubble 额外分支', () => {
  it('left placement 默认；loading 态', () => {
    render(
      <PureBubble
        {...baseProps({
          originData: origin({ isFinished: false, content: '' }),
        })}
      />,
    );
    expect(screen.getByTestId('chat-message')).toBeInTheDocument();
  });

  it('PureUserBubble 渲染用户消息', () => {
    render(
      <PureUserBubble
        {...baseProps({
          originData: origin({ role: 'user', content: 'user hi' }),
        })}
      />,
    );
    expect(screen.getByTestId('chat-message')).toBeInTheDocument();
  });

  it('avatarRender / titleRender 自定义', () => {
    render(
      <PureBubble
        {...baseProps({
          bubbleRenderConfig: {
            avatarRender: () => <div data-testid="av">A</div>,
            titleRender: () => <div data-testid="ti">T</div>,
          },
        })}
      />,
    );
    expect(screen.getByTestId('av')).toBeInTheDocument();
    expect(screen.getByTestId('ti')).toBeInTheDocument();
  });

  it.skip('onClick 透传', () => {
    const onClick = vi.fn();
    render(<PureBubble {...baseProps({ onClick })} />);
    fireEvent.click(screen.getByTestId('chat-message'));
    expect(onClick).toHaveBeenCalled();
  });
});

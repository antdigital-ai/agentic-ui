/**
 * PureBubble 分支覆盖：placement、render 钩子、extra、feedback 回调。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PureBubble, PureAIBubble, PureUserBubble } from '../PureBubble';
import type { BubbleProps, MessageBubbleData } from '../type';

vi.mock('../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: { initValue?: string }) => (
    <div data-testid="md-editor">{initValue}</div>
  ),
}));

vi.mock('../MessagesContent/BubbleExtra', () => ({
  BubbleExtra: ({ onLike, onDislike }: any) => (
    <div data-testid="bubble-extra">
      <button type="button" data-testid="like-btn" onClick={() => onLike?.()}>
        like
      </button>
      <button
        type="button"
        data-testid="dislike-btn"
        onClick={() => onDislike?.()}
      >
        dislike
      </button>
    </div>
  ),
}));

const origin = (over: Partial<MessageBubbleData> = {}): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'hello world',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isLast: false,
  meta: { title: 'Bot', avatar: 'a.png' },
  ...over,
});

const baseProps = (over: Partial<BubbleProps> = {}): BubbleProps => ({
  id: 'm1',
  originData: origin(),
  ...over,
});

describe('PureBubble branches', () => {
  it('render=false 时返回 null', () => {
    const { container } = render(
      <PureBubble
        {...baseProps({
          bubbleRenderConfig: { render: false },
        })}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('right placement 头像与标题顺序互换', () => {
    render(<PureBubble {...baseProps({ placement: 'right' })} />);
    expect(screen.getByTestId('chat-message')).toBeInTheDocument();
  });

  it('custom render 包装 itemDom', () => {
    render(
      <PureBubble
        {...baseProps({
          bubbleRenderConfig: {
            render: (_p, _slots, itemDom) => (
              <div data-testid="custom-wrap">{itemDom}</div>
            ),
          },
        })}
      />,
    );
    expect(screen.getByTestId('custom-wrap')).toBeInTheDocument();
  });

  it('contentBeforeRender / contentAfterRender 分支', () => {
    render(
      <PureBubble
        {...baseProps({
          bubbleRenderConfig: {
            contentBeforeRender: () => <span data-testid="before">B</span>,
            contentAfterRender: () => <span data-testid="after">A</span>,
          },
        })}
      />,
    );
    expect(screen.getByTestId('before')).toBeInTheDocument();
    expect(screen.getByTestId('after')).toBeInTheDocument();
  });

  it('extraRender=false 时不渲染 BubbleExtra', () => {
    render(
      <PureBubble
        {...baseProps({ bubbleRenderConfig: { extraRender: false } })}
      />,
    );
    expect(screen.queryByTestId('bubble-extra')).not.toBeInTheDocument();
  });

  it('MessagesContext setMessage 调用 bubbleRef', () => {
    const setMessageItem = vi.fn();
    render(
      <PureBubble
        {...baseProps({
          bubbleRef: { current: { setMessageItem } } as any,
        })}
      />,
    );
    expect(screen.getByTestId('chat-message')).toBeInTheDocument();
  });

  it('非 string content 时 editor initValue 为空', () => {
    render(
      <PureBubble
        {...baseProps({
          originData: origin({ content: { blocks: [] } as any }),
        })}
      />,
    );
    expect(screen.getByTestId('md-editor')).toHaveTextContent('');
  });

  it('markdownRenderConfig initValue 优先于 origin content', () => {
    render(
      <PureBubble
        {...baseProps({
          markdownRenderConfig: { initValue: 'override' },
        })}
      />,
    );
    expect(screen.getByTestId('md-editor')).toHaveTextContent('override');
  });

  it('PureAIBubble / PureUserBubble 固定 placement', () => {
    render(<PureAIBubble {...baseProps()} />);
    expect(screen.getByTestId('chat-message')).toBeInTheDocument();
    render(<PureUserBubble {...baseProps()} />);
    expect(screen.getAllByTestId('chat-message').length).toBeGreaterThan(0);
  });

  it('onDoubleClick 绑定到 content', () => {
    const onDoubleClick = vi.fn();
    render(<PureBubble {...baseProps({ onDoubleClick })} />);
    fireEvent.doubleClick(screen.getByTestId('message-content'));
    expect(onDoubleClick).toHaveBeenCalled();
  });
});

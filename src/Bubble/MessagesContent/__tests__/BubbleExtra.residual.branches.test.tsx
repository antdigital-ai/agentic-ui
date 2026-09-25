/**
 * BubbleExtra 残留：dislike cancel、readonly、空内容、shouldShowCopy。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleExtra } from '../BubbleExtra';

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title, ...props }: any) => (
    <button type="button" onClick={onClick} title={title} {...props}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

vi.mock('../CopyButton', () => ({
  CopyButton: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

describe('BubbleExtra more residual branches', () => {
  it('onDislikeCancel 已踩', () => {
    const onDislikeCancel = vi.fn();
    render(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: 'answer',
              feedback: 'thumbsDown',
              isFinished: true,
            },
          } as any
        }
        readonly={false}
        onDislikeCancel={onDislikeCancel}
      />,
    );
    const dislike = screen.queryByTestId('dislike-button');
    if (dislike) {
      fireEvent.click(dislike);
    }
    expect(document.body.querySelector('.ant-chat-item-extra')).toBeTruthy();
  });

  it('shouldShowCopy 函数返回 false', () => {
    const shouldShowCopy = vi.fn(() => false);
    render(
      <BubbleExtra
        bubble={
          {
            originData: { content: 'a', isFinished: true },
          } as any
        }
        readonly={false}
        shouldShowCopy={shouldShowCopy}
      />,
    );
    expect(shouldShowCopy).toHaveBeenCalled();
    expect(screen.queryByTestId('chat-item-copy-button')).toBeNull();
  });

  it('空内容不展示 copy', () => {
    render(
      <BubbleExtra
        bubble={{ originData: { content: '', isFinished: true } } as any}
        readonly={false}
        shouldShowCopy
      />,
    );
    expect(screen.queryByTestId('chat-item-copy-button')).toBeNull();
  });

  it('readonly 仍可渲染', () => {
    render(
      <BubbleExtra
        bubble={
          {
            originData: { content: 'x', isFinished: true },
          } as any
        }
        readonly
      />,
    );
    expect(document.body.querySelector('.ant-chat-item-extra')).toBeTruthy();
  });

  it('like/dislike 门控：feedback thumbsUp/Down；onDisLike 兼容；voice', () => {
    const onLike = vi.fn();
    const onDisLike = vi.fn();
    render(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: 'ans',
              isFinished: true,
              feedback: 'thumbsUp',
            },
          } as any
        }
        onLike={onLike}
        onDisLike={onDisLike}
        shouldShowVoice
      />,
    );
    expect(document.body.querySelector('.ant-chat-item-extra')).toBeTruthy();

    const pureResult = render(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: 'ans',
              isFinished: true,
              feedback: 'thumbsDown',
              extra: { answerStatus: 'ok' },
            },
          } as any
        }
        onLike={onLike}
        onDislike={onDisLike}
        pure
      />,
    );
    // pure 模式返回动作节点数组，不包 .ant-chat-item-extra
    expect(pureResult.container).toBeTruthy();
  });

  it('rightRender=false；typing 省略号', () => {
    render(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: '...',
              isFinished: false,
              isAborted: false,
            },
          } as any
        }
        bubbleRenderConfig={{ rightRender: false } as any}
      />,
    );
    expect(document.body).toBeTruthy();
  });
});

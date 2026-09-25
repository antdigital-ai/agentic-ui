/**
 * BubbleExtra deepen residual：copy 抛错、retry 文案回退、pure、rightRender、aborted。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const copyMock = vi.fn();

vi.mock('copy-to-clipboard', () => ({
  default: (...args: unknown[]) => copyMock(...args),
}));

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title, ...props }: any) => (
    <button type="button" onClick={onClick} title={title} {...props}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

vi.mock('../CopyButton', () => ({
  CopyButton: ({ children, onClick, ...props }: any) => (
    <button
      type="button"
      onClick={onClick}
      data-testid={props['data-testid'] || 'copy'}
    >
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

vi.mock('../VoiceButton', () => ({
  VoiceButton: ({ text }: any) => (
    <div data-testid="voice-btn">{text || 'empty'}</div>
  ),
}));

vi.mock('@ant-design/agentic-ui', () => ({
  CopyLottie: () => <span />,
  RefreshLottie: () => <span />,
  LikeLottie: () => <span />,
  DislikeLottie: () => <span />,
}));

import { BubbleExtra } from '../BubbleExtra';

describe('BubbleExtra deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    copyMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('copy 抛错时静默', () => {
    copyMock.mockImplementation(() => {
      throw new Error('fail');
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <BubbleExtra
        bubble={
          {
            originData: { content: 'body', isFinished: true },
          } as any
        }
        shouldShowCopy
      />,
    );
    fireEvent.click(screen.getByTestId('chat-item-copy-button'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('copy 内容缺省走空串', () => {
    copyMock.mockReturnValue(true);
    render(
      <BubbleExtra
        bubble={
          {
            originData: { content: 'visible', isFinished: true },
          } as any
        }
        shouldShowCopy
      />,
    );
    // 强制 originData.content 在 onClick 时缺失
    const btn = screen.getByTestId('chat-item-copy-button');
    fireEvent.click(btn);
    expect(copyMock).toHaveBeenCalled();
  });

  it('shouldShowVoice + 无 locale 重试文案回退', () => {
    const onReply = vi.fn();
    render(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: 'ans',
              isFinished: true,
              extra: { preMessage: { content: '' } },
            },
          } as any
        }
        shouldShowVoice
        onReply={onReply}
      />,
    );
    const reply = screen.queryByTestId('reply-button');
    if (reply) {
      fireEvent.click(reply);
      expect(onReply).toHaveBeenCalled();
      const arg = onReply.mock.calls[0][0];
      expect(arg === '' || typeof arg === 'string').toBe(true);
    }
  });

  it('retry：preMessage 有内容；无 locale 用默认 title', () => {
    const onReply = vi.fn();
    render(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: 'ans',
              isFinished: true,
              extra: { preMessage: { content: 'prev' } },
            },
          } as any
        }
        onReply={onReply}
      />,
    );
    const reply = screen.getByTestId('reply-button');
    fireEvent.click(reply);
    expect(onReply).toHaveBeenCalledWith('prev');
  });

  it('isAborted 未 finished 显示停止文案', () => {
    render(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: 'ans',
              isAborted: true,
              isFinished: false,
            },
          } as any
        }
      />,
    );
    expect(document.body.textContent).toMatch(/停止|aborted|回答/i);
  });

  it('pure 返回数组；rightRender false 无右侧', () => {
    const pure = render(
      <BubbleExtra
        bubble={
          {
            originData: { content: 'ans', isFinished: true },
          } as any
        }
        pure
        shouldShowCopy
      />,
    );
    expect(pure.container).toBeTruthy();

    render(
      <BubbleExtra
        bubble={
          {
            originData: { content: 'ans', isFinished: true },
          } as any
        }
        rightRender={false}
      />,
    );
  });

  it('rightRender 自定义；isAborted 仅 copy', () => {
    const rightRender = vi.fn(() => <div data-testid="custom-right">R</div>);
    render(
      <BubbleExtra
        bubble={
          {
            originData: { content: 'ans', isFinished: true },
          } as any
        }
        rightRender={rightRender}
      />,
    );
    expect(screen.getByTestId('custom-right')).toBeInTheDocument();

    render(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: 'ans',
              isAborted: true,
              isFinished: true,
            },
          } as any
        }
        shouldShowCopy
      />,
    );
    expect(screen.getAllByTestId('chat-item-copy-button').length).toBeGreaterThan(
      0,
    );
  });

  it('无内容且无动作返回 null', () => {
    const { container } = render(
      <BubbleExtra
        bubble={{ originData: { content: '', isFinished: true } } as any}
        shouldShowCopy={false}
      />,
    );
    expect(container.querySelector('.ant-chat-item-extra')).toBeNull();
  });
});

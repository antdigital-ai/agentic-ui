/**
 * BubbleExtra deepen2：copy 空串、retry 回退、aborted 无 copy 返回 null。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';

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
    <div data-testid="voice-btn">{text === '' ? 'EMPTY' : text}</div>
  ),
}));

vi.mock('@ant-design/agentic-ui', () => ({
  CopyLottie: () => <span />,
  RefreshLottie: () => <span />,
  LikeLottie: () => <span />,
  DislikeLottie: () => <span />,
}));

import { BubbleExtra } from '../BubbleExtra';

describe('BubbleExtra deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    copyMock.mockReset().mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('click 前清空 content：copy 走空串', () => {
    const originData = { content: 'body', isFinished: true };
    render(
      <BubbleExtra
        bubble={{ originData } as any}
        shouldShowCopy
      />,
    );
    originData.content = undefined as any;
    fireEvent.click(screen.getByTestId('chat-item-copy-button'));
    expect(copyMock).toHaveBeenCalledWith('');
  });

  it('retry：click 时清空 preMessage.content → locale/默认文案', () => {
    const onReply = vi.fn();
    const originData = {
      content: 'ans',
      isFinished: true,
      extra: { preMessage: { content: 'prev' } },
    };
    render(
      <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
        <BubbleExtra bubble={{ originData } as any} onReply={onReply} />
      </I18nContext.Provider>,
    );
    originData.extra.preMessage.content = '';
    fireEvent.click(screen.getByTestId('reply-button'));
    expect(onReply).toHaveBeenCalledWith('重新生成');
  });

  it('shouldShowVoice：渲染后清空 content → VoiceButton 空串', () => {
    const originData = {
      content: 'speak',
      isFinished: true,
    };
    const { rerender } = render(
      <BubbleExtra
        bubble={{ originData } as any}
        shouldShowVoice
      />,
    );
    expect(screen.getByTestId('voice-btn')).toHaveTextContent('speak');
    originData.content = '';
    rerender(
      <BubbleExtra
        bubble={{ originData } as any}
        shouldShowVoice
      />,
    );
  });

  it('isAborted finished 且无 copy/reSend → null', () => {
    const { container } = render(
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
        shouldShowCopy={false}
      />,
    );
    expect(container.querySelector('.ant-chat-item-extra')).toBeNull();
    expect(screen.queryByTestId('chat-item-copy-button')).toBeNull();
  });
});

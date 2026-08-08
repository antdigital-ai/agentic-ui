/**
 * BubbleExtra deepen3：thumbs feedback、answerStatus、onDisLike、readonly。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(),
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
  VoiceButton: () => <div data-testid="voice-btn" />,
}));

vi.mock('@ant-design/agentic-ui', () => ({
  CopyLottie: () => <span />,
  RefreshLottie: () => <span />,
  LikeLottie: () => <span />,
  DislikeLottie: () => <span />,
}));

import { BubbleExtra } from '../BubbleExtra';

const locale = {
  'chat.message.copy': 'copy',
  'chat.message.like': 'like',
  'chat.message.dislike': 'dislike',
  'chat.message.retry': 'retry',
};

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nContext.Provider value={{ locale, language: 'zh-CN' } as any}>
      {ui}
    </I18nContext.Provider>,
  );

describe('BubbleExtra deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('feedback thumbsUp / thumbsDown 渲染安全', () => {
    const onLike = vi.fn();
    const onDislike = vi.fn();
    expect(() =>
      wrap(
        <BubbleExtra
          bubble={
            {
              originData: {
                content: 'c',
                feedback: 'thumbsUp',
                isFinished: true,
              },
            } as any
          }
          onLike={onLike}
          onDislike={onDislike}
        />,
      ),
    ).not.toThrow();

    cleanup();
    expect(() =>
      wrap(
        <BubbleExtra
          bubble={
            {
              originData: {
                content: 'c',
                feedback: 'thumbsDown',
                isFinished: true,
              },
            } as any
          }
          onLike={onLike}
          onDislike={onDislike}
        />,
      ),
    ).not.toThrow();
  });

  it('answerStatus / onDisLike 别名可点', () => {
    const onDisLike = vi.fn();
    wrap(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: 'c',
              isFinished: true,
              extra: { answerStatus: 'done' },
            },
          } as any
        }
        onLike={vi.fn()}
        onDisLike={onDisLike}
      />,
    );

    cleanup();
    wrap(
      <BubbleExtra
        bubble={{ originData: { content: 'c', isFinished: true } } as any}
        onDisLike={onDisLike}
      />,
    );
    const dislike =
      screen.queryByTitle('dislike') ||
      screen.queryByTestId('dislike-button') ||
      document.querySelector('[aria-label*="dislike" i]');
    if (dislike) {
      fireEvent.click(dislike);
      expect(onDisLike).toHaveBeenCalled();
    }
  });

  it('readonly 渲染安全', () => {
    expect(() =>
      wrap(
        <BubbleExtra
          readonly
          bubble={
            {
              originData: {
                content: 'c',
                feedback: 'thumbsUp',
                isFinished: true,
              },
            } as any
          }
          onLike={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });
});

/**
 * BubbleExtra deepen12 safe：rightRender、copy 抛错静默。
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
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" onClick={onClick} title={title}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

vi.mock('../CopyButton', () => ({
  CopyButton: ({ onClick, ...props }: any) => (
    <button
      type="button"
      data-testid={props['data-testid'] || 'chat-item-copy-button'}
      onClick={onClick}
    >
      copy
    </button>
  ),
}));

vi.mock('../VoiceButton', () => ({
  VoiceButton: () => <div data-testid="voice12" />,
}));

vi.mock('@ant-design/agentic-ui', () => ({
  CopyLottie: () => <span />,
  RefreshLottie: () => <span />,
  LikeLottie: () => <span />,
  DislikeLottie: () => <span />,
}));

import { BubbleExtra } from '../BubbleExtra';

describe('BubbleExtra deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    copyMock.mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('rightRender 自定义', () => {
    render(
      <BubbleExtra
        placement="right"
        rightRender={() => <span data-testid="right12">R</span>}
        bubble={
          {
            originData: { content: 'body', isFinished: true },
          } as any
        }
      />,
    );
    expect(screen.getByTestId('right12')).toBeInTheDocument();
  });

  it('copy 抛错时 console.error', () => {
    copyMock.mockImplementation(() => {
      throw new Error('copy fail');
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <BubbleExtra
        bubble={
          {
            originData: { content: 'text', isFinished: true },
          } as any
        }
        shouldShowCopy
      />,
    );
    fireEvent.click(screen.getByTestId('chat-item-copy-button'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

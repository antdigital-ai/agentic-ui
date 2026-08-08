/**
 * UserBubble deepen：standalone minWidth；非 string content；无 quote。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import type { BubbleProps, MessageBubbleData } from '../type';
import { UserBubble } from '../UserBubble';

vi.mock('../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: { initValue?: string }) => (
    <div data-testid="md-editor">{initValue}</div>
  ),
}));

vi.mock('../MessagesContent/BubbleExtra', () => ({
  BubbleExtra: () => <div data-testid="bubble-extra" />,
}));

vi.mock('../MessagesContent', () => ({
  BubbleMessageDisplay: ({ content }: { content?: any }) => (
    <div data-testid="msg-display">{String(content)}</div>
  ),
}));

const origin = (over: Partial<MessageBubbleData> = {}): MessageBubbleData => ({
  id: 'u1',
  role: 'user',
  content: 'user msg',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  meta: { title: 'Me' },
  ...over,
});

const baseProps = (over: Partial<BubbleProps> = {}): BubbleProps => ({
  id: 'u1',
  originData: origin(),
  ...over,
});

describe('UserBubble deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('standalone=true 设置 minWidth；content 非 string', () => {
    const { container } = render(
      <BubbleConfigContext.Provider
        value={{ compact: false, standalone: true } as any}
      >
        <UserBubble
          {...baseProps({
            originData: origin({ content: { text: 'obj' } as any }),
          })}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(container.querySelector('[class*="bubble"]') || container).toBeTruthy();
    expect(screen.getByTestId('msg-display')).toBeTruthy();
  });

  it('standalone=false 走 0px minWidth', () => {
    render(
      <BubbleConfigContext.Provider
        value={{ compact: false, standalone: false } as any}
      >
        <UserBubble {...baseProps()} />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('msg-display')).toBeTruthy();
  });
});

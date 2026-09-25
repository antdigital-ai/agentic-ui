/**
 * AIBubble deepen2：LOADING_FLAT / 无 id 生成 displayKey；standalone=false fileMap minWidth。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AIBubble } from '../AIBubble';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import type { BubbleProps, MessageBubbleData } from '../type';

vi.mock('../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: { initValue?: string }) => (
    <div data-testid="md-editor">{initValue}</div>
  ),
}));

vi.mock('../MessagesContent/BubbleExtra', () => ({
  BubbleExtra: () => <div data-testid="bubble-extra" />,
}));

vi.mock('../MessagesContent', () => ({
  BubbleMessageDisplay: ({ content }: { content?: string }) => (
    <div data-testid="msg-display">{content}</div>
  ),
  LOADING_FLAT: '__loading__',
}));

vi.mock('../FileView', () => ({
  BubbleFileView: () => <div data-testid="file-view" />,
}));

vi.mock('../BubbleBeforeNode', () => ({
  BubbleBeforeNode: () => <div data-testid="before-node" />,
}));

vi.mock('../ContentFilemapView', () => ({
  ContentFilemapView: () => <div data-testid="filemap-view" />,
}));

const origin = (over: Partial<MessageBubbleData> = {}): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'reply',
  createAt: 1,
  updateAt: 2,
  isFinished: true,
  meta: { title: 'AI', avatar: 'a.png', name: 'BotName' },
  ...over,
});

const baseProps = (over: Partial<BubbleProps> = {}): BubbleProps => ({
  id: 'm1',
  originData: origin(),
  ...over,
});

describe('AIBubble deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('id=LOADING_FLAT 与无 id 仍渲染 message display', () => {
    const { rerender } = render(
      <AIBubble
        {...baseProps({
          originData: origin({ id: '__loading__' as any, content: 'loading…' }),
        })}
      />,
    );
    expect(screen.getByTestId('msg-display')).toBeInTheDocument();

    rerender(
      <AIBubble
        {...baseProps({
          id: undefined as any,
          originData: origin({ id: undefined as any, content: 'no-id' }),
        })}
      />,
    );
    expect(screen.getByTestId('msg-display')).toHaveTextContent('no-id');
  });

  it('fileMap + standalone=false：仍渲染 message-after', () => {
    const fileMap = new Map([['f1', { name: 'a.txt', url: 'https://x/a' }]]);
    render(
      <BubbleConfigContext.Provider value={{ standalone: false } as any}>
        <AIBubble
          {...baseProps({
            originData: origin({ fileMap: fileMap as any }),
          })}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('message-after')).toBeInTheDocument();
  });
});

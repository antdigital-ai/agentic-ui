/**
 * PureBubble deepen2：无 BubbleConfigContext 解构回退；onLike 失败日志。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PureBubble } from '../PureBubble';
import type { BubbleProps, MessageBubbleData } from '../type';

vi.mock('../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: { initValue?: string }) => (
    <div data-testid="md-editor">{initValue}</div>
  ),
}));

vi.mock('../MessagesContent/BubbleExtra', () => ({
  BubbleExtra: ({
    onLike,
  }: {
    onLike?: () => void | Promise<void>;
  }) => (
    <div data-testid="bubble-extra">
      <button type="button" data-testid="like-btn" onClick={() => onLike?.()}>
        like
      </button>
    </div>
  ),
}));

const origin = (over: Partial<MessageBubbleData> = {}): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'hello bubble',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  meta: { title: 'Bot', avatar: 'a.png', name: 'BotName' },
  ...over,
});

const baseProps = (over: Partial<BubbleProps> = {}): BubbleProps => ({
  id: 'm1',
  originData: origin(),
  ...over,
});

describe('PureBubble deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 BubbleConfigContext；onLike 失败打日志', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ConfigProvider>
        <PureBubble
          {...baseProps({
            onLike: vi.fn().mockRejectedValue(new Error('like-fail')),
            bubbleRenderConfig: {
              render: (_p, slots) => (
                <div data-testid="render-wrap">{slots.extra}</div>
              ),
            },
          })}
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByTestId('like-btn'));
    await Promise.resolve();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('placement 缺省 left；content 非 string 走空 init', () => {
    render(
      <ConfigProvider>
        <PureBubble
          {...baseProps({
            placement: undefined,
            originData: origin({ content: { nested: true } as any }),
          })}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('md-editor')).toBeInTheDocument();
  });
});

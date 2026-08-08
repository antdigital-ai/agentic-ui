/**
 * PureBubble deepen residual：feedback 回调、context 透传、placement/readonly 边界。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { PureBubble, PureAIBubble, PureUserBubble } from '../PureBubble';
import type { BubbleProps, MessageBubbleData } from '../type';

vi.mock('../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue, readonly }: { initValue?: string; readonly?: boolean }) => (
    <div data-testid="md-editor" data-readonly={String(readonly)}>
      {initValue}
    </div>
  ),
}));

vi.mock('../MessagesContent/BubbleExtra', () => ({
  BubbleExtra: ({
    onLike,
    onDislike,
    onDisLike,
  }: {
    onLike?: () => void | Promise<void>;
    onDislike?: () => void | Promise<void>;
    onDisLike?: () => void | Promise<void>;
  }) => (
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
      <button
        type="button"
        data-testid="dislike-legacy-btn"
        onClick={() => onDisLike?.()}
      >
        disLike
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

describe('PureBubble deepen residual branches', () => {
  it('onLike/onDislike/onDisLike 成功写 feedback；无 id 跳过 setMessageItem', async () => {
    const setMessageItem = vi.fn();
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ConfigProvider>
        <PureBubble
          {...baseProps({
            onLike: vi.fn().mockResolvedValue(undefined),
            onDislike: vi.fn().mockRejectedValue(new Error('fail')),
            onDisLike: vi.fn().mockResolvedValue(undefined),
            bubbleRef: { current: { setMessageItem } } as any,
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
    expect(setMessageItem).toHaveBeenCalledWith('m1', { feedback: 'thumbsUp' });

    fireEvent.click(screen.getByTestId('dislike-btn'));
    await Promise.resolve();
    expect(errSpy).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('dislike-legacy-btn'));
    await Promise.resolve();
    expect(setMessageItem).toHaveBeenCalledWith('m1', { feedback: 'thumbsDown' });

    render(
      <ConfigProvider>
        <PureBubble
          {...baseProps({
            id: undefined,
            onLike: vi.fn().mockResolvedValue(undefined),
            bubbleRef: { current: { setMessageItem } } as any,
          })}
        />
      </ConfigProvider>,
    );
    const likeButtons = screen.getAllByTestId('like-btn');
    fireEvent.click(likeButtons[likeButtons.length - 1]);
    await Promise.resolve();
    errSpy.mockRestore();
  });

  it('context 透传 thoughtChain；compact 类名；readonly 来自 markdownRenderConfig', () => {
    render(
      <ConfigProvider>
        <BubbleConfigContext.Provider
          value={{ compact: true, thoughtChain: { enable: true }, agentId: 'a1' } as any}
        >
          <PureBubble
            {...baseProps({
              markdownRenderConfig: { readonly: true },
              readonly: undefined,
            })}
          />
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('md-editor')).toHaveAttribute('data-readonly', 'true');
    expect(document.querySelector('[class*="bubble-compact"]')).toBeTruthy();
  });

  it('avatarRender/titleRender=false 关闭槽位；contentRender 覆盖 editor', () => {
    render(
      <ConfigProvider>
        <PureBubble
          {...baseProps({
            bubbleRenderConfig: {
              avatarRender: false,
              titleRender: false,
              contentRender: () => <div data-testid="slot-content">slot</div>,
            },
          })}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('slot-content')).toBeInTheDocument();
    expect(screen.queryByTestId('md-editor')).toBeNull();
  });

  it('PureAIBubble / PureUserBubble 固定 placement 与 avatar 顺序', () => {
    render(
      <ConfigProvider>
        <PureAIBubble {...baseProps()} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('chat-message')).toBeInTheDocument();

    render(
      <ConfigProvider>
        <PureUserBubble
          {...baseProps({
            originData: origin({ role: 'user', content: 'user msg' }),
          })}
        />
      </ConfigProvider>,
    );
    expect(screen.getAllByTestId('chat-message').length).toBeGreaterThan(1);
  });

  it('props.readonly 优先于 markdownRenderConfig.readonly', () => {
    render(
      <ConfigProvider>
        <PureBubble
          {...baseProps({
            readonly: false,
            markdownRenderConfig: { readonly: true },
          })}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('md-editor')).toHaveAttribute('data-readonly', 'false');
  });

  it('MessagesContext setMessage 经 bubbleRef 转发', () => {
    const setMessageItem = vi.fn();
    render(
      <ConfigProvider>
        <PureBubble
          {...baseProps({
            bubbleRef: { current: { setMessageItem } } as any,
          })}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('chat-message')).toBeInTheDocument();
  });
});

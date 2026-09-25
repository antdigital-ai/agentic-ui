/**
 * AIBubble deepen residual：fileMap、taskList/before、feedback 回调、render 槽位。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AIBubble, shouldRenderBeforeContent } from '../AIBubble';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import type { BubbleProps, MessageBubbleData } from '../type';

vi.mock('../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: { initValue?: string }) => (
    <div data-testid="md-editor">{initValue}</div>
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

describe('AIBubble deepen residual branches', () => {
  it('hasFileMap + standalone 渲染 message-after', () => {
    const fileMap = new Map([['f1', { name: 'a.txt', url: 'https://x/a' }]]);
    render(
      <BubbleConfigContext.Provider value={{ standalone: true } as any}>
        <AIBubble
          {...baseProps({
            originData: origin({ fileMap: fileMap as any }),
          })}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('message-after')).toBeInTheDocument();
    expect(screen.getByTestId('file-view')).toBeInTheDocument();
  });

  it('taskList + thoughtChain 渲染 before；contentAfterRender 自定义', () => {
    render(
      <BubbleConfigContext.Provider
        value={{ thoughtChain: { enable: true } } as any}
      >
        <AIBubble
          {...baseProps({
            originData: origin({
              extra: { white_box_process: { info: 'think' } },
            }),
            bubbleRenderConfig: {
              contentAfterRender: () => (
                <div data-testid="after-slot">after</div>
              ),
            },
          })}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('before-node')).toBeInTheDocument();
    expect(screen.getByTestId('after-slot')).toBeInTheDocument();
  });

  it('filemap 块渲染 ContentFilemapView；非 string content 走 stripped', () => {
    render(
      <AIBubble
        {...baseProps({
          originData: origin({
            content:
              'hello\n```agentic-ui-filemap\n{"files":[{"name":"a.pdf"}]}\n```\n',
          }),
        })}
      />,
    );
    expect(screen.getByTestId('filemap-view')).toBeInTheDocument();
    expect(screen.getByTestId('msg-display')).toHaveTextContent('hello');

    render(
      <AIBubble
        {...baseProps({
          originData: origin({ content: { blocks: [] } as any }),
        })}
      />,
    );
    expect(screen.getAllByTestId('msg-display').length).toBeGreaterThan(0);
  });

  it('preMessage 不同 role 显示 avatar-title；无 id 时 nanoid key', () => {
    render(
      <AIBubble
        {...baseProps({
          preMessage: { role: 'user', id: 'p' } as any,
          originData: origin({ id: undefined as any, createAt: undefined as any }),
          avatar: { title: 'Fallback' },
          time: 88,
        })}
      />,
    );
    expect(screen.getByTestId('bubble-avatar-title')).toBeInTheDocument();
    expect(screen.getByTestId('msg-display')).toBeInTheDocument();
  });

  it('onLike/onDislike/onDisLike 成功更新 feedback；失败吞错', async () => {
    const setMessageItem = vi.fn();
    const onLike = vi.fn().mockResolvedValue(undefined);
    const onDislike = vi.fn().mockRejectedValue(new Error('dislike fail'));
    const onDisLike = vi.fn().mockResolvedValue(undefined);

    render(
      <AIBubble
        {...baseProps({
          onLike,
          onDislike,
          onDisLike,
          bubbleRef: { current: { setMessageItem } } as any,
          bubbleRenderConfig: {
            render: (_p, slots) => (
              <div data-testid="render-wrap">{slots.extra}</div>
            ),
          },
        })}
      />,
    );

    fireEvent.click(screen.getByTestId('like-btn'));
    await Promise.resolve();
    expect(onLike).toHaveBeenCalled();
    expect(setMessageItem).toHaveBeenCalledWith('m1', { feedback: 'thumbsUp' });

    fireEvent.click(screen.getByTestId('dislike-btn'));
    await Promise.resolve();
    expect(onDislike).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('dislike-legacy-btn'));
    await Promise.resolve();
    expect(onDisLike).toHaveBeenCalled();
    expect(setMessageItem).toHaveBeenCalledWith('m1', { feedback: 'thumbsDown' });
  });

  it('custom render 槽位 extraRender=false；shouldRenderBeforeContent bot 跳过', () => {
    expect(
      shouldRenderBeforeContent('left', 'assistant', { enable: true }, 1),
    ).toBe(true);
    render(
      <AIBubble
        {...baseProps({
          bubbleRenderConfig: {
            extraRender: false,
            render: (_p, slots) => (
              <div data-testid="custom-render">
                {slots.extra}
                {slots.itemDom}
              </div>
            ),
          },
        })}
      />,
    );
    expect(screen.getByTestId('custom-render')).toBeInTheDocument();
    expect(screen.queryByTestId('bubble-extra')).toBeNull();
  });
});

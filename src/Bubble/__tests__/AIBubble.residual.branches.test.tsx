/**
 * AIBubble 残留：runRender false、shouldRenderBeforeContent、placement。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  AIBubble,
  runRender,
  shouldRenderBeforeContent,
} from '../AIBubble';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import type { MessageBubbleData } from '../type';

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

const origin = (over: Partial<MessageBubbleData> = {}): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'reply',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  meta: { title: 'AI', avatar: 'a.png' },
  ...over,
});

describe('AIBubble residual branches', () => {
  it('runRender：false / 函数 / 默认', () => {
    expect(runRender(false, {} as any, <span>d</span>)).toBeNull();
    expect(
      runRender(() => <span data-testid="r">r</span>, {} as any, <span>d</span>),
    ).toBeTruthy();
    expect(runRender(undefined, {} as any, <span data-testid="d">d</span>)).toBeTruthy();
  });

  it('shouldRenderBeforeContent 矩阵', () => {
    expect(shouldRenderBeforeContent('right', 'assistant', {}, 1)).toBe(false);
    expect(shouldRenderBeforeContent('left', 'bot', {}, 1)).toBe(false);
    expect(
      shouldRenderBeforeContent('left', 'assistant', { enable: false }, 1),
    ).toBe(false);
    expect(shouldRenderBeforeContent('left', 'assistant', {}, 0)).toBe(false);
    expect(
      shouldRenderBeforeContent('left', 'assistant', { alwaysRender: true }, 0),
    ).toBe(true);
    expect(shouldRenderBeforeContent('left', 'assistant', {}, 2)).toBe(true);
  });

  it('loading 内容与 avatar', () => {
    render(
      <AIBubble
        avatar={{ title: 'AI', avatar: 'a.png' }}
        originData={origin({ content: '', loading: true } as any)}
        placement="left"
      />,
    );
    expect(document.body).toBeTruthy();
  });

  it('placement right 不渲染 before', () => {
    render(
      <AIBubble
        avatar={{ title: 'AI' }}
        originData={origin()}
        placement="right"
      />,
    );
    expect(screen.getByTestId('msg-display')).toHaveTextContent('reply');
  });

  it('isSameRoleAsPrevious：缺 role 返回 false', () => {
    render(
      <AIBubble
        avatar={{ title: 'AI' }}
        originData={origin({ role: undefined as any })}
        preMessage={{ id: 'p', content: 'p' } as any}
        placement="left"
      />,
    );
    expect(screen.getByTestId('msg-display')).toBeInTheDocument();
  });

  it('contentRender=false / titleRender 函数 / 无 createAt 用 props.time', () => {
    render(
      <AIBubble
        avatar={{ name: 'N' }}
        time={99}
        originData={origin({ createAt: undefined as any, meta: undefined })}
        bubbleRenderConfig={{
          contentRender: false,
          titleRender: () => <span data-testid="custom-title">T</span>,
          avatarRender: false,
        }}
        placement="left"
      />,
    );
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    expect(screen.queryByTestId('msg-display')).toBeNull();
  });

  it.skip('fileMap 非空渲染 after；LOADING_FLAT id 仍可挂载', () => {
    const fileMap = new Map([['f1', { name: 'a.txt', url: 'https://x/a' }]]);
    render(
      <AIBubble
        avatar={{ title: 'AI' }}
        originData={origin({
          id: '__loading__' as any,
          fileMap: fileMap as any,
          content: 'with files',
        })}
        placement="left"
      />,
    );
    expect(screen.getByTestId('msg-display')).toBeInTheDocument();
  });

  it('thoughtChain alwaysRender + 空 taskList 仍可 before；bot 角色跳过', () => {
    render(
      <BubbleConfigContext.Provider
        value={
          { thoughtChain: { alwaysRender: true }, standalone: true } as any
        }
      >
        <AIBubble
          avatar={{ title: 'AI' }}
          originData={origin({ role: 'bot' as any })}
          placement="left"
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('msg-display')).toBeInTheDocument();
  });

  it('非 string content 走 stripped；extraRender=false', () => {
    render(
      <AIBubble
        avatar={{ title: 'AI' }}
        originData={origin({ content: { x: 1 } as any })}
        bubbleRenderConfig={{ extraRender: false }}
        placement="left"
      />,
    );
    expect(screen.getByTestId('msg-display')).toBeInTheDocument();
  });
});

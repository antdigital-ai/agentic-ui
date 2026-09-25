/**
 * PureBubbleList 分支覆盖：loading、lazy、placement、事件回调。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { LOADING_FLAT } from '../MessagesContent';
import { PureBubbleList } from '../List/PureBubbleList';

vi.mock('../List/SkeletonList', () => ({
  default: () => <div data-testid="skeleton">loading</div>,
}));

vi.mock('../PureBubble', () => ({
  PureAIBubble: ({ originData }: { originData: { content?: string } }) => (
    <div data-testid="ai-bubble">{originData?.content}</div>
  ),
  PureUserBubble: ({ originData }: { originData: { content?: string } }) => (
    <div data-testid="user-bubble">{originData?.content}</div>
  ),
}));

vi.mock('../../MarkdownEditor/editor/components/LazyElement', () => ({
  LazyElement: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="lazy-wrap">{children}</div>
  ),
}));

const msg = (
  id: string,
  role: 'user' | 'assistant',
  content: string,
) => ({
  id,
  role,
  content,
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isLast: false,
});

describe('PureBubbleList branches', () => {
  it('isLoading 渲染 SkeletonList', () => {
    render(<PureBubbleList bubbleList={[]} isLoading />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('user 消息走 PureUserBubble', () => {
    render(<PureBubbleList bubbleList={[msg('1', 'user', 'hi')]} />);
    expect(screen.getByTestId('user-bubble')).toHaveTextContent('hi');
  });

  it('assistant 消息走 PureAIBubble', () => {
    render(<PureBubbleList bubbleList={[msg('1', 'assistant', 'bot')]} />);
    expect(screen.getByTestId('ai-bubble')).toHaveTextContent('bot');
  });

  it('compact context 应用 compact 类名', () => {
    const { container } = render(
      <BubbleConfigContext.Provider value={{ compact: true } as any}>
        <PureBubbleList bubbleList={[msg('1', 'assistant', 'x')]} />
      </BubbleConfigContext.Provider>,
    );
    expect(container.firstChild?.className).toContain('compact');
  });

  it('lazy.enable 包裹 LazyElement', () => {
    render(
      <PureBubbleList
        bubbleList={[msg('1', 'assistant', 'lazy')]}
        lazy={{ enable: true }}
      />,
    );
    expect(screen.getByTestId('lazy-wrap')).toBeInTheDocument();
  });

  it('shouldLazyLoad 返回 false 时不包裹 LazyElement', () => {
    render(
      <PureBubbleList
        bubbleList={[msg('1', 'assistant', 'no-lazy')]}
        lazy={{
          enable: true,
          shouldLazyLoad: () => false,
        }}
      />,
    );
    expect(screen.queryByTestId('lazy-wrap')).not.toBeInTheDocument();
    expect(screen.getByTestId('ai-bubble')).toBeInTheDocument();
  });

  it('LOADING_FLAT 使用稳定 loading key', () => {
    const { rerender } = render(
      <PureBubbleList
        bubbleList={[
          {
            ...msg(LOADING_FLAT, 'assistant', ''),
            createAt: 99,
          },
        ]}
      />,
    );
    rerender(
      <PureBubbleList
        bubbleList={[
          {
            id: 'real-id',
            role: 'assistant',
            content: 'done',
            createAt: 99,
            updateAt: 99,
            isFinished: true,
            isLast: true,
          },
        ]}
      />,
    );
    expect(screen.getByTestId('ai-bubble')).toHaveTextContent('done');
  });

  it('onScroll / onWheel / onTouchMove 回调', () => {
    const onScroll = vi.fn();
    const onWheel = vi.fn();
    const onTouchMove = vi.fn();
    const { container } = render(
      <PureBubbleList
        bubbleList={[msg('1', 'assistant', 'evt')]}
        onScroll={onScroll}
        onWheel={onWheel}
        onTouchMove={onTouchMove}
      />,
    );
    const root = container.firstChild as HTMLElement;
    fireEvent.scroll(root);
    fireEvent.wheel(root);
    fireEvent.touchMove(root);
    expect(onScroll).toHaveBeenCalled();
    expect(onWheel).toHaveBeenCalled();
    expect(onTouchMove).toHaveBeenCalled();
  });

  it('readonly 应用 readonly 类名', () => {
    const { container } = render(
      <PureBubbleList
        bubbleList={[msg('1', 'assistant', 'r')]}
        readonly
      />,
    );
    expect(container.firstChild?.className).toContain('readonly');
  });
});

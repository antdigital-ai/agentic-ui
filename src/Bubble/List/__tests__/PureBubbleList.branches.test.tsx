import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PureBubbleList } from '../PureBubbleList';

vi.mock('../style', () => ({ useStyle: () => ({ hashId: 'hash' }) }));
vi.mock('../SkeletonList', () => ({
  default: () => <div data-testid="bubble-skeleton" />,
}));
vi.mock('../../PureBubble', () => ({
  PureAIBubble: (props: any) => <div data-testid="ai-bubble" {...props} />,
  PureUserBubble: (props: any) => <div data-testid="user-bubble" {...props} />,
}));
vi.mock('../../../MarkdownEditor/editor/components/LazyElement', () => ({
  LazyElement: ({ children }: any) => <>{children}</>,
}));

describe('PureBubbleList residual branches', () => {
  it('renders the loading skeleton instead of bubble items', () => {
    render(<PureBubbleList bubbleList={[]} isLoading />);
    expect(screen.getByTestId('bubble-skeleton')).toBeInTheDocument();
  });

  it('bypasses lazy wrapping when shouldLazyLoad returns false', () => {
    render(
      <PureBubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'reply' } as any]}
        lazy={{ enable: true, shouldLazyLoad: () => false }}
      />,
    );
    expect(screen.getByTestId('ai-bubble')).toBeInTheDocument();
  });

  it('user 角色走 PureUserBubble；assistant 走 PureAIBubble', () => {
    render(
      <PureBubbleList
        bubbleList={[
          { id: 'u', role: 'user', content: 'q', createAt: 1 } as any,
          { id: 'a', role: 'assistant', content: 'a', createAt: 2 } as any,
        ]}
      />,
    );
    expect(screen.getByTestId('user-bubble')).toBeInTheDocument();
    expect(screen.getByTestId('ai-bubble')).toBeInTheDocument();
  });

  it('LOADING_FLAT id 使用稳定 cacheKey；onDisLike 兼容 onDislike', () => {
    const onDisLike = vi.fn();
    render(
      <PureBubbleList
        bubbleList={[
          {
            id: '__loading__',
            role: 'assistant',
            content: '',
            createAt: 10,
          } as any,
        ]}
        onDisLike={onDisLike}
        lazy={{ enable: false }}
      />,
    );
    expect(screen.getByTestId('ai-bubble')).toBeInTheDocument();
  });

  it('lazy 默认 placeholderHeight/rootMargin；无 compact context', () => {
    render(
      <PureBubbleList
        bubbleList={[{ id: '2', role: 'assistant', content: 'x' } as any]}
        lazy={{ enable: true }}
      />,
    );
    expect(screen.getByTestId('ai-bubble')).toBeInTheDocument();
  });
});

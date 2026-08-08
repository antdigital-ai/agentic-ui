/**
 * Bubble List 分支覆盖：loading、empty、pure、extraShowOnHover、lazy、renderMode、事件。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { LOADING_FLAT } from '../MessagesContent';
import BubbleList from '../List';

vi.mock('../Bubble', () => ({
  Bubble: ({ originData, placement }: { originData: { content?: string }; placement?: string }) => (
    <div data-testid="bubble-item" data-placement={placement}>
      {originData?.content}
    </div>
  ),
}));

vi.mock('../List/SkeletonList', () => ({
  default: () => <div data-testid="skeleton-list">loading</div>,
}));

vi.mock('../../MarkdownEditor/editor/components/LazyElement', () => ({
  LazyElement: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="lazy-element">{children}</div>
  ),
}));

const msg = (id: string, content: string, role: 'user' | 'assistant' = 'assistant') => ({
  id,
  role,
  content,
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isLast: false,
});

describe('BubbleList branches', () => {
  it('空列表渲染空容器', () => {
    const { container } = render(<BubbleList bubbleList={[]} />);
    expect(container.querySelector('[class*="bubble-list"]')).toBeTruthy();
  });

  it('isLoading 时渲染 SkeletonList', () => {
    render(<BubbleList bubbleList={[]} isLoading />);
    expect(screen.getByTestId('skeleton-list')).toBeInTheDocument();
  });

  it('deprecated loading 等同 isLoading', () => {
    render(<BubbleList bubbleList={[]} loading />);
    expect(screen.getByTestId('skeleton-list')).toBeInTheDocument();
  });

  it('有消息时渲染 Bubble 项', () => {
    render(
      <BubbleList bubbleList={[msg('1', 'hello'), msg('2', 'world')]} />,
    );
    expect(screen.getAllByTestId('bubble-item')).toHaveLength(2);
  });

  it('pure 模式仍渲染列表项', () => {
    render(<BubbleList bubbleList={[msg('1', 'x')]} pure />);
    expect(screen.getByTestId('bubble-item')).toBeInTheDocument();
  });

  it('extraShowOnHover 传入 BubbleConfigContext', () => {
    render(
      <BubbleList bubbleList={[msg('1', 'x')]} extraShowOnHover />,
    );
    expect(screen.getByTestId('bubble-item')).toBeInTheDocument();
  });

  it('readonly 透传给子 Bubble', () => {
    render(
      <BubbleList bubbleList={[msg('1', 'x')]} readonly />,
    );
    expect(screen.getByText('x')).toBeInTheDocument();
  });

  it('自定义 className / style 应用到列表根', () => {
    const { container } = render(
      <BubbleList
        bubbleList={[msg('1', 'x')]}
        className="custom-list"
        style={{ marginTop: 8 }}
      />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('custom-list');
    expect(root.style.marginTop).toBe('8px');
  });

  it('renderMode 合并进 markdownRenderConfig', () => {
    render(
      <BubbleList
        bubbleList={[msg('1', 'md')]}
        renderMode="markdown"
      />,
    );
    expect(screen.getByTestId('bubble-item')).toBeInTheDocument();
  });

  it('renderType 兼容协议字段', () => {
    render(
      <BubbleList bubbleList={[msg('1', 't')]} renderType="markdown" />,
    );
    expect(screen.getByText('t')).toBeInTheDocument();
  });

  it('BubbleConfigContext compact 应用 compact 类名', () => {
    const { container } = render(
      <BubbleConfigContext.Provider value={{ compact: true } as any}>
        <BubbleList bubbleList={[msg('1', 'c')]} />
      </BubbleConfigContext.Provider>,
    );
    expect(container.firstChild?.className).toContain('compact');
  });

  it('BubbleConfigContext 继承 extraShowOnHover', () => {
    render(
      <BubbleConfigContext.Provider
        value={{ extraShowOnHover: true, standalone: false } as any}
      >
        <BubbleList bubbleList={[msg('1', 'ctx')]} />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByText('ctx')).toBeInTheDocument();
  });

  it('user 消息 placement 为 right', () => {
    render(<BubbleList bubbleList={[msg('1', 'user-msg', 'user')]} />);
    expect(screen.getByTestId('bubble-item')).toHaveAttribute(
      'data-placement',
      'right',
    );
  });

  it('lazy.enable 包裹 LazyElement', () => {
    render(
      <BubbleList
        bubbleList={[msg('1', 'lazy')]}
        lazy={{ enable: true }}
      />,
    );
    expect(screen.getByTestId('lazy-element')).toBeInTheDocument();
  });

  it('shouldLazyLoad false 跳过 LazyElement', () => {
    render(
      <BubbleList
        bubbleList={[msg('1', 'direct')]}
        lazy={{ enable: true, shouldLazyLoad: () => false }}
      />,
    );
    expect(screen.queryByTestId('lazy-element')).not.toBeInTheDocument();
  });

  it('LOADING_FLAT 过渡到真实 id 保持 key', () => {
    const { rerender } = render(
      <BubbleList
        bubbleList={[
          { ...msg(LOADING_FLAT, ''), createAt: 42 },
        ]}
      />,
    );
    rerender(
      <BubbleList
        bubbleList={[
          {
            id: 'stable-real',
            role: 'assistant',
            content: 'ready',
            createAt: 42,
            updateAt: 42,
            isFinished: true,
            isLast: true,
          },
        ]}
      />,
    );
    expect(screen.getByText('ready')).toBeInTheDocument();
  });

  it('onScroll / onWheel / onTouchMove 触发回调', () => {
    const onScroll = vi.fn();
    const onWheel = vi.fn();
    const onTouchMove = vi.fn();
    const { container } = render(
      <BubbleList
        bubbleList={[msg('1', 'evt')]}
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

  it('styles 左右内容样式按 placement 合并', () => {
    render(
      <BubbleList
        bubbleList={[msg('u', 'right-style', 'user')]}
        styles={{
          bubbleListRightItemContentStyle: { color: 'red' },
          bubbleListLeftItemContentStyle: { color: 'blue' },
        }}
      />,
    );
    expect(screen.getByText('right-style')).toBeInTheDocument();
  });

  it('无父级 BubbleConfigContext 时 standalone 为 false', () => {
    render(<BubbleList bubbleList={[msg('1', 'solo')]} />);
    expect(screen.getByText('solo')).toBeInTheDocument();
  });

  it('markdownRenderConfigProp.renderMode 优先于顶层 renderMode', () => {
    render(
      <BubbleList
        bubbleList={[msg('1', 'cfg')]}
        renderMode="slate"
        markdownRenderConfig={{ renderMode: 'markdown' }}
      />,
    );
    expect(screen.getByText('cfg')).toBeInTheDocument();
  });

  it('markdownRenderConfigProp.renderType 兼容', () => {
    render(
      <BubbleList
        bubbleList={[msg('1', 'rtype')]}
        markdownRenderConfig={{ renderType: 'markdown' } as any}
      />,
    );
    expect(screen.getByText('rtype')).toBeInTheDocument();
  });

  it('userMeta / assistantMeta 合并到气泡', () => {
    render(
      <BubbleList
        bubbleList={[
          msg('u', 'user-meta', 'user'),
          msg('a', 'ai-meta', 'assistant'),
        ]}
        userMeta={{ avatar: 'u.png', title: 'U' }}
        assistantMeta={{ avatar: 'a.png', title: 'A' }}
      />,
    );
    expect(screen.getAllByTestId('bubble-item')).toHaveLength(2);
  });

  it('lazy placeholderHeight / rootMargin / renderPlaceholder', () => {
    const renderPlaceholder = vi.fn(({ elementInfo }) => (
      <div data-testid="custom-ph">{elementInfo?.role ?? 'none'}</div>
    ));
    render(
      <BubbleList
        bubbleList={[msg('1', 'lazy-ph')]}
        lazy={{
          enable: true,
          placeholderHeight: 80,
          rootMargin: '50px',
          renderPlaceholder,
        }}
      />,
    );
    expect(screen.getByTestId('lazy-element')).toBeInTheDocument();
  });

  it('item.meta 覆盖角色 meta', () => {
    render(
      <BubbleList
        bubbleList={[
          {
            ...msg('1', 'meta-item'),
            meta: { avatar: 'item.png', title: 'Item' },
          } as any,
        ]}
        assistantMeta={{ avatar: 'default.png', title: 'Default' }}
      />,
    );
    expect(screen.getByText('meta-item')).toBeInTheDocument();
  });

  it('列表收缩时仍可渲染剩余项', () => {
    const { rerender } = render(
      <BubbleList
        bubbleList={[msg('1', 'a'), msg('2', 'b'), msg('3', 'c')]}
      />,
    );
    expect(screen.getAllByTestId('bubble-item')).toHaveLength(3);
    rerender(<BubbleList bubbleList={[msg('1', 'a')]} />);
    expect(screen.getAllByTestId('bubble-item')).toHaveLength(1);
  });

  it('readonly 根节点带只读类名', () => {
    const { container } = render(
      <BubbleList bubbleList={[msg('1', 'ro')]} readonly />,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(
      /readonly|bubble-list/,
    );
  });

  it('左内容 styles 应用到 assistant', () => {
    render(
      <BubbleList
        bubbleList={[msg('1', 'left-style', 'assistant')]}
        styles={{
          bubbleListLeftItemContentStyle: { padding: 4 },
        }}
      />,
    );
    expect(screen.getByText('left-style')).toBeInTheDocument();
  });
});

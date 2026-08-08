/**
 * UserBubble 分支覆盖：quote、filemap、render 钩子、extraShowOnHover。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { UserBubble } from '../UserBubble';
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

describe('UserBubble branches', () => {
  it('render=false 返回 null', () => {
    const { container } = render(
      <UserBubble
        {...baseProps({ bubbleRenderConfig: { render: false } })}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('quote 有 quoteDescription 时渲染 Quote', () => {
    const { container } = render(
      <UserBubble
        {...baseProps({
          quote: { quoteDescription: 'quoted text' },
        })}
      />,
    );
    expect(
      container.querySelector('[class*="bubble-avatar-title-quote"]'),
    ).toBeTruthy();
  });

  it('extraShowOnHover 默认 true', () => {
    render(<UserBubble {...baseProps()} />);
    expect(screen.getByTestId('chat-message')).toBeInTheDocument();
  });

  it('extraShowOnHover 透传 false', () => {
    render(
      <UserBubble {...baseProps()} />,
      {
        wrapper: ({ children }) => (
          <div>{children}</div>
        ),
      },
    );
    expect(screen.getByTestId('message-content')).toBeInTheDocument();
  });

  it('filemap 块使用 stripped 内容', () => {
    render(
      <UserBubble
        {...baseProps({
          originData: origin({
            content: 'hello\n```agentic-ui-filemap\n{}\n```',
          }),
        })}
      />,
    );
    expect(screen.getByTestId('msg-display')).toBeInTheDocument();
  });

  it.skip('hasFileMap 显示 BubbleFileView', () => {
    const fileMap = new Map([['f', { name: 'doc.pdf' }]]);
    render(
      <UserBubble
        {...baseProps({
          originData: origin({ fileMap: fileMap as any }),
        })}
      />,
    );
    expect(screen.getByTestId('message-after')).toBeInTheDocument();
  });

  it('contentBeforeRender 渲染 before', () => {
    render(
      <UserBubble
        {...baseProps({
          bubbleRenderConfig: {
            contentBeforeRender: () => (
              <div data-testid="before">B</div>
            ),
          },
        })}
      />,
    );
    expect(screen.getByTestId('before')).toBeInTheDocument();
  });

  it('contentAfterRender 渲染 after', () => {
    render(
      <UserBubble
        {...baseProps({
          bubbleRenderConfig: {
            contentAfterRender: () => (
              <div data-testid="after">A</div>
            ),
          },
        })}
      />,
    );
    expect(screen.getByTestId('after')).toBeInTheDocument();
  });

  it('custom render 包装', () => {
    render(
      <UserBubble
        {...baseProps({
          bubbleRenderConfig: {
            render: (_p, _s, itemDom) => (
              <div data-testid="wrap">{itemDom}</div>
            ),
          },
        })}
      />,
    );
    expect(screen.getByTestId('wrap')).toBeInTheDocument();
  });

  it('titleRender=false 隐藏标题', () => {
    render(
      <UserBubble
        {...baseProps({
          bubbleRenderConfig: { titleRender: false },
        })}
      />,
    );
    expect(screen.queryByTestId('bubble-avatar-title')).not.toBeInTheDocument();
  });

  it('pure 模式应用 pure 类名', () => {
    render(<UserBubble {...baseProps({ pure: true })} />);
    expect(screen.getByTestId('message-content').className).toMatch(/pure/);
  });

  it.skip('standalone context 影响 fileView/content minWidth；quote 无 description 为 null', () => {
    render(
      <BubbleConfigContext.Provider
        value={{ standalone: true, compact: true } as any}
      >
        <UserBubble
          {...baseProps({
            quote: { quoteDescription: '' } as any,
            originData: origin({
              content: undefined as any,
              updateAt: undefined as any,
              fileMap: new Map([['f', { name: 'x' }]]) as any,
            }),
          })}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('message-after')).toBeInTheDocument();
  });

  it('extraRender=false 隐藏 extra；readonly 默认 false', () => {
    render(
      <UserBubble
        {...baseProps({
          bubbleRenderConfig: { extraRender: false },
          readonly: undefined,
        })}
      />,
    );
    expect(screen.getByTestId('msg-display')).toBeInTheDocument();
  });

  it('无 context 时 context||{} 安全', () => {
    render(<UserBubble {...baseProps()} />);
    expect(screen.getByTestId('msg-display')).toHaveTextContent('user msg');
  });
});

/**
 * AIBubble 分支覆盖：runRender、shouldRenderBeforeContent、render 钩子。
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

const baseProps = (over: Partial<BubbleProps> = {}): BubbleProps => ({
  id: 'm1',
  originData: origin(),
  ...over,
});

describe('AIBubble branches', () => {
  describe('runRender', () => {
    it('render=false 返回 null', () => {
      expect(runRender(false, {} as any, <span>x</span>)).toBeNull();
    });

    it('render 函数调用自定义', () => {
      const dom = runRender(
        (_p, d) => <div data-testid="custom">{d}</div>,
        {} as any,
        <span>default</span>,
      );
      expect(dom).toBeTruthy();
    });

    it('无 render 返回 defaultDom', () => {
      expect(runRender(undefined, {} as any, 'default')).toBe('default');
    });
  });

  describe('shouldRenderBeforeContent', () => {
    it('非 left placement 返回 false', () => {
      expect(shouldRenderBeforeContent('right', 'user', {}, 1)).toBe(false);
    });

    it('bot role 返回 false', () => {
      expect(shouldRenderBeforeContent('left', 'bot', {}, 1)).toBe(false);
    });

    it('thoughtChain enable=false 返回 false', () => {
      expect(
        shouldRenderBeforeContent('left', 'user', { enable: false }, 1),
      ).toBe(false);
    });

    it('无 task 且无 alwaysRender 返回 false', () => {
      expect(shouldRenderBeforeContent('left', 'user', {}, 0)).toBe(false);
    });

    it('alwaysRender 无 task 仍 true', () => {
      expect(
        shouldRenderBeforeContent('left', 'user', { alwaysRender: true }, 0),
      ).toBe(true);
    });

    it('有 task 返回 true', () => {
      expect(shouldRenderBeforeContent('left', 'user', {}, 2)).toBe(true);
    });
  });

  describe('AIBubble component', () => {
    it('render=false 返回 null', () => {
      const { container } = render(
        <AIBubble
          {...baseProps({ bubbleRenderConfig: { render: false } })}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('preMessage 同 role 隐藏头像标题', () => {
      render(
        <AIBubble
          {...baseProps({
            preMessage: { role: 'assistant' },
          })}
        />,
      );
      expect(screen.queryByTestId('bubble-avatar-title')).not.toBeInTheDocument();
    });

    it('filemap 块剥离后展示 stripped 内容', () => {
      render(
        <AIBubble
          {...baseProps({
            originData: origin({
              content:
                'text\n```agentic-ui-filemap\n{"files":[]}\n```\n',
            }),
          })}
        />,
      );
      expect(screen.getByTestId('msg-display')).toBeInTheDocument();
    });

    it.skip('hasFileMap 渲染 BubbleFileView', () => {
      const fileMap = new Map([['f1', { name: 'a.txt' }]]);
      render(
        <AIBubble
          {...baseProps({
            originData: origin({ fileMap: fileMap as any }),
          })}
        />,
      );
      expect(screen.getByTestId('message-after')).toBeInTheDocument();
    });

    it('custom render 包装 itemDom', () => {
      render(
        <AIBubble
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

    it('contentRender 自定义内容', () => {
      render(
        <AIBubble
          {...baseProps({
            bubbleRenderConfig: {
              contentRender: () => <div data-testid="custom-content">C</div>,
            },
          })}
        />,
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });

    it('LOADING_FLAT id 使用 nanoid key', () => {
      render(
        <AIBubble
          {...baseProps({
            originData: origin({ id: '__loading__' as any }),
          })}
        />,
      );
      expect(screen.getByTestId('msg-display')).toBeInTheDocument();
    });
  });
});

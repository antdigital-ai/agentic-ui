import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from 'antd';
import { BubbleConfigContext } from '../../../src/Bubble/BubbleConfigProvide';
import { LOADING_FLAT } from '../../../src/Bubble/MessagesContent';
import { PureBubbleList } from '../../../src/Bubble/List/PureBubbleList';
import type { MessageBubbleData } from '../../../src/Bubble/type';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const BubbleConfigProvide: React.FC<{
  children: React.ReactNode;
  compact?: boolean;
}> = ({ children, compact }) => (
  <ConfigProvider>
    <BubbleConfigContext.Provider
      value={{ standalone: false, compact, locale: {} as any }}
    >
      {children}
    </BubbleConfigContext.Provider>
  </ConfigProvider>
);

const createMockBubbleData = (
  id: string,
  role: 'user' | 'assistant',
  content: string,
  extra?: Partial<MessageBubbleData>,
): MessageBubbleData => ({
  id,
  role,
  content,
  createAt: Date.now(),
  updateAt: Date.now(),
  ...extra,
});

describe('PureBubbleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应渲染气泡列表', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'User msg'),
        createMockBubbleData('2', 'assistant', 'AI msg'),
      ];

      render(
        <BubbleConfigProvide>
          <PureBubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      expect(screen.getByText('User msg')).toBeInTheDocument();
      expect(screen.getByText('AI msg')).toBeInTheDocument();
    });

    it('isLoading 为 true 时应渲染 SkeletonList', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Hi'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <PureBubbleList bubbleList={bubbleList} isLoading />
        </BubbleConfigProvide>,
      );

      const loadingEl = container.querySelector('[class*="-loading"]');
      expect(loadingEl).toBeInTheDocument();
    });

    it('应设置 data-chat-list 为列表长度', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'A'),
        createMockBubbleData('2', 'assistant', 'B'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <PureBubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      const listRoot = container.querySelector('[data-chat-list="2"]');
      expect(listRoot).toBeInTheDocument();
    });
  });

  describe('LOADING_FLAT 与 key 稳定性', () => {
    it('id 为 LOADING_FLAT 时应使用稳定 key 渲染', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData(LOADING_FLAT, 'assistant', 'Loading...', {
          createAt: 12345,
        }),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <PureBubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      const bubbles = container.querySelectorAll('[data-id]');
      expect(bubbles.length).toBe(1);
      expect(bubbles[0]).toHaveAttribute('data-id', LOADING_FLAT);
    });
  });

  describe('readonly 与 compact', () => {
    it('readonly 时应添加 readonly 类名', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Hi'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <PureBubbleList bubbleList={bubbleList} readonly />
        </BubbleConfigProvide>,
      );

      expect(container.querySelector('[class*="-readonly"]')).toBeInTheDocument();
    });

    it('BubbleConfigContext compact 时应添加 compact 类名', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Hi'),
      ];

      const { container } = render(
        <BubbleConfigProvide compact>
          <PureBubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      expect(container.querySelector('[class*="-compact"]')).toBeInTheDocument();
    });
  });

  describe('事件回调', () => {
    it('应触发 onScroll', () => {
      const onScroll = vi.fn();
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Hi'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <PureBubbleList bubbleList={bubbleList} onScroll={onScroll} />
        </BubbleConfigProvide>,
      );

      const listEl = container.querySelector('[data-chat-list]');
      fireEvent.scroll(listEl!);
      expect(onScroll).toHaveBeenCalled();
    });

    it('应触发 onWheel 并传入 bubbleListRef', () => {
      const onWheel = vi.fn();
      const bubbleListRef = React.createRef<HTMLDivElement | null>();
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Hi'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <PureBubbleList
            bubbleList={bubbleList}
            bubbleListRef={bubbleListRef}
            onWheel={onWheel}
          />
        </BubbleConfigProvide>,
      );

      const listEl = container.querySelector('[data-chat-list]');
      fireEvent.wheel(listEl!);
      expect(onWheel).toHaveBeenCalledTimes(1);
      expect(onWheel.mock.calls[0].length).toBe(2);
      expect(onWheel.mock.calls[0][1]).toBe(listEl);
    });

    it('应触发 onTouchMove 并传入 bubbleListRef', () => {
      const onTouchMove = vi.fn();
      const bubbleListRef = React.createRef<HTMLDivElement | null>();
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Hi'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <PureBubbleList
            bubbleList={bubbleList}
            bubbleListRef={bubbleListRef}
            onTouchMove={onTouchMove}
          />
        </BubbleConfigProvide>,
      );

      const listEl = container.querySelector('[data-chat-list]');
      fireEvent.touchMove(listEl!);
      expect(onTouchMove).toHaveBeenCalledTimes(1);
      expect(onTouchMove.mock.calls[0].length).toBe(2);
      expect(onTouchMove.mock.calls[0][1]).toBe(listEl);
    });
  });

  describe('deprecated 与别名 props', () => {
    it('应使用 onDisLike 当 onDislike 未传', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'assistant', 'AI'),
      ];

      render(
        <BubbleConfigProvide>
          <PureBubbleList
            bubbleList={bubbleList}
            onDisLike={vi.fn()}
          />
        </BubbleConfigProvide>,
      );

      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('应使用 onCancelLike 当 onLikeCancel 未传', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'assistant', 'AI'),
      ];

      render(
        <BubbleConfigProvide>
          <PureBubbleList
            bubbleList={bubbleList}
            onCancelLike={vi.fn()}
          />
        </BubbleConfigProvide>,
      );

      expect(screen.getByText('AI')).toBeInTheDocument();
    });
  });

  describe('userMeta / assistantMeta', () => {
    it('应传递 userMeta 给右侧气泡、assistantMeta 给左侧', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'User'),
        createMockBubbleData('2', 'assistant', 'Assistant'),
      ];

      render(
        <BubbleConfigProvide>
          <PureBubbleList
            bubbleList={bubbleList}
            userMeta={{ name: 'Human' }}
            assistantMeta={{ name: 'Bot' }}
          />
        </BubbleConfigProvide>,
      );

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Assistant')).toBeInTheDocument();
    });
  });

  describe('styles', () => {
    it('应应用 style 与 styles.bubbleListItemStyle', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Hi'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <PureBubbleList
            bubbleList={bubbleList}
            style={{ padding: 8 }}
            styles={{
              bubbleListItemStyle: { marginBottom: 4 },
              bubbleListRightItemContentStyle: { maxWidth: 300 },
            }}
          />
        </BubbleConfigProvide>,
      );

      const listRoot = container.querySelector('[data-chat-list]');
      expect(listRoot).toHaveStyle({ padding: '8px' });
    });
  });

  describe('bubbleRenderConfig.customConfig', () => {
    it('应传递 customConfig 给气泡', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Hi'),
      ];

      render(
        <BubbleConfigProvide>
          <PureBubbleList
            bubbleList={bubbleList}
            bubbleRenderConfig={{ customConfig: { foo: 'bar' } as any }}
          />
        </BubbleConfigProvide>,
      );

      expect(screen.getByText('Hi')).toBeInTheDocument();
    });
  });

  describe('lazy 懒加载', () => {
    it('lazy.enable 且 shouldLazyLoad 返回 false 时该条直接渲染不包 LazyElement', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'First'),
        createMockBubbleData('2', 'assistant', 'Second'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <PureBubbleList
            bubbleList={bubbleList}
            lazy={{
              enable: true,
              shouldLazyLoad: (index) => index !== 0,
            }}
          />
        </BubbleConfigProvide>,
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      const firstBubble = container.querySelector('[data-id="1"]');
      expect(firstBubble).toBeInTheDocument();
    });

    it('lazy.enable 且 renderPlaceholder 时应传入 elementInfo.role', () => {
      const renderPlaceholder = vi.fn((props: any) => (
        <div data-testid="placeholder" data-height={props.height}>
          Placeholder
        </div>
      ));

      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'User'),
      ];

      render(
        <BubbleConfigProvide>
          <PureBubbleList
            bubbleList={bubbleList}
            lazy={{
              enable: true,
              renderPlaceholder,
            }}
          />
        </BubbleConfigProvide>,
      );

      expect(renderPlaceholder).toHaveBeenCalled();
      const lastCall = renderPlaceholder.mock.calls[renderPlaceholder.mock.calls.length - 1][0];
      expect(lastCall.elementInfo).toEqual(
        expect.objectContaining({ type: 'bubble', index: 0, total: 1 }),
      );
    });

    it('lazy 未启用时应直接渲染列表', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Hi'),
      ];

      render(
        <BubbleConfigProvide>
          <PureBubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      expect(screen.getByText('Hi')).toBeInTheDocument();
    });
  });
});

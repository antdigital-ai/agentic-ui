import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React, { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../src/Bubble/BubbleConfigProvide';
import { BubbleList } from '../src/Bubble/List';
import { LOADING_FLAT } from '../src/Bubble/MessagesContent';
import type { MessageBubbleData } from '../src/Bubble/type';

interface MockBubbleProps {
  id?: string;
  markdownRenderConfig?: { renderMode?: 'slate' | 'markdown' };
}

const mockState = vi.hoisted(() => ({
  mountCount: 0,
  unmountCount: 0,
  renderedProps: [] as MockBubbleProps[],
}));

vi.mock('../src/Bubble/Bubble', () => {
  const MockBubble: React.FC<MockBubbleProps> = (props) => {
    mockState.renderedProps.push(props);

    useEffect(() => {
      mockState.mountCount += 1;
      return () => {
        mockState.unmountCount += 1;
      };
    }, []);

    return (
      <div data-testid={`mock-bubble-${props.id}`}>
        {props.markdownRenderConfig?.renderMode || 'no-mode'}
      </div>
    );
  };

  return { Bubble: MockBubble };
});

const BubbleConfigProvide: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ConfigProvider>
    <BubbleConfigContext.Provider
      value={{ standalone: false, compact: false, locale: {} as any }}
    >
      {children}
    </BubbleConfigContext.Provider>
  </ConfigProvider>
);

const createBubble = (
  id: string,
  role: 'user' | 'assistant',
  content: string,
  extra?: Partial<MessageBubbleData>,
): MessageBubbleData => ({
  id,
  role,
  content,
  createAt: 1700000000000,
  updateAt: 1700000000000,
  ...extra,
});

describe('BubbleList regression', () => {
  beforeEach(() => {
    mockState.mountCount = 0;
    mockState.unmountCount = 0;
    mockState.renderedProps = [];
  });

  describe('loading 到真实消息的 key 稳定性', () => {
    it('LOADING_FLAT 替换为真实 id 时不应触发卸载重挂载', () => {
      const loadingList = [
        createBubble(LOADING_FLAT, 'assistant', 'loading', { createAt: 12345 }),
      ];
      const realList = [createBubble('msg-1', 'assistant', 'real message')];

      const { rerender, unmount } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={loadingList} />
        </BubbleConfigProvide>,
      );

      expect(screen.getByTestId(`mock-bubble-${LOADING_FLAT}`)).toBeInTheDocument();
      expect(mockState.mountCount).toBe(1);
      expect(mockState.unmountCount).toBe(0);

      rerender(
        <BubbleConfigProvide>
          <BubbleList bubbleList={realList} />
        </BubbleConfigProvide>,
      );

      expect(screen.getByTestId('mock-bubble-msg-1')).toBeInTheDocument();
      expect(mockState.mountCount).toBe(1);
      expect(mockState.unmountCount).toBe(0);

      unmount();
      expect(mockState.unmountCount).toBe(1);
    });

    it('过渡后消息索引变化时应继续复用稳定 key，避免二次闪动', () => {
      const loadingList = [
        createBubble(LOADING_FLAT, 'assistant', 'loading', { createAt: 54321 }),
      ];
      const realList = [createBubble('msg-2', 'assistant', 'real message')];
      const shiftedList = [
        createBubble('user-1', 'user', 'new first message'),
        createBubble('msg-2', 'assistant', 'real message'),
      ];

      const { rerender } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={loadingList} />
        </BubbleConfigProvide>,
      );

      expect(mockState.mountCount).toBe(1);
      expect(mockState.unmountCount).toBe(0);

      rerender(
        <BubbleConfigProvide>
          <BubbleList bubbleList={realList} />
        </BubbleConfigProvide>,
      );

      expect(mockState.mountCount).toBe(1);
      expect(mockState.unmountCount).toBe(0);

      rerender(
        <BubbleConfigProvide>
          <BubbleList bubbleList={shiftedList} />
        </BubbleConfigProvide>,
      );

      expect(screen.getByTestId('mock-bubble-user-1')).toBeInTheDocument();
      expect(screen.getByTestId('mock-bubble-msg-2')).toBeInTheDocument();
      expect(mockState.mountCount).toBe(2);
      expect(mockState.unmountCount).toBe(0);
    });
  });

  describe('renderMode / renderType 合并优先级', () => {
    it('renderMode 应高于 renderType 与 markdownRenderConfig 内配置', () => {
      const bubbleList = [createBubble('mode-1', 'assistant', 'hello')];

      render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            renderMode="markdown"
            renderType="slate"
            markdownRenderConfig={{ renderMode: 'slate', renderType: 'slate' }}
          />
        </BubbleConfigProvide>,
      );

      const lastProps = mockState.renderedProps.at(-1);
      expect(lastProps?.markdownRenderConfig?.renderMode).toBe('markdown');
    });

    it('无 renderMode 时应使用 renderType', () => {
      const bubbleList = [createBubble('mode-2', 'assistant', 'hello')];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} renderType="markdown" />
        </BubbleConfigProvide>,
      );

      const lastProps = mockState.renderedProps.at(-1);
      expect(lastProps?.markdownRenderConfig?.renderMode).toBe('markdown');
    });

    it('仅 markdownRenderConfig.renderType 存在时应兼容映射为 renderMode', () => {
      const bubbleList = [createBubble('mode-3', 'assistant', 'hello')];

      render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            markdownRenderConfig={{ renderType: 'markdown' }}
          />
        </BubbleConfigProvide>,
      );

      const lastProps = mockState.renderedProps.at(-1);
      expect(lastProps?.markdownRenderConfig?.renderMode).toBe('markdown');
    });
  });
});

import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React, { useEffect, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { BubbleList } from '../List';
import { LOADING_FLAT } from '../MessagesContent';
import type { MessageBubbleData } from '../type';

interface MockBubbleProps {
  id?: string;
  markdownRenderConfig?: { renderMode?: 'slate' | 'markdown' };
  originData?: MessageBubbleData;
  avatar?: object;
  styles?: object;
}

const mockState = vi.hoisted(() => ({
  mountCount: 0,
  unmountCount: 0,
  renderedProps: [] as MockBubbleProps[],
}));

vi.mock('../Bubble', () => {
  const MockBubble: React.FC<MockBubbleProps> = (props) => {
    mockState.renderedProps.push(props);
    const mountedId = useRef(props.id);

    useEffect(() => {
      mockState.mountCount += 1;
      return () => {
        mockState.unmountCount += 1;
      };
    }, []);

    return (
      <div
        data-testid={`mock-bubble-${props.id}`}
        data-mounted-id={mountedId.current}
      >
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loading 到真实消息的 key 稳定性', () => {
    it('没有 createAt 的 loading 在父级更新时保持挂载', () => {
      const now = vi.spyOn(Date, 'now');
      now.mockReturnValue(1000);
      const loading = createBubble(LOADING_FLAT, 'assistant', 'loading', {
        createAt: undefined,
      });
      const { rerender } = render(<BubbleList bubbleList={[loading]} />);
      expect(mockState.mountCount).toBe(1);

      now.mockReturnValue(2000);
      rerender(
        <BubbleList bubbleList={[{ ...loading, content: 'still loading' }]} />,
      );
      expect(mockState.mountCount).toBe(1);
      expect(mockState.unmountCount).toBe(0);
    });

    it('被挂起后取消的列表清空不会污染已显示消息的 key', () => {
      const loading = createBubble(LOADING_FLAT, 'assistant', 'loading');
      const pending = new Promise<void>(() => {});
      let update: React.Dispatch<
        React.SetStateAction<{
          messages: MessageBubbleData[];
          suspend: boolean;
        }>
      >;
      const SuspendAfterList = ({ suspend }: { suspend: boolean }) => {
        if (suspend) throw pending;
        return null;
      };
      const App = () => {
        const [state, setState] = React.useState({
          messages: [loading],
          suspend: false,
        });
        update = setState;
        return (
          <React.Suspense fallback={<p>Suspended</p>}>
            <BubbleList bubbleList={state.messages} />
            <SuspendAfterList suspend={state.suspend} />
          </React.Suspense>
        );
      };
      render(<App />);
      act(() => {
        React.startTransition(() => {
          update({ messages: [], suspend: true });
        });
      });
      expect(
        screen.getByTestId(`mock-bubble-${LOADING_FLAT}`),
      ).toBeInTheDocument();

      act(() => {
        update({
          messages: [{ ...loading, content: 'updated' }],
          suspend: false,
        });
      });
      expect(mockState.mountCount).toBe(1);
      expect(mockState.unmountCount).toBe(0);
    });

    it('删除 loading 后邻接历史消息移动不应继承 loading 的 key', () => {
      const historic = createBubble('historic', 'assistant', 'history');
      const { rerender } = render(
        <BubbleList
          bubbleList={[
            createBubble(LOADING_FLAT, 'assistant', 'loading'),
            historic,
          ]}
        />,
      );
      expect(mockState.mountCount).toBe(2);

      rerender(<BubbleList bubbleList={[historic]} />);
      expect(mockState.mountCount).toBe(2);
      expect(mockState.unmountCount).toBe(1);
      expect(screen.getByTestId('mock-bubble-historic')).toHaveAttribute(
        'data-mounted-id',
        'historic',
      );
    });

    it('清空列表后，重新加入旧 id 应使用当前 loading 的 key', () => {
      const { rerender } = render(
        <BubbleList
          bubbleList={[createBubble(LOADING_FLAT, 'assistant', 'loading')]}
        />,
      );
      rerender(
        <BubbleList
          bubbleList={[createBubble('reused', 'assistant', 'done')]}
        />,
      );
      rerender(<BubbleList bubbleList={[]} />);
      rerender(
        <BubbleList
          bubbleList={[createBubble(LOADING_FLAT, 'assistant', 'new loading')]}
        />,
      );
      const mounts = mockState.mountCount;
      const unmounts = mockState.unmountCount;

      rerender(
        <BubbleList
          bubbleList={[createBubble('reused', 'assistant', 'new done')]}
        />,
      );
      expect(mockState.mountCount).toBe(mounts);
      expect(mockState.unmountCount).toBe(unmounts);
    });

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

      expect(
        screen.getByTestId(`mock-bubble-${LOADING_FLAT}`),
      ).toBeInTheDocument();
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

  it('流式消息更新时复用历史行正文、头像和样式引用', () => {
    const historic = createBubble('history', 'assistant', 'history');
    const streaming = createBubble('streaming', 'assistant', 'initial');
    const messages = [historic, streaming];
    const { rerender } = render(<BubbleList bubbleList={messages} />);
    const previous = mockState.renderedProps.find(
      (props) => props.id === historic.id,
    )!;
    mockState.renderedProps = [];

    rerender(
      <BubbleList
        bubbleList={[historic, { ...streaming, content: 'updated' }]}
      />,
    );
    const next = mockState.renderedProps.find(
      (props) => props.id === historic.id,
    )!;
    expect(next.originData).toBe(previous.originData);
    expect(next.avatar).toBe(previous.avatar);
    expect(next.styles).toBe(previous.styles);
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

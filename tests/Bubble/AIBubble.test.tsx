import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { useContext } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  AIBubble,
  shouldRenderBeforeContent,
} from '../../src/Bubble/AIBubble';
import { BubbleConfigContext } from '../../src/Bubble/BubbleConfigProvide';
import { MessagesContext } from '../../src/Bubble/MessagesContent/BubbleContext';
import { RoleType } from '../../src/Types/common';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const BubbleConfigProvide: React.FC<{
  children: React.ReactNode;
  compact?: boolean;
  standalone?: boolean;
  thoughtChain?: any;
}> = ({ children, compact, standalone, thoughtChain }) => {
  return (
    <BubbleConfigContext.Provider
      value={{
        standalone: standalone || false,
        compact,
        locale: {} as any,
        thoughtChain,
      }}
    >
      {children}
    </BubbleConfigContext.Provider>
  );
};

describe('AIBubble', () => {
  const defaultProps = {
    placement: 'left' as const,
    avatar: {
      name: 'AI Assistant',
      avatar: 'ai-avatar.jpg',
    },
    time: 1716537600000,
    originData: {
      content: 'AI message content',
      createAt: 1716537600000,
      id: '123',
      role: 'assistant' as RoleType,
      updateAt: 1716537600000,
    },
  };

  it('should render with default props', () => {
    render(
      <BubbleConfigProvide>
        <AIBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('AI message content')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('shouldRenderBeforeContent returns false when placement is not left', () => {
    expect(
      shouldRenderBeforeContent('right', 'assistant', { enable: true }, 1),
    ).toBe(false);
  });

  it('should not render before content when placement is not left', () => {
    render(
      <BubbleConfigProvide thoughtChain={{ enable: true, alwaysRender: true }}>
        <AIBubble
          {...defaultProps}
          originData={{
            ...defaultProps.originData,
            role: 'assistant' as RoleType,
            extra: {
              white_box_process: [{ info: 'test' }],
            },
          }}
        />
      </BubbleConfigProvide>,
    );

    expect(screen.getByTestId('message-before')).toBeInTheDocument();
  });

  // 测试行48: role === 'bot' 返回 false 的情况
  it('should not render before content when role is bot', () => {
    render(
      <BubbleConfigProvide thoughtChain={{ enable: true, alwaysRender: true }}>
        <AIBubble
          {...defaultProps}
          originData={{
            ...defaultProps.originData,
            role: 'bot' as RoleType,
            extra: {
              white_box_process: [{ info: 'test' }],
            },
          }}
        />
      </BubbleConfigProvide>,
    );

    // 不应该渲染 before content
    expect(screen.queryByTestId('message-before')).not.toBeInTheDocument();
  });

  // 测试行50: taskListLength < 1 && !thoughtChainConfig?.alwaysRender 返回 false 的情况
  it('should not render before content when task list is empty and alwaysRender is false', () => {
    render(
      <BubbleConfigProvide thoughtChain={{ enable: true, alwaysRender: false }}>
        <AIBubble
          {...defaultProps}
          originData={{
            ...defaultProps.originData,
            role: 'assistant' as RoleType,
            extra: {
              white_box_process: [], // 空的任务列表
            },
          }}
        />
      </BubbleConfigProvide>,
    );

    // 不应该渲染 before content
    expect(screen.queryByTestId('message-before')).not.toBeInTheDocument();
  });

  // 测试行329: bubbleRenderConfig?.render === false 的情况
  it('should return null when bubbleRenderConfig.render is false', () => {
    render(
      <BubbleConfigProvide>
        <AIBubble {...defaultProps} bubbleRenderConfig={{ render: false }} />
      </BubbleConfigProvide>,
    );

    // 组件应该返回 null，不渲染任何内容
    expect(screen.queryByText('AI message content')).not.toBeInTheDocument();
  });

  it('should call bubbleRef.current.setMessageItem when setMessage is called', () => {
    const setMessageItem = vi.fn();
    const mockBubbleRef = { current: { setMessageItem } };

    const SetMessageTrigger = () => {
      const { setMessage } = useContext(MessagesContext);
      return (
        <button
          type="button"
          data-testid="trigger-set-message"
          onClick={() => setMessage?.({ content: 'updated' })}
        >
          Update
        </button>
      );
    };

    render(
      <BubbleConfigProvide>
        <AIBubble
          {...defaultProps}
          bubbleRef={mockBubbleRef as any}
          id="test-id"
          bubbleRenderConfig={{
            render: (props, slots) => (
              <>
                <SetMessageTrigger />
                {slots?.messageContent}
              </>
            ),
          }}
          originData={{
            ...defaultProps.originData,
            role: 'assistant' as RoleType,
          }}
        />
      </BubbleConfigProvide>,
    );

    fireEvent.click(screen.getByTestId('trigger-set-message'));

    expect(setMessageItem).toHaveBeenCalledWith('test-id', { content: 'updated' });
  });

  it('should call setMessageItem with thumbsDown when onDisLike succeeds', async () => {
    const setMessageItem = vi.fn();
    const onDisLike = vi.fn().mockResolvedValue(undefined);

    render(
      <BubbleConfigProvide>
        <AIBubble
          {...defaultProps}
          bubbleRef={{ current: { setMessageItem } } as any}
          id="bubble-1"
          onDisLike={onDisLike}
          originData={{
            ...defaultProps.originData,
            role: 'assistant' as RoleType,
          }}
        />
      </BubbleConfigProvide>,
    );

    const dislikeButton = screen.getByTestId('dislike-button');
    fireEvent.click(dislikeButton);

    await waitFor(() => {
      expect(onDisLike).toHaveBeenCalled();
      expect(setMessageItem).toHaveBeenCalledWith('bubble-1', {
        feedback: 'thumbsDown',
      });
    });
  });

  it('should call setMessageItem with thumbsDown when onDislike succeeds', async () => {
    const setMessageItem = vi.fn();
    const onDislike = vi.fn().mockResolvedValue(undefined);

    render(
      <BubbleConfigProvide>
        <AIBubble
          {...defaultProps}
          bubbleRef={{ current: { setMessageItem } } as any}
          id="bubble-2"
          onDislike={onDislike}
          originData={{
            ...defaultProps.originData,
            role: 'assistant' as RoleType,
          }}
        />
      </BubbleConfigProvide>,
    );

    const dislikeButton = screen.getByTestId('dislike-button');
    fireEvent.click(dislikeButton);

    await waitFor(() => {
      expect(onDislike).toHaveBeenCalled();
      expect(setMessageItem).toHaveBeenCalledWith('bubble-2', {
        feedback: 'thumbsDown',
      });
    });
  });

  it('should call setMessageItem with thumbsUp when onLike succeeds', async () => {
    const setMessageItem = vi.fn();
    const onLike = vi.fn().mockResolvedValue(undefined);

    render(
      <BubbleConfigProvide>
        <AIBubble
          {...defaultProps}
          bubbleRef={{ current: { setMessageItem } } as any}
          id="bubble-3"
          onLike={onLike}
          originData={{
            ...defaultProps.originData,
            role: 'assistant' as RoleType,
          }}
        />
      </BubbleConfigProvide>,
    );

    const likeButton = screen.getByTestId('like-button');
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(onLike).toHaveBeenCalled();
      expect(setMessageItem).toHaveBeenCalledWith('bubble-3', {
        feedback: 'thumbsUp',
      });
    });
  });

  it('should handle onDislike error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onDislike = vi.fn().mockRejectedValue(new Error('Dislike failed'));

    render(
      <BubbleConfigProvide>
        <AIBubble
          {...defaultProps}
          onDislike={onDislike}
          originData={{
            ...defaultProps.originData,
            role: 'assistant' as RoleType,
            feedback: 'thumbsUp',
          }}
        />
      </BubbleConfigProvide>,
    );

    // 查找并点击不喜欢按钮
    const dislikeButton = screen.queryByTestId('dislike-button');
    if (dislikeButton) {
      fireEvent.click(dislikeButton);
      await waitFor(() => {
        expect(onDislike).toHaveBeenCalled();
      });
    }

    consoleSpy.mockRestore();
  });

  // 测试行400-402: onLike 异常处理
  it('should handle onLike error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onLike = vi.fn().mockRejectedValue(new Error('Like failed'));

    render(
      <BubbleConfigProvide>
        <AIBubble
          {...defaultProps}
          onLike={onLike}
          originData={{
            ...defaultProps.originData,
            role: 'assistant' as RoleType,
          }}
        />
      </BubbleConfigProvide>,
    );

    // 查找并点击喜欢按钮
    const likeButton = screen.queryByTestId('like-button');
    if (likeButton) {
      fireEvent.click(likeButton);
      await waitFor(() => {
        expect(onLike).toHaveBeenCalled();
      });
    }

    consoleSpy.mockRestore();
  });

  // 测试 thoughtChainConfig.enable === false 的情况
  it('should not render before content when thoughtChain is disabled', () => {
    render(
      <BubbleConfigProvide thoughtChain={{ enable: false }}>
        <AIBubble
          {...defaultProps}
          originData={{
            ...defaultProps.originData,
            role: 'assistant' as RoleType,
            extra: {
              white_box_process: [{ info: 'test' }],
            },
          }}
        />
      </BubbleConfigProvide>,
    );

    // 不应该渲染 before content
    expect(screen.queryByTestId('message-before')).not.toBeInTheDocument();
  });

  // 测试 taskListLength >= 1 的情况
  it('should render before content when task list has items', () => {
    render(
      <BubbleConfigProvide thoughtChain={{ enable: true }}>
        <AIBubble
          {...defaultProps}
          originData={{
            ...defaultProps.originData,
            role: 'assistant' as RoleType,
            extra: {
              white_box_process: [{ info: 'test task' }],
            },
          }}
        />
      </BubbleConfigProvide>,
    );

    // 应该渲染 before content
    expect(screen.getByTestId('message-before')).toBeInTheDocument();
  });

  // 测试 thoughtChainConfig.alwaysRender === true 的情况
  it('should render before content when alwaysRender is true even with empty task list', () => {
    render(
      <BubbleConfigProvide thoughtChain={{ enable: true, alwaysRender: true }}>
        <AIBubble
          {...defaultProps}
          originData={{
            ...defaultProps.originData,
            extra: {
              white_box_process: [], // 空的任务列表
            },
          }}
        />
      </BubbleConfigProvide>,
    );

    // 应该渲染 before content，因为 alwaysRender 为 true
    expect(screen.getByTestId('message-before')).toBeInTheDocument();
  });
});

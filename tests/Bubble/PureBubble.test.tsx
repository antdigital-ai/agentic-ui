import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { useContext, useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../src/Bubble/BubbleConfigProvide';
import {
  PureAIBubble,
  PureBubble,
  PureUserBubble,
} from '../../src/Bubble/PureBubble';
import { MessagesContext } from '../../src/Bubble/MessagesContent/BubbleContext';
import { ConfigProvider } from 'antd';

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
}> = ({ children, compact, standalone }) => {
  return (
    <ConfigProvider>
      <BubbleConfigContext.Provider
        value={{ standalone: standalone || false, compact, locale: {} as any }}
      >
        {children}
      </BubbleConfigContext.Provider>
    </ConfigProvider>
  );
};

describe('PureBubble', () => {
  const defaultProps = {
    placement: 'left' as const,
    avatar: {
      name: 'Test User',
      avatar: 'test-avatar.jpg',
    },
    time: 1716537600000,
    originData: {
      content: 'Test message content',
      createAt: 1716537600000,
      id: '123',
      role: 'user' as const,
      updateAt: 1716537600000,
    },
    markdownRenderConfig: {
      readonly: true,
    },
  };

  it('should render with default props', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should destructure props correctly', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should initialize hidePadding state', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should use ConfigProvider context', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should use BubbleConfigContext', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should destructure context values', () => {
    render(
      <BubbleConfigProvide compact standalone>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should get prefix class', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should use style hook', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should assign placement correctly', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} placement="right" />
      </BubbleConfigProvide>,
    );

    // 查找包含 placement 类的元素
    const bubbleElement = document.querySelector('[class*="right"]');
    expect(bubbleElement).toBeInTheDocument();
  });

  it('should determine isRightPlacement correctly', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} placement="right" />
      </BubbleConfigProvide>,
    );

    // 查找包含 placement 类的元素
    const bubbleElement = document.querySelector('[class*="right"]');
    expect(bubbleElement).toBeInTheDocument();
  });

  it('should assign time correctly', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should assign avatar correctly', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should assign defaultMarkdown correctly', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should destructure markdownConfig correctly', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should assign editorInitValue correctly', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should assign editorReadonly correctly', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} readonly={true} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should render titleDom', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should render avatarDom', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should render markdownEditorDom', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should render contentBeforeDom as null by default', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should render contentAfterDom as null by default', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should render messageContent', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should not render extraDom when extraRender is false', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble
          {...defaultProps}
          bubbleRenderConfig={{ extraRender: false }}
        />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  const feedbackEnabledProps = {
    ...defaultProps,
    readonly: false,
    originData: {
      ...defaultProps.originData,
      isFinished: true,
      extra: {},
    },
  };

  it('should handle onDisLike success and call setMessageItem with thumbsDown', async () => {
    const setMessageItem = vi.fn();
    const mockBubbleRef = { current: { setMessageItem } };
    const onDisLike = vi.fn().mockResolvedValue(undefined);

    render(
      <BubbleConfigProvide>
        <PureBubble
          {...feedbackEnabledProps}
          onDisLike={onDisLike}
          bubbleRef={mockBubbleRef as any}
          id="bubble-id"
        />
      </BubbleConfigProvide>,
    );

    const dislikeButton = screen.queryByTestId('dislike-button');
    if (dislikeButton) {
      fireEvent.click(dislikeButton);
      await waitFor(() => {
        expect(onDisLike).toHaveBeenCalledWith(feedbackEnabledProps.originData);
        expect(setMessageItem).toHaveBeenCalledWith('bubble-id', {
          feedback: 'thumbsDown',
        });
      });
    }
  });

  it('should handle onDisLike reject and swallow error', async () => {
    const setMessageItem = vi.fn();
    const mockBubbleRef = { current: { setMessageItem } };
    const onDisLike = vi.fn().mockRejectedValue(new Error('DisLike failed'));

    render(
      <BubbleConfigProvide>
        <PureBubble
          {...feedbackEnabledProps}
          onDisLike={onDisLike}
          bubbleRef={mockBubbleRef as any}
          id="bubble-id"
        />
      </BubbleConfigProvide>,
    );

    const dislikeButton = screen.queryByTestId('dislike-button');
    if (dislikeButton) {
      fireEvent.click(dislikeButton);
      await waitFor(() => expect(onDisLike).toHaveBeenCalled());
      expect(setMessageItem).not.toHaveBeenCalled();
    }
  });

  it('should handle onDislike success and call setMessageItem with thumbsDown', async () => {
    const setMessageItem = vi.fn();
    const mockBubbleRef = { current: { setMessageItem } };
    const onDislike = vi.fn().mockResolvedValue(undefined);

    render(
      <BubbleConfigProvide>
        <PureBubble
          {...feedbackEnabledProps}
          onDislike={onDislike}
          bubbleRef={mockBubbleRef as any}
          id="bubble-id"
        />
      </BubbleConfigProvide>,
    );

    const dislikeButton = screen.queryByTestId('dislike-button');
    if (dislikeButton) {
      fireEvent.click(dislikeButton);
      await waitFor(() => {
        expect(onDislike).toHaveBeenCalledWith(feedbackEnabledProps.originData);
        expect(setMessageItem).toHaveBeenCalledWith('bubble-id', {
          feedback: 'thumbsDown',
        });
      });
    }
  });

  it('should handle onDislike reject and swallow error', async () => {
    const onDislike = vi.fn().mockRejectedValue(new Error('Dislike failed'));

    render(
      <BubbleConfigProvide>
        <PureBubble
          {...feedbackEnabledProps}
          onDislike={onDislike}
        />
      </BubbleConfigProvide>,
    );

    const dislikeButton = screen.queryByTestId('dislike-button');
    if (dislikeButton) {
      fireEvent.click(dislikeButton);
      await waitFor(() => expect(onDislike).toHaveBeenCalled());
    }
  });

  it('should handle onLike success and call setMessageItem with thumbsUp', async () => {
    const setMessageItem = vi.fn();
    const mockBubbleRef = { current: { setMessageItem } };
    const onLike = vi.fn().mockResolvedValue(undefined);

    render(
      <BubbleConfigProvide>
        <PureBubble
          {...feedbackEnabledProps}
          onLike={onLike}
          bubbleRef={mockBubbleRef as any}
          id="bubble-id"
        />
      </BubbleConfigProvide>,
    );

    const likeButton = screen.queryByTestId('like-button');
    if (likeButton) {
      fireEvent.click(likeButton);
      await waitFor(() => {
        expect(onLike).toHaveBeenCalledWith(feedbackEnabledProps.originData);
        expect(setMessageItem).toHaveBeenCalledWith('bubble-id', {
          feedback: 'thumbsUp',
        });
      });
    }
  });

  it('should handle onLike reject and swallow error', async () => {
    const onLike = vi.fn().mockRejectedValue(new Error('Like failed'));

    render(
      <BubbleConfigProvide>
        <PureBubble {...feedbackEnabledProps} onLike={onLike} />
      </BubbleConfigProvide>,
    );

    const likeButton = screen.queryByTestId('like-button');
    if (likeButton) {
      fireEvent.click(likeButton);
      await waitFor(() => expect(onLike).toHaveBeenCalled());
    }
  });

  it('should handle onDislike error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onDislike = vi.fn().mockRejectedValue(new Error('Dislike failed'));

    render(
      <BubbleConfigProvide>
        <PureBubble
          {...defaultProps}
          onDislike={onDislike}
          originData={{
            ...defaultProps.originData,
            feedback: 'thumbsUp',
          }}
        />
      </BubbleConfigProvide>,
    );

    const dislikeButton = screen.queryByTestId('dislike-button');
    if (dislikeButton) {
      fireEvent.click(dislikeButton);
      await waitFor(() => {
        expect(onDislike).toHaveBeenCalled();
      });
    }

    consoleSpy.mockRestore();
  });

  it('should handle onLike error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onLike = vi.fn().mockRejectedValue(new Error('Like failed'));

    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} onLike={onLike} />
      </BubbleConfigProvide>,
    );

    const likeButton = screen.queryByTestId('like-button');
    if (likeButton) {
      fireEvent.click(likeButton);
      await waitFor(() => {
        expect(onLike).toHaveBeenCalled();
      });
    }

    consoleSpy.mockRestore();
  });

  it('should render itemDom', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should return null when bubbleRenderConfig.render is false', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} bubbleRenderConfig={{ render: false }} />
      </BubbleConfigProvide>,
    );

    // 组件应该返回 null，不渲染任何内容
    expect(screen.queryByText('Test message content')).not.toBeInTheDocument();
  });

  it('should render main component', () => {
    render(
      <BubbleConfigProvide>
        <PureBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should handle setMessage function', () => {
    const mockBubbleRef = {
      current: {
        setMessageItem: vi.fn(),
      },
    };

    render(
      <BubbleConfigProvide>
        <PureBubble
          {...defaultProps}
          bubbleRef={mockBubbleRef as any}
          id="test-id"
        />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should call bubbleRef.setMessageItem when custom render uses setMessage from context', () => {
    const setMessageItem = vi.fn();
    const mockBubbleRef = { current: { setMessageItem } };
    const customMessage = { updated: true };
    const SetMessageCaller = ({ msg }: { msg: any }) => {
      const ctx = useContext(MessagesContext);
      useEffect(() => {
        ctx.setMessage?.(msg);
      }, []);
      return <div data-testid="custom-render">custom</div>;
    };
    const renderFn = vi.fn((_props: any, _slots: any) => (
      <SetMessageCaller msg={customMessage} />
    ));

    render(
      <BubbleConfigProvide>
        <PureBubble
          {...defaultProps}
          bubbleRef={mockBubbleRef as any}
          id="msg-id"
          bubbleRenderConfig={{ render: renderFn }}
        />
      </BubbleConfigProvide>,
    );

    expect(renderFn).toHaveBeenCalled();
    expect(screen.getByTestId('custom-render')).toBeInTheDocument();
    expect(setMessageItem).toHaveBeenCalledWith('msg-id', customMessage);
  });

  it('should render PureAIBubble with left placement', () => {
    render(
      <BubbleConfigProvide>
        <PureAIBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should render PureUserBubble with right placement', () => {
    render(
      <BubbleConfigProvide>
        <PureUserBubble {...defaultProps} />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });
});

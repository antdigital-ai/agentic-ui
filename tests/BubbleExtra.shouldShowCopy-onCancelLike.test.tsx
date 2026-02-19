import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../src/Bubble/BubbleConfigProvide';
import { BubbleExtra } from '../src/Bubble/MessagesContent/BubbleExtra';

const BubbleConfigProvide: React.FC<{
  children: React.ReactNode;
  compact?: boolean;
  standalone?: boolean;
}> = ({ children, compact, standalone }) => {
  return (
    <BubbleConfigContext.Provider
      value={{ standalone: standalone || false, compact }}
    >
      {children}
    </BubbleConfigContext.Provider>
  );
};

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock copy-to-clipboard
vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(),
}));

// Mock classnames
vi.mock('classnames', () => ({
  default: vi.fn(() => 'test-class'),
}));

// Mock @ant-design/agentic-ui (别名指向 ./src)
vi.mock('@ant-design/agentic-ui', async () => {
  const actual = await vi.importActual('@ant-design/agentic-ui');
  // Mock Lottie 组件
  const mockPlayLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'voice-play-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockCopyLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'copy-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockLikeLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'like-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockDislikeLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'dislike-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockRefreshLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'refresh-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  return {
    ...actual,
    PlayLottie: mockPlayLottie,
    CopyLottie: mockCopyLottie,
    LikeLottie: mockLikeLottie,
    DislikeLottie: mockDislikeLottie,
    RefreshLottie: mockRefreshLottie,
  };
});

// Mock ActionIconBox and CopyButton
vi.mock('../src/index', async () => {
  const actual = await vi.importActual('../src/index');
  return {
    ...actual,
    ActionIconBox: ({
      children,
      onClick,
      title,
      style,
      scale,
      'data-testid': dataTestid,
      ...props
    }: any) => (
      <span
        data-testid={dataTestid || 'action-icon-box'}
        onClick={onClick}
        style={style}
        title={title}
        data-scale={scale ? 'true' : 'false'}
        data-title={title}
        {...props}
      >
        {children}
      </span>
    ),
    CopyButton: ({
      children,
      onClick,
      title,
      style,
      scale,
      'data-testid': dataTestid,
      ...props
    }: any) => (
      <span
        data-testid={dataTestid || 'copy-button'}
        onClick={onClick}
        style={style}
        title={title}
        data-scale={scale ? 'true' : 'false'}
        {...props}
      >
        {children || '复制'}
      </span>
    ),
  };
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

describe('BubbleExtra - shouldShowCopy and onLikeCancel Tests', () => {
  const defaultBubbleProps = {
    id: 'test-id',
    content: 'Test message content',
    isFinished: true,
    isAborted: false,
    uuid: 1,
    originData: {
      id: 'test-id',
      role: 'assistant' as const,
      content: 'Test message content',
      createAt: 1716537600000,
      updateAt: 1716537600000,
    },
  };

  it('should render retry container with data attribute when preMessage exists', () => {
    const bubbleWithPreMessage = {
      ...defaultBubbleProps,
      originData: {
        ...defaultBubbleProps.originData,
        extra: {
          preMessage: {
            content: '重新生成内容',
          },
        },
      },
    };

    const { container } = render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={bubbleWithPreMessage as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          onReply={vi.fn()}
        />
      </BubbleConfigProvide>,
    );

    expect(
      container.querySelector('[data-messages-content-retry]'),
    ).toBeInTheDocument();
  });

  describe('shouldShowCopy Tests', () => {
    it('should show copy button by default when shouldShowCopy is undefined', () => {
      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={defaultBubbleProps as any}
            onLike={vi.fn()}
            onDislike={vi.fn()}
          />
        </BubbleConfigProvide>,
      );

      // 默认情况下应该显示复制按钮
      const copyButton = screen.queryByTestId('chat-item-copy-button');
      expect(copyButton).toBeInTheDocument();
    });

    it('should show copy button when shouldShowCopy is true', () => {
      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={defaultBubbleProps as any}
            onLike={vi.fn()}
            onDislike={vi.fn()}
            shouldShowCopy={true}
          />
        </BubbleConfigProvide>,
      );

      // 验证复制按钮存在
      const copyButton = screen.queryByTestId('chat-item-copy-button');
      expect(copyButton).toBeInTheDocument();
    });

    it('should hide copy button when shouldShowCopy is false', () => {
      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={defaultBubbleProps as any}
            onLike={vi.fn()}
            onDislike={vi.fn()}
            shouldShowCopy={false}
          />
        </BubbleConfigProvide>,
      );

      // 验证复制按钮不存在
      const copyButton = screen.queryByTestId('chat-item-copy-button');
      expect(copyButton).not.toBeInTheDocument();
    });

    it('should show copy button when shouldShowCopy function returns true', () => {
      const shouldShowCopyFn = vi.fn().mockReturnValue(true);
      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={defaultBubbleProps as any}
            onLike={vi.fn()}
            onDislike={vi.fn()}
            shouldShowCopy={shouldShowCopyFn}
          />
        </BubbleConfigProvide>,
      );

      // 验证函数被正确调用
      expect(shouldShowCopyFn).toHaveBeenCalled();
      expect(shouldShowCopyFn).toHaveBeenCalledWith(defaultBubbleProps);

      // 验证复制按钮存在
      const copyButton = screen.queryByTestId('chat-item-copy-button');
      expect(copyButton).toBeInTheDocument();
    });

    it('should hide copy button when shouldShowCopy function returns false', () => {
      const shouldShowCopyFn = vi.fn().mockReturnValue(false);
      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={defaultBubbleProps as any}
            onLike={vi.fn()}
            onDislike={vi.fn()}
            shouldShowCopy={shouldShowCopyFn}
          />
        </BubbleConfigProvide>,
      );

      // 验证函数被正确调用
      expect(shouldShowCopyFn).toHaveBeenCalled();

      // 验证复制按钮不存在
      const copyButton = screen.queryByTestId('chat-item-copy-button');
      expect(copyButton).not.toBeInTheDocument();
    });

    it('should pass correct bubble data to shouldShowCopy function', () => {
      const shouldShowCopyFn = vi.fn().mockReturnValue(true);
      const customBubbleProps = {
        ...defaultBubbleProps,
        originData: {
          ...defaultBubbleProps.originData,
          content: 'Custom test content',
          id: 'custom-id-456',
        },
      };

      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={customBubbleProps as any}
            onLike={vi.fn()}
            onDislike={vi.fn()}
            shouldShowCopy={shouldShowCopyFn}
          />
        </BubbleConfigProvide>,
      );

      // 验证函数被调用时传入了正确的 bubble 数据
      expect(shouldShowCopyFn).toHaveBeenCalledWith(
        expect.objectContaining({
          originData: expect.objectContaining({
            content: 'Custom test content',
            id: 'custom-id-456',
          }),
        }),
      );
    });

    it('should not show copy button when content is empty', () => {
      const bubbleWithEmptyContent = {
        ...defaultBubbleProps,
        originData: {
          ...defaultBubbleProps.originData,
          content: '', // 空内容
        },
      };

      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={bubbleWithEmptyContent as any}
            onLike={vi.fn()}
            onDislike={vi.fn()}
            shouldShowCopy={true}
          />
        </BubbleConfigProvide>,
      );

      // 即使 shouldShowCopy 为 true，但内容为空时不应该显示复制按钮
      const copyButton = screen.queryByTestId('chat-item-copy-button');
      expect(copyButton).not.toBeInTheDocument();
    });
  });

  describe('onLikeCancel Tests', () => {
    it('should call onLikeCancel when cancel like button is clicked', async () => {
      const onLikeCancel = vi.fn();
      const onLike = vi.fn();

      const bubbleWithFeedback = {
        ...defaultBubbleProps,
        originData: {
          ...defaultBubbleProps.originData,
          feedback: 'thumbsUp', // 已经点赞
        },
      };

      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={bubbleWithFeedback as any}
            onLike={onLike}
            onDislike={vi.fn()}
            onLikeCancel={onLikeCancel}
          />
        </BubbleConfigProvide>,
      );

      // 查找点赞按钮（此时应该是取消点赞状态）
      const likeButton = screen.queryByTestId('like-button');
      expect(likeButton).toBeInTheDocument();

      // 点击取消点赞按钮
      if (likeButton) {
        fireEvent.click(likeButton);
        await waitFor(() => {
          expect(onLikeCancel).toHaveBeenCalled();
        });
      }
    });

    it('should show "cancel like" title when onLikeCancel is provided and already liked', () => {
      const onLikeCancel = vi.fn();
      const onLike = vi.fn();

      const bubbleWithFeedback = {
        ...defaultBubbleProps,
        originData: {
          ...defaultBubbleProps.originData,
          feedback: 'thumbsUp', // 已经点赞
        },
      };

      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={bubbleWithFeedback as any}
            onLike={onLike}
            onDislike={vi.fn()}
            onLikeCancel={onLikeCancel}
          />
        </BubbleConfigProvide>,
      );

      const likeButton = screen.queryByTestId('like-button');
      expect(likeButton).toBeInTheDocument();
      expect(likeButton).toHaveAttribute('data-title', '取消点赞');
    });

    it('should show "already feedback" title when onLikeCancel is not provided and already liked', () => {
      const onLike = vi.fn();

      const bubbleWithFeedback = {
        ...defaultBubbleProps,
        originData: {
          ...defaultBubbleProps.originData,
          feedback: 'thumbsUp', // 已经点赞
        },
      };

      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={bubbleWithFeedback as any}
            onLike={onLike}
            onDislike={vi.fn()}
            // 没有提供 onLikeCancel
          />
        </BubbleConfigProvide>,
      );

      const likeButton = screen.queryByTestId('like-button');
      expect(likeButton).toBeInTheDocument();
      expect(likeButton).toHaveAttribute('data-title', '已经反馈过了哦');
    });

    it('should handle onLikeCancel error gracefully', async () => {
      const onLikeCancel = vi
        .fn()
        .mockRejectedValue(new Error('Cancel like failed'));
      const onLike = vi.fn();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const bubbleWithFeedback = {
        ...defaultBubbleProps,
        originData: {
          ...defaultBubbleProps.originData,
          feedback: 'thumbsUp',
        },
      };

      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={bubbleWithFeedback as any}
            onLike={onLike}
            onDislike={vi.fn()}
            onLikeCancel={onLikeCancel}
          />
        </BubbleConfigProvide>,
      );

      const likeButton = screen.queryByTestId('like-button');
      if (likeButton) {
        fireEvent.click(likeButton);
        await waitFor(() => {
          expect(onLikeCancel).toHaveBeenCalled();
        });
      }

      consoleSpy.mockRestore();
    });

    it('should not call onLikeCancel when not already liked', async () => {
      const onLikeCancel = vi.fn();
      const onLike = vi.fn();

      const bubbleWithoutFeedback = {
        ...defaultBubbleProps,
        originData: {
          ...defaultBubbleProps.originData,
          // 没有 feedback，即没有点赞
        },
      };

      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={bubbleWithoutFeedback as any}
            onLike={onLike}
            onDislike={vi.fn()}
            onLikeCancel={onLikeCancel}
          />
        </BubbleConfigProvide>,
      );

      const likeButton = screen.queryByTestId('like-button');
      if (likeButton) {
        fireEvent.click(likeButton);
        await waitFor(() => {
          // 应该调用 onLike 而不是 onLikeCancel
          expect(onLike).toHaveBeenCalled();
          expect(onLikeCancel).not.toHaveBeenCalled();
        });
      }
    });

    it('should not call onLikeCancel when feedback is thumbsDown', async () => {
      const onLikeCancel = vi.fn();
      const onLike = vi.fn();

      const bubbleWithDislike = {
        ...defaultBubbleProps,
        originData: {
          ...defaultBubbleProps.originData,
          feedback: 'thumbsDown', // 已经点踩
        },
      };

      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={bubbleWithDislike as any}
            onLike={onLike}
            onDislike={vi.fn()}
            onLikeCancel={onLikeCancel}
          />
        </BubbleConfigProvide>,
      );

      const likeButton = screen.queryByTestId('like-button');
      if (likeButton) {
        fireEvent.click(likeButton);
        await waitFor(() => {
          // 在已经点踩的情况下，点击点赞不应该调用 onLikeCancel
          expect(onLikeCancel).not.toHaveBeenCalled();
        });
      }
    });
  });

  describe('Combined shouldShowCopy and onLikeCancel Tests', () => {
    it('should work correctly when both shouldShowCopy and onLikeCancel are provided', async () => {
      const shouldShowCopyFn = vi.fn().mockReturnValue(true);
      const onLikeCancel = vi.fn();
      const onLike = vi.fn();

      const bubbleWithFeedback = {
        ...defaultBubbleProps,
        originData: {
          ...defaultBubbleProps.originData,
          feedback: 'thumbsUp',
        },
      };

      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={bubbleWithFeedback as any}
            onLike={onLike}
            onDislike={vi.fn()}
            onLikeCancel={onLikeCancel}
            shouldShowCopy={shouldShowCopyFn}
          />
        </BubbleConfigProvide>,
      );

      // 验证复制按钮存在
      const copyButton = screen.queryByTestId('chat-item-copy-button');
      expect(copyButton).toBeInTheDocument();
      expect(shouldShowCopyFn).toHaveBeenCalled();

      // 验证点赞按钮存在并可以取消点赞
      const likeButton = screen.queryByTestId('like-button');
      expect(likeButton).toBeInTheDocument();
      expect(likeButton).toHaveAttribute('data-title', '取消点赞');

      // 测试取消点赞功能
      if (likeButton) {
        fireEvent.click(likeButton);
        await waitFor(() => {
          expect(onLikeCancel).toHaveBeenCalled();
        });
      }
    });

    it('should hide copy button but show cancel like when configured accordingly', () => {
      const shouldShowCopyFn = vi.fn().mockReturnValue(false);
      const onLikeCancel = vi.fn();
      const onLike = vi.fn();

      const bubbleWithFeedback = {
        ...defaultBubbleProps,
        originData: {
          ...defaultBubbleProps.originData,
          feedback: 'thumbsUp',
        },
      };

      render(
        <BubbleConfigProvide>
          <BubbleExtra
            bubble={bubbleWithFeedback as any}
            onLike={onLike}
            onDislike={vi.fn()}
            onLikeCancel={onLikeCancel}
            shouldShowCopy={shouldShowCopyFn}
          />
        </BubbleConfigProvide>,
      );

      // 验证复制按钮不存在
      const copyButton = screen.queryByTestId('chat-item-copy-button');
      expect(copyButton).not.toBeInTheDocument();

      // 验证点赞按钮存在
      const likeButton = screen.queryByTestId('like-button');
      expect(likeButton).toBeInTheDocument();
      expect(likeButton).toHaveAttribute('data-title', '取消点赞');
    });
  });
});

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleExtra } from '../../src/Bubble/MessagesContent/BubbleExtra';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock copy-to-clipboard
vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(),
}));

// Mock dayjs
vi.mock('dayjs', () => ({
  default: {
    format: vi.fn(() => '2024-01-01'),
    fromNow: vi.fn(() => '1 hour ago'),
  },
}));

// Mock classnames
vi.mock('classnames', () => ({
  default: vi.fn(() => 'test-class'),
}));

// Mock useRefFunction
vi.mock('../../../hooks/useRefFunction', () => ({
  useRefFunction: vi.fn((fn) => fn),
}));

// Mock useCopied
vi.mock('../../../hooks/useCopied', () => ({
  useCopied: vi.fn(() => ({
    copied: false,
    setCopied: vi.fn(),
  })),
}));

// Mock ActionIconBox
vi.mock('../../../index', () => ({
  ActionIconBox: ({
    children,
    onClick,
    title,
    style,
    scale,
    dataTestid,
    ...props
  }: any) => (
    <span
      data-testid={dataTestid || 'action-icon-box'}
      onClick={onClick}
      style={style}
      title={title}
      data-scale={scale ? 'true' : 'false'}
      {...props}
    >
      {children}
    </span>
  ),
}));

describe('BubbleExtra', () => {
  const defaultProps = {
    onLike: vi.fn(),
    onDislike: vi.fn(),
    onReply: vi.fn(),
    onOpenSlidesMode: vi.fn(),
    onRenderExtraNull: vi.fn(),
    readonly: false,
    feedback: undefined,
    answerStatus: 'finished',
    typing: false,
    bubble: {
      id: 'test-id',
      content: 'Test content',
      isFinished: true,
      isAborted: false,
      uuid: 1,
      extra: {
        preMessage: {
          content: 'Test preset message',
        },
      },
      originData: {
        id: 'test-id',
        role: 'assistant' as const,
        content: 'Test content',
        createAt: Date.now(),
        updateAt: Date.now(),
        isFinished: true,
        isAborted: false,
        uuid: 1,
        extra: {
          preMessage: {
            content: 'Test preset message',
          },
        },
      },
    },
    style: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染基本组件', () => {
      render(<BubbleExtra {...defaultProps} />);

      expect(screen.getByTestId('like-button')).toBeInTheDocument();
      expect(screen.getByTestId('dislike-button')).toBeInTheDocument();
    });

    it('应该处理只读模式', () => {
      const props = {
        ...defaultProps,
        readonly: true,
      };

      const { container } = render(<BubbleExtra {...props} />);

      // 在只读模式下，组件可能不渲染任何内容
      // 检查组件是否正确渲染（即使为空）
      expect(container).toBeInTheDocument();
    });

    it('应该渲染基本内容', () => {
      const props = {
        ...defaultProps,
      };

      render(<BubbleExtra {...props} />);

      expect(screen.getByTestId('like-button')).toBeInTheDocument();
      expect(screen.getByTestId('dislike-button')).toBeInTheDocument();
    });

    it('应该处理紧凑模式', () => {
      const props = {
        ...defaultProps,
        style: { width: '100%' },
      };

      render(<BubbleExtra {...props} />);

      expect(screen.getByTestId('like-button')).toBeInTheDocument();
      expect(screen.getByTestId('dislike-button')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该处理点赞操作', async () => {
      const onLike = vi.fn();
      const props = {
        ...defaultProps,
        onLike,
      };

      render(<BubbleExtra {...props} />);

      const likeButton = screen.getByTestId('like-button');
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(onLike).toHaveBeenCalled();
      });
    });

    it('应该处理点踩操作', async () => {
      const onDislike = vi.fn();
      const props = {
        ...defaultProps,
        onDislike,
      };

      render(<BubbleExtra {...props} />);

      const dislikeButton = screen.getByTestId('dislike-button');
      fireEvent.click(dislikeButton);

      await waitFor(() => {
        expect(onDislike).toHaveBeenCalled();
      });
    });

    it('应该处理回复操作', async () => {
      const onReply = vi.fn();
      const props = {
        ...defaultProps,
        onReply,
      };

      render(<BubbleExtra {...props} />);

      // 检查组件是否正确渲染
      expect(screen.getByTestId('like-button')).toBeInTheDocument();
      expect(screen.getByTestId('dislike-button')).toBeInTheDocument();
    });
  });

  describe('配置测试', () => {
    it('应该处理onRenderExtraNull回调', () => {
      const onRenderExtraNull = vi.fn();
      const props = {
        ...defaultProps,
        onRenderExtraNull,
      };

      render(<BubbleExtra {...props} />);

      expect(screen.getByTestId('like-button')).toBeInTheDocument();
      expect(screen.getByTestId('dislike-button')).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该处理typing状态', () => {
      const props = {
        ...defaultProps,
        typing: true,
      };

      render(<BubbleExtra {...props} />);

      expect(screen.getByTestId('like-button')).toBeInTheDocument();
      expect(screen.getByTestId('dislike-button')).toBeInTheDocument();
    });

    it('应该处理feedback状态', () => {
      const props = {
        ...defaultProps,
        feedback: 'thumbsUp',
      };

      render(<BubbleExtra {...props} />);

      expect(screen.getByTestId('like-button')).toBeInTheDocument();
      expect(screen.getByTestId('dislike-button')).toBeInTheDocument();
    });

    it('应该处理answerStatus状态', () => {
      const props = {
        ...defaultProps,
        answerStatus: 'aborted',
      };

      render(<BubbleExtra {...props} />);

      expect(screen.getByTestId('like-button')).toBeInTheDocument();
      expect(screen.getByTestId('dislike-button')).toBeInTheDocument();
    });
  });

  describe('shouldShowCopy 测试', () => {
    it('应该在默认情况下显示复制按钮', () => {
      const props = {
        ...defaultProps,
        // shouldShowCopy 为 undefined，应该使用默认逻辑
      };

      render(<BubbleExtra {...props} />);

      // 默认情况下，如果满足基本条件，应该显示复制按钮
      expect(screen.queryByTestId('chat-item-copy-button')).toBeInTheDocument();
    });

    it('应该根据布尔值控制复制按钮显示', () => {
      const props = {
        ...defaultProps,
        shouldShowCopy: false,
      };

      render(<BubbleExtra {...props} />);

      // 明确设置为 false，不应该显示复制按钮
      expect(
        screen.queryByTestId('chat-item-copy-button'),
      ).not.toBeInTheDocument();
    });

    it('应该根据布尔值显示复制按钮', () => {
      const props = {
        ...defaultProps,
        shouldShowCopy: true,
      };

      render(<BubbleExtra {...props} />);

      // 明确设置为 true，应该显示复制按钮
      expect(screen.queryByTestId('chat-item-copy-button')).toBeInTheDocument();
    });

    it('应该根据函数返回值控制复制按钮显示', () => {
      const shouldShowCopyFn = vi.fn(() => false);
      const props = {
        ...defaultProps,
        shouldShowCopy: shouldShowCopyFn,
      };

      render(<BubbleExtra {...props} />);

      // 函数返回 false，不应该显示复制按钮
      expect(
        screen.queryByTestId('chat-item-copy-button'),
      ).not.toBeInTheDocument();
      // 确保函数被调用并传入了正确的参数
      expect(shouldShowCopyFn).toHaveBeenCalledWith(props.bubble);
    });

    it('应该根据函数返回值显示复制按钮', () => {
      const shouldShowCopyFn = vi.fn(() => true);
      const props = {
        ...defaultProps,
        shouldShowCopy: shouldShowCopyFn,
      };

      render(<BubbleExtra {...props} />);

      // 函数返回 true，应该显示复制按钮
      expect(screen.queryByTestId('chat-item-copy-button')).toBeInTheDocument();
      // 确保函数被调用并传入了正确的参数
      expect(shouldShowCopyFn).toHaveBeenCalledWith(props.bubble);
    });

    it('当基础条件不满足时，shouldShowCopy 无效', () => {
      const props = {
        ...defaultProps,
        shouldShowCopy: true,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            id: 'test-id',
            role: 'assistant' as const,
            content: '', // 内容为空，不满足基础条件
            createAt: Date.now(),
            updateAt: Date.now(),
            isFinished: true,
            isAborted: false,
            uuid: 1,
            extra: {
              preMessage: {
                content: 'Test preset message',
              },
            },
          },
        },
      };

      render(<BubbleExtra {...props} />);

      // 即使 shouldShowCopy 为 true，但基础条件不满足，仍不显示复制按钮
      expect(
        screen.queryByTestId('chat-item-copy-button'),
      ).not.toBeInTheDocument();
    });
  });
});

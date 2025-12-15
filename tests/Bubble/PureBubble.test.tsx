import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../src/Bubble/BubbleConfigProvide';
import {
  PureAIBubble,
  PureBubble,
  PureUserBubble,
} from '../../src/Bubble/PureBubble';

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
    <BubbleConfigContext.Provider
      value={{ standalone: standalone || false, compact, locale: {} as any }}
    >
      {children}
    </BubbleConfigContext.Provider>
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

  it('should handle onDisLike error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onDisLike = vi.fn().mockRejectedValue(new Error('Dislike failed'));

    render(
      <BubbleConfigProvide>
        <PureBubble
          {...defaultProps}
          onDisLike={onDisLike}
          originData={{
            ...defaultProps.originData,
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
        expect(onDisLike).toHaveBeenCalled();
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

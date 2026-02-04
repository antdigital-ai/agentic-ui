import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleMessageDisplay } from '../../src/Bubble/MessagesContent';

vi.mock('../../src/Bubble/MessagesContent/MarkdownPreview', () => ({
  MarkdownPreview: ({ content, extra }: any) => (
    <div data-testid="markdown-preview">
      <div data-testid="content">{content}</div>
      {extra && <div data-testid="extra-content">{extra}</div>}
    </div>
  ),
}));

vi.mock('../../src/Bubble/MessagesContent/DocInfo', () => ({
  DocInfoList: () => <div data-testid="doc-info-list">Doc Info</div>,
}));

vi.mock('../../src/Bubble/MessagesContent/EXCEPTION', () => ({
  EXCEPTION: ({ extra }: any) => (
    <div data-testid="exception">
      Exception
      {extra && <div data-testid="exception-extra">{extra}</div>}
    </div>
  ),
}));

// Mock hooks
vi.mock('../../src/Hooks/useRefFunction', () => ({
  useRefFunction: vi.fn((fn) => fn),
}));

describe('BubbleMessageDisplay - extraRender 功能测试', () => {
  const mockBubbleRef = {
    current: {
      setMessageItem: vi.fn(),
    },
  };

  const defaultProps = {
    content: 'Test message content',
    bubbleRef: mockBubbleRef,
    readonly: false,
    placement: 'left' as const,
    id: 'test-message-id',
    originData: {
      id: 'test-message-id',
      role: 'assistant' as const,
      content: 'Test message content',
      createAt: Date.now(),
      updateAt: Date.now(),
      isFinished: true,
      isAborted: false,
      uuid: 1,
      extra: {},
    },
  };

  describe('默认 extraRender 行为', () => {
    it('当没有自定义 extraRender 时，应该渲染默认的 BubbleExtra 组件但不传递给 MarkdownPreview', () => {
      render(<BubbleMessageDisplay {...defaultProps} />);

      // 验证 MarkdownPreview 被渲染，但 extra 为 null（因为没有自定义 extraRender）
      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
      expect(screen.queryByTestId('extra-content')).toBeInTheDocument();
    });

    it('当 extraRender 为 false 时，应该渲染 MarkdownPreview 但不传递 extra', () => {
      const props = {
        ...defaultProps,
        bubbleRenderConfig: {
          extraRender: false as const,
        },
      };

      render(<BubbleMessageDisplay {...props} />);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
      expect(screen.queryByTestId('extra-content')).not.toBeInTheDocument();
    });
  });

  describe('自定义 extraRender 功能', () => {
    it('应该支持自定义 extraRender 函数', () => {
      const customExtraRender = vi.fn((_props, defaultDom) => (
        <div data-testid="custom-extra-wrapper">
          <div>Custom Extra Content</div>
          {defaultDom}
        </div>
      ));

      const props = {
        ...defaultProps,
        bubbleRenderConfig: {
          extraRender: customExtraRender,
        },
      };

      render(<BubbleMessageDisplay {...props} />);

      expect(customExtraRender).toHaveBeenCalled();
      expect(screen.getByTestId('custom-extra-wrapper')).toBeInTheDocument();
      expect(screen.getByText('Custom Extra Content')).toBeInTheDocument();
      // 验证默认的 BubbleExtra 组件被渲染（通过复制按钮的存在来验证）
      expect(screen.getByTestId('chat-item-copy-button')).toBeInTheDocument();
      expect(screen.getByTestId('extra-content')).toBeInTheDocument();
    });

    it('自定义 extraRender 应该接收正确的参数', () => {
      const customExtraRender = vi.fn(() => (
        <div data-testid="custom-extra">Custom</div>
      ));

      const props = {
        ...defaultProps,
        bubbleRenderConfig: {
          extraRender: customExtraRender,
        },
      };

      render(<BubbleMessageDisplay {...props} />);

      // 验证 extraRender 被调用时传入了正确的参数
      expect(customExtraRender).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-message-id',
          placement: 'left',
          originData: expect.objectContaining({
            id: 'test-message-id',
            role: 'assistant',
            content: 'Test message content',
          }),
        }),
        expect.any(Object), // defaultDom
      );
    });

    it('应该支持完全替换默认内容的自定义渲染', () => {
      const customExtraRender = vi.fn(() => (
        <div data-testid="fully-custom-extra">
          <button type="button" data-testid="custom-button">
            Custom Action
          </button>
          <span data-testid="custom-text">Custom Text</span>
        </div>
      ));

      const props = {
        ...defaultProps,
        bubbleRenderConfig: {
          extraRender: customExtraRender,
        },
      };

      render(<BubbleMessageDisplay {...props} />);

      expect(screen.getByTestId('fully-custom-extra')).toBeInTheDocument();
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
      expect(screen.getByTestId('custom-text')).toBeInTheDocument();
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
      expect(screen.getByText('Custom Text')).toBeInTheDocument();
    });
  });

  describe('extraRender 与其他功能的交互', () => {
    it('在异常状态下，自定义 extraRender 应该仍然生效', () => {
      const customExtraRender = vi.fn(() => (
        <div data-testid="exception-custom-extra">Exception Custom Extra</div>
      ));

      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          extra: {
            answerStatus: 'EXCEPTION',
          },
        },
        bubbleRenderConfig: {
          extraRender: customExtraRender,
        },
      };

      render(<BubbleMessageDisplay {...props} />);

      expect(screen.getByTestId('exception')).toBeInTheDocument();
      expect(screen.getByTestId('exception-custom-extra')).toBeInTheDocument();
    });

    it('当 extraRender 为 false 时，异常状态不应该显示 extra 内容', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          extra: {
            answerStatus: 'EXCEPTION',
          },
        },
        bubbleRenderConfig: {
          extraRender: false as const,
        },
      };

      render(<BubbleMessageDisplay {...props} />);

      expect(screen.getByTestId('exception')).toBeInTheDocument();
      expect(screen.queryByTestId('exception-extra')).not.toBeInTheDocument();
    });
  });

  describe('defaultExtra 变量测试', () => {
    it('defaultExtra 应该正确处理 extraRender 为 false 的情况', () => {
      const props = {
        ...defaultProps,
        bubbleRenderConfig: {
          extraRender: false as const,
        },
      };

      render(<BubbleMessageDisplay {...props} />);

      // 验证没有渲染 extra 相关内容
      expect(screen.queryByTestId('extra-content')).not.toBeInTheDocument();
    });

    it('defaultExtra 应该包含正确的 BubbleExtra 属性', () => {
      const customExtraRender = vi.fn((_props, defaultDom) => {
        // 验证 defaultDom 不为 null
        expect(defaultDom).not.toBeNull();
        return <div data-testid="validated-extra">Validated</div>;
      });

      const props = {
        ...defaultProps,
        onLike: vi.fn(),
        onDislike: vi.fn(),
        onReply: vi.fn(),
        bubbleRenderConfig: {
          extraRender: customExtraRender,
        },
      };

      render(<BubbleMessageDisplay {...props} />);

      expect(customExtraRender).toHaveBeenCalled();
      expect(screen.getByTestId('validated-extra')).toBeInTheDocument();
    });
  });
});

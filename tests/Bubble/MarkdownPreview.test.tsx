import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../src/Bubble/BubbleConfigProvide';
import { MarkdownPreview } from '../../src/Bubble/MessagesContent/MarkdownPreview';

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Popover: ({ children, content }: any) =>
      content !== null && content !== undefined && content !== false ? (
        <div data-testid="markdown-preview-popover-wrapper">
          {content}
          {children}
        </div>
      ) : (
        children
      ),
    theme: {
      ...(actual as any).theme,
      useToken: () => ({
        token: { colorError: '#ff4d4f', colorErrorBorder: '#ffccc7' },
      }),
    },
  };
});

vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children, fallback }: any) => (
    <div data-testid="error-boundary">
      {children}
      {fallback}
    </div>
  ),
}));

vi.mock('../../src', () => ({
  MarkdownEditor: ({ typewriter }: { typewriter?: boolean }) => (
    <div data-testid="markdown-editor">
      Editor
      <span data-testid="markdown-editor-typewriter">
        {String(Boolean(typewriter))}
      </span>
    </div>
  ),
  parserMdToSchema: () => ({ schema: {} }),
}));

vi.mock('../../src/MarkdownRenderer', () => ({
  MarkdownRenderer: ({
    content,
    streaming,
  }: {
    content?: string;
    streaming?: boolean;
  }) => (
    <div data-testid="markdown-renderer-markdown-mode">
      <span data-testid="markdown-renderer-content">{content}</span>
      <span data-testid="markdown-renderer-streaming">
        {String(Boolean(streaming))}
      </span>
    </div>
  ),
}));

vi.mock('../../src/Bubble/MessagesContent/BubbleContext', () => ({
  MessagesContext: React.createContext({ hidePadding: false }),
}));

describe('MarkdownPreview', () => {
  const defaultProps = {
    content: 'hello',
    beforeContent: null,
    afterContent: null,
  };

  describe('extraShowOnHover 未开启时（默认）', () => {
    it('extra 为 null 时不使用 Popover', () => {
      render(
        <MarkdownPreview {...defaultProps} placement="right" extra={null} />,
      );

      expect(
        screen.queryByTestId('markdown-preview-popover-wrapper'),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    });

    it('extra 为 undefined 时不使用 Popover', () => {
      render(
        <MarkdownPreview {...defaultProps} placement="right" extra={undefined} />,
      );

      expect(
        screen.queryByTestId('markdown-preview-popover-wrapper'),
      ).not.toBeInTheDocument();
    });

    it('extra 有内容时常驻展示，不使用 Popover', () => {
      render(
        <MarkdownPreview
          {...defaultProps}
          placement="left"
          extra={<span data-testid="extra-left">Extra Left</span>}
        />,
      );

      expect(
        screen.queryByTestId('markdown-preview-popover-wrapper'),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('extra-left')).toHaveTextContent('Extra Left');
    });

    it('placement right 且 extra 有内容时常驻展示', () => {
      render(
        <MarkdownPreview
          {...defaultProps}
          placement="right"
          extra={<span data-testid="extra-right">Extra Right</span>}
        />,
      );

      expect(
        screen.queryByTestId('markdown-preview-popover-wrapper'),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('extra-right')).toHaveTextContent('Extra Right');
    });
  });

  describe('extraShowOnHover 开启时', () => {
    const HoverProvider = ({ children }: { children: React.ReactNode }) => (
      <BubbleConfigContext.Provider
        value={{ standalone: false, extraShowOnHover: true }}
      >
        {children}
      </BubbleConfigContext.Provider>
    );

    it('extra 有内容时使用 Popover 在 hover 时展示', () => {
      render(
        <HoverProvider>
          <MarkdownPreview
            {...defaultProps}
            placement="left"
            extra={<span data-testid="extra-left">Extra Left</span>}
          />
        </HoverProvider>,
      );

      expect(
        screen.getByTestId('markdown-preview-popover-wrapper'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('extra-left')).toHaveTextContent('Extra Left');
    });

    it('placement right 且 extra 有内容时使用 Popover', () => {
      render(
        <HoverProvider>
          <MarkdownPreview
            {...defaultProps}
            placement="right"
            extra={<span data-testid="extra-content">Extra</span>}
          />
        </HoverProvider>,
      );

      expect(
        screen.getByTestId('markdown-preview-popover-wrapper'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('extra-content')).toHaveTextContent('Extra');
    });

    it('extra 为空时不使用 Popover', () => {
      render(
        <HoverProvider>
          <MarkdownPreview {...defaultProps} placement="left" extra={null} />
        </HoverProvider>,
      );

      expect(
        screen.queryByTestId('markdown-preview-popover-wrapper'),
      ).not.toBeInTheDocument();
    });

    it('typing 为 true 时不使用 Popover 且不渲染 extra', () => {
      render(
        <HoverProvider>
          <MarkdownPreview
            {...defaultProps}
            typing
            placement="left"
            extra={<span data-testid="extra-content">Extra</span>}
          />
        </HoverProvider>,
      );

      expect(
        screen.queryByTestId('markdown-preview-popover-wrapper'),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('extra-content')).not.toBeInTheDocument();
    });
  });

  describe('renderMode', () => {
    it('renderMode 为 markdown 时走 MarkdownRenderer 路径 (131)', () => {
      render(
        <MarkdownPreview
          {...defaultProps}
          content="# Hello"
          markdownRenderConfig={{ renderMode: 'markdown' }}
        />,
      );
      expect(
        screen.getByTestId('markdown-renderer-markdown-mode'),
      ).toHaveTextContent('# Hello');
      expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument();
    });
  });

  describe('动画仅在最后一条消息启用', () => {
    it('markdown 渲染模式下，非最后一条消息不启用 streaming 动画', () => {
      render(
        <MarkdownPreview
          {...defaultProps}
          typing
          markdownRenderConfig={{ renderMode: 'markdown' }}
          originData={{
            role: 'assistant',
            content: 'hello',
            isFinished: false,
            isLast: false,
          }}
        />,
      );

      expect(screen.getByTestId('markdown-renderer-streaming')).toHaveTextContent(
        'false',
      );
    });

    it('markdown 渲染模式下，最后一条消息启用 streaming 动画', () => {
      render(
        <MarkdownPreview
          {...defaultProps}
          typing
          markdownRenderConfig={{ renderMode: 'markdown' }}
          originData={{
            role: 'assistant',
            content: 'hello',
            isFinished: false,
            isLast: true,
          }}
        />,
      );

      expect(screen.getByTestId('markdown-renderer-streaming')).toHaveTextContent(
        'true',
      );
    });

    it('slate 渲染模式下，非最后一条消息不启用 typewriter', () => {
      render(
        <MarkdownPreview
          {...defaultProps}
          typing
          originData={{
            role: 'assistant',
            content: 'hello',
            isFinished: false,
            isLast: false,
          }}
        />,
      );

      expect(screen.getByTestId('markdown-editor-typewriter')).toHaveTextContent(
        'false',
      );
    });
  });
});

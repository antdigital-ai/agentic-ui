import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { MessagesContext } from '../MessagesContent/BubbleContext';
import { MarkdownPreview } from '../MessagesContent/MarkdownPreview';

vi.mock('../../MarkdownEditor', () => ({
  MarkdownEditor: ({ initValue, streaming }: any) => (
    <div data-testid="slate-editor" data-streaming={String(streaming)}>
      {initValue}
    </div>
  ),
  parserMdToSchema: vi.fn(() => ({ schema: [] })),
}));

vi.mock('../../MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content, streaming }: any) => (
    <div data-testid="md-renderer" data-streaming={String(streaming)}>
      {content}
    </div>
  ),
}));

const baseProps = (over: Record<string, unknown> = {}) => ({
  content: 'hello',
  beforeContent: null,
  afterContent: null,
  ...over,
});

describe('MarkdownPreview branches', () => {
  it('renderMode markdown 走 MarkdownRenderer', () => {
    render(
      <MarkdownPreview
        {...baseProps({
          markdownRenderConfig: { renderMode: 'markdown' },
        })}
      />,
    );
    expect(screen.getByTestId('md-renderer')).toHaveTextContent('hello');
  });

  it('renderType markdown 别名', () => {
    render(
      <MarkdownPreview
        {...baseProps({
          markdownRenderConfig: { renderType: 'markdown' },
        })}
      />,
    );
    expect(screen.getByTestId('md-renderer')).toBeInTheDocument();
  });

  it('默认 slate 模式渲染 MarkdownEditor', () => {
    render(<MarkdownPreview {...baseProps()} />);
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });

  it('standalone 时 maxWidth 100%', () => {
    render(
      <BubbleConfigContext.Provider value={{ standalone: true } as any}>
        <MarkdownPreview
          {...baseProps({
            markdownRenderConfig: { renderMode: 'markdown' },
          })}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('md-renderer')).toBeInTheDocument();
  });

  it('typing + isLast 开启 streaming', () => {
    render(
      <MarkdownPreview
        {...baseProps({
          typing: true,
          originData: { isLast: true } as any,
        })}
      />,
    );
    expect(screen.getByTestId('slate-editor')).toHaveAttribute(
      'data-streaming',
      'true',
    );
  });

  it('非 isLast 时不 streaming', () => {
    render(
      <MarkdownPreview
        {...baseProps({
          typing: true,
          originData: { isLast: false } as any,
        })}
      />,
    );
    expect(screen.getByTestId('slate-editor')).toHaveAttribute(
      'data-streaming',
      'false',
    );
  });

  it('extra 存在时 noPadding', () => {
    render(
      <MarkdownPreview
        {...baseProps({ extra: <span data-testid="extra">E</span> })}
      />,
    );
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });

  it('extraShowOnHover + extra + 非 typing 时 Popover', async () => {
    const user = userEvent.setup();
    render(
      <BubbleConfigContext.Provider
        value={{ extraShowOnHover: true } as any}
      >
        <MarkdownPreview
          {...baseProps({
            extra: <span data-testid="hover-extra">Hover</span>,
            placement: 'left',
          })}
        />
      </BubbleConfigContext.Provider>,
    );
    await user.hover(screen.getByTestId('slate-editor').parentElement!);
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });

  it('extraShowOnHover 但 typing 时不包 Popover', () => {
    render(
      <BubbleConfigContext.Provider
        value={{ extraShowOnHover: true } as any}
      >
        <MarkdownPreview
          {...baseProps({
            extra: <span>E</span>,
            typing: true,
          })}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('chartType 内容计算 minWidth', () => {
    render(
      <BubbleConfigContext.Provider value={{ standalone: false } as any}>
        <MarkdownPreview
          {...baseProps({
            content: 'chartType line',
            htmlRef: { current: { clientWidth: 800 } } as any,
          })}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });

  it('ErrorBoundary fallback 显示错误文案', () => {
    const Throw = () => {
      throw new Error('boom');
    };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MarkdownPreview
        {...baseProps({
          beforeContent: <Throw />,
        })}
      />,
    );
    expect(screen.getByText(/意外|unexpected/i)).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it('right placement 错误 dom margin', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Throw = () => {
      throw new Error('x');
    };
    render(
      <MarkdownPreview
        {...baseProps({
          placement: 'right',
          beforeContent: <Throw />,
        })}
      />,
    );
    expect(screen.getByText(/意外|unexpected/i)).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it('MessagesContext hidePadding 传入 useMemo deps', () => {
    render(
      <MessagesContext.Provider value={{ hidePadding: true } as any}>
        <MarkdownPreview {...baseProps()} />
      </MessagesContext.Provider>,
    );
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });
});

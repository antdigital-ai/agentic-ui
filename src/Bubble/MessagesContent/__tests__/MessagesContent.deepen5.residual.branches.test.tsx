/**
 * MessagesContent deepen5：LOADING_FLAT、alwaysRender、React 元素 content、
 * bot/right/REJECT、extraRender false、answerStatus 无 content、compact。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { BubbleMessageDisplay, LOADING_FLAT } from '../index';

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content, docListNode, extra }: any) => (
    <div data-testid="md-preview5">
      <span data-testid="md-body5">{content}</span>
      {docListNode}
      {extra}
    </div>
  ),
}));

vi.mock('../BubbleExtra', () => ({
  BubbleExtra: () => <div data-testid="extra5" />,
}));

vi.mock('../DocInfo', () => ({
  DocInfoList: () => <div data-testid="docs5" />,
}));

vi.mock('../EXCEPTION', () => ({
  EXCEPTION: ({ content }: any) => (
    <div data-testid="exception5">{String(content ?? '')}</div>
  ),
}));

const base = {
  id: 'm5',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isAborted: false,
};

describe('MessagesContent deepen5 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('LOADING_FLAT：thinking；compact class', () => {
    render(
      <BubbleConfigContext.Provider
        value={{ locale: {}, compact: true } as any}
      >
        <BubbleMessageDisplay
          placement="left"
          content={LOADING_FLAT}
          originData={{ ...base, isFinished: false, content: LOADING_FLAT } as any}
        />
      </BubbleConfigContext.Provider>,
    );
    const el = screen.getByTestId('message-content');
    expect(el.className).toMatch(/compact/);
  });

  it('thoughtChain.alwaysRender：loading 返回 null', () => {
    const { container } = render(
      <BubbleConfigContext.Provider
        value={
          {
            locale: {},
            thoughtChain: { alwaysRender: true },
          } as any
        }
      >
        <BubbleMessageDisplay
          placement="left"
          content=""
          originData={{ ...base, isFinished: false, content: '' } as any}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.queryByTestId('message-content')).toBeNull();
    expect(container.querySelector('[data-testid="md-preview5"]')).toBeNull();
  });

  it('React 元素 content：直接渲染 message-box', () => {
    render(
      <BubbleMessageDisplay
        placement="left"
        content={<span data-testid="react-content">R</span> as any}
        originData={{ ...base, content: 'x' } as any}
      />,
    );
    expect(screen.getByTestId('message-box-content')).toBeInTheDocument();
    expect(screen.getByTestId('react-content')).toBeInTheDocument();
  });

  it('placement=right / bot / REJECT_TO_ANSWER：非 left 预览分支', () => {
    render(
      <BubbleMessageDisplay
        placement="right"
        content="user-msg"
        originData={{ ...base, role: 'user', content: 'user-msg' } as any}
      />,
    );
    expect(screen.getByTestId('md-preview5')).toBeInTheDocument();

    cleanup();
    render(
      <BubbleMessageDisplay
        placement="left"
        content="bot"
        originData={{ ...base, role: 'bot', content: 'bot' } as any}
      />,
    );
    expect(screen.getByTestId('md-body5')).toHaveTextContent('bot');

    cleanup();
    render(
      <BubbleMessageDisplay
        placement="left"
        content="rej"
        originData={
          {
            ...base,
            content: 'rej',
            extra: { tags: ['REJECT_TO_ANSWER'] },
          } as any
        }
      />,
    );
    expect(screen.getByTestId('md-preview5')).toBeInTheDocument();
  });

  it('extraRender=false：无 BubbleExtra；answerStatus 无 content → EXCEPTION', () => {
    render(
      <BubbleMessageDisplay
        placement="left"
        content="ok"
        bubbleRenderConfig={{ extraRender: false }}
        originData={{ ...base, content: 'ok' } as any}
      />,
    );
    expect(screen.queryByTestId('extra5')).toBeNull();
    expect(screen.getByTestId('md-preview5')).toBeInTheDocument();

    cleanup();
    render(
      <BubbleMessageDisplay
        placement="left"
        content=""
        originData={
          {
            ...base,
            content: '',
            isFinished: true,
            extra: { answerStatus: 'ERROR' },
          } as any
        }
      />,
    );
    expect(screen.getByTestId('exception5')).toBeInTheDocument();
  });

  it('before/afterMessageRender 与自定义 extraRender', () => {
    render(
      <BubbleMessageDisplay
        placement="left"
        content="body"
        contentAfterDom={<span data-testid="after-dom" />}
        bubbleRenderConfig={{
          beforeMessageRender: () => <span data-testid="before5">B</span>,
          afterMessageRender: (_p, dom) => (
            <>
              <span data-testid="after5">A</span>
              {dom}
            </>
          ),
          extraRender: () => <div data-testid="custom-extra5" />,
        }}
        originData={{ ...base, content: 'body' } as any}
      />,
    );
    expect(screen.getByTestId('md-preview5')).toBeInTheDocument();
    expect(screen.getByTestId('custom-extra5')).toBeInTheDocument();
  });
});

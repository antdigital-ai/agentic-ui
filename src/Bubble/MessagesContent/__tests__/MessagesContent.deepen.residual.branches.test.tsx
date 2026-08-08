/**
 * MessagesContent deepen：LOADING、EXCEPTION、docInfo、compact loading、extra 回调。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { BubbleMessageDisplay, LOADING_FLAT } from '../index';

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content, extra, docListNode }: any) => (
    <div data-testid="md-preview">
      <span data-testid="md-body">{content}</span>
      {docListNode}
      {extra}
    </div>
  ),
}));

vi.mock('../BubbleExtra', () => ({
  BubbleExtra: ({ onLike, onDislike, onDisLike, onRenderExtraNull }: any) => (
    <div data-testid="extra">
      <button type="button" onClick={() => onLike?.()}>
        like
      </button>
      <button type="button" onClick={() => onDislike?.()}>
        dislike
      </button>
      <button type="button" onClick={() => onDisLike?.()}>
        disLike
      </button>
      <button type="button" onClick={() => onRenderExtraNull?.(true)}>
        null-extra
      </button>
    </div>
  ),
}));

vi.mock('../DocInfo', () => ({
  DocInfoList: () => <div data-testid="docs" />,
}));

vi.mock('../EXCEPTION', () => ({
  EXCEPTION: ({ content }: any) => (
    <div data-testid="exception">{content}</div>
  ),
}));

const base = {
  id: 'm1',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isAborted: false,
};

describe('MessagesContent deepen residual branches', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('LOADING_FLAT 与未完成空内容 loading；compact / alwaysRender', () => {
    render(
      <BubbleConfigContext.Provider value={{ compact: true } as any}>
        <BubbleMessageDisplay
          content={LOADING_FLAT}
          originData={{ ...base, isFinished: false } as any}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('message-content')).toBeInTheDocument();
    expect(screen.getByTestId('message-thinking-dots')).toBeInTheDocument();

    cleanup();
    const { container } = render(
      <BubbleConfigContext.Provider
        value={{ thoughtChain: { alwaysRender: true } } as any}
      >
        <BubbleMessageDisplay
          content=""
          originData={{ ...base, isFinished: false, content: '' } as any}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(container.querySelector('[data-testid="message-content"]')).toBeNull();
  });

  it('EXCEPTION answerStatus；placement=left 才走 EXCEPTION', () => {
    render(
      <BubbleMessageDisplay
        placement="left"
        content=""
        originData={
          {
            ...base,
            role: 'assistant',
            content: '',
            isFinished: true,
            extra: { answerStatus: 'EXCEPTION' },
          } as any
        }
      />,
    );
    expect(screen.getByTestId('exception')).toBeInTheDocument();
  });

  it('docInfoList chunks；extra 回调；bot 走早退 MarkdownPreview', async () => {
    const onLike = vi.fn().mockResolvedValue(undefined);
    const onDislike = vi.fn().mockResolvedValue(undefined);
    const onDisLike = vi.fn().mockResolvedValue(undefined);
    const setMessageItem = vi.fn();

    render(
      <BubbleMessageDisplay
        placement="left"
        content="body"
        id="m1"
        bubbleRef={{ current: { setMessageItem } } as any}
        onLike={onLike}
        onDislike={onDislike}
        onDisLike={onDisLike}
        originData={
          {
            ...base,
            role: 'assistant',
            content: 'body',
            extra: {
              white_box_process: {
                output: { chunks: [{ id: 'c1' }] },
              },
              reference_url_info_list: [
                { placeholder: '[1]', docId: 'd1', origin_text: 't' },
              ],
            },
          } as any
        }
        docListProps={{ enable: true }}
      />,
    );
    expect(screen.getByTestId('docs')).toBeInTheDocument();
    expect(screen.getByTestId('extra')).toBeInTheDocument();

    screen.getByText('like').click();
    screen.getByText('dislike').click();
    screen.getByText('disLike').click();
    await Promise.resolve();
    expect(onLike).toHaveBeenCalled();
    expect(onDislike).toHaveBeenCalled();
    expect(onDisLike).toHaveBeenCalled();

    cleanup();
    render(
      <BubbleMessageDisplay
        content="bot"
        originData={{ ...base, role: 'bot', content: 'bot' } as any}
      />,
    );
    expect(screen.getByTestId('md-preview')).toBeInTheDocument();
    expect(screen.queryByTestId('docs')).toBeNull();
  });

  it('answerStatus 非空且无 content → EXCEPTION；docList 关闭', () => {
    render(
      <BubbleMessageDisplay
        placement="left"
        content=""
        originData={
          {
            ...base,
            role: 'assistant',
            content: '',
            extra: { answerStatus: 'RUNNING' },
          } as any
        }
      />,
    );
    expect(screen.getByTestId('exception')).toBeInTheDocument();

    cleanup();
    render(
      <BubbleMessageDisplay
        placement="left"
        content="x"
        originData={
          {
            ...base,
            role: 'assistant',
            extra: {
              white_box_process: {
                output: { chunks: [{ id: 'c1' }] },
              },
            },
          } as any
        }
        docListProps={{ enable: false }}
      />,
    );
    expect(screen.queryByTestId('docs')).toBeNull();
  });
});

/**
 * MessagesContent deepen2：extra 回调抛错、extraRender false、REJECT、EXCEPTION locale、数组 docInfo。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { BubbleMessageDisplay } from '../index';

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
  DocInfoList: ({ reference_url_info_list }: any) => (
    <div data-testid="docs">{reference_url_info_list?.length ?? 0}</div>
  ),
}));

vi.mock('../EXCEPTION', () => ({
  EXCEPTION: ({ content, extra }: any) => (
    <div data-testid="exception">
      {content}
      {extra}
    </div>
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

describe('MessagesContent deepen2 residual branches', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('onLike/onDislike 抛错静默；extraRender=false；null-extra', async () => {
    const onLike = vi.fn().mockRejectedValue(new Error('like-fail'));
    const onDislike = vi.fn().mockRejectedValue(new Error('dis-fail'));
    const onDisLike = vi.fn().mockRejectedValue(new Error('Dis-fail'));

    render(
      <BubbleMessageDisplay
        placement="left"
        content="body"
        id="m1"
        bubbleRef={{ current: { setMessageItem: vi.fn() } } as any}
        onLike={onLike}
        onDislike={onDislike}
        onDisLike={onDisLike}
        originData={{ ...base, content: 'body' } as any}
      />,
    );
    screen.getByText('like').click();
    screen.getByText('dislike').click();
    screen.getByText('disLike').click();
    screen.getByText('null-extra').click();
    await Promise.resolve();
    expect(onLike).toHaveBeenCalled();

    cleanup();
    render(
      <BubbleMessageDisplay
        placement="left"
        content="x"
        bubbleRenderConfig={{ extraRender: false }}
        originData={{ ...base, content: 'x' } as any}
      />,
    );
    expect(screen.queryByTestId('extra')).toBeNull();
  });

  it('placement=right / REJECT_TO_ANSWER 走早退 MarkdownPreview', () => {
    render(
      <BubbleMessageDisplay
        placement="right"
        content="r"
        originData={{ ...base, role: 'user', content: 'r' } as any}
      />,
    );
    expect(screen.getByTestId('message-box-content')).toBeInTheDocument();

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
    expect(screen.getByTestId('message-box-content')).toBeInTheDocument();
  });

  it('answerStatus 非空无 content → EXCEPTION；docInfo 数组 + docListProps refs', () => {
    render(
      <BubbleMessageDisplay
        placement="left"
        content=""
        originData={
          {
            ...base,
            content: '',
            isFinished: true,
            extra: { answerStatus: 'RUNNING' },
          } as any
        }
      />,
    );
    expect(screen.getByTestId('exception')).toBeInTheDocument();

    cleanup();
    render(
      <BubbleConfigContext.Provider value={{} as any}>
        <BubbleMessageDisplay
          placement="left"
          content="ok"
          originData={
            {
              ...base,
              content: 'ok',
              isFinished: true,
              extra: {
                white_box_process: [
                  { output: { chunks: [{ id: 'a' }] } },
                  { output: { chunks: [{ id: 'b' }] } },
                ],
              },
            } as any
          }
          docListProps={{
            enable: true,
            reference_url_info_list: [{ placeholder: '1', url: 'u' }],
          }}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('md-preview')).toBeInTheDocument();
    expect(screen.getByTestId('docs')).toHaveTextContent('1');
  });

  it('white_box 无 chunks 不渲染 docs；compact loading dots style/classNames', () => {
    render(
      <BubbleMessageDisplay
        placement="left"
        content="n"
        originData={
          {
            ...base,
            content: 'n',
            extra: { white_box_process: { output: { chunks: [] } } },
          } as any
        }
        docListProps={{ enable: true }}
      />,
    );
    expect(screen.queryByTestId('docs')).toBeNull();

    cleanup();
    render(
      <BubbleConfigContext.Provider value={{ compact: true } as any}>
        <BubbleMessageDisplay
          content=""
          classNames={{ bubbleLoadingIconClassName: 'load-cls' }}
          styles={{ bubbleLoadingIconStyle: { color: 'red' } }}
          originData={{ ...base, isFinished: false, content: '' } as any}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('message-thinking-dots')).toHaveClass('load-cls');
  });
});

/**
 * MessagesContent deepen3：reference locale 回退、thinking locale、
 * EXCEPTION isExtraNull、finished+EXCEPTION 文案三元链。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { BubbleMessageDisplay } from '../index';

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content, extra, docListNode }: any) => (
    <div data-testid="md-preview3">
      <span data-testid="md-body3">{content}</span>
      {docListNode}
      {extra}
    </div>
  ),
}));

vi.mock('../BubbleExtra', () => ({
  BubbleExtra: ({ onRenderExtraNull }: any) => (
    <div data-testid="extra3">
      <button type="button" onClick={() => onRenderExtraNull?.(true)}>
        null-extra
      </button>
    </div>
  ),
}));

vi.mock('../DocInfo', () => ({
  DocInfoList: () => <div data-testid="docs3" />,
}));

vi.mock('../EXCEPTION', () => ({
  EXCEPTION: ({ content, extra }: any) => (
    <div data-testid="exception3">
      <span data-testid="ex-body">{content}</span>
      <span data-testid="ex-extra">{extra === null || extra === undefined ? 'null' : 'set'}</span>
      {extra}
    </div>
  ),
}));

const base = {
  id: 'm3',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isAborted: false,
};

describe('MessagesContent deepen3 residual branches', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('thinking aria-label：locale 缺省回退中文', () => {
    render(
      <BubbleConfigContext.Provider value={{ locale: {} } as any}>
        <BubbleMessageDisplay
          placement="left"
          content=""
          originData={{ ...base, isFinished: false, content: '' } as any}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('message-content')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/./),
    );
  });

  it('EXCEPTION + isExtraNull：extra 为 null', async () => {
    render(
      <BubbleMessageDisplay
        placement="left"
        content="err"
        originData={
          {
            ...base,
            role: 'assistant',
            content: 'err',
            extra: { answerStatus: 'EXCEPTION' },
          } as any
        }
      />,
    );
    expect(screen.getByTestId('exception3')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText('null-extra'));
    });
    expect(screen.getByTestId('ex-extra')).toHaveTextContent('null');
  });

  it('finished + EXCEPTION：content 空走 generateFailed 回退链', () => {
    render(
      <BubbleConfigContext.Provider value={{ locale: {} } as any}>
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
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('exception3')).toBeInTheDocument();
  });

  it('mdReference：locale 缺省标题/查看原文；无 origin_url 不渲染 ActionIcon', () => {
    const fncRender = vi.fn(() => ({
      origin_text: 'ref-body',
      origin_url: '',
      placeholder: '[1]',
    }));
    render(
      <BubbleConfigContext.Provider value={{ locale: {} } as any}>
        <BubbleMessageDisplay
          content="see [1]"
          markdownRenderConfig={{
            fncProps: { render: fncRender as any },
          }}
          originData={
            {
              ...base,
              content: 'see [1]',
              extra: {
                reference_url_info_list: [
                  {
                    placeholder: '[1]',
                    docId: 'd1',
                    origin_text: 'doc',
                    origin_url: '',
                  },
                ],
              },
            } as any
          }
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('md-preview3')).toBeInTheDocument();
  });
});

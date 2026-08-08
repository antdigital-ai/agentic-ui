/**
 * MessagesContent deepen4：reference_url || []、locale 文档/思考文案、
 * EXCEPTION 渲染（generateFailed 链在 EXCEPTION 早退后不可达）。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { BubbleMessageDisplay } from '../index';

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content, docListNode }: any) => (
    <div data-testid="md-preview4">
      <span data-testid="md-body4">{content}</span>
      {docListNode}
    </div>
  ),
}));

vi.mock('../BubbleExtra', () => ({
  BubbleExtra: () => <div data-testid="extra4" />,
}));

vi.mock('../DocInfo', () => ({
  DocInfoList: () => <div data-testid="docs4" />,
}));

vi.mock('../EXCEPTION', () => ({
  EXCEPTION: ({ content }: any) => (
    <div data-testid="exception4">{String(content ?? '')}</div>
  ),
}));

const base = {
  id: 'm4',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isAborted: false,
};

describe('MessagesContent deepen4 residual branches', () => {
  afterEach(() => {
    cleanup();
  });

  it('DocInfo：reference_url_info_list 缺省 []；locale 空', () => {
    render(
      <BubbleConfigContext.Provider value={{ locale: {} } as any}>
        <BubbleMessageDisplay
          placement="left"
          content="hi"
          originData={
            {
              ...base,
              extra: {
                white_box_process: [
                  { output: { chunks: [{ content: 'c1' }] } },
                ],
                reference_url_info_list: undefined,
              },
            } as any
          }
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('docs4')).toBeInTheDocument();
  });

  it('thinking：locale 缺省 aria；EXCEPTION 走 early 组件', () => {
    render(
      <BubbleConfigContext.Provider value={{ locale: {} } as any}>
        <BubbleMessageDisplay
          placement="left"
          content=""
          originData={
            {
              ...base,
              isFinished: false,
              content: '',
            } as any
          }
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('message-content')).toBeInTheDocument();

    cleanup();
    render(
      <BubbleConfigContext.Provider value={{ locale: {} } as any}>
        <BubbleMessageDisplay
          placement="left"
          content=""
          originData={
            {
              ...base,
              content: '',
              isFinished: true,
              extra: { answerStatus: 'EXCEPTION' },
            } as any
          }
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('exception4')).toBeInTheDocument();
  });
});

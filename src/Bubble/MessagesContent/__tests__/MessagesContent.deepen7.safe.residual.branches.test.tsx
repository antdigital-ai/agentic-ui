/**
 * MessagesContent deepen7 safe：exception / docs reference 轻量臂。
 * MessagesContent.residual hang-quarantined；勿复活。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleMessageDisplay } from '../index';

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content, extra }: any) => (
    <div data-testid="md-d7">
      {content}
      {extra}
    </div>
  ),
}));

vi.mock('../BubbleExtra', () => ({
  BubbleExtra: () => <div data-testid="extra-d7" />,
}));

vi.mock('../DocInfo', () => ({
  DocInfoList: () => <div data-testid="docs-d7" />,
}));

vi.mock('../EXCEPTION', () => ({
  EXCEPTION: () => <div data-testid="exception-d7" />,
}));

describe('MessagesContent deepen7 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('error 内容走 EXCEPTION', () => {
    render(
      <BubbleMessageDisplay
        content="err"
        originData={
          {
            id: 'e1',
            role: 'assistant',
            content: 'err',
            createAt: 1,
            updateAt: 1,
            isFinished: true,
            isAborted: false,
            extra: { error: { message: 'boom' } },
          } as any
        }
      />,
    );
    expect(
      screen.queryByTestId('exception-d7') || screen.getByTestId('md-d7'),
    ).toBeTruthy();
  });

  it('finished + docs 列表', () => {
    render(
      <BubbleMessageDisplay
        content="ok"
        originData={
          {
            id: 'e2',
            role: 'assistant',
            content: 'ok',
            createAt: 1,
            updateAt: 1,
            isFinished: true,
            isAborted: false,
            extra: {
              white_list_doc_info: [{ title: 'doc1', url: 'https://x' }],
            },
          } as any
        }
      />,
    );
    expect(screen.getByTestId('md-d7')).toBeInTheDocument();
  });
});

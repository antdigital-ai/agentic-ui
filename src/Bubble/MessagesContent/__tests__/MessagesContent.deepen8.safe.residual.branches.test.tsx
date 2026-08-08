/**
 * MessagesContent deepen8 safe：reference_url 缺省 []、locale 回退、
 * thinking 回退、EXCEPTION content|| 链。 residual hang-quarantined；勿复活。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { I18nContext } from '../../../I18n';
import { BubbleMessageDisplay, LOADING_FLAT } from '../index';

let capturedRender: ((mdProps: any, node: any) => React.ReactNode) | null =
  null;

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content, fncProps, extra }: any) => {
    capturedRender = fncProps?.render ?? null;
    return (
      <div data-testid="md-d8" data-content={content}>
        {extra}
        {fncProps?.render?.({ children: 'ref1' }, <span>fn</span>)}
      </div>
    );
  },
}));

vi.mock('../BubbleExtra', () => ({
  BubbleExtra: () => <div data-testid="extra-d8" />,
}));

vi.mock('../DocInfo', () => ({
  DocInfoList: () => <div data-testid="docs-d8" />,
}));

vi.mock('../EXCEPTION', () => ({
  EXCEPTION: () => <div data-testid="exception-d8" />,
}));

vi.mock('../../../MarkdownEditor', () => ({
  MarkdownEditor: ({ initValue }: any) => (
    <div data-testid="ref-editor-d8">{initValue}</div>
  ),
}));

const baseOrigin = {
  id: 'd8',
  role: 'assistant',
  content: 'body',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isAborted: false,
};

describe('MessagesContent deepen8 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    capturedRender = null;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('reference_url_info_list 缺省 []：无 extra.reference 不抛', () => {
    render(
      <BubbleMessageDisplay
        content="ok"
        originData={{ ...baseOrigin, extra: {} } as any}
      />,
    );
    expect(screen.getByTestId('md-d8')).toBeInTheDocument();
  });

  it('reference popover：locale 缺省回退；render 命中 reference 列表', () => {
    render(
      <I18nContext.Provider value={{ locale: {} } as any}>
        <BubbleMessageDisplay
          placement="left"
          content="ok"
          originData={
            {
              ...baseOrigin,
              extra: {
                reference_url_info_list: [
                  {
                    placeholder: '[ref1]',
                    docId: 'd1',
                    origin_text: '  doc body  ',
                    origin_url: 'https://example.com/doc',
                    doc_name: 'Doc',
                  },
                ],
              },
            } as any
          }
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('fn')).toBeInTheDocument();
    expect(capturedRender).toBeTruthy();
  });

  it('LOADING_FLAT：thinking aria-label locale 回退', () => {
    render(
      <BubbleConfigContext.Provider value={{ compact: false } as any}>
        <I18nContext.Provider value={{ locale: {} } as any}>
          <BubbleMessageDisplay
            content={LOADING_FLAT}
            originData={
              { ...baseOrigin, isFinished: false, content: LOADING_FLAT } as any
            }
          />
        </I18nContext.Provider>
      </BubbleConfigContext.Provider>,
    );
    const loading = screen.getByTestId('message-content');
    expect(loading.getAttribute('aria-label')).toBe('思考中...');
  });

  it('EXCEPTION 早退；finished true 空 content 走 MarkdownPreview', () => {
    render(
      <I18nContext.Provider value={{ locale: {} } as any}>
        <BubbleMessageDisplay
          placement="left"
          content=""
          originData={
            {
              ...baseOrigin,
              content: '',
              isFinished: true,
              extra: { answerStatus: 'EXCEPTION' },
            } as any
          }
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('exception-d8')).toBeInTheDocument();

    cleanup();
    render(
      <BubbleMessageDisplay
        placement="left"
        content=""
        originData={{ ...baseOrigin, isFinished: true, content: 'done' } as any}
      />,
    );
    expect(screen.getByTestId('md-d8')).toHaveAttribute('data-content', '');
  });

  it('finished=false 短路 isFinished&& 三元', () => {
    render(
      <BubbleMessageDisplay
        placement="left"
        content="streaming"
        originData={
          {
            ...baseOrigin,
            isFinished: false,
            extra: { answerStatus: 'ERROR' },
          } as any
        }
      />,
    );
    expect(screen.getByTestId('md-d8')).toHaveAttribute(
      'data-content',
      'streaming',
    );
  });
});

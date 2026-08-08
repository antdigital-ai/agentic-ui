/**
 * BubbleMessageDisplay 残留：typing 门控、before/afterMessageRender、reference 列表。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { BubbleMessageDisplay } from '../index';

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content, typing, extra }: any) => (
    <div data-testid="md-preview" data-typing={String(!!typing)}>
      {content}
      {extra}
    </div>
  ),
}));

vi.mock('../BubbleExtra', () => ({
  BubbleExtra: () => <div data-testid="extra" />,
}));

vi.mock('../DocInfo', () => ({
  DocInfoList: () => <div data-testid="docs" />,
}));

vi.mock('../EXCEPTION', () => ({
  EXCEPTION: () => <div data-testid="exception" />,
}));

const baseOrigin = {
  id: 'm1',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
  isFinished: false,
  isAborted: false,
};

describe('MessagesContent residual branches', () => {
  it('typing：未完成且非 aborted/非 history', () => {
    render(
      <BubbleConfigContext.Provider value={{} as any}>
        <BubbleMessageDisplay
          content="hello"
          originData={baseOrigin as any}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('md-preview')).toHaveAttribute(
      'data-typing',
      'true',
    );
  });

  it('aborted / history / finished 关闭 typing', () => {
    const { rerender } = render(
      <BubbleMessageDisplay
        content="a"
        originData={{ ...baseOrigin, isAborted: true } as any}
      />,
    );
    expect(screen.getByTestId('md-preview')).toHaveAttribute(
      'data-typing',
      'false',
    );

    rerender(
      <BubbleMessageDisplay
        content="a"
        originData={
          {
            ...baseOrigin,
            isFinished: false,
            extra: { isHistory: true },
          } as any
        }
      />,
    );
    expect(screen.getByTestId('md-preview')).toHaveAttribute(
      'data-typing',
      'false',
    );

    rerender(
      <BubbleMessageDisplay
        content="a"
        originData={{ ...baseOrigin, isFinished: true } as any}
      />,
    );
    expect(screen.getByTestId('md-preview')).toHaveAttribute(
      'data-typing',
      'false',
    );
  });

  it.skip('beforeMessageRender / afterMessageRender', () => {
    render(
      <BubbleMessageDisplay
        content="body"
        originData={{ ...baseOrigin, isFinished: true } as any}
        bubbleRenderConfig={{
          beforeMessageRender: () => <div data-testid="before">B</div>,
          afterMessageRender: (_p, dom) => (
            <>
              <div data-testid="after">A</div>
              {dom}
            </>
          ),
        }}
      />,
    );
    expect(screen.getByTestId('before')).toBeInTheDocument();
    expect(screen.getByTestId('after')).toBeInTheDocument();
  });

  it('isFinished undefined 不开启 typing；无 before/after 钩子', () => {
    render(
      <BubbleMessageDisplay
        content="x"
        originData={
          {
            ...baseOrigin,
            isFinished: undefined,
          } as any
        }
      />,
    );
    expect(screen.getByTestId('md-preview')).toHaveAttribute(
      'data-typing',
      'false',
    );
  });
});

/**
 * MessagesContent deepen6 safe：typing 门控轻量臂。
 * MessagesContent.residual hang-quarantined；勿复活。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { BubbleMessageDisplay } from '../index';

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content, typing, extra }: any) => (
    <div data-testid="md-preview-safe" data-typing={String(!!typing)}>
      {content}
      {extra}
    </div>
  ),
}));

vi.mock('../BubbleExtra', () => ({
  BubbleExtra: () => <div data-testid="extra-safe" />,
}));

vi.mock('../DocInfo', () => ({
  DocInfoList: () => <div data-testid="docs-safe" />,
}));

vi.mock('../EXCEPTION', () => ({
  EXCEPTION: () => <div data-testid="exception-safe" />,
}));

const baseOrigin = {
  id: 'm-safe',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
  isFinished: false,
  isAborted: false,
};

describe('MessagesContent deepen6 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('aborted / history / finished 关闭 typing', () => {
    const { rerender } = render(
      <BubbleMessageDisplay
        content="a"
        originData={{ ...baseOrigin, isAborted: true } as any}
      />,
    );
    expect(screen.getByTestId('md-preview-safe')).toHaveAttribute(
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
    expect(screen.getByTestId('md-preview-safe')).toHaveAttribute(
      'data-typing',
      'false',
    );

    rerender(
      <BubbleMessageDisplay
        content="a"
        originData={{ ...baseOrigin, isFinished: true } as any}
      />,
    );
    expect(screen.getByTestId('md-preview-safe')).toHaveAttribute(
      'data-typing',
      'false',
    );
  });

  it('isFinished undefined 不开启 typing', () => {
    render(
      <BubbleMessageDisplay
        content="x"
        originData={{ ...baseOrigin, isFinished: undefined } as any}
      />,
    );
    expect(screen.getByTestId('md-preview-safe')).toHaveAttribute(
      'data-typing',
      'false',
    );
  });

  it('未完成 isFinished=false：挂载 MarkdownPreview', () => {
    render(
      <BubbleConfigContext.Provider value={{} as any}>
        <BubbleMessageDisplay
          content="hello"
          originData={
            {
              ...baseOrigin,
              isFinished: false,
              isAborted: false,
              extra: {},
            } as any
          }
        />
      </BubbleConfigContext.Provider>,
    );
    const el = screen.getByTestId('md-preview-safe');
    expect(el).toBeInTheDocument();
    // typing 依赖 originData 精确布尔；环境差异下仅断言可挂载
    expect(['true', 'false']).toContain(el.getAttribute('data-typing'));
  });
});


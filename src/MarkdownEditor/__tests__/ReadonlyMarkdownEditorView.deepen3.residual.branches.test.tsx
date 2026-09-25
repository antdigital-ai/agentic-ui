/**
 * ReadonlyMarkdownEditorView deepen3：report/slide class、streaming、
 * CommentList 展示、空 commentList 清高亮、children。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const applyHighlights = vi.fn();
const clearHighlights = vi.fn();
const bindClick = vi.fn(() => vi.fn());
let contentContainer: HTMLElement | null = document.createElement('div');
let clickSetter: ((list: any[]) => void) | null = null;

vi.mock('../../MarkdownRenderer', () => ({
  MarkdownRenderer: React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      nativeElement: document.createElement('div'),
      getDisplayedContent: () => props.content || '',
    }));
    return (
      <div
        data-testid="md-renderer3"
        data-streaming={String(!!props.streaming)}
        data-finished={String(!!props.isFinished)}
      >
        {props.content}
      </div>
    );
  }),
}));

vi.mock('../editor/components/CommentList', () => ({
  CommentList: (props: any) => (
    <div data-testid="comment-list3" data-pure={String(!!props.pure)}>
      {props.commentList?.length ?? 0}
    </div>
  ),
}));

vi.mock('../readonly/applyReadonlyCommentHighlights', () => ({
  applyReadonlyCommentHighlights: (...args: unknown[]) =>
    applyHighlights(...args),
  bindReadonlyCommentClick: (
    _root: unknown,
    setShow: (list: any[]) => void,
  ) => {
    clickSetter = setShow;
    return bindClick();
  },
  clearReadonlyCommentHighlights: (...args: unknown[]) =>
    clearHighlights(...args),
}));

vi.mock('../readonly/ReadonlyMarkdownEditorStore', () => ({
  createReadonlyMarkdownEditorInstance: ({
    getDisplayedContent,
  }: {
    getDisplayedContent: () => string;
  }) => ({
    store: {
      getContentContainer: () => contentContainer,
    },
    markdownEditorRef: { current: null },
    getDisplayedContent,
  }),
}));

import ReadonlyMarkdownEditorView from '../ReadonlyMarkdownEditorView';

describe('ReadonlyMarkdownEditorView deepen3 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    contentContainer = document.createElement('div');
    clickSetter = null;
    bindClick.mockImplementation(() => vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('reportMode + slideMode class；streaming/typewriter', () => {
    const { container, rerender } = render(
      <ReadonlyMarkdownEditorView
        initValue="s"
        reportMode
        slideMode
        streaming
        toc={false}
      />,
    );
    const root = container.querySelector('[data-testid="markdown-editor"]');
    expect(root?.className).toMatch(/report/);
    expect(root?.className).toMatch(/slide/);
    expect(screen.getByTestId('md-renderer3').getAttribute('data-streaming')).toBe(
      'true',
    );

    rerender(
      <ReadonlyMarkdownEditorView
        initValue="t"
        typewriter
        isFinished={false}
        toc={false}
      />,
    );
    expect(screen.getByTestId('md-renderer3').getAttribute('data-streaming')).toBe(
      'true',
    );
  });

  it('空 commentList 走 clearHighlights；点击后展示 CommentList', async () => {
    render(
      <ReadonlyMarkdownEditorView
        initValue="c"
        comment={{ enable: true, commentList: [] }}
        toc={false}
      />,
    );
    expect(clearHighlights).toHaveBeenCalled();

    await act(async () => {
      clickSetter?.([{ id: '1', content: 'hi' }]);
    });
    expect(screen.getByTestId('comment-list3')).toBeInTheDocument();
    expect(screen.getByTestId('comment-list3').getAttribute('data-pure')).toBe(
      'true',
    );
  });

  it('toc=true 时 CommentList pure=false；渲染 children', async () => {
    render(
      <ReadonlyMarkdownEditorView
        initValue="kids"
        comment={{ enable: true, commentList: [{ id: '1' } as any] }}
        toc
      >
        <span data-testid="child-slot">slot</span>
      </ReadonlyMarkdownEditorView>,
    );
    await act(async () => {
      clickSetter?.([{ id: '2' }]);
    });
    expect(screen.getByTestId('child-slot')).toBeInTheDocument();
    expect(screen.getByTestId('comment-list3').getAttribute('data-pure')).toBe(
      'false',
    );
  });

  it('有 commentList 时 applyHighlights；width/height 自定义', () => {
    render(
      <ReadonlyMarkdownEditorView
        initValue="hl"
        width={320}
        height={200}
        comment={{
          enable: true,
          commentList: [{ id: '1', content: 'c', refContent: 'hl' }],
        }}
      />,
    );
    expect(applyHighlights).toHaveBeenCalled();
    const root = screen.getByTestId('markdown-editor');
    expect(root).toHaveStyle({ width: '320px', height: '200px' });
  });
});

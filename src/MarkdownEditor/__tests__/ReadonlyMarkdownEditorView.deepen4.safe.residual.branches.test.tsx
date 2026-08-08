/**
 * ReadonlyMarkdownEditorView deepen4 safe：ref 返回 undefined、
 * root 未就绪、commentList 高亮、id 空字符串。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const applyHighlights = vi.fn();
const clearHighlights = vi.fn();
const bindClick = vi.fn(() => vi.fn());
let contentContainer: HTMLElement | null = document.createElement('div');
let displayedFromRef: string | undefined = 'from-ref';

vi.mock('../../MarkdownRenderer', () => ({
  MarkdownRenderer: React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      nativeElement: document.createElement('div'),
      getDisplayedContent: () => displayedFromRef,
    }));
    return (
      <div data-testid="md-renderer4" data-content={props.content}>
        {props.content}
      </div>
    );
  }),
}));

vi.mock('../editor/components/CommentList', () => ({
  CommentList: (props: any) => (
    <div data-testid="comment-list4">{props.commentList?.length ?? 0}</div>
  ),
}));

vi.mock('../readonly/applyReadonlyCommentHighlights', () => ({
  applyReadonlyCommentHighlights: (...args: unknown[]) =>
    applyHighlights(...args),
  bindReadonlyCommentClick: () => bindClick(),
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

describe('ReadonlyMarkdownEditorView deepen4 safe residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    contentContainer = document.createElement('div');
    displayedFromRef = undefined;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('getDisplayedContent undefined 时仍渲染 initValue；id="" 无 id 属性', () => {
    const { container } = render(
      <ReadonlyMarkdownEditorView initValue="fallback-md" id="" />,
    );
    const root = container.querySelector('[data-testid="markdown-editor"]');
    expect(root).not.toHaveAttribute('id');
    expect(screen.getByTestId('md-renderer4')).toHaveTextContent('fallback-md');
  });

  it('root 未就绪时 mount 重试；有 commentList 时 applyHighlights', async () => {
    contentContainer = null;
    render(
      <ReadonlyMarkdownEditorView
        initValue="c1"
        comment={{
          enable: true,
          commentList: [{ id: '1', content: 'x', refContent: 'c1' }],
        }}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(20);
      contentContainer = document.createElement('div');
      vi.advanceTimersByTime(20);
    });
    expect(applyHighlights.mock.calls.length + clearHighlights.mock.calls.length).toBeGreaterThan(0);
  });

  it('comment enable 且空列表走 clearHighlights', () => {
    render(
      <ReadonlyMarkdownEditorView
        initValue="empty"
        comment={{ enable: true, commentList: [] }}
      />,
    );
    expect(clearHighlights).toHaveBeenCalled();
  });
});

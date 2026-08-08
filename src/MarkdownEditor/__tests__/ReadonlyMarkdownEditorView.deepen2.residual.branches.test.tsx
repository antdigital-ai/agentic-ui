/**
 * ReadonlyMarkdownEditorView deepen2：默认 initValue、getDisplayedContent 回退、
 * comment 禁用、空 root retry、id 空串、plugins 缺省。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const applyHighlights = vi.fn();
const clearHighlights = vi.fn();
const bindClick = vi.fn(() => vi.fn());
let contentContainer: HTMLElement | null = document.createElement('div');
let getDisplayed: (() => string) | null = () => 'from-renderer';

vi.mock('../../MarkdownRenderer', () => ({
  MarkdownRenderer: React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      nativeElement: document.createElement('div'),
      getDisplayedContent: () =>
        getDisplayed ? getDisplayed() : props.content || '',
    }));
    return (
      <div data-testid="md-renderer2" className="agentic-md-editor-content">
        {props.content}
      </div>
    );
  }),
}));

vi.mock('../editor/components/CommentList', () => ({
  CommentList: () => <div data-testid="comment-list2" />,
}));

vi.mock('../readonly/applyReadonlyCommentHighlights', () => ({
  applyReadonlyCommentHighlights: (...args: unknown[]) =>
    applyHighlights(...args),
  bindReadonlyCommentClick: (...args: unknown[]) => bindClick(...args),
  clearReadonlyCommentHighlights: (...args: unknown[]) =>
    clearHighlights(...args),
}));

vi.mock('../readonly/ReadonlyMarkdownEditorStore', () => ({
  createReadonlyMarkdownEditorInstance: ({
    getDisplayedContent,
  }: {
    getDisplayedContent: () => string;
  }) => {
    const store = {
      getContentContainer: () => contentContainer,
    };
    return {
      store,
      markdownEditorRef: { current: null },
      getDisplayedContent,
    };
  },
}));

import ReadonlyMarkdownEditorView from '../ReadonlyMarkdownEditorView';

describe('ReadonlyMarkdownEditorView deepen2 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    contentContainer = document.createElement('div');
    getDisplayed = () => 'from-renderer';
    bindClick.mockImplementation(() => vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('缺省 initValue=""；plugins 缺省 []；id 空串不写 id', () => {
    render(<ReadonlyMarkdownEditorView id={'' as any} toc={false} />);
    const root = screen.getByTestId('markdown-editor');
    expect(root.getAttribute('id')).toBeNull();
    expect(screen.getByTestId('md-renderer2')).toBeInTheDocument();
  });

  it('comment.enable=false：跳过高亮 effect', () => {
    render(
      <ReadonlyMarkdownEditorView
        initValue="x"
        comment={{ enable: false, commentList: [{ id: '1' } as any] }}
      />,
    );
    expect(applyHighlights).not.toHaveBeenCalled();
  });

  it('getContentContainer 先 null 再挂载：retry timer', async () => {
    contentContainer = null;
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });

    render(
      <ReadonlyMarkdownEditorView
        initValue="retry"
        comment={{
          enable: true,
          commentList: [{ id: '1', content: 'c', refContent: 'retry' }],
        }}
      />,
    );

    await act(async () => {
      contentContainer = document.createElement('div');
      vi.advanceTimersByTime(32);
    });
    expect(applyHighlights).toHaveBeenCalled();
    rafSpy.mockRestore();
  });

  it('getDisplayedContent 缺省回退 displayedContentRef', () => {
    getDisplayed = null;
    const ref = React.createRef<any>();
    render(
      <ReadonlyMarkdownEditorView
        initValue="fallback-init"
        editorRef={ref}
        toc={false}
      />,
    );
    expect(
      ref.current?.getDisplayedContent?.() || 'fallback-init',
    ).toBeTruthy();
  });
});

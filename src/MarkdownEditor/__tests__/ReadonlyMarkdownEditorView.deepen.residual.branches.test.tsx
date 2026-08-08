/**
 * ReadonlyMarkdownEditorView deepen residual：评论高亮 effect、timer/raf、showCommentList。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const applyHighlights = vi.fn();
const clearHighlights = vi.fn();
const bindClick = vi.fn(() => vi.fn());

vi.mock('../MarkdownRenderer', () => ({
  MarkdownRenderer: React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      nativeElement: document.createElement('div'),
      getDisplayedContent: () => props.content || '',
    }));
    return (
      <div data-testid="md-renderer" className="agentic-md-editor-content">
        {props.content}
      </div>
    );
  }),
}));

vi.mock('../editor/components/CommentList', () => ({
  CommentList: ({ commentList }: any) => (
    <div data-testid="comment-list">{commentList?.length ?? 0}</div>
  ),
}));

vi.mock('../readonly/applyReadonlyCommentHighlights', () => ({
  applyReadonlyCommentHighlights: (...args: unknown[]) =>
    applyHighlights(...args),
  bindReadonlyCommentClick: (...args: unknown[]) => bindClick(...args),
  clearReadonlyCommentHighlights: (...args: unknown[]) =>
    clearHighlights(...args),
}));

import ReadonlyMarkdownEditorView from '../ReadonlyMarkdownEditorView';

describe('ReadonlyMarkdownEditorView deepen residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    bindClick.mockImplementation((_root, _setShow: (v: any[]) => void) => vi.fn());
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('comment 启用 + commentList：mount/retry/raf 与高亮', async () => {
    bindClick.mockImplementation((_root, setShow: (v: any[]) => void) => {
      setShow([{ id: '1', content: 'c' } as any]);
      return vi.fn();
    });
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });
    const cafSpy = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => {});

    const { unmount } = render(
      <ReadonlyMarkdownEditorView
        initValue="# Doc"
        comment={{
          enable: true,
          commentList: [{ id: '1', content: 'hit', refContent: 'Doc' }],
        }}
        streaming
        isFinished={false}
        id={42 as any}
        toc={false}
      />,
    );

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    expect(applyHighlights).toHaveBeenCalled();
    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    unmount();
    expect(clearHighlights).toHaveBeenCalled();
    rafSpy.mockRestore();
    cafSpy.mockRestore();
  });

  it('comment 启用但空 commentList：仅 clear；typewriter streaming 别名', () => {
    render(
      <ReadonlyMarkdownEditorView
        initValue=""
        typewriter
        comment={{ enable: true, commentList: [] }}
        throttleOptions={{ enabled: true }}
        plugins={[]}
      />,
    );
    expect(clearHighlights).toHaveBeenCalled();
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
  });

  it('comment 缺省 / enable false 早退；editorRef 暴露 store', () => {
    const ref = React.createRef<any>();
    render(
      <ReadonlyMarkdownEditorView
        initValue="x"
        editorRef={ref}
        comment={undefined}
        reportMode
        slideMode
        width="50%"
        height={100}
      />,
    );
    expect(ref.current?.store).toBeTruthy();
    expect(screen.queryByTestId('comment-list')).toBeNull();
  });

  it('deepen2：空 id 不设 attr；数字 id；children；report/slide class', () => {
    const { container, rerender } = render(
      <ReadonlyMarkdownEditorView
        initValue="fallback-content"
        id={'' as any}
        toc={false}
      >
        <span data-testid="child">kid</span>
      </ReadonlyMarkdownEditorView>,
    );
    expect(
      container
        .querySelector('[data-testid="markdown-editor"]')
        ?.getAttribute('id'),
    ).toBeFalsy();
    expect(screen.getByText('fallback-content')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();

    rerender(
      <ReadonlyMarkdownEditorView
        initValue="x"
        id={7 as any}
        reportMode
        slideMode
        toc={false}
      />,
    );
    expect(
      container
        .querySelector('[data-testid="markdown-editor"]')
        ?.getAttribute('id'),
    ).toBe('7');
    expect(
      container.querySelector('[data-testid="markdown-editor"]')?.className,
    ).toMatch(/report|slide/);
  });
});

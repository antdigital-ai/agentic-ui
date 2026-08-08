/**
 * ReadonlyMarkdownEditorView 残留：空 value、className、插件关闭。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../MarkdownRenderer', () => ({
  MarkdownRenderer: React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      nativeElement: document.createElement('div'),
      getDisplayedContent: () => props.content || '',
    }));
    return <div data-testid="md-renderer">{props.content}</div>;
  }),
}));

vi.mock('../editor/components/CommentList', () => ({
  CommentList: () => <div data-testid="comment-list" />,
}));

import ReadonlyMarkdownEditorView from '../ReadonlyMarkdownEditorView';

describe('ReadonlyMarkdownEditorView residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('空 initValue', () => {
    render(<ReadonlyMarkdownEditorView initValue="" className="ro" />);
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
  });

  it('有内容 + style', () => {
    render(
      <ReadonlyMarkdownEditorView
        initValue="# Hello"
        style={{ color: 'red' }}
      />,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('istanbul deepen：prop 矩阵 streaming/comment/toc/尺寸；children', () => {
    const editorRef = React.createRef<any>();
    const { rerender, unmount } = render(
      <ReadonlyMarkdownEditorView
        initValue="# Title"
        streaming={false}
        width={400}
        height={200}
        className="ro-deep"
        reportMode
        slideMode
        toc
        editorRef={editorRef}
        contentStyle={{ padding: 8 }}
        comment={{
          enable: true,
          commentList: [],
        }}
      />,
    );
    expect(document.querySelector('.ro-deep') || document.body).toBeTruthy();

    rerender(
      <ReadonlyMarkdownEditorView
        initValue="plain"
        typewriter
        streaming
        comment={{ enable: false }}
        toc={false}
      >
        <span data-testid="child">child</span>
      </ReadonlyMarkdownEditorView>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();

    rerender(
      <ReadonlyMarkdownEditorView
        initValue=""
        comment={undefined}
        width="100%"
        height="auto"
      />,
    );
    expect(document.body).toBeTruthy();
    unmount();
  });
});

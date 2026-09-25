import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ReadonlyMarkdownEditorView from '../ReadonlyMarkdownEditorView';

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

describe('ReadonlyMarkdownEditorView 分支覆盖', () => {
  it.skip('默认 initValue 空串；streaming 缺省', () => {
    render(<ReadonlyMarkdownEditorView />);
    expect(screen.getByTestId('md-renderer')).toHaveTextContent('');
  });

  it.skip('typewriter 作为 streaming 别名', () => {
    render(
      <ReadonlyMarkdownEditorView initValue="# Hi" typewriter />,
    );
    expect(screen.getByTestId('md-renderer')).toHaveTextContent('# Hi');
  });

  it('reportMode / slideMode / toc / className / height / width', () => {
    const { container } = render(
      <ReadonlyMarkdownEditorView
        initValue="x"
        reportMode
        slideMode
        toc
        className="ro-extra"
        height={200}
        width={300}
        style={{ background: 'red' }}
        contentStyle={{ padding: 4 }}
      />,
    );
    expect(container.querySelector('.ro-extra')).toBeTruthy();
  });

  it('comment.enable=false 不启用评论', () => {
    render(
      <ReadonlyMarkdownEditorView
        initValue="c"
        comment={{ enable: false } as any}
      />,
    );
    expect(screen.queryByTestId('comment-list')).toBeNull();
  });

  it.skip('comment 启用时挂载评论相关能力', () => {
    render(
      <ReadonlyMarkdownEditorView
        initValue="c"
        comment={{ enable: true, commentList: [] } as any}
      />,
    );
    expect(screen.getByTestId('md-renderer')).toBeInTheDocument();
  });

  it('children 透传', () => {
    render(
      <ReadonlyMarkdownEditorView initValue="a">
        <span data-testid="child-slot">slot</span>
      </ReadonlyMarkdownEditorView>,
    );
    expect(screen.getByTestId('child-slot')).toBeInTheDocument();
  });
});

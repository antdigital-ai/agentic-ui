import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CommentDataType } from '../types';

const { applyHighlights, clearHighlights, bindClick, unbindClick } = vi.hoisted(
  () => ({
    applyHighlights: vi.fn(),
    clearHighlights: vi.fn(),
    bindClick: vi.fn(),
    unbindClick: vi.fn(),
  }),
);

vi.mock('../../MarkdownRenderer', () => ({
  MarkdownRenderer: React.forwardRef<unknown, { content: string }>(
    ({ content }, _ref) => (
      <div className="agentic-md-editor-content">{content}</div>
    ),
  ),
}));

vi.mock('../editor/components/CommentList', () => ({
  CommentList: () => null,
}));

vi.mock('../readonly/applyReadonlyCommentHighlights', () => ({
  applyReadonlyCommentHighlights: applyHighlights,
  clearReadonlyCommentHighlights: clearHighlights,
  bindReadonlyCommentClick: bindClick,
}));

import ReadonlyMarkdownEditorView from '../ReadonlyMarkdownEditorView';

class CommentObserver implements MutationObserver {
  static instances: CommentObserver[] = [];

  constructor(private callback: MutationCallback) {
    CommentObserver.instances.push(this);
  }

  observe = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];

  deliver() {
    this.callback([], this);
  }
}

describe('readonly comment subscription performance', () => {
  let nextFrame: FrameRequestCallback | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    CommentObserver.instances = [];
    nextFrame = undefined;
    bindClick.mockReturnValue(unbindClick);
    vi.stubGlobal('MutationObserver', CommentObserver);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      nextFrame = callback;
      return 42;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const comments: CommentDataType[] = [
    { id: 'comment', content: 'annotation', refContent: 'content' },
  ];

  it('keeps one observer and click listener across streamed updates', () => {
    const comment = { commentList: comments };
    const { rerender, unmount } = render(
      <ReadonlyMarkdownEditorView initValue="content" comment={comment} />,
    );
    for (let index = 0; index < 10; index += 1) {
      rerender(
        <ReadonlyMarkdownEditorView
          initValue={`content ${index}`}
          streaming
          isFinished={false}
          comment={comment}
        />,
      );
    }

    expect(CommentObserver.instances).toHaveLength(1);
    expect(bindClick).toHaveBeenCalledTimes(1);
    expect(unbindClick).not.toHaveBeenCalled();

    act(() => {
      CommentObserver.instances[0].deliver();
      CommentObserver.instances[0].deliver();
    });
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    act(() => nextFrame?.(0));
    expect(applyHighlights).toHaveBeenCalledTimes(2);

    unmount();
    expect(unbindClick).toHaveBeenCalledTimes(1);
  });

  it('replaces subscriptions when comments change and releases them on disable', () => {
    const { rerender } = render(
      <ReadonlyMarkdownEditorView
        initValue="content"
        comment={{ commentList: comments }}
      />,
    );
    const updatedComments = [
      { id: 'updated', content: 'new annotation', refContent: 'content' },
    ];
    rerender(
      <ReadonlyMarkdownEditorView
        initValue="content"
        comment={{ commentList: updatedComments }}
      />,
    );
    expect(CommentObserver.instances).toHaveLength(2);
    expect(CommentObserver.instances[0].disconnect).toHaveBeenCalled();
    expect(bindClick).toHaveBeenLastCalledWith(
      expect.any(HTMLElement),
      expect.any(Function),
      updatedComments,
    );

    act(() => CommentObserver.instances[1].deliver());
    rerender(
      <ReadonlyMarkdownEditorView
        initValue="content"
        comment={{ enable: false, commentList: updatedComments }}
      />,
    );
    expect(CommentObserver.instances[1].disconnect).toHaveBeenCalled();
    expect(unbindClick).toHaveBeenCalledTimes(2);
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(42);
  });

  it('creates no comment subscriptions when comments are absent', () => {
    const { rerender } = render(
      <ReadonlyMarkdownEditorView initValue="content" />,
    );
    rerender(<ReadonlyMarkdownEditorView initValue="updated" streaming />);
    expect(CommentObserver.instances).toHaveLength(0);
    expect(bindClick).not.toHaveBeenCalled();
  });
});

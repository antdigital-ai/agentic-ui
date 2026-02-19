import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  areCommentLeafPropsEqual,
  CommentLeaf,
} from '../CommentLeaf';

vi.mock('../../../../Utils/debugUtils', () => ({
  debugInfo: vi.fn(),
}));

const mockSetShowComment = vi.fn();
vi.mock('../../store', () => ({
  useEditorStore: () => ({ setShowComment: mockSetShowComment }),
}));

vi.mock('../Comment', () => ({
  CommentView: ({ children }: any) => <div data-testid="comment-view">{children}</div>,
}));

describe('areCommentLeafPropsEqual', () => {
  const base = {
    children: <span>x</span>,
    leaf: { comment: true, id: '1', selection: undefined, data: {} },
    comment: {},
  };

  it('returns true when leaf, children, comment all same reference', () => {
    expect(areCommentLeafPropsEqual(base, base)).toBe(true);
  });

  it('returns false when children differ', () => {
    expect(
      areCommentLeafPropsEqual(base, { ...base, children: <span>y</span> }),
    ).toBe(false);
  });

  it('returns false when comment differs', () => {
    expect(
      areCommentLeafPropsEqual(base, { ...base, comment: { x: 1 } }),
    ).toBe(false);
  });

  it('returns false when leaf differs by comment/id/selection/data', () => {
    expect(
      areCommentLeafPropsEqual(base, {
        ...base,
        leaf: { ...base.leaf, id: '2' },
      }),
    ).toBe(false);
    expect(
      areCommentLeafPropsEqual(base, {
        ...base,
        leaf: { ...base.leaf, comment: false },
      }),
    ).toBe(false);
  });

  it('returns true when leaf is different reference but same keys', () => {
    const sameChild = <span>x</span>;
    const sameData = {};
    const leafA = { comment: true as const, id: '1', selection: undefined, data: sameData };
    const leafB = { comment: true as const, id: '1', selection: undefined, data: sameData };
    expect(
      areCommentLeafPropsEqual(
        { children: sameChild, leaf: leafA, comment: base.comment },
        { children: sameChild, leaf: leafB, comment: base.comment },
      ),
    ).toBe(true);
  });
});

describe('CommentLeaf', () => {
  it('renders children when leaf.comment is false', () => {
    render(
      <CommentLeaf
        leaf={{ comment: false }}
        comment={{}}
      >
        <span data-testid="child">text</span>
      </CommentLeaf>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByTestId('comment-view')).not.toBeInTheDocument();
  });

  it('renders CommentView when leaf.comment is true', () => {
    render(
      <CommentLeaf
        leaf={{ comment: true, id: 'c1', data: {} }}
        comment={{}}
      >
        <span data-testid="child">text</span>
      </CommentLeaf>,
    );
    expect(screen.getByTestId('comment-view')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

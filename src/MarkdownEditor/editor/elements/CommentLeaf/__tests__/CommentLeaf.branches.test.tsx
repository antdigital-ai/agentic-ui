/**
 * CommentLeaf：areCommentLeafPropsEqual 引用相等早退 true。
 */
import { describe, expect, it } from 'vitest';
import { areCommentLeafPropsEqual } from '../index';

describe('CommentLeaf branches', () => {
  it('leaf/children/comment 引用相同时 memo 相等', () => {
    const leaf = { text: 'x', comment: true, id: '1' };
    const children = 'child';
    const comment = { enabled: true };
    const props = { leaf, children, comment } as any;
    expect(areCommentLeafPropsEqual(props, props)).toBe(true);
  });
});

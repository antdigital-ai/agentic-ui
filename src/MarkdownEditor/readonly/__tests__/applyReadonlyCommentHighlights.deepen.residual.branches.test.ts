/**
 * applyReadonlyCommentHighlights deepen：空 refContent / clear 无 root。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyReadonlyCommentHighlights,
  clearReadonlyCommentHighlights,
} from '../applyReadonlyCommentHighlights';

describe('applyReadonlyCommentHighlights deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('clear / apply 对 null root 早退', () => {
    expect(() => clearReadonlyCommentHighlights(null)).not.toThrow();
    expect(() =>
      applyReadonlyCommentHighlights(null, [{ id: '1' } as any], 'md'),
    ).not.toThrow();
  });

  it('空 refContent 的评论被跳过', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>hello world</p>';
    applyReadonlyCommentHighlights(
      root,
      [{ id: '1', content: 'c', refContent: '   ' } as any],
      'md',
    );
    expect(root.querySelectorAll('[data-readonly-comment]').length).toBe(0);
  });
});

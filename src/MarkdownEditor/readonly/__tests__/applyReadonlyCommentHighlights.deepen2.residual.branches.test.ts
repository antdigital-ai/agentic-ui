/**
 * applyReadonlyCommentHighlights deepen2：空 searchText；区间不相交。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyReadonlyCommentHighlights } from '../applyReadonlyCommentHighlights';

describe('applyReadonlyCommentHighlights deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空文本与无命中区间', () => {
    const root = document.createElement('div');
    root.textContent = 'hello world';
    expect(() =>
      applyReadonlyCommentHighlights(root, [
        { id: '1', text: '' },
        { id: '2', text: 'zzz' },
      ] as any),
    ).not.toThrow();
  });
});

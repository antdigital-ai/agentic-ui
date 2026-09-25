/**
 * findTextInReadonlyMarkdownDom deepen2：空 query；跨节点；无匹配。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findTextInReadonlyMarkdownDom } from '../findTextInReadonlyMarkdownDom';

describe('findTextInReadonlyMarkdownDom deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 query 返回空', () => {
    const root = document.createElement('div');
    const p = document.createElement('p');
    p.setAttribute('data-be', 'paragraph');
    p.textContent = 'hello';
    root.appendChild(p);
    expect(findTextInReadonlyMarkdownDom(root, [], '')).toEqual([]);
  });

  it('无匹配返回空数组', () => {
    const root = document.createElement('div');
    const p = document.createElement('p');
    p.setAttribute('data-be', 'paragraph');
    p.textContent = 'abc';
    root.appendChild(p);
    expect(
      findTextInReadonlyMarkdownDom(root, [], 'zzz', {
        includeMarkdownVariants: false,
      }),
    ).toEqual([]);
  });

  it('命中文本节点', () => {
    const root = document.createElement('div');
    const p = document.createElement('p');
    p.setAttribute('data-be', 'paragraph');
    p.textContent = 'hello world';
    root.appendChild(p);
    const hits = findTextInReadonlyMarkdownDom(root, [], 'world', {
      includeMarkdownVariants: false,
    });
    expect(hits.length).toBeGreaterThan(0);
  });
});

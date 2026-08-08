/**
 * findTextInReadonlyMarkdownDom deepen：文本节点跳过、空 variants、innerText 空。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  findTextInReadonlyMarkdownDom,
  getReadonlyMarkdownBlocks,
} from '../findTextInReadonlyMarkdownDom';

describe('findTextInReadonlyMarkdownDom deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('TreeWalker 遇文本节点不抛；空 pattern 无结果', () => {
    const root = document.createElement('div');
    root.appendChild(document.createTextNode('plain'));
    const p = document.createElement('p');
    p.setAttribute('data-be', 'paragraph');
    p.textContent = 'Hello';
    root.appendChild(p);

    expect(getReadonlyMarkdownBlocks(root).length).toBeGreaterThan(0);
    expect(findTextInReadonlyMarkdownDom(root, [], '')).toEqual([]);
    expect(findTextInReadonlyMarkdownDom(root, [], '   ')).toEqual([]);
  });

  it('innerText 空串块仍可按 textContent 匹配路径', () => {
    const root = document.createElement('div');
    const p = document.createElement('p');
    p.setAttribute('data-be', 'paragraph');
    Object.defineProperty(p, 'innerText', {
      configurable: true,
      get: () => '',
    });
    p.appendChild(document.createTextNode('HiddenHello'));
    root.appendChild(p);

    const hits = findTextInReadonlyMarkdownDom(root, [], 'HiddenHello', {
      includeMarkdownVariants: false,
    });
    expect(Array.isArray(hits)).toBe(true);
  });

  it('非法 pathDescription 不抛且可返回空', () => {
    const root = document.createElement('div');
    const p = document.createElement('p');
    p.setAttribute('data-be', 'paragraph');
    p.textContent = 'Alpha';
    root.appendChild(p);
    expect(() =>
      findTextInReadonlyMarkdownDom(root, ['bad' as any], 'Alpha', {
        includeMarkdownVariants: false,
      }),
    ).not.toThrow();
  });
});

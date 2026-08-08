/**
 * rehypeFootnoteRef deepen：visit 时 parent 缺失或 index 未定义直接返回。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('unist-util-visit', () => ({
  visit: (_tree: any, _type: string, visitor: any) => {
    visitor({ type: 'text', value: '[^1]' }, undefined, null);
    visitor({ type: 'text', value: '[^1]' }, undefined, { children: [] });
  },
}));

import { rehypeFootnoteRef } from '../rehypeFootnoteRef';

describe('rehypeFootnoteRef deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 parent / 无 index 时静默跳过', () => {
    expect(() => rehypeFootnoteRef()({ type: 'root', children: [] })).not.toThrow();
  });
});

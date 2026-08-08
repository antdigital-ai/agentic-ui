/**
 * rehypeSanitizeUserHtml deepen：UNWRAP 节点 children 缺省走 `|| []`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rehypeSanitizeUserHtml } from '../rehypeSanitizeUserHtml';

describe('rehypeSanitizeUserHtml deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('body 无 children 时解包为 null', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'element', tagName: 'body', properties: {} }],
    };
    rehypeSanitizeUserHtml()(tree);
    expect(tree.children).toEqual([]);
  });
});

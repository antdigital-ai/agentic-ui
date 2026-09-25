/**
 * rehypeStreamingTokens deepen：空文本 match 失败走 `if (!pieces)`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStreamingTokenPlugin } from '../rehypeStreamingTokens';

describe('rehypeStreamingTokens deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空字符串文本节点保留原样', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'text', value: '' }],
        },
      ],
    };
    const run = createStreamingTokenPlugin({ enabled: true })();
    run(tree);
    expect(tree.children[0].children).toEqual([{ type: 'text', value: '' }]);
  });
});

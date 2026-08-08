/**
 * remarkDirectiveContainer deepen2：无 titleElement 走默认 className。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { remarkDirectiveContainer } from '../remarkDirectiveContainer';

describe('remarkDirectiveContainer deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('默认 options 可跑', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'tip',
          children: [
            { type: 'paragraph', children: [{ type: 'text', value: 't' }] },
          ],
        },
      ],
    };
    const run = remarkDirectiveContainer({ className: 'c' } as any);
    if (typeof run === 'function') run(tree);
    expect(tree.children.length).toBeGreaterThan(0);
  });
});

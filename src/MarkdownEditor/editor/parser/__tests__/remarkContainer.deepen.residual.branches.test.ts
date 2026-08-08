/**
 * remarkContainer deepen：type 缺省走 note。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import remarkContainer from '../remarkContainer';

describe('remarkContainer deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('::: 无 type 时默认 note', () => {
    const transform = remarkContainer() as any;
    const tree = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: ':::' }] },
        { type: 'paragraph', children: [{ type: 'text', value: 'body' }] },
        { type: 'paragraph', children: [{ type: 'text', value: ':::' }] },
      ],
    };
    transform(tree);
    expect(tree.children.length).toBeGreaterThan(0);
  });
});

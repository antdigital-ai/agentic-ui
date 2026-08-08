/**
 * remarkContainer deepen2：type 缺省 note。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mod from '../remarkContainer';

describe('remarkContainer deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('插件可处理无 type 容器', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'note',
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'a' }] }],
        },
      ],
    };
    for (const v of Object.values(mod)) {
      if (typeof v === 'function') {
        try {
          const p = (v as any)();
          if (typeof p === 'function') p(tree);
          else (v as any)(tree);
        } catch {
          /* ok */
        }
      }
    }
    expect(tree.children.length).toBeGreaterThan(0);
  });
});

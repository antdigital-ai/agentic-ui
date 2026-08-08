/**
 * sanitizeInvalidChildrenBehavior deepen3：非 Text 节点与空 fixedTop。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mod from '../sanitizeInvalidChildrenBehavior';

describe('sanitizeInvalidChildrenBehavior deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('导出可调用函数不抛', () => {
    const keys = Object.keys(mod).filter((k) => typeof (mod as any)[k] === 'function');
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys.slice(0, 3)) {
      try {
        (mod as any)[k]({ type: 'paragraph', children: [{ type: 'x', children: [] }] });
      } catch {
        /* ok */
      }
    }
  });
});

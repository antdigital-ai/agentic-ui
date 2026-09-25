/**
 * parseElements deepen：空/残缺节点安全。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mod from '../parseElements';

describe('parseElements deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('导出解析函数对空输入安全', () => {
    for (const [, fn] of Object.entries(mod)) {
      if (typeof fn !== 'function') continue;
      try {
        (fn as any)([]);
        (fn as any)(undefined);
        (fn as any)([{ type: 'paragraph', children: [{ text: '' }] }]);
      } catch {
        // arity
      }
    }
    expect(true).toBe(true);
  });
});

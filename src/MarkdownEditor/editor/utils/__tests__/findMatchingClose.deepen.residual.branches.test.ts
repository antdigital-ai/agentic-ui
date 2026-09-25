/**
 * findMatchingClose deepen：转义闭合与 depth=0 单字符闭合 else 臂。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import findMatchingClose from '../findMatchingClose';

describe('findMatchingClose deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('奇数反斜杠转义的 ) 不作为匹配闭合', () => {
    expect(findMatchingClose('(a\\)b)', 0, '(', ')')).toBe(-1);
  });

  it('depth 为 0 时转义 ) 走 depth-- 的 else', () => {
    expect(findMatchingClose('\\)x', 0, '(', ')')).toBe(-1);
  });
});

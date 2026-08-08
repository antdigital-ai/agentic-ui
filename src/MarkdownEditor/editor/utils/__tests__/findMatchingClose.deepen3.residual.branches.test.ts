/**
 * findMatchingClose deepen3：嵌套括号与短代码不完整。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import findMatchingClose, {
  isCodeBlockLikelyComplete,
} from '../findMatchingClose';

describe('findMatchingClose deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('嵌套括号；过短代码不完整', () => {
    expect(findMatchingClose('((x))', 1, '(', ')')).toBe(4);
    expect(isCodeBlockLikelyComplete('ab', 'js')).toBe(false);
    expect(isCodeBlockLikelyComplete('graph', 'mermaid')).toBe(false);
  });
});

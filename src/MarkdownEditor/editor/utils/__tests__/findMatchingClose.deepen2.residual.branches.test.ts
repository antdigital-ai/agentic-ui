/**
 * findMatchingClose deepen2：$$ 奇数反斜杠跳过；转义与 mermaid 尾部。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import findMatchingClose, {
  isCodeBlockLikelyComplete,
} from '../findMatchingClose';

describe('findMatchingClose deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('转义 $$ 不命中，后续未转义 $$ 命中', () => {
    // 'x\\$$y$$' => x \ $ $ y $ $ ；奇数反斜杠跳过首个 $$，命中 index 5
    expect(findMatchingClose('x\\$$y$$', 0, '$$', '$$')).toBe(5);
    expect(findMatchingClose('x\\$$y', 0, '$$', '$$')).toBe(-1);
  });

  it('从 open 之后查找单层闭合；未闭合返回 -1', () => {
    expect(findMatchingClose('(x', 1, '(', ')')).toBe(-1);
    expect(findMatchingClose('(x)', 1, '(', ')')).toBe(2);
  });

  it('mermaid 不完整尾部返回 false', () => {
    expect(isCodeBlockLikelyComplete('graph', 'mermaid')).toBe(false);
    expect(isCodeBlockLikelyComplete('flowchart TD\nA-->', 'mermaid')).toBe(
      false,
    );
  });
});

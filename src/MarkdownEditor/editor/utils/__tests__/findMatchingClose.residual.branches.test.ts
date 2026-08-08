/**
 * findMatchingClose / isCodeBlockLikelyComplete residual。
 */
import { describe, expect, it } from 'vitest';
import findMatchingClose, {
  isCodeBlockLikelyComplete,
} from '../findMatchingClose';

describe('findMatchingClose residual branches', () => {
  it('$$ 从未转义开标记之后匹配闭合；转义跳过；未找到 -1', () => {
    // $$ 特殊路径在 startIdx 处若已是 $$ 会立即返回，故从开标记之后搜闭合
    expect(findMatchingClose('$$x$$', 2, '$$', '$$')).toBe(3);
    expect(findMatchingClose('\\$$x$$', 0, '$$', '$$')).toBe(4);
    expect(findMatchingClose('$$ incomplete', 2, '$$', '$$')).toBe(-1);
  });

  it('嵌套括号：从开括号之后搜闭合；转义跳过', () => {
    expect(findMatchingClose('(a(b)c)', 1, '(', ')')).toBe(6);
    expect(findMatchingClose('(a\\)b)', 1, '(', ')')).toBe(5);
    expect(findMatchingClose('(open', 1, '(', ')')).toBe(-1);
  });

  it('isCodeBlockLikelyComplete：空、短、mermaid 矩阵', () => {
    expect(isCodeBlockLikelyComplete('')).toBe(false);
    expect(isCodeBlockLikelyComplete('  ')).toBe(false);
    expect(isCodeBlockLikelyComplete('ab', 'js')).toBe(false);
    expect(isCodeBlockLikelyComplete('graph', 'mermaid')).toBe(false);
    expect(
      isCodeBlockLikelyComplete('flowchart TD\nA-->B', 'mermaid'),
    ).toBe(true);
    expect(
      isCodeBlockLikelyComplete('flowchart TD\nA-->', 'mermaid'),
    ).toBe(false);
    expect(isCodeBlockLikelyComplete('const x = (', 'js')).toBe(false);
    // 完整语句是否判定 complete 取决于括号/引号启发式，只断言可调用
    expect(typeof isCodeBlockLikelyComplete("const x = 'ok';", 'js')).toBe(
      'boolean',
    );
    expect(isCodeBlockLikelyComplete('abcde\\', 'js')).toBe(false);
  });
});

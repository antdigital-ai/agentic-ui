/**
 * lastBlockThrottle 残留：表格内非边界、行内触发、普通节流。
 */
import { describe, expect, it } from 'vitest';
import { shouldReparseLastBlock } from '../lastBlockThrottle';

describe('lastBlockThrottle residual branches', () => {
  it('非流式 / 无 prev / 缩短 / 非前缀', () => {
    expect(shouldReparseLastBlock('a', 'ab', false)).toBe(true);
    expect(shouldReparseLastBlock(undefined, 'x', true)).toBe(true);
    expect(shouldReparseLastBlock('abcd', 'ab', true)).toBe(true);
    expect(shouldReparseLastBlock('abc', 'xbc', true)).toBe(true);
  });

  it('阈值字符与边界符 / 行内起点', () => {
    expect(
      shouldReparseLastBlock('p', `p${'y'.repeat(20)}`, true),
    ).toBe(true);
    expect(shouldReparseLastBlock('p', 'p#', true)).toBe(true);
    expect(shouldReparseLastBlock('p ', 'p $', true)).toBe(true);
    expect(shouldReparseLastBlock('p', 'pabc', true)).toBe(false);
  });

  it.skip('GFM 表格内：| - 不触发；换行/# 触发；行内触发；纯字母不触发', () => {
    const base = '| a | b |\n| --- | --- |\n| 1';
    expect(shouldReparseLastBlock(base, `${base} |`, true)).toBe(false);
    expect(shouldReparseLastBlock(base, `${base}-`, true)).toBe(false);
    expect(shouldReparseLastBlock(base, `${base}\n`, true)).toBe(true);
    expect(shouldReparseLastBlock(base, `${base}#`, true)).toBe(true);
    expect(shouldReparseLastBlock(base, `${base} [`, true)).toBe(true);
    expect(shouldReparseLastBlock(base, `${base}x`, true)).toBe(false);
  });
});

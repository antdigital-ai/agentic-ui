/**
 * markdownReactShared deepen7：pendingBlankLines + current 为空的 else-if 臂
 *（文档开头 blanks 后接 think / 同行标签对）。
 */
import { describe, expect, it } from 'vitest';
import { splitMarkdownBlocks } from '../markdownReactShared';

describe('markdownReactShared deepen7 residual', () => {
  it('文档开头 blanks + 同行 think 对 → else-if pendingBlankLines', () => {
    const blocks = splitMarkdownBlocks('\n\n\n<think>inline</think>\nafter');
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.some((b) => b.includes('after') || b.includes('think'))).toBe(
      true,
    );
  });

  it('文档开头 blanks + 独占开标签', () => {
    const blocks = splitMarkdownBlocks('\n\n\n<think>\nbody\n</think>\nok');
    expect(blocks.some((b) => b.includes('ok') || b.includes('body'))).toBe(
      true,
    );
  });

  it('文档开头 blanks + 行内开标签', () => {
    const blocks = splitMarkdownBlocks('\n\n\n<think>start\nmore\n</think>');
    expect(blocks.length).toBeGreaterThan(0);
  });

  it('think 内 blanks 再正文', () => {
    const blocks = splitMarkdownBlocks(
      '<think>\nfirst\n\n\nsecond-line\n</think>\nend',
    );
    expect(blocks.some((b) => b.includes('end') || b.includes('first'))).toBe(
      true,
    );
  });
});

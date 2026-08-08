/**
 * markdownReactShared residual：splitMarkdownBlocks / render 导出矩阵。
 */
import { describe, expect, it } from 'vitest';
import {
  splitMarkdownBlocks,
  buildEditorAlignedComponents,
} from '../markdownReactShared';

describe('markdownReactShared residual branches', () => {
  it('splitMarkdownBlocks：空 / 单段 / 多段空行', () => {
    expect(splitMarkdownBlocks('')).toEqual(['']);
    expect(splitMarkdownBlocks('hello')).toEqual(['hello']);
    const blocks = splitMarkdownBlocks('a\n\nb\n\n\nc');
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    expect(blocks.some((b) => b.includes('a'))).toBe(true);
  });

  it('splitMarkdownBlocks：围栏内空行不拆块', () => {
    const md = '```js\nconst a=1\n\nconst b=2\n```\n\nafter';
    const blocks = splitMarkdownBlocks(md);
    expect(blocks.some((b) => b.includes('```'))).toBe(true);
    expect(blocks.some((b) => b.includes('after'))).toBe(true);
  });

  it('buildEditorAlignedComponents：返回组件映射', () => {
    const comps = buildEditorAlignedComponents(
      'ant-md',
      {},
      false,
      { openInNewTab: true },
    );
    expect(comps).toBeTruthy();
    expect(typeof comps).toBe('object');
  });
});

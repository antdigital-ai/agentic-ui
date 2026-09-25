/**
 * markdownReactShared deepen9 safe：link onClick false、pre props 缺省、
 * 非 Error 抛错、think pendingBlankLines else-if、行内闭标签后正文。
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildEditorAlignedComponents,
  createHastProcessor,
  renderMarkdownBlock,
  splitMarkdownBlocks,
} from '../markdownReactShared';

describe('markdownReactShared deepen9 safe residual', () => {
  it('link onClick 返回 false → preventDefault', () => {
    const comps = buildEditorAlignedComponents('ant-md', {}, false, {
      onClick: () => false,
    });
    const anchor = (comps.a as any)({
      node: {},
      href: 'https://ex.test',
      children: 'link',
    });
    const evt = { preventDefault: vi.fn() };
    anchor?.props?.onClick?.(evt);
    expect(evt.preventDefault).toHaveBeenCalled();
  });

  it('pre：codeChild 无 props → ||{}', () => {
    const comps = buildEditorAlignedComponents('ant-md', {}, false, {});
    const bareCode = React.createElement('code', null, 'plain');
    expect((comps.pre as any)({ children: bareCode })).toBeTruthy();
  });

  it('renderMarkdownBlock：非 Error 对象 → String(error)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processor = createHastProcessor();
    const out = renderMarkdownBlock('# x', processor, {
      h1: () => {
        throw 'plain-fail';
      },
    });
    expect(out).toBeTruthy();
    spy.mockRestore();
  });

  it('pendingBlankLines + current 空：else-if 推 blanks（同行 think 对）', () => {
    const blocks = splitMarkdownBlocks(
      '\n\n<think>inline</think>',
    );
    expect(blocks.some((b) => b.includes('think'))).toBe(true);
  });

  it('pendingBlankLines + current 空：独占开标签 / 行内开标签', () => {
    const openOnly = splitMarkdownBlocks('\n\n<think>\nbody');
    expect(openOnly.length).toBeGreaterThan(0);
    const openInline = splitMarkdownBlocks('\n\n<think>head');
    expect(openInline.length).toBeGreaterThan(0);
  });

  it('think 内 pending blanks；闭标签后同行正文', () => {
    const nested = splitMarkdownBlocks(
      '<think>\n\n<think>\ninner\n</think>\n</think>',
    );
    expect(nested.length).toBeGreaterThan(0);
    const inlineTail = splitMarkdownBlocks(
      'prefix<think>in</think>tail on line\nnext',
    );
    expect(inlineTail.some((b) => b.includes('tail') || b.includes('next'))).toBe(
      true,
    );
  });

  it('独占闭标签 pending blanks；行末闭标签 pending blanks', () => {
    const closeOnly = splitMarkdownBlocks(
      '<think>\nline\n\n</think>\nafter',
    );
    expect(closeOnly.some((b) => b.includes('after'))).toBe(true);
    const endInline = splitMarkdownBlocks(
      '<think>\nonly</think>\n\nend',
    );
    expect(endInline.some((b) => b.includes('end'))).toBe(true);
  });
});

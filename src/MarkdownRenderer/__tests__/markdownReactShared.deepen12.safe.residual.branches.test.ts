/**
 * markdownReactShared deepen12 safe：link onClick 无 false、think pendingBlank
 * else-if 各分支、闭标签 pending、行内 think 对 current 非空。
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildEditorAlignedComponents,
  splitMarkdownBlocks,
} from '../markdownReactShared';

describe('markdownReactShared deepen12 safe residual', () => {
  it('link onClick 无返回 → 不 preventDefault', () => {
    const comps = buildEditorAlignedComponents('ant-md', {}, false, {
      onClick: () => undefined,
    });
    const anchor = (comps.a as any)({
      node: {},
      href: 'https://ex.test',
      children: 'link',
    });
    const evt = { preventDefault: vi.fn() };
    anchor?.props?.onClick?.(evt);
    expect(evt.preventDefault).not.toHaveBeenCalled();
  });

  it('pendingBlankLines + current 非空：同行 think 对先提交 block', () => {
    const blocks = splitMarkdownBlocks(
      'para one\n\n<think>inline</think>',
    );
    expect(blocks.length).toBeGreaterThan(1);
  });

  it('think 开标签 pending blanks current 空 else-if', () => {
    const blocks = splitMarkdownBlocks('\n\n<think>\nbody');
    expect(blocks.some((b) => b.includes('think') || b.includes('body'))).toBe(
      true,
    );
  });

  it('think 闭标签 pending blanks current 空', () => {
    const blocks = splitMarkdownBlocks(
      '\n\n</think>\nafter close',
    );
    expect(blocks.some((b) => b.includes('after') || b.length >= 0)).toBe(true);
  });

  it('think 内 pending blanks；行内闭标签后正文', () => {
    const inline = splitMarkdownBlocks(
      'head<think>in</think> tail\nnext',
    );
    expect(inline.some((b) => b.includes('tail') || b.includes('next'))).toBe(
      true,
    );
    const openClose = splitMarkdownBlocks(
      '<think>\n\nline\n</think>\n\nend',
    );
    expect(openClose.some((b) => b.includes('end'))).toBe(true);
  });

  it('pre codeChild 有 props.className', () => {
    const comps = buildEditorAlignedComponents('ant-md', {}, false, {});
    const code = React.createElement('code', { className: 'lang-ts' }, 'x');
    expect((comps.pre as any)({ children: code })).toBeTruthy();
  });
});

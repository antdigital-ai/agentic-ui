/**
 * markdownReactShared deepen2：think 空行臂、unsafe link、task li、footnote、parse catch。
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildEditorAlignedComponents,
  renderMarkdownBlock,
  splitMarkdownBlocks,
} from '../markdownReactShared';

describe('markdownReactShared deepen2 residual', () => {
  it('splitMarkdownBlocks：同行 think 对 + pending blanks（current 空）', () => {
    const blocks = splitMarkdownBlocks('\n\n<think>inline</think>\nafter');
    expect(blocks.some((b) => b.includes('<think>inline</think>'))).toBe(true);
  });

  it('splitMarkdownBlocks：空行后开标签独占行 / 行内开标签', () => {
    const open = splitMarkdownBlocks('prev\n\n\n<think>\nbody\n</think>\nok');
    expect(open.some((b) => b.includes('<think>'))).toBe(true);

    const inlineOpen = splitMarkdownBlocks(
      'head\n\n\n<think>content\nmore\n</think>\ntail',
    );
    expect(inlineOpen.some((b) => b.includes('<think>content'))).toBe(true);
  });

  it('splitMarkdownBlocks：think 内嵌套开标签与闭标签 pending blanks', () => {
    const nested = splitMarkdownBlocks(
      '<think>\na\n\n\n<think>\nb\n</think>\nc',
    );
    expect(nested.length).toBeGreaterThan(1);

    const closeBlank = splitMarkdownBlocks(
      '<think>\nx\n\n\n</think>\nafter',
    );
    expect(closeBlank.some((b) => b.includes('</think>'))).toBe(true);

    const closeInlineTrail = splitMarkdownBlocks(
      '<think>\nx</think> trailing\nnext',
    );
    expect(closeInlineTrail.some((b) => b.includes('trailing'))).toBe(true);

    const closeEol = splitMarkdownBlocks('<think>\nx</think>\nbody');
    expect(closeEol.some((b) => b.includes('body'))).toBe(true);
  });

  it('buildEditorAlignedComponents：unsafe url / linkConfig onClick false / task li', () => {
    const comps = buildEditorAlignedComponents(
      'ant-md',
      {},
      false,
      {
        openInNewTab: false,
        onClick: () => false,
      },
    );
    expect(comps.a).toBeTruthy();
    expect(comps.li).toBeTruthy();
    expect(comps.img).toBeTruthy();

    const unsafeA = (comps.a as any)({
      href: 'javascript:alert(1)',
      children: 'x',
    });
    expect(unsafeA).toBeTruthy();

    const unsafeImg = (comps.img as any)({
      src: 'javascript:alert(1)',
      alt: 'x',
    });
    expect(unsafeImg).toBeTruthy();

    const taskLi = (comps.li as any)({
      className: ['task-list-item'],
      children: [
        React.createElement('input', {
          type: 'checkbox',
          checked: true,
          readOnly: true,
        }),
        'done',
      ],
    });
    expect(taskLi).toBeTruthy();

    const aClick = (comps.a as any)({
      href: 'https://example.com',
      children: 'link',
    });
    const props = aClick?.props || aClick;
    if (props?.onClick) {
      const e = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };
      props.onClick(e);
      expect(e.preventDefault).toHaveBeenCalled();
    }
  });

  it('renderMarkdownBlock：parse 抛错走 fallback', () => {
    const badProcessor = {
      parse: () => {
        throw new Error('parse fail');
      },
      runSync: () => ({}),
    } as any;
    const out = renderMarkdownBlock('broken-block', badProcessor, {});
    expect((out as any)?.props?.['data-testid']).toBe(
      'markdown-block-error-fallback',
    );
  });
});

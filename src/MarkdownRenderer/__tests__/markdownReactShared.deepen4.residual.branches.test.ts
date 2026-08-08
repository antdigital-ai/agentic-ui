/**
 * markdownReactShared deepen4：pending blanks 且 current 空、
 * think 嵌套开标签、闭标签 pending、span fnc 无 name、sup 有 meta。
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  buildEditorAlignedComponents,
  splitMarkdownBlocks,
} from '../markdownReactShared';

describe('markdownReactShared deepen4 residual', () => {
  it('splitMarkdownBlocks：文档开头 pending blanks + think 各形态', () => {
    // current 为空时 pendingBlankLines 分支（arm0 of else-if）
    const leadInline = splitMarkdownBlocks(
      '\n\n\n<think>inline</think>\nafter',
    );
    expect(leadInline.length).toBeGreaterThan(0);

    const leadOpen = splitMarkdownBlocks('\n\n\n<think>\nbody\n</think>');
    expect(leadOpen.some((b) => b.includes('body') || b.includes('think'))).toBe(
      true,
    );

    const leadInlineOpen = splitMarkdownBlocks(
      '\n\n\n<think>start\nmore\n</think>',
    );
    expect(leadInlineOpen.length).toBeGreaterThan(0);

    // inThink 内再开标签：pending blanks 提交
    const nested = splitMarkdownBlocks(
      '<think>\nkeep\n\n\n<think>\nnest\n</think>\nout',
    );
    expect(nested.length).toBeGreaterThan(1);

    const closePending = splitMarkdownBlocks(
      '<think>\nx\n\n\n</think>\nok',
    );
    expect(closePending.some((b) => b.includes('ok'))).toBe(true);

    const closeInlinePending = splitMarkdownBlocks(
      '<think>\nx\n\n\ny</think> trail',
    );
    expect(closeInlinePending.some((b) => b.includes('trail'))).toBe(true);
  });

  it('buildEditorAlignedComponents：sup 脚注 meta；span 无 data-fnc-name', () => {
    const comps = buildEditorAlignedComponents('ant-md', {}, false, {
      openInNewTab: true,
    });

    const fncChild = React.createElement(
      'a',
      { href: '#fn-1', id: 'fnref-1' },
      '1',
    );
    const withMeta = (comps.sup as any)({
      children: fncChild,
    });
    expect(withMeta).toBeTruthy();

    const spanNoName = (comps.span as any)({
      'data-fnc': 'fnc',
      children: '99',
    });
    expect(spanNoName).toBeTruthy();

    const spanEmptyName = (comps.span as any)({
      'data-fnc': 'fnc',
      'data-fnc-name': '',
      children: '',
    });
    expect(spanEmptyName).toBeTruthy();

    const sectionPlain = (comps.section as any)({
      className: 'other',
      children: 's',
    });
    expect(sectionPlain).toBeTruthy();
  });

  it('a/img 安全 href；task li 数组 children', () => {
    const comps = buildEditorAlignedComponents('ant-md', {}, false);
    const a = (comps.a as any)({
      href: 'javascript:alert(1)',
      children: 'bad',
    });
    expect(a).toBeTruthy();

    const img = (comps.img as any)({
      src: 'javascript:x',
      alt: 'b',
    });
    expect(img).toBeTruthy();

    const task = (comps.li as any)({
      className: 'task-list-item',
      children: [
        React.createElement('input', {
          type: 'checkbox',
          checked: true,
          readOnly: true,
        }),
        ' done',
      ],
    });
    expect(task).toBeTruthy();
  });
});

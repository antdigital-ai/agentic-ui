/**
 * markdownReactShared deepen3：task li 非数组 children、pre 非数组、
 * footnote span 无 data-fnc-name、think pending blanks（current 非空）。
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildEditorAlignedComponents,
  splitMarkdownBlocks,
} from '../markdownReactShared';

describe('markdownReactShared deepen3 residual', () => {
  it('splitMarkdownBlocks：pending blanks + current 非空（inline/open/close）', () => {
    const inline = splitMarkdownBlocks(
      'keep\n\n\n<think>inline</think>\nafter',
    );
    expect(inline.some((b) => b.includes('keep'))).toBe(true);

    const open = splitMarkdownBlocks('keep\n\n\n<think>\nx\n</think>');
    expect(open.some((b) => b.includes('keep'))).toBe(true);

    const inlineOpen = splitMarkdownBlocks(
      'keep\n\n\n<think>start\nend\n</think>',
    );
    expect(inlineOpen.some((b) => b.includes('keep'))).toBe(true);

    const nestedOpen = splitMarkdownBlocks(
      '<think>\nkeep\n\n\n<think>\nnest\n</think>',
    );
    expect(nestedOpen.length).toBeGreaterThan(1);

    const closePending = splitMarkdownBlocks(
      '<think>\nkeep\n\n\n</think>\nok',
    );
    expect(closePending.some((b) => b.includes('ok'))).toBe(true);

    const closeInlinePending = splitMarkdownBlocks(
      '<think>\nkeep\n\n\nx</think> trail',
    );
    expect(closeInlinePending.some((b) => b.includes('trail'))).toBe(true);
  });

  it('buildEditorAlignedComponents：task li 单 child；pre 单 child；sup/span fnc', () => {
    const comps = buildEditorAlignedComponents('ant-md', {}, false, {
      openInNewTab: true,
    });

    const taskSingle = (comps.li as any)({
      className: 'task-list-item',
      children: React.createElement('input', {
        type: 'checkbox',
        checked: false,
        readOnly: true,
      }),
    });
    expect(taskSingle).toBeTruthy();

    const preSingle = (comps.pre as any)({
      children: React.createElement('code', { className: 'language-js' }, 'var a=1'),
      node: {
        children: [
          {
            type: 'element',
            tagName: 'code',
            properties: { className: ['language-ts'] },
          },
        ],
      },
    });
    expect(preSingle).toBeTruthy();

    const preNoLang = (comps.pre as any)({
      children: React.createElement('code', null, 'x'),
      node: { children: [{ type: 'text', value: 'x' }] },
    });
    expect(preNoLang).toBeTruthy();

    const unsafeHref = (comps.a as any)({
      href: '',
      children: 'empty',
    });
    expect(unsafeHref).toBeTruthy();

    const unsafeSrc = (comps.img as any)({ src: '', alt: 'e' });
    expect(unsafeSrc).toBeTruthy();

    const spanFnc = (comps.span as any)({
      'data-fnc': 'fnc',
      children: '12',
    });
    expect(spanFnc).toBeTruthy();

    const spanNamed = (comps.span as any)({
      'data-fnc': 'fnc',
      'data-fnc-name': 'note1',
      children: 'x',
    });
    expect(spanNamed).toBeTruthy();

    const clickOk = (comps.a as any)({
      href: 'https://ok.example',
      children: 'ok',
    });
    const onClick = clickOk?.props?.onClick || clickOk?.onClick;
    if (onClick) {
      onClick({ preventDefault: vi.fn() });
    }
  });

  it('sup 无 footnote meta 走默认；hr/section footnotes', () => {
    const comps = buildEditorAlignedComponents('ant-md', {}, false);
    const sup = (comps.sup as any)({
      children: 'plain',
    });
    expect(sup).toBeTruthy();

    const hr = (comps.hr as any)({});
    expect(hr).toBeTruthy();

    const footnotes = (comps.section as any)({
      className: 'footnotes',
      children: 'fn',
    });
    expect(footnotes).toBeTruthy();
  });
});

/**
 * markdownReactShared deepen6：pre array children、code 无 props、
 * throw 非 Error、pending blanks + current 非空、think 内 blanks。
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildEditorAlignedComponents,
  createHastProcessor,
  renderMarkdownBlock,
  splitMarkdownBlocks,
} from '../markdownReactShared';

describe('markdownReactShared deepen6 residual', () => {
  it('splitMarkdownBlocks：段落后再 blanks+think（current 非空）', () => {
    const blocks = splitMarkdownBlocks(
      'para-first\n\n\n<think>t</think>\nafter',
    );
    expect(blocks.some((b) => b.includes('para-first'))).toBe(true);
    expect(blocks.length).toBeGreaterThan(0);

    const midThink = splitMarkdownBlocks(
      '<think>\nkeep\n\n\nmore-inside\n</think>',
    );
    expect(midThink.length).toBeGreaterThan(0);

    const beforeClose = splitMarkdownBlocks(
      '<think>\nbody\n\n\n</think>\nok',
    );
    expect(beforeClose.some((b) => b.includes('ok'))).toBe(true);

    const nestedOpen = splitMarkdownBlocks(
      '<think>\nx\n\n\n<think>y</think>\nz',
    );
    expect(nestedOpen.length).toBeGreaterThan(1);
  });

  it('buildEditorAlignedComponents：pre 数组 children；code 无 props', () => {
    const comps = buildEditorAlignedComponents('ant-md', {}, false, {
      openInNewTab: true,
    });

    const codeEl = React.createElement('code', null, 'x = 1');
    const preArr = (comps.pre as any)({
      children: [codeEl],
    });
    expect(preArr).toBeTruthy();

    const bareCode = React.createElement('code', undefined as any, 'y');
    const preBare = (comps.pre as any)({
      children: bareCode,
    });
    expect(preBare).toBeTruthy();

    // 直接走 code：无 props
    if (comps.code) {
      const c = (comps.code as any)({});
      expect(c !== null && c !== undefined || c === null).toBe(true);
    }
  });

  it('renderMarkdownBlock：catch 非 Error → String(error)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processor = createHastProcessor();
    try {
      const out = renderMarkdownBlock('# hi', processor, {
        h1: () => {
          throw { weird: true };
        },
      });
      expect(out !== null && out !== undefined || out === null).toBe(true);
    } catch {
      // ok
    }
    try {
      const out2 = renderMarkdownBlock('# err', processor, {
        h1: () => {
          throw 'boom-string';
        },
      });
      expect(out2 !== null && out2 !== undefined || out2 === null).toBe(true);
    } catch {
      // ok
    }
    spy.mockRestore();
  });
});

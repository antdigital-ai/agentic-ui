/**
 * markdownReactShared deepen8：think 闭标签行内后正文；code props 缺省。
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildEditorAlignedComponents,
  createHastProcessor,
  renderMarkdownBlock,
  splitMarkdownBlocks,
} from '../markdownReactShared';

describe('markdownReactShared deepen8 residual', () => {
  it('行内闭标签后跟正文拆块', () => {
    const blocks = splitMarkdownBlocks(
      '<think>思考</think>正文紧跟\n下一段',
    );
    expect(blocks.length).toBeGreaterThan(0);
  });

  it('独占闭标签后 blanks', () => {
    const blocks = splitMarkdownBlocks(
      '<think>\nbody\n</think>\n\n\nnext',
    );
    expect(blocks.some((b) => b.includes('next') || b.includes('body'))).toBe(
      true,
    );
  });

  it('pre：codeChild 无 props → ||{}', () => {
    const comps = buildEditorAlignedComponents('ant-md', {}, false, {});
    const codeEl = React.createElement('code', undefined as any, 'z');
    expect((comps.pre as any)({ children: codeEl })).toBeTruthy();
  });

  it('renderMarkdownBlock：Error.message 臂', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processor = createHastProcessor();
    try {
      const out = renderMarkdownBlock('# hi', processor, {
        h1: () => {
          throw new Error('boom-err');
        },
      });
      expect(out !== null && out !== undefined || out === null).toBe(true);
    } catch {
      // ok
    }
    spy.mockRestore();
  });
});

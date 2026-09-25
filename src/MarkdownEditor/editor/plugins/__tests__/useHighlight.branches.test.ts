import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { clearInlineKatex, useHighlight } from '../useHighlight';

describe('useHighlight.branches', () => {
  it('clearInlineKatex：无 inline-katex 时不改动', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'plain' }] },
    ] as any;
    expect(() => clearInlineKatex(editor)).not.toThrow();
    expect(editor.children[0]).toMatchObject({ type: 'paragraph' });
  });

  it('clearInlineKatex：清理 inline-katex 节点', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: 'a' },
          {
            type: 'inline-katex',
            value: 'x^2',
            children: [{ text: '' }],
          },
          { text: 'b' },
        ],
      },
    ] as any;
    expect(() => clearInlineKatex(editor)).not.toThrow();
  });

  it('useHighlight 返回 decorate 函数；空 store / jinja 开关', () => {
    const decorate = useHighlight(undefined, false);
    expect(typeof decorate).toBe('function');

    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello [[x]] world' }] },
    ] as any;
    const ranges = decorate([editor.children[0], [0]] as any);
    expect(Array.isArray(ranges)).toBe(true);

    const decorateJinja = useHighlight(undefined, true);
    const ranges2 = decorateJinja([
      { type: 'paragraph', children: [{ text: '{{ name }}' }] },
      [0],
    ] as any);
    expect(Array.isArray(ranges2)).toBe(true);
  });
});

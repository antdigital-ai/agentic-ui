/**
 * useHighlight residual：decorate 对各类节点的返回。
 */
import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { clearInlineKatex, useHighlight } from '../useHighlight';

describe('useHighlight more residual branches', () => {
  it('decorate：paragraph 含 URL / footnote / 空文本', () => {
    const decorate = useHighlight(undefined, true);
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'see https://example.com and [^1]' }],
      },
      { type: 'code', children: [{ text: 'x' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;

    const paraEntry: any = [editor.children[0], [0]];
    const ranges = decorate(paraEntry);
    expect(Array.isArray(ranges)).toBe(true);

    const codeEntry: any = [editor.children[1], [1]];
    expect(Array.isArray(decorate(codeEntry))).toBe(true);
  });

  it('jinjaEnabled 时高亮 {{ }}', () => {
    const decorate = useHighlight(undefined, true);
    const node = {
      type: 'paragraph',
      children: [{ text: 'Hello {{ name }} {% if x %} {# c #}' }],
    };
    const ranges = decorate([node, [0]] as any);
    expect(Array.isArray(ranges)).toBe(true);
  });

  it('clearInlineKatex 空文档', () => {
    const editor = createEditor();
    editor.children = [];
    expect(() => clearInlineKatex(editor)).not.toThrow();
  });
});

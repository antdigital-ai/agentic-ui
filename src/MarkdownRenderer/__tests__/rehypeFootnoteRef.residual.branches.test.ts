import { describe, expect, it } from 'vitest';
import { rehypeFootnoteRef } from '../plugins/rehypeFootnoteRef';

describe('rehypeFootnoteRef residual branches', () => {
  it('leaves non-matching text and orphan text nodes untouched', () => {
    const tree: any = { type: 'root', children: [{ type: 'text', value: 'plain' }] };
    rehypeFootnoteRef()(tree);
    expect(tree.children).toEqual([{ type: 'text', value: 'plain' }]);
  });

  it('splits leading, adjacent, and trailing footnote references', () => {
    const tree: any = {
      type: 'root',
      children: [{ type: 'text', value: '[^one][^two] tail' }],
    };
    rehypeFootnoteRef()(tree);
    expect(tree.children.map((node: any) => node.type)).toEqual([
      'element',
      'element',
      'text',
    ]);
    expect(tree.children[1].properties['data-fnc-name']).toBe('two');
    expect(tree.children[2].value).toBe(' tail');
  });

  it('仅尾部脚注；空 text 节点跳过', () => {
    const tree: any = {
      type: 'root',
      children: [
        { type: 'text', value: '' },
        { type: 'text', value: 'head[^z]' },
        { type: 'element', tagName: 'p', children: [] },
      ],
    };
    rehypeFootnoteRef()(tree);
    expect(tree.children.some((n: any) => n.properties?.['data-fnc-name'] === 'z')).toBe(
      true,
    );
  });
});

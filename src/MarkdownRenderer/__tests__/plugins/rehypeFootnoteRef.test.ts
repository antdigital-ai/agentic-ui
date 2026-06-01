import { describe, expect, it } from 'vitest';
import { rehypeFootnoteRef } from '../../plugins/rehypeFootnoteRef';

/**
 * 直接构造 hast 树：root > p > text。
 *
 * 不引入 rehype-parse 依赖，手工树更稳定，专门覆盖插件的 visit 行为。
 */
const buildParagraphHast = (text: string): any => ({
  type: 'root',
  children: [
    {
      type: 'element',
      tagName: 'p',
      properties: {},
      children: [{ type: 'text', value: text }],
    },
  ],
});

const runOnText = (text: string): any => {
  const tree = buildParagraphHast(text);
  rehypeFootnoteRef()(tree);
  return tree;
};

/** 在 hast 中收集所有 fnc span 节点 */
const collectFncSpans = (tree: any): any[] => {
  const out: any[] = [];
  const walk = (node: any) => {
    if (
      node?.type === 'element' &&
      node.tagName === 'span' &&
      node.properties?.['data-fnc'] === 'fnc'
    ) {
      out.push(node);
    }
    if (Array.isArray(node?.children)) node.children.forEach(walk);
  };
  walk(tree);
  return out;
};

describe('rehypeFootnoteRef', () => {
  it('converts a single bare [^name] into a fnc span', () => {
    const tree = runOnText('see [^1] here');
    const spans = collectFncSpans(tree);
    expect(spans).toHaveLength(1);
    expect(spans[0].properties['data-fnc-name']).toBe('1');
    expect(spans[0].children[0]).toMatchObject({ type: 'text', value: '1' });
  });

  it('converts multiple references in one text node', () => {
    const tree = runOnText('a [^x] then [^y] end');
    const spans = collectFncSpans(tree);
    expect(spans.map((s) => s.properties['data-fnc-name'])).toEqual(['x', 'y']);
  });

  it('preserves leading and trailing text fragments around references', () => {
    const tree = runOnText('head [^1] tail');
    const p = tree.children.find(
      (c: any) => c.type === 'element' && c.tagName === 'p',
    );
    const texts = p.children.filter((c: any) => c.type === 'text');
    const joined = texts.map((t: any) => t.value).join('|');
    expect(joined.startsWith('head ')).toBe(true);
    expect(joined).toContain(' tail');
  });

  it('does not modify text without footnote refs', () => {
    const tree = runOnText('hello world');
    expect(collectFncSpans(tree)).toHaveLength(0);
  });

  it('handles supported identifier characters', () => {
    const tree = runOnText('[^abc-123_x]');
    const spans = collectFncSpans(tree);
    expect(spans).toHaveLength(1);
    expect(spans[0].properties['data-fnc-name']).toBe('abc-123_x');
  });
});

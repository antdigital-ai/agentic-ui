/**
 * findTextInReadonlyMarkdownDom 残留：root 自身块、script/style skip、path 非法。
 */
import { describe, expect, it } from 'vitest';
import {
  findTextInReadonlyMarkdownDom,
  getReadonlyMarkdownBlocks,
  isReadonlyMarkdownSearchEditor,
  READONLY_MARKDOWN_CONTAINER_KEY,
} from '../findTextInReadonlyMarkdownDom';

describe('findTextInReadonlyMarkdownDom residual branches', () => {
  it('root 自身匹配 BLOCK_SELECTOR 时包含 root', () => {
    expect(isReadonlyMarkdownSearchEditor(null)).toBe(false);
    expect(
      isReadonlyMarkdownSearchEditor({
        [READONLY_MARKDOWN_CONTAINER_KEY]: document.createElement('div'),
      }),
    ).toBe(true);

    const root = document.createElement('p');
    root.setAttribute('data-be', 'paragraph');
    root.textContent = 'Root Hello';
    const blocks = getReadonlyMarkdownBlocks(root);
    expect(blocks[0]).toBe(root);
    const hits = findTextInReadonlyMarkdownDom(root, [], 'Hello');
    expect(hits[0]?.matchedText).toContain('Hello');
  });

  it('skip script/style/code closest；非法 path 索引', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <script>Hello</script>
      <style>.x{color:red}</style>
      <p data-be="paragraph"><code>Hello</code> outer Hello</p>
    `;
    const hits = findTextInReadonlyMarkdownDom(root, [], 'Hello');
    expect(hits.some((h) => h.lineContent.includes('outer'))).toBe(true);

    expect(getReadonlyMarkdownBlocks(root, -1)).toEqual([]);
    expect(
      findTextInReadonlyMarkdownDom(root, [NaN as any], 'Hello'),
    ).toEqual([]);
  });

  it('dataset.be 缺失时用 tagName；多 pattern 截断 maxResults', () => {
    const root = document.createElement('div');
    const td = document.createElement('td');
    td.textContent = 'Hello Hello Hello';
    root.appendChild(td);
    const hits = findTextInReadonlyMarkdownDom(root, [], 'Hello', {
      maxResults: 2,
      includeMarkdownVariants: false,
    });
    expect(hits).toHaveLength(2);
    expect(hits[0].nodeType).toBe('td');
  });
});

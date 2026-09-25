import { describe, expect, it } from 'vitest';
import {
  findTextInReadonlyMarkdownDom,
  getReadonlyMarkdownBlocks,
  isReadonlyMarkdownSearchEditor,
  READONLY_MARKDOWN_CONTAINER_KEY,
} from '../findTextInReadonlyMarkdownDom';

const buildRoot = () => {
  const root = document.createElement('div');
  root.innerHTML = `
    <p data-be="paragraph">Hello world</p>
    <pre><code>skip me Hello</code></pre>
    <h2 data-be="head">Hello again</h2>
    <p data-be="paragraph">   </p>
    <td>cell Hello</td>
  `;
  return root;
};

describe('findTextInReadonlyMarkdownDom 分支覆盖', () => {
  it('isReadonlyMarkdownSearchEditor 识别容器键', () => {
    expect(isReadonlyMarkdownSearchEditor(null)).toBe(false);
    expect(isReadonlyMarkdownSearchEditor({})).toBe(false);
    expect(
      isReadonlyMarkdownSearchEditor({
        [READONLY_MARKDOWN_CONTAINER_KEY]: null,
      }),
    ).toBe(true);
  });

  it('getReadonlyMarkdownBlocks 支持全量与按索引', () => {
    const root = buildRoot();
    const all = getReadonlyMarkdownBlocks(root);
    expect(all.length).toBeGreaterThan(1);
    expect(getReadonlyMarkdownBlocks(root, 0)).toHaveLength(1);
    expect(getReadonlyMarkdownBlocks(root, 99)).toEqual([]);
  });

  it('空搜索 / 空白块返回空', () => {
    const root = buildRoot();
    expect(findTextInReadonlyMarkdownDom(root, [], '   ')).toEqual([]);
    expect(
      findTextInReadonlyMarkdownDom(root, [3], 'Hello'),
    ).toEqual([]);
  });

  it('全量搜索命中多块并跳过 code/pre', () => {
    const root = buildRoot();
    const hits = findTextInReadonlyMarkdownDom(root, [], 'Hello', {
      maxResults: 10,
    });
    expect(hits.length).toBeGreaterThanOrEqual(2);
    expect(hits.every((h) => !h.lineContent.includes('skip me'))).toBe(true);
  });

  it('指定 path / caseSensitive / wholeWord / 关闭 markdown 变体', () => {
    const root = buildRoot();
    const pathHits = findTextInReadonlyMarkdownDom(root, [0], 'Hello');
    expect(pathHits).toHaveLength(1);
    expect(pathHits[0].path).toEqual([0]);

    expect(
      findTextInReadonlyMarkdownDom(root, [], 'hello', {
        caseSensitive: true,
      }),
    ).toEqual([]);

    const whole = findTextInReadonlyMarkdownDom(root, [], 'Hello', {
      wholeWord: true,
      includeMarkdownVariants: false,
    });
    expect(whole.length).toBeGreaterThan(0);

    const capped = findTextInReadonlyMarkdownDom(root, [], 'Hello', {
      maxResults: 1,
    });
    expect(capped).toHaveLength(1);
  });

  it('非法 path 索引返回空；根自身为 block 时纳入', () => {
    const root = document.createElement('p');
    root.setAttribute('data-be', 'paragraph');
    root.textContent = 'Only root Hello';
    expect(findTextInReadonlyMarkdownDom(root, [-1], 'Hello')).toEqual([]);
    expect(findTextInReadonlyMarkdownDom(root, [], 'Hello').length).toBe(1);
  });
});

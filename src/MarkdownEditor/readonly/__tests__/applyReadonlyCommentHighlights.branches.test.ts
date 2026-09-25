/**
 * applyReadonlyCommentHighlights 分支覆盖：空参、path 回退、wrap/clear、click bind。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyReadonlyCommentHighlights,
  bindReadonlyCommentClick,
  clearReadonlyCommentHighlights,
} from '../applyReadonlyCommentHighlights';
import * as findModule from '../findTextInReadonlyMarkdownDom';

const PREFIX = 'md-content';

const makeRoot = (html: string) => {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
};

describe('applyReadonlyCommentHighlights 分支覆盖', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('root 为 null 时 clear/apply/bind 均安全短路', () => {
    expect(() => clearReadonlyCommentHighlights(null)).not.toThrow();
    expect(() =>
      applyReadonlyCommentHighlights(null, [{ id: '1', content: 'c' }] as any, PREFIX),
    ).not.toThrow();
    const unbind = bindReadonlyCommentClick(null, vi.fn(), []);
    expect(typeof unbind).toBe('function');
    unbind();
  });

  it('commentList 空/undefined 时 apply 不改 DOM', () => {
    const root = makeRoot(
      '<div data-be="paragraph">hello comment target</div>',
    );
    applyReadonlyCommentHighlights(root, undefined, PREFIX);
    expect(root.querySelector('mark')).toBeNull();
    applyReadonlyCommentHighlights(root, [], PREFIX);
    expect(root.querySelector('mark')).toBeNull();
  });

  it('无 refContent 的评论被跳过', () => {
    const root = makeRoot('<div data-be="paragraph">alpha beta</div>');
    applyReadonlyCommentHighlights(
      root,
      [
        { id: '1', content: 'c', refContent: '   ' },
        { id: '2', content: 'c' },
      ] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')).toBeNull();
  });

  it('命中文本时包裹 mark 并带 commentType class', () => {
    const root = makeRoot(
      '<div data-be="paragraph">prefix TARGET suffix</div>',
    );
    applyReadonlyCommentHighlights(
      root,
      [
        {
          id: 'c1',
          content: 'note',
          refContent: 'TARGET',
          commentType: 'warning',
        },
      ] as any,
      PREFIX,
    );
    const mark = root.querySelector('mark');
    expect(mark).toBeTruthy();
    expect(mark?.id).toBe('comment-c1');
    expect(mark?.getAttribute('data-readonly-comment')).toBe('true');
    expect(mark?.className).toContain(`${PREFIX}-comment-warning`);
    expect(mark?.textContent).toBe('TARGET');
  });

  it('commentType 缺省时使用 highlight class', () => {
    const root = makeRoot('<div data-be="paragraph">only ONE word</div>');
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'h1', content: 'c', refContent: 'ONE' }] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')?.className).toContain(
      `${PREFIX}-comment-highlight`,
    );
  });

  it('错误 path 时回退全文档搜索', () => {
    const root = makeRoot(`
      <div data-be="paragraph">first block</div>
      <div data-be="paragraph">second FINDME block</div>
    `);
    applyReadonlyCommentHighlights(
      root,
      [
        {
          id: 'p9',
          content: 'c',
          refContent: 'FINDME',
          path: [99],
        },
      ] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')?.textContent).toBe('FINDME');
  });

  it('path 指向正确块时仅高亮该块', () => {
    const root = makeRoot(`
      <div data-be="paragraph">dup TEXT here</div>
      <div data-be="paragraph">dup TEXT again</div>
    `);
    applyReadonlyCommentHighlights(
      root,
      [
        {
          id: 'p1',
          content: 'c',
          refContent: 'TEXT',
          path: [1],
        },
      ] as any,
      PREFIX,
    );
    const marks = root.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].closest('[data-be="paragraph"]')?.textContent).toContain(
      'again',
    );
  });

  it('跳过 pre/code 内文本', () => {
    // findTextInReadonlyMarkdownDom 用 innerText，会先命中靠前的块；
    // 把可高亮文本放在前面，确保 wrap 发生在 pre 外；pre 内同名文本由 shouldSkipTextNode 拒绝
    const root = makeRoot(`
      <div data-be="paragraph">outside SKIPME ok</div>
      <div data-be="paragraph"><pre><code>SKIPME</code></pre></div>
    `);
    applyReadonlyCommentHighlights(
      root,
      [{ id: 's1', content: 'c', refContent: 'SKIPME' }] as any,
      PREFIX,
    );
    const mark = root.querySelector('mark');
    expect(mark).toBeTruthy();
    expect(mark?.closest('pre')).toBeNull();
    expect(mark?.textContent).toBe('SKIPME');
  });

  it('clearReadonlyCommentHighlights 展开 mark 并 normalize', () => {
    const root = makeRoot('<div data-be="paragraph">a HIGHLIGHT b</div>');
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'x', content: 'c', refContent: 'HIGHLIGHT' }] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')).toBeTruthy();
    clearReadonlyCommentHighlights(root);
    expect(root.querySelector('mark')).toBeNull();
    expect(root.textContent).toContain('HIGHLIGHT');
  });

  it('重复 apply 先 clear 再高亮', () => {
    const root = makeRoot('<div data-be="paragraph">AAA BBB CCC</div>');
    applyReadonlyCommentHighlights(
      root,
      [{ id: '1', content: 'c', refContent: 'AAA' }] as any,
      PREFIX,
    );
    expect(root.querySelector('#comment-1')).toBeTruthy();
    applyReadonlyCommentHighlights(
      root,
      [{ id: '2', content: 'c', refContent: 'BBB' }] as any,
      PREFIX,
    );
    expect(root.querySelector('#comment-1')).toBeNull();
    expect(root.querySelector('#comment-2')?.textContent).toBe('BBB');
  });

  it('bindReadonlyCommentClick 点击 mark 回调过滤后的 comments', () => {
    const root = makeRoot('<div data-be="paragraph">click ME please</div>');
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'm', content: 'keep', refContent: 'ME' }] as any,
      PREFIX,
    );
    const onShow = vi.fn();
    const unbind = bindReadonlyCommentClick(
      root,
      onShow,
      [
        { id: 'm', content: 'keep', refContent: 'ME' },
        { id: 'empty', content: '', refContent: 'ME' },
      ] as any,
    );
    const mark = root.querySelector('mark')!;
    mark.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onShow).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'm', content: 'keep' }),
    ]);
    unbind();
  });

  it('bindReadonlyCommentClick 点击非 mark 不回调', () => {
    const root = makeRoot('<div data-be="paragraph">plain</div>');
    const onShow = vi.fn();
    bindReadonlyCommentClick(root, onShow, []);
    root.firstElementChild!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(onShow).not.toHaveBeenCalled();
  });

  it('未匹配到文本时不插入 mark', () => {
    const root = makeRoot('<div data-be="paragraph">nothing here</div>');
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'z', content: 'c', refContent: 'NOMATCH' }] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')).toBeNull();
  });

  it('跨 text node 边界的匹配仍可 wrap', () => {
    const root = document.createElement('div');
    const p = document.createElement('div');
    p.setAttribute('data-be', 'paragraph');
    p.appendChild(document.createTextNode('hel'));
    p.appendChild(document.createTextNode('lo WORLD'));
    root.appendChild(p);
    document.body.appendChild(root);
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'w', content: 'c', refContent: 'WORLD' }] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')?.textContent).toBe('WORLD');
  });

  it('clearReadonlyCommentHighlights：mark parentNode 为 null 时跳过', () => {
    const root = makeRoot('<div data-be="paragraph">safe text</div>');
    const detached = document.createElement('mark');
    detached.setAttribute('data-readonly-comment', 'true');
    detached.textContent = 'ghost';
    const qsSpy = vi
      .spyOn(root, 'querySelectorAll')
      .mockReturnValue([detached] as any);
    Object.defineProperty(detached, 'parentNode', {
      configurable: true,
      get: () => null,
    });
    expect(() => clearReadonlyCommentHighlights(root)).not.toThrow();
    expect(root.textContent).toContain('safe text');
    qsSpy.mockRestore();
  });

  it('path 与全文档搜索均无匹配时不插入 mark', () => {
    const root = makeRoot('<div data-be="paragraph">nothing to find</div>');
    const findSpy = vi
      .spyOn(findModule, 'findTextInReadonlyMarkdownDom')
      .mockReturnValue([]);
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'miss', content: 'c', refContent: 'NOMATCH', path: [5] }] as any,
      PREFIX,
    );
    expect(findSpy).toHaveBeenCalled();
    expect(root.querySelector('mark')).toBeNull();
    findSpy.mockRestore();
  });

  it('match 命中但 getReadonlyMarkdownBlocks 为空时不包裹', () => {
    const root = makeRoot('<div data-be="paragraph">orphan TARGET</div>');
    vi.spyOn(findModule, 'findTextInReadonlyMarkdownDom').mockReturnValue([
      {
        path: [0],
        matchedText: 'TARGET',
        offset: { start: 7, end: 13 },
        lineContent: 'orphan TARGET',
      },
    ] as any);
    vi.spyOn(findModule, 'getReadonlyMarkdownBlocks').mockReturnValue([]);
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'blk', content: 'c', refContent: 'TARGET', path: [0] }] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')).toBeNull();
    vi.restoreAllMocks();
  });

  it('零宽 offset（start===end）时 wrapMatchedText 返回 false', () => {
    const root = makeRoot('<div data-be="paragraph">zero width</div>');
    vi.spyOn(findModule, 'findTextInReadonlyMarkdownDom').mockReturnValue([
      {
        path: [0],
        matchedText: '',
        offset: { start: 3, end: 3 },
        lineContent: 'zero width',
      },
    ] as any);
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'zw', content: 'c', refContent: 'x', path: [0] }] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')).toBeNull();
    vi.restoreAllMocks();
  });

  it('bindReadonlyCommentClick：mark 不在 root 内时不回调', () => {
    const host = makeRoot('<div data-be="paragraph">inside</div>');
    const foreign = document.createElement('div');
    foreign.innerHTML =
      '<div data-be="paragraph"><mark data-be="comment-text">OUT</mark></div>';
    document.body.appendChild(foreign);
    applyReadonlyCommentHighlights(
      foreign,
      [{ id: 'out', content: 'keep', refContent: 'OUT' }] as any,
      PREFIX,
    );
    const onShow = vi.fn();
    const unbind = bindReadonlyCommentClick(host, onShow, [
      { id: 'out', content: 'keep', refContent: 'OUT' },
    ] as any);
    foreign.querySelector('mark')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(onShow).not.toHaveBeenCalled();
    unbind();
    foreign.remove();
  });

  it('shouldSkipTextNode：parentElement 为 null 的文本被 walker 拒绝', () => {
    const root = makeRoot('<div data-be="paragraph">prefix HIDDEN suffix</div>');
    const block = root.querySelector('[data-be="paragraph"]')!;
    // TreeWalker 只遍历树内节点；appendChild(fragment) 会把 orphan 挂到 block。
    // 用 defineProperty 强制 parentElement=null，覆盖 shouldSkipTextNode 早退分支。
    const textNode = Array.from(block.childNodes).find(
      (n) => n.nodeType === Node.TEXT_NODE,
    ) as Text;
    expect(textNode).toBeTruthy();
    Object.defineProperty(textNode, 'parentElement', {
      configurable: true,
      get: () => null,
    });
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'sk', content: 'c', refContent: 'HIDDEN' }] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')).toBeNull();
  });

  it('istanbul after：跨节点匹配跳过前缀节点；wrap 含 before/after', () => {
    const root = document.createElement('div');
    const p = document.createElement('div');
    p.setAttribute('data-be', 'paragraph');
    p.appendChild(document.createTextNode('AAA '));
    p.appendChild(document.createTextNode('MID'));
    p.appendChild(document.createTextNode(' BBB'));
    root.appendChild(p);
    document.body.appendChild(root);

    applyReadonlyCommentHighlights(
      root,
      [{ id: 'mid', content: 'c', refContent: 'MID' }] as any,
      PREFIX,
    );
    const mark = root.querySelector('mark');
    expect(mark?.textContent).toBe('MID');
    expect(p.textContent).toBe('AAA MID BBB');
  });

  it('istanbul after：path 空数组命中时不二次全文档搜索', () => {
    const root = makeRoot('<div data-be="paragraph">direct HIT here</div>');
    const findSpy = vi.spyOn(findModule, 'findTextInReadonlyMarkdownDom');
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'd', content: 'c', refContent: 'HIT', path: [] }] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')?.textContent).toBe('HIT');
    // path 空：findCommentMatch 命中后不走二次 find
    expect(findSpy.mock.calls.length).toBe(1);
    findSpy.mockRestore();
  });

  it('空 searchText / 无匹配时不插入 mark', () => {
    const root = makeRoot('<div data-be="paragraph">nothing here</div>');
    applyReadonlyCommentHighlights(
      root,
      [{ id: 'e', content: 'c', refContent: '' }] as any,
      PREFIX,
    );
    expect(root.querySelector('mark')).toBeNull();
  });
});

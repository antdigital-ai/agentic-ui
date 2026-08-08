/**
 * useHighlight deepen5：dirt leaf 跳过、url/docId 跳过链接、
 * jinja 过滤器/运算符、store highlightCache、code 节点。
 */
import { Element } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils } from '../../utils/editorUtils';
import { cacheTextNode, useHighlight } from '../useHighlight';

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn(() => false),
  },
}));

describe('useHighlight deepen5 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(false);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('dirt leaf：跳过 footnote/html 匹配', () => {
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(true);
    const decorate = useHighlight(undefined, false);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '[^a] <b>x</b>' }],
    };
    expect(decorate([node, [0]])).toEqual([]);
  });

  it('已有 url/docId/hash：不跑 processLinkMatches', () => {
    const decorate = useHighlight(undefined, false);
    const node: Element = {
      type: 'paragraph',
      children: [
        {
          text: 'http://skip.test/a',
          url: 'http://skip.test/a',
        } as any,
        { text: ' http://keep.test/b', docId: 'd1' } as any,
        { text: ' http://hash.test/c', hash: true } as any,
      ],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.every((r: any) => !r.link)).toBe(true);
  });

  it('jinja：过滤器、双引号串、比较运算符', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [
        {
          text: '{{ name | upper }}{% if x == "ok" and y >= 1 %}',
        },
      ],
    };
    const ranges = decorate([node, [0]]);
    expect(
      ranges.some(
        (r: any) =>
          r.jinjaFilter ||
          r.jinjaString ||
          r.jinjaDelimiter ||
          r.jinjaKeyword,
      ),
    ).toBe(true);
  });

  it('store.highlightCache 已有 range：合并返回', () => {
    const cached = [
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
        html: true,
      },
    ];
    const node: Element = {
      type: 'paragraph',
      children: [{ text: 'z' }],
    };
    const store = {
      highlightCache: new Map([[node, [...cached]]]),
    } as any;
    const decorate = useHighlight(store, false);
    const ranges = decorate([node, [0]]);
    expect(ranges.some((r: any) => r.html)).toBe(true);
  });

  it('code 类型节点：highlightNodes 命中但非 paragraph 早路径', () => {
    const decorate = useHighlight(undefined, false);
    const node: Element = {
      type: 'code',
      children: [{ text: 'const x = 1' }],
    } as any;
    expect(decorate([node, [0]])).toEqual([]);
  });

  it('path 变化后清除旧 cacheText 再装饰', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{{ user }}' }],
    };
    const first = decorate([node, [0]]);
    expect(first.length).toBeGreaterThan(0);
    cacheTextNode.set(node, {
      path: [1],
      range: [{ anchor: { path: [1, 0], offset: 0 }, focus: { path: [1, 0], offset: 1 } }],
    });
    const second = decorate([node, [0]]);
    expect(second.some((r: any) => r.jinjaDelimiter || r.jinjaVariableName)).toBe(
      true,
    );
  });
});

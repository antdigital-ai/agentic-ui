/**
 * useHighlight deepen residual：cache、特殊段落、jinja token、head/table-cell。
 */
import { Element, Path, createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cacheTextNode,
  clearInlineKatex,
  useHighlight,
} from '../useHighlight';

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn((leaf: any) => !!leaf?.bold || !!leaf?.code),
  },
}));

describe('useHighlight deepen residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非元素节点 / 非 highlight 类型早退', () => {
    const decorate = useHighlight(undefined, false);
    expect(decorate([{ text: 'x' } as any, [0, 0]])).toEqual([]);
    expect(decorate([{ type: 'blockquote', children: [{ text: 'q' }] } as any, [0]])).toEqual([]);
  });

  it('store.highlightCache 预填充 + cacheTextNode 复用', () => {
    const node: Element = {
      type: 'paragraph',
      children: [{ text: 'cached' }],
    };
    const cachedRange = [
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
        link: 'http://x.com',
      },
    ];
    cacheTextNode.set(node, { path: [0], range: cachedRange });

    const store = { highlightCache: new WeakMap([[node, [{ html: true }]]]) };
    const decorate = useHighlight(store as any, false);
    const ranges = decorate([node, [0]]);
    expect(ranges.length).toBeGreaterThan(0);
  });

  it('head / table-cell 类型高亮链接与 HTML', () => {
    const decorate = useHighlight(undefined, false);
    for (const type of ['head', 'table-cell'] as const) {
      const node: Element = {
        type,
        children: [{ text: '<b>x</b> https://a.com' }],
      } as any;
      const ranges = decorate([node, [0]]);
      expect(ranges.some((r: any) => r.html || r.link)).toBe(true);
    }
  });

  it('脏 leaf 跳过 footnote/HTML；带 url 跳过 link', () => {
    const decorate = useHighlight(undefined, false);
    const node: Element = {
      type: 'paragraph',
      children: [
        { text: '[^1]', bold: true },
        { text: 'https://x.com', url: 'https://x.com' },
      ],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.filter((r: any) => r.link).length).toBe(0);
  });

  it('特殊段落 ``` 前缀与表格行 regex', () => {
    const decorate = useHighlight(undefined, false);
    const fence: Element = {
      type: 'paragraph',
      children: [{ text: '```js' }],
    };
    const fenceRanges = decorate([fence, [0]]);
    expect(fenceRanges.some((r: any) => r.color === '#a3a3a3')).toBe(true);

    const tableRow: Element = {
      type: 'paragraph',
      children: [{ text: '| a | b |' }],
    };
    const rowRanges = decorate([tableRow, [1]]);
    expect(rowRanges.some((r: any) => r.color === '#a3a3a3')).toBe(true);
  });

  it('jinja：filter/placeholder/string/number/比较运算符', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [
        {
          text: '{% if x >= 1 and y != 2 %}$(ph:val) {{ name | upper }} "s" {% endif %}',
        },
      ],
    };
    const ranges = decorate([node, [0]]);
    const props = new Set<string>();
    ranges.forEach((r: any) => {
      Object.keys(r).forEach((k) => {
        if (k.startsWith('jinja')) props.add(k);
      });
    });
    expect(props.has('jinjaFilter') || props.has('jinjaPlaceholder')).toBe(true);
    expect(props.has('jinjaKeyword') || props.has('jinjaDelimiter')).toBe(true);
  });

  it('jinja 跨子节点 span + 空 inner 变量名 fallback', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [
        { text: '{% if ' },
        { text: 'flag', code: true },
        { text: ' %} {{  }}' },
      ],
    } as any;
    const ranges = decorate([node, [0]]);
    expect(ranges.length).toBeGreaterThan(0);
  });

  it('clearInlineKatex 删除 cache 项', () => {
    const editor = createEditor();
    const katexNode = {
      type: 'inline-katex',
      value: 'x',
      children: [{ text: '' }],
    };
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'a' }, katexNode, { text: 'b' }],
      },
    ] as any;
    cacheTextNode.set(katexNode, {
      path: [0, 1],
      range: [{ anchor: { path: [0, 1, 0], offset: 0 }, focus: { path: [0, 1, 0], offset: 0 } }],
    });
    clearInlineKatex(editor);
    expect(cacheTextNode.has(katexNode)).toBe(false);
  });

  it('path 变化时不复用 cache，重新计算 ranges', () => {
    const node: Element = {
      type: 'paragraph',
      children: [{ text: 'https://example.com' }],
    };
    cacheTextNode.set(node, {
      path: [0],
      range: [{ anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 3 } }],
    });
    const decorate = useHighlight(undefined, false);
    const ranges = decorate([node, [1]]);
    expect(Path.equals([1], [0])).toBe(false);
    expect(ranges.some((r: any) => r.link)).toBe(true);
  });
});

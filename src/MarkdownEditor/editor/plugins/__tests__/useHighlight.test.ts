/**
 * @fileoverview useHighlight 与 clearInlineKatex 的单元测试
 */
import { createEditor } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorStore } from '../../store';
import { EditorUtils } from '../../utils/editorUtils';
import { cacheTextNode, clearInlineKatex, useHighlight } from '../useHighlight';

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn(() => false),
  },
}));

describe('useHighlight', () => {
  let store: EditorStore;

  beforeEach(() => {
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(false);
    store = { highlightCache: new Map() } as EditorStore;
  });

  describe('clearInlineKatex', () => {
    it('应删除所有 inline-katex 节点在 cacheTextNode 中的缓存 (18, 20, 24)', () => {
      const editor = createEditor();
      const inlineKatexNode = {
        type: 'inline-katex',
        children: [{ text: 'x' }],
      } as any;
      editor.children = [
        {
          type: 'paragraph',
          children: [inlineKatexNode],
        },
      ];

      cacheTextNode.set(inlineKatexNode, {
        path: [0, 0],
        range: [],
      });
      expect(cacheTextNode.has(inlineKatexNode)).toBe(true);

      clearInlineKatex(editor);

      expect(cacheTextNode.has(inlineKatexNode)).toBe(false);
    });

    it('无 inline-katex 节点时不抛错', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: 'a' }] }];
      expect(() => clearInlineKatex(editor)).not.toThrow();
    });
  });

  describe('useHighlight 装饰器', () => {
    it('调用 useHighlight 时应调用 EditorUtils.isDirtLeaf', () => {
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: 'plain text' }],
      } as any;
      high([node, [0]]);
      expect(EditorUtils.isDirtLeaf).toHaveBeenCalled();
    });

    it('paragraph 中含 URL 文本时应匹配链接范围 (103-105)', () => {
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: 'see https://example.com/path here' }],
      } as any;
      const path = [0];

      const ranges = high([node, path]);

      const linkRange = ranges.find((r: any) => r.link);
      expect(linkRange).toBeDefined();
      expect(linkRange.link).toContain('example.com');
    });

    it('paragraph 单子节点且以 ``` 开头时应返回代码块高亮范围 (169-171, 173)', () => {
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: '```\ncode' }],
      } as any;
      const path = [0];

      const ranges = high([node, path]);

      expect(ranges.length).toBeGreaterThan(0);
      const grayRange = ranges.find((r: any) => r.color === '#a3a3a3');
      expect(grayRange).toBeDefined();
      expect(grayRange.anchor.offset).toBe(0);
      expect(grayRange.focus.offset).toBe(3);
    });

    it('paragraph 单子节点且为表格行时应返回表格行高亮范围 (176-177)', () => {
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: '| col1 | col2 |' }],
      } as any;
      const path = [0];

      const ranges = high([node, path]);

      expect(ranges.length).toBeGreaterThan(0);
      const grayRange = ranges.find((r: any) => r.color === '#a3a3a3');
      expect(grayRange).toBeDefined();
    });

    it('returns empty array for non-element nodes', () => {
      const high = useHighlight(store);
      const textNode = { text: 'just text' } as any;
      const ranges = high([textNode, [0]]);
      expect(ranges).toEqual([]);
    });

    it('returns empty array for element not in highlightNodes set', () => {
      const high = useHighlight(store);
      const node = { type: 'list-item', children: [{ text: '' }] } as any;
      const ranges = high([node, [0]]);
      expect(ranges).toEqual([]);
    });

    it('uses cached ranges when path matches', () => {
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: 'see https://example.com here' }],
      } as any;
      const path = [0];

      high([node, path]);
      const cachedEntry = cacheTextNode.get(node);
      expect(cachedEntry).toBeDefined();

      const ranges2 = high([node, path]);
      expect(ranges2.length).toBeGreaterThan(0);
    });

    it('handles table-cell type in PARAGRAPH_TYPES', () => {
      const high = useHighlight(store);
      const node = {
        type: 'table-cell',
        children: [{ text: 'https://example.com' }],
      } as any;
      const path = [0, 0, 0];

      const ranges = high([node, path]);
      const linkRange = ranges.find((r: any) => r.link);
      expect(linkRange).toBeDefined();
    });

    it('handles head type in PARAGRAPH_TYPES', () => {
      const high = useHighlight(store);
      const node = {
        type: 'head',
        children: [{ text: 'visit https://example.com today' }],
      } as any;
      const path = [0];

      const ranges = high([node, path]);
      const linkRange = ranges.find((r: any) => r.link);
      expect(linkRange).toBeDefined();
    });

    it('skips link matching for children with url property', () => {
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: 'https://example.com', url: 'https://example.com' }],
      } as any;
      const ranges = high([node, [0]]);
      const linkRange = ranges.find((r: any) => r.link);
      expect(linkRange).toBeUndefined();
    });

    it('skips link matching for children with docId', () => {
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: 'https://example.com', docId: 'doc123' }],
      } as any;
      const ranges = high([node, [0]]);
      const linkRange = ranges.find((r: any) => r.link);
      expect(linkRange).toBeUndefined();
    });

    it('skips link matching for children with hash', () => {
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: 'https://example.com', hash: 'abc' }],
      } as any;
      const ranges = high([node, [0]]);
      const linkRange = ranges.find((r: any) => r.link);
      expect(linkRange).toBeUndefined();
    });

    it('skips text matching for dirt leaves', () => {
      vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(true);
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: '<div>html</div>' }],
      } as any;
      const ranges = high([node, [0]]);
      const htmlRange = ranges.find((r: any) => r.html);
      expect(htmlRange).toBeUndefined();
    });

    it('matches footnote references in text', () => {
      vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(false);
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: 'Some text[^1] and more' }],
      } as any;
      const ranges = high([node, [0]]);
      const fncRange = ranges.find((r: any) => r.fnc === true);
      expect(fncRange).toBeDefined();
    });

    it('matches HTML tags in text', () => {
      vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(false);
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: 'Hello <div>world</div> end' }],
      } as any;
      const ranges = high([node, [0]]);
      const htmlRange = ranges.find((r: any) => r.html === true);
      expect(htmlRange).toBeDefined();
    });

    it('handles Jinja {{ variable }} highlighting when enabled', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: 'Hello {{ name }} world' }],
      } as any;
      const ranges = high([node, [0]]);
      const jinjaRange = ranges.find(
        (r: any) => r.jinjaDelimiter || r.jinjaVariableName,
      );
      expect(jinjaRange).toBeDefined();
    });

    it('handles Jinja {% tag %} highlighting when enabled', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{% if user %}show{% endif %}' }],
      } as any;
      const ranges = high([node, [0]]);
      const jinjaRange = ranges.find(
        (r: any) => r.jinjaKeyword || r.jinjaDelimiter,
      );
      expect(jinjaRange).toBeDefined();
    });

    it('handles Jinja {# comment #} highlighting when enabled', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{# this is a comment #}' }],
      } as any;
      const ranges = high([node, [0]]);
      const commentRange = ranges.find((r: any) => r.jinjaComment);
      expect(commentRange).toBeDefined();
    });

    it('skips Jinja processing when disabled', () => {
      const high = useHighlight(store, false);
      const node = {
        type: 'paragraph',
        children: [{ text: '{{ name }}' }],
      } as any;
      const ranges = high([node, [0]]);
      const jinjaRange = ranges.find(
        (r: any) => r.jinjaDelimiter || r.jinjaVariableName,
      );
      expect(jinjaRange).toBeUndefined();
    });

    it('handles Jinja tag with string literal', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: "{% set x = 'hello' %}" }],
      } as any;
      const ranges = high([node, [0]]);
      const strRange = ranges.find((r: any) => r.jinjaString);
      expect(strRange).toBeDefined();
    });

    it('handles Jinja tag with double-quoted string', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{% set x = "hello" %}' }],
      } as any;
      const ranges = high([node, [0]]);
      const strRange = ranges.find((r: any) => r.jinjaString);
      expect(strRange).toBeDefined();
    });

    it('handles Jinja tag with number literal', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{% set x = 42.5 %}' }],
      } as any;
      const ranges = high([node, [0]]);
      const numRange = ranges.find((r: any) => r.jinjaNumber);
      expect(numRange).toBeDefined();
    });

    it('handles Jinja tag with filter', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{% set x = y | upper %}' }],
      } as any;
      const ranges = high([node, [0]]);
      const filterRange = ranges.find((r: any) => r.jinjaFilter);
      expect(filterRange).toBeDefined();
    });

    it('handles Jinja tag with comparison operators', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{% if x == 1 %}ok{% endif %}' }],
      } as any;
      const ranges = high([node, [0]]);
      const delimRange = ranges.find((r: any) => r.jinjaDelimiter);
      expect(delimRange).toBeDefined();
    });

    it('handles Jinja tag with single comparison operators', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{% if x > 1 %}ok{% endif %}' }],
      } as any;
      const ranges = high([node, [0]]);
      expect(ranges.length).toBeGreaterThan(0);
    });

    it('handles Jinja tag with placeholder $(xxx:yyy)', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{% set x = $(input:text) %}' }],
      } as any;
      const ranges = high([node, [0]]);
      const phRange = ranges.find((r: any) => r.jinjaPlaceholder);
      expect(phRange).toBeDefined();
    });

    it('handles Jinja variable with filter', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{{ name | upper }}' }],
      } as any;
      const ranges = high([node, [0]]);
      const filterRange = ranges.find((r: any) => r.jinjaFilter);
      expect(filterRange).toBeDefined();
    });

    it('handles Jinja variable with placeholder', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{{ $(field:name) }}' }],
      } as any;
      const ranges = high([node, [0]]);
      const phRange = ranges.find((r: any) => r.jinjaPlaceholder);
      expect(phRange).toBeDefined();
    });

    it('handles Jinja variable with empty inner content', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [{ text: '{{  }}' }],
      } as any;
      const ranges = high([node, [0]]);
      expect(ranges).toBeDefined();
    });

    it('handles paragraph with code block and cached path for second call', () => {
      const high = useHighlight(store);
      const node = {
        type: 'paragraph',
        children: [{ text: '```js' }],
      } as any;
      const path = [0];

      high([node, path]);

      cacheTextNode.set(node, { path, range: [{ mock: true }] as any });
      const ranges2 = high([node, path]);
      expect(ranges2.find((r: any) => r.mock)).toBeDefined();
    });

    it('handles highlighting from store cache', () => {
      const node = {
        type: 'paragraph',
        children: [{ text: 'text' }],
      } as any;
      store.highlightCache.set(node, [
        { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 4 }, custom: true },
      ] as any);
      const high = useHighlight(store);
      const ranges = high([node, [0]]);
      const customRange = ranges.find((r: any) => r.custom);
      expect(customRange).toBeDefined();
    });

    it('handles multi-child paragraph with Jinja spanning children', () => {
      const high = useHighlight(store, true);
      const node = {
        type: 'paragraph',
        children: [
          { text: '{% if ' },
          { text: 'x', code: true },
          { text: ' %}' },
        ],
      } as any;
      const ranges = high([node, [0]]);
      expect(ranges.length).toBeGreaterThan(0);
    });
  });
});

/**
 * @fileoverview useHighlight 与 clearInlineKatex 的单元测试
 */
import { createEditor } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorStore } from '../../store';
import { EditorUtils } from '../../utils/editorUtils';
import {
  cacheTextNode,
  clearInlineKatex,
  useHighlight,
} from '../useHighlight';

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
  });
});

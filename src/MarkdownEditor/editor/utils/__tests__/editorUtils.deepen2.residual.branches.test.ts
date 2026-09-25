/**
 * editorUtils deepen2：copyText/cutText 跨节点；findByPathAndText 链接/去重。
 */
import { createEditor, Editor, Path, Point } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils, findByPathAndText } from '../editorUtils';

describe('EditorUtils deepen2 residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copyText / cutText：跨 leaf 到 end；无 end 读到末尾', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ab' }, { text: 'cd' }, { text: 'ef' }],
      },
    ];
    const start: Point = { path: [0, 0], offset: 1 };
    const end: Point = { path: [0, 2], offset: 1 };
    expect(EditorUtils.copyText(editor, start, end)).toBe('bcde');
    expect(EditorUtils.copyText(editor, start)).toBe('bcdef');

    const cut = EditorUtils.cutText(editor, start, end);
    expect(cut[0].text).toBe('b');
    expect(cut[cut.length - 1].text).toBe('e');
    expect(EditorUtils.cutText(editor, start).length).toBeGreaterThan(1);
  });

  it('moveBeforeSpace：path 无 previous 时插入空 text', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(() => EditorUtils.moveBeforeSpace(editor, [0, 0])).not.toThrow();
  });

  it('clearMarks：无 selection 早退；非 list-item 父', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'hi', bold: true }] }];
    editor.selection = null;
    expect(() => EditorUtils.clearMarks(editor)).not.toThrow();

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(() => EditorUtils.clearMarks(editor, false)).not.toThrow();
  });

  it('findByPathAndText：命中链接、空搜索、path 范围', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: 'hello link hello', url: 'https://ex.com' },
        ],
      },
    ];
    const hits = findByPathAndText(editor as any, [0], 'hello', {
      caseSensitive: false,
      wholeWord: false,
      includeMarkdownVariants: false,
      maxResults: 10,
    });
    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits.some((h) => h.isLink)).toBe(true);

    expect(
      findByPathAndText(editor as any, [0], '   ', {
        includeMarkdownVariants: true,
      }),
    ).toEqual([]);

    const scoped = findByPathAndText(editor as any, [0], 'link', {
      maxResults: 1,
    });
    expect(scoped.length).toBeLessThanOrEqual(1);
  });

  it('copyText leaf.text 缺省；Path.equals 结束分支', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'xy' }, { text: 'z' }] },
    ];
    const spy = vi.spyOn(Editor, 'leaf').mockImplementation((ed, at) => {
      const path = Array.isArray(at) ? at : (at as Point).path;
      if (Path.equals(path, [0, 0])) {
        return [{ text: undefined as any }, [0, 0]] as any;
      }
      return [{ text: 'z' }, [0, 1]] as any;
    });
    const text = EditorUtils.copyText(
      editor,
      { path: [0, 0], offset: 0 },
      { path: [0, 1], offset: 1 },
    );
    expect(typeof text).toBe('string');
    spy.mockRestore();
  });
});

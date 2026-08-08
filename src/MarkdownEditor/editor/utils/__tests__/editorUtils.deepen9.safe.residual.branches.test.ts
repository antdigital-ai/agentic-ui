/**
 * editorUtils deepen9 safe：moveBeforeSpace、clearMarks 段落父级、
 * deleteAll hasPath、findByPathAndText 空 variants/去重/父节点。
 */
import { createEditor, Node } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils, findByPathAndText } from '../editorUtils';

describe('EditorUtils deepen9 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('moveBeforeSpace：Path 无 previous', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] }];
    expect(() => EditorUtils.moveBeforeSpace(editor, [0, 0])).not.toThrow();
  });

  it('clearMarks：paragraph 父级再向上', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'marked', bold: true }],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 6 },
    };
    expect(() => EditorUtils.clearMarks(editor, true)).not.toThrow();
  });

  it('deleteAll：Editor.hasPath [0] 删除剩余', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ];
    expect(() => EditorUtils.deleteAll(editor)).not.toThrow();
    expect(editor.children.length).toBeGreaterThan(0);
  });

  it('findByPathAndText：空 variants 早退', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    expect(
      findByPathAndText(editor as any, [0], '   ', {
        includeMarkdownVariants: true,
      }),
    ).toEqual([]);
  });

  it('findByPathAndText：text ?? ""、parent Element、去重', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'alpha beta alpha' }],
      },
    ];
    const hits = findByPathAndText(editor as any, [0], 'alpha', {
      maxResults: 10,
      wholeWord: false,
    });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].lineContent).toBeTypeOf('string');

    const textSpy = vi.spyOn(Node, 'string').mockImplementation((n: any) => {
      if (typeof n?.text === 'string') return null as any;
      return Node.string(n);
    });
    const withNullText = findByPathAndText(editor as any, [0], 'alpha');
    expect(Array.isArray(withNullText)).toBe(true);
    textSpy.mockRestore();
  });

  it('findByPathAndText：链接 url 字段', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'click', url: 'https://ex.test' } as any],
      },
    ];
    const hits = findByPathAndText(editor as any, [0], 'click');
    expect(hits.some((h) => h.isLink)).toBe(true);
  });
});

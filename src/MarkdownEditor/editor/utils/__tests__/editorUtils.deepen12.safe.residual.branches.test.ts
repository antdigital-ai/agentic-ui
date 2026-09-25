/**
 * editorUtils deepen12 safe：isDOMNode null、clearMarks list-item、
 * deleteAll hasPath、findByPathAndText 空 trim、链接 url。
 */
import { createEditor, Node } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils, findByPathAndText, isDOMNode } from '../editorUtils';

describe('editorUtils deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('isDOMNode：null / 非 DOM 早退', () => {
    expect(isDOMNode(null)).toBe(false);
    expect(isDOMNode({} as any)).toBe(false);
  });

  it('clearMarks：list-item 父级 lift', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'li', bold: true }],
              },
            ],
          },
        ],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 2 },
    };
    expect(() => EditorUtils.clearMarks(editor, true)).not.toThrow();
  });

  it('deleteAll：剩余 [0] 节点删除', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ];
    expect(() => EditorUtils.deleteAll(editor)).not.toThrow();
  });

  it('findByPathAndText：空 trim 早退', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'word test' }] }];
    expect(findByPathAndText(editor as any, [0], '   ')).toEqual([]);
  });

  it('findByPathAndText：url 链接 + wholeWord', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'link', url: 'https://a.test' } as any],
      },
    ];
    const hits = findByPathAndText(editor as any, [0], 'link', {
      wholeWord: true,
      maxResults: 5,
    });
    expect(hits.length).toBeGreaterThan(0);
    const textSpy = vi.spyOn(Node, 'string').mockImplementation((n: any) => {
      if (n?.type === 'paragraph') return 'link';
      return Node.string(n);
    });
    findByPathAndText(editor as any, [0], 'link');
    textSpy.mockRestore();
  });
});

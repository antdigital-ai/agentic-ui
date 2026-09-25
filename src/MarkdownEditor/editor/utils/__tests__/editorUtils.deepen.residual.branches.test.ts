/**
 * editorUtils deepen residual：replaceEditorContent、findPrev/findNext、move*、clearMarks、listToParagraph。
 */
import { createEditor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils } from '../editorUtils';

describe('EditorUtils deepen residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('replaceEditorContent：withHistory 记录分支', () => {
    const editor = withHistory(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'old' }] }];
    EditorUtils.replaceEditorContent(
      editor,
      [{ type: 'paragraph', children: [{ text: 'new' }] }] as any,
      { withoutHistory: false },
    );
    expect(editor.children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ text: 'new' }],
    });
  });

  it('isPrevious / isNextPath 同父路径', () => {
    expect(EditorUtils.isPrevious([0, 0], [0, 1])).toBe(true);
    expect(EditorUtils.isNextPath([0, 1], [0, 0])).toBe(true);
  });

  it('findPrev 跳过 hr；findNext 向上回溯', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'hr', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ] as any;
    const prev = EditorUtils.findPrev(editor, [2, 0]);
    expect(prev).toEqual(expect.any(Array));

    const shallow = createEditor();
    shallow.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    expect(EditorUtils.findNext(shallow, [0, 0])).toBeUndefined();
  });

  it('findMediaInsertPath：table-cell / head / 非空段落 / null 选区', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
              },
            ],
          },
        ],
      },
      { type: 'head', level: 1, children: [{ text: 'H' }] },
      { type: 'paragraph', children: [{ text: 'body' }] },
    ] as any;

    editor.selection = {
      anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0, 0], offset: 0 },
    };
    expect(EditorUtils.findMediaInsertPath(editor)).toEqual(expect.any(Array));

    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    expect(EditorUtils.findMediaInsertPath(editor)).toEqual(expect.any(Array));

    editor.selection = {
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    };
    expect(EditorUtils.findMediaInsertPath(editor)).toEqual(expect.any(Array));

    editor.selection = null;
    expect(EditorUtils.findMediaInsertPath(editor)).toBeNull();
  });

  it('moveAfterSpace / moveBeforeSpace / moveNodes 默认 index', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab' }, { text: 'c' }] },
    ];
    expect(() => EditorUtils.moveAfterSpace(editor, [0, 0])).not.toThrow();

    const atStart = createEditor();
    atStart.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    expect(() => EditorUtils.moveBeforeSpace(atStart, [0, 0])).not.toThrow();

    const moveEd = createEditor();
    moveEd.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ];
    expect(() => EditorUtils.moveNodes(moveEd, [1], [0])).not.toThrow();
  });

  it('clearMarks split + 列表转段落；listToParagraph 嵌套', () => {
    const listNode = {
      type: 'bulleted-list',
      children: [
        {
          type: 'list-item',
          children: [
            { type: 'paragraph', children: [{ text: 'a', bold: true }] },
            {
              type: 'numbered-list',
              children: [
                {
                  type: 'list-item',
                  children: [
                    { type: 'paragraph', children: [{ text: 'nest' }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    } as any;

    const listEditor = createEditor();
    listEditor.children = [listNode];
    listEditor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 1 },
    };
    expect(
      EditorUtils.listToParagraph(listEditor, listNode).length,
    ).toBeGreaterThan(0);
    expect(
      EditorUtils.listToParagraph(listEditor, { type: 'list', children: [] } as any),
    ).toEqual([]);
    expect(() => EditorUtils.clearMarks(listEditor, true)).not.toThrow();
  });

  it('replaceSelectedNode 空选区与空文本；coalesce 空根', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(() =>
      EditorUtils.replaceSelectedNode(editor, [
        { type: 'paragraph', children: [{ text: 'n' }] },
      ] as any),
    ).not.toThrow();

    const empty = createEditor();
    empty.children = [];
    expect(
      EditorUtils.coalesceRootAllEmptyParagraphs([] as any)[0],
    ).toMatchObject({ type: 'paragraph' });
  });

  it('deleteAll / reset force history；safeDeselect 容错', () => {
    const editor = withHistory(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 1 },
    };
    expect(() => EditorUtils.deleteAll(editor)).not.toThrow();
    expect(() =>
      EditorUtils.reset(
        editor,
        [{ type: 'paragraph', children: [{ text: 'r' }] }] as any,
        true,
      ),
    ).not.toThrow();

    const broken = createEditor();
    broken.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.spyOn(Transforms, 'deselect').mockImplementation(() => {
      throw new Error('deselect fail');
    });
    expect(() => EditorUtils.safeDeselect(broken)).not.toThrow();
  });
});

import { createEditor, Transforms } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils } from '../../utils/editorUtils';
import {
  BlockMathNodes,
  insertAfter,
  MdElements,
  TextMatchNodes,
} from '../elements';

describe('markdown elements gated and dirt branches', () => {
  it('does not transform dirty formatted leaves', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '**bold**' }] }] as any;
    editor.selection = { anchor: { path: [0, 0], offset: 8 }, focus: { path: [0, 0], offset: 8 } };
    const dirty = vi.spyOn(EditorUtils, 'isDirtLeaf').mockReturnValue(true);
    expect(
      MdElements.bold.run({
        editor,
        path: [0],
        sel: editor.selection,
        match: '**bold**'.match(MdElements.bold.reg)!,
        el: editor.children[0] as any,
        startText: '**bold**',
      } as any),
    ).toBe(false);
    dirty.mockRestore();
  });

  it('keeps repeated match delimiters and gates task/list transforms', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '***x***' }] }] as any;
    editor.selection = { anchor: { path: [0, 0], offset: 7 }, focus: { path: [0, 0], offset: 7 } };
    const insert = vi.spyOn(Transforms, 'insertNodes');
    const match = '***x***'.match(MdElements.bold.reg)!;
    expect(MdElements.bold.run({ editor, path: [0], sel: editor.selection, match, el: editor.children[0], startText: '***x***' } as any)).toBe(false);
    expect(MdElements.task.gatedByMatchInputToNode).toBe(true);
    expect(MdElements.list.gatedByMatchInputToNode).toBe(true);
    expect(insert).not.toHaveBeenCalled();
    insert.mockRestore();
  });
});

describe('plugins/elements 分支覆盖', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('insertAfter 默认插入空段落并可自定义 node', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a' }] }];
    insertAfter(editor, [0]);
    expect(editor.children).toHaveLength(2);
    expect((editor.children[1] as any).type).toBe('paragraph');

    insertAfter(editor, [1], {
      type: 'hr',
      children: [{ text: '' }],
    } as any);
    expect((editor.children[2] as any).type).toBe('hr');
  });

  it('BlockMathNodes / TextMatchNodes 非空导出', () => {
    expect(BlockMathNodes.length).toBeGreaterThan(0);
    expect(TextMatchNodes.length).toBeGreaterThan(0);
  });

  it('MdElements.code.run 插入 code 节点', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '```js' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    };
    // 源码插入的 code 节点无 children；裸 createEditor 会抛，与 elements.test 一致 spy Transforms
    const insertSpy = vi
      .spyOn(Transforms, 'insertNodes')
      .mockImplementation(() => {});
    const deleteSpy = vi
      .spyOn(Transforms, 'delete')
      .mockImplementation(() => {});
    const match = '```js'.match(MdElements.code.reg)!;
    expect(
      MdElements.code.run({
        editor,
        path: [0],
        match,
        sel: editor.selection!,
        el: editor.children[0] as any,
        startText: match[0],
      }),
    ).toBe(true);
    expect(deleteSpy).toHaveBeenCalledWith(editor, { at: [0] });
    expect(insertSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ type: 'code', language: 'js', value: '' }),
      expect.objectContaining({ at: [0], select: true }),
    );
  });

  it('MdElements.hr.run 与 insertAfter', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '---' }] }];
    const match = '---'.match(MdElements.hr.reg)!;
    expect(
      MdElements.hr.run({
        editor,
        path: [0],
        match,
        sel: {
          anchor: { path: [0, 0], offset: 3 },
          focus: { path: [0, 0], offset: 3 },
        },
        el: editor.children[0] as any,
        startText: match[0],
      }),
    ).toBe(true);
    expect((editor.children[0] as any).type).toBe('hr');
  });

  it('MdElements.task.checkAllow：段落非列表首项允许', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list-item',
        children: [
          { type: 'paragraph', children: [{ text: '[ ] a' }] },
          { type: 'paragraph', children: [{ text: '[ ] b' }] },
        ],
      },
    ];
    const allow = MdElements.task.checkAllow!({
      editor,
      node: [editor.children[0].children[1] as any, [0, 1]],
      sel: {
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 0 },
      },
    });
    expect(allow).toBe(true);
  });

  it('MdElements.task.checkAllow：列表首段落拒绝', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: '[ ] a' }] }],
      },
    ];
    const allow = MdElements.task.checkAllow!({
      editor,
      node: [editor.children[0].children[0] as any, [0, 0]],
      sel: {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      },
    });
    expect(allow).toBe(false);
  });

  it('MdElements.task.run checked=true', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '[x] done' }] }];
    const match = '[x] '.match(MdElements.task.reg)!;
    expect(
      MdElements.task.run({
        editor,
        path: [0],
        match,
        sel: {
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 0], offset: 4 },
        },
        el: editor.children[0] as any,
        startText: match[0],
      }),
    ).toBe(true);
    expect((editor.children[0] as any).task).toBe(true);
    expect((editor.children[0] as any).children[0].checked).toBe(true);
  });

  it('MdElements.list.run 有序 / 无序', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '1. item' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    };
    const match = '1. '.match(MdElements.list.reg)!;
    MdElements.list.run({
      editor,
      path: [0],
      match,
      sel: editor.selection!,
      el: editor.children[0] as any,
      startText: match[0],
    });
    expect((editor.children[0] as any).type).toBe('numbered-list');

    const editor2 = createEditor();
    editor2.children = [{ type: 'paragraph', children: [{ text: '- item' }] }];
    editor2.selection = {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    };
    const match2 = '- '.match(MdElements.list.reg)!;
    MdElements.list.run({
      editor: editor2,
      path: [0],
      match: match2,
      sel: editor2.selection!,
      el: editor2.children[0] as any,
      startText: match2[0],
    });
    expect((editor2.children[0] as any).type).toBe('bulleted-list');
  });

  it('MdElements.inlineCode.run 与 dirty leaf 拒绝', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '`x`' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    const match = '`x`'.match(MdElements.inlineCode.reg)!;
    expect(
      MdElements.inlineCode.run({
        editor,
        path: [0],
        match,
        sel: editor.selection!,
        el: editor.children[0] as any,
        startText: match[0],
      }),
    ).toBe(true);

    const dirty = createEditor();
    dirty.children = [
      { type: 'paragraph', children: [{ text: '`y`', bold: true }] },
    ];
    dirty.selection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    const matchY = '`y`'.match(MdElements.inlineCode.reg)!;
    expect(
      MdElements.inlineCode.run({
        editor: dirty,
        path: [0],
        match: matchY,
        sel: dirty.selection!,
        el: dirty.children[0] as any,
        startText: matchY[0],
      }),
    ).toBe(false);
  });

  it('MdElements.head.checkAllow 非 top 拒绝', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: '# h' }] }],
      },
    ];
    const allow = MdElements.head.checkAllow!({
      editor,
      node: [editor.children[0].children[0] as any, [0, 0]],
      sel: {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      },
    });
    expect(allow).toBe(false);
  });
});

import { createEditor, Transforms } from 'slate';
import { vi } from 'vitest';
import { parseMarkdownToNodesAndInsert } from '../parseMarkdownToNodesAndInsert';

vi.mock('../../parser/parserMdToSchema', () => ({
  parserMdToSchema: vi.fn((md: string) => ({
    schema: md === '' ? [] : [{ type: 'paragraph', children: [{ text: md }] }],
  })),
}));

describe('parseMarkdownToNodesAndInsert', () => {
  it('当 schema 为空时应 push 段落节点', () => {
    const editor = createEditor();
    editor.children = [];
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');

    parseMarkdownToNodesAndInsert(editor, '');

    expect(insertSpy).toHaveBeenCalledWith(
      editor,
      [{ type: 'paragraph', children: [{ text: '' }] }],
    );
    insertSpy.mockRestore();
  });

  it('有选区且 children 为空时只 insert 不 return true', () => {
    const editor = createEditor();
    editor.children = [];
    editor.selection = {
      anchor: { path: [], offset: 0 },
      focus: { path: [], offset: 0 },
    };
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');

    const result = parseMarkdownToNodesAndInsert(editor, 'x');

    expect(insertSpy).toHaveBeenCalled();
    expect(result).toBeUndefined();
    insertSpy.mockRestore();
  });

  it('有选区且有选中文本时应 removeNodes 再 insert', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    const removeSpy = vi.spyOn(Transforms, 'removeNodes').mockImplementation(() => {});
    const insertSpy = vi.spyOn(Transforms, 'insertNodes').mockImplementation(() => {});

    const result = parseMarkdownToNodesAndInsert(editor, 'new');

    expect(removeSpy).toHaveBeenCalledWith(editor, expect.objectContaining({ at: expect.anything() }));
    expect(insertSpy).toHaveBeenCalledWith(
      editor,
      expect.any(Array),
      expect.objectContaining({ at: expect.anything() }),
    );
    expect(result).toBe(true);
    removeSpy.mockRestore();
    insertSpy.mockRestore();
  });

  it('无有效选区时直接 insert 并 return true', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = null;
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');

    const result = parseMarkdownToNodesAndInsert(editor, 'text');

    expect(insertSpy).toHaveBeenCalledWith(editor, expect.any(Array));
    expect(result).toBe(true);
    insertSpy.mockRestore();
  });
});

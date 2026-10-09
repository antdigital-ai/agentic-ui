import { createEditor, Node, Transforms } from 'slate';
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

    expect(insertSpy).toHaveBeenCalledWith(editor, [
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
    insertSpy.mockRestore();
  });

  it('空文档的无效选区不会阻止插入', () => {
    const editor = createEditor();
    editor.children = [];
    editor.selection = {
      anchor: { path: [], offset: 0 },
      focus: { path: [], offset: 0 },
    };
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');

    const result = parseMarkdownToNodesAndInsert(editor, 'x');

    expect(insertSpy).toHaveBeenCalled();
    expect(result).toBe(true);
    insertSpy.mockRestore();
  });

  it('替换跨段选区并保留范围外文本', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello' }] },
      { type: 'paragraph', children: [{ text: 'world' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 3 },
    };

    const result = parseMarkdownToNodesAndInsert(editor, 'new');

    expect(editor.children.map(Node.string)).toEqual(['henewld']);
    expect(result).toBe(true);
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
